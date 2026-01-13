import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { checkRateLimit, createRateLimitResponse } from "../_shared/rate-limiter.ts";
import { isValidEmail, escapeHtml, sanitizeString, isValidPincode } from "../_shared/validation.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Rate limit: 5 emails per minute per IP
const RATE_LIMIT_CONFIG = { maxRequests: 5, windowMs: 60000 };

interface OrderItem {
  product_name: string;
  product_price: number;
  product_size: string;
}

interface OrderConfirmationRequest {
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderItems: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  const requestOrigin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(requestOrigin);
  
  console.log("Order confirmation email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest(requestOrigin);
  }

  // Rate limiting
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateLimit = checkRateLimit(`email:${clientIP}`, RATE_LIMIT_CONFIG);
  
  if (!rateLimit.allowed) {
    console.warn(`Rate limit exceeded for email sending, IP: ${clientIP}`);
    return createRateLimitResponse(rateLimit, corsHeaders);
  }

  try {
    const body: OrderConfirmationRequest = await req.json();
    const {
      customerEmail,
      customerName,
      orderId,
      orderItems,
      subtotal,
      shipping,
      total,
      shippingAddress,
    } = body;

    // Input validation
    if (!isValidEmail(customerEmail)) {
      console.error('Invalid customer email:', customerEmail);
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!customerName || typeof customerName !== 'string' || customerName.trim().length === 0) {
      console.error('Invalid customer name');
      return new Response(
        JSON.stringify({ error: 'Customer name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!orderId || typeof orderId !== 'string') {
      console.error('Invalid order ID');
      return new Response(
        JSON.stringify({ error: 'Order ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      console.error('Invalid order items');
      return new Response(
        JSON.stringify({ error: 'Order items are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and sanitize order items
    for (const item of orderItems) {
      if (!item.product_name || typeof item.product_price !== 'number') {
        console.error('Invalid order item:', item);
        return new Response(
          JSON.stringify({ error: 'Invalid order item data' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.pincode) {
      console.error('Invalid shipping address');
      return new Response(
        JSON.stringify({ error: 'Complete shipping address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Sending order confirmation to:", customerEmail);
    console.log("Order ID:", orderId);

    // Sanitize all user-provided content to prevent XSS in email clients
    const safeCustomerName = escapeHtml(sanitizeString(customerName, 100));
    const safeOrderId = escapeHtml(sanitizeString(orderId, 50));
    const safeStreet = escapeHtml(sanitizeString(shippingAddress.street, 200));
    const safeCity = escapeHtml(sanitizeString(shippingAddress.city, 100));
    const safeState = escapeHtml(sanitizeString(shippingAddress.state, 100));
    const safePincode = escapeHtml(sanitizeString(shippingAddress.pincode, 10));

    const itemsHtml = orderItems
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${escapeHtml(sanitizeString(item.product_name, 200))}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${escapeHtml(sanitizeString(item.product_size || 'N/A', 20))}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${Math.max(0, Math.floor(item.product_price)).toLocaleString()}</td>
        </tr>
      `
      )
      .join("");

    // Use environment variable for from address, fallback to onboarding@resend.dev for testing
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Orders <onboarding@resend.dev>";
    
    console.log("Sending email from:", fromEmail);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [customerEmail],
        subject: `Order Confirmation - ${safeOrderId.slice(0, 8).toUpperCase()}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px;">
              <h1 style="color: #333; margin-bottom: 24px; font-size: 24px;">Thank you for your order, ${safeCustomerName}!</h1>
              
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                We've received your order and are getting it ready. You'll receive another email when your order ships.
              </p>
              
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0; color: #333; font-size: 14px;">
                  <strong>Order ID:</strong> ${safeOrderId.slice(0, 8).toUpperCase()}
                </p>
              </div>
              
              <h2 style="color: #333; font-size: 18px; margin-top: 32px;">Order Summary</h2>
              
              <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                <thead>
                  <tr style="background-color: #f9f9f9;">
                    <th style="padding: 12px; text-align: left; font-weight: 600;">Item</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600;">Size</th>
                    <th style="padding: 12px; text-align: right; font-weight: 600;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #eee;">
                <table style="width: 100%;">
                  <tr>
                    <td style="color: #666; padding: 4px 0;">Subtotal:</td>
                    <td style="color: #333; text-align: right; padding: 4px 0;">₹${Math.max(0, Math.floor(subtotal)).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; padding: 4px 0;">Shipping:</td>
                    <td style="color: #333; text-align: right; padding: 4px 0;">${shipping === 0 ? 'Free' : `₹${Math.max(0, Math.floor(shipping)).toLocaleString()}`}</td>
                  </tr>
                  <tr style="font-size: 18px; font-weight: 600;">
                    <td style="color: #333; padding: 12px 0 4px; border-top: 1px solid #eee;">Total:</td>
                    <td style="color: #333; text-align: right; padding: 12px 0 4px; border-top: 1px solid #eee;">₹${Math.max(0, Math.floor(total)).toLocaleString()}</td>
                  </tr>
                </table>
              </div>
              
              <h2 style="color: #333; font-size: 18px; margin-top: 32px;">Shipping Address</h2>
              <p style="color: #666; line-height: 1.6; margin-top: 8px;">
                ${safeStreet}<br>
                ${safeCity}, ${safeState} ${safePincode}
              </p>
              
              <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #eee; text-align: center;">
                <p style="color: #999; font-size: 14px;">
                  If you have any questions, reply to this email or contact our support team.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending order confirmation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
