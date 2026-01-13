import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { checkRateLimit, createRateLimitResponse } from "../_shared/rate-limiter.ts";
import { isValidUUID, sanitizeString } from "../_shared/validation.ts";

// Stricter rate limit for payment verification: 5 requests per minute per IP
const RATE_LIMIT_CONFIG = { maxRequests: 5, windowMs: 60000 };

// HMAC SHA256 verification using Web Crypto API
async function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const message = `${orderId}|${paymentId}`;
  const encoder = new TextEncoder();
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message)
  );
  
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Use constant-time comparison to prevent timing attacks
  if (expectedSignature.length !== signature.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < expectedSignature.length; i++) {
    result |= expectedSignature.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  
  return result === 0;
}

// Validate Razorpay ID format
function isValidRazorpayId(id: string, prefix: string): boolean {
  if (!id || typeof id !== 'string') return false;
  // Razorpay IDs are alphanumeric with prefix
  const regex = new RegExp(`^${prefix}_[a-zA-Z0-9]{14,}$`);
  return regex.test(id);
}

serve(async (req) => {
  const requestOrigin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(requestOrigin);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(requestOrigin);
  }

  // Rate limiting
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateLimit = checkRateLimit(`razorpay-verify:${clientIP}`, RATE_LIMIT_CONFIG);
  
  if (!rateLimit.allowed) {
    console.warn(`Rate limit exceeded for payment verification, IP: ${clientIP}`);
    return createRateLimitResponse(rateLimit, corsHeaders);
  }

  try {
    const body = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      orderId,
      productIds 
    } = body;

    // Input validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      console.error('Missing required parameters');
      return new Response(
        JSON.stringify({ error: 'Missing required parameters', verified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate Razorpay IDs format
    if (!isValidRazorpayId(razorpay_order_id, 'order')) {
      console.error('Invalid Razorpay order ID format');
      return new Response(
        JSON.stringify({ error: 'Invalid order ID format', verified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidRazorpayId(razorpay_payment_id, 'pay')) {
      console.error('Invalid Razorpay payment ID format');
      return new Response(
        JSON.stringify({ error: 'Invalid payment ID format', verified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate internal order ID
    if (!isValidUUID(orderId)) {
      console.error('Invalid order ID format');
      return new Response(
        JSON.stringify({ error: 'Invalid order ID', verified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate signature format (hex string)
    if (!/^[a-f0-9]{64}$/i.test(razorpay_signature)) {
      console.error('Invalid signature format');
      return new Response(
        JSON.stringify({ error: 'Invalid signature format', verified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate productIds if provided
    if (productIds && Array.isArray(productIds)) {
      for (const pid of productIds) {
        if (!isValidUUID(pid)) {
          console.error('Invalid product ID format');
          return new Response(
            JSON.stringify({ error: 'Invalid product ID format', verified: false }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    console.log('Verifying payment for order:', orderId);

    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!keySecret) {
      console.error('Razorpay secret not configured');
      return new Response(
        JSON.stringify({ error: 'Payment service not configured', verified: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the signature
    const isValid = await verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      keySecret
    );

    if (!isValid) {
      console.error('Invalid payment signature for order:', orderId);
      return new Response(
        JSON.stringify({ error: 'Payment verification failed', verified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Payment signature verified successfully');

    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update order payment status
    const { error: orderError } = await supabase
      .from('orders')
      .update({ 
        payment_status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (orderError) {
      console.error('Error updating order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to update order', verified: true }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update products status to 'sold'
    if (productIds && productIds.length > 0) {
      const { error: productsError } = await supabase
        .from('products')
        .update({ status: 'sold' })
        .in('id', productIds);

      if (productsError) {
        console.error('Error updating products:', productsError);
        // Don't fail the whole request, payment is still verified
      } else {
        console.log('Products marked as sold:', productIds.length);
      }
    }

    console.log('Payment verified and order updated successfully');

    return new Response(
      JSON.stringify({ 
        verified: true, 
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        } 
      }
    );
  } catch (error) {
    console.error('Error verifying payment:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', verified: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
