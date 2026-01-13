import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { checkoutSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

type PaymentMethod = 'cod' | 'upi';

// Load Razorpay script dynamically
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please sign in to checkout');
      navigate('/auth?redirect=/checkout');
    }
  }, [user, authLoading, navigate]);

  // Pre-fill email from user
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user]);

  if (authLoading) {
    return (
      <Layout>
        <div className="container-narrow py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for this field
    setValidationErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCODOrder = async (orderId: string, productIds: string[]) => {
    // For COD, mark products as sold immediately
    const { error: updateError } = await supabase
      .from('products')
      .update({ status: 'sold' })
      .in('id', productIds);

    if (updateError) throw updateError;

    return true;
  };

  const handleUPIPayment = async (
    orderId: string, 
    grandTotal: number, 
    productIds: string[]
  ): Promise<boolean> => {
    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error('Failed to load payment gateway');
      return false;
    }

    // Create Razorpay order (also returns the key ID)
    const { data: razorpayOrder, error: razorpayError } = await supabase.functions.invoke(
      'create-razorpay-order',
      {
        body: {
          amount: grandTotal * 100, // Convert to paise
          currency: 'INR',
          receipt: orderId,
        },
      }
    );

    if (razorpayError || !razorpayOrder?.orderId || !razorpayOrder?.keyId) {
      logger.error('Failed to create Razorpay order', razorpayError);
      toast.error('Failed to initiate payment');
      return false;
    }

    // Open Razorpay checkout
    return new Promise((resolve) => {
      const options: RazorpayOptions = {
        key: razorpayOrder.keyId,
        amount: grandTotal * 100,
        currency: 'INR',
        name: 'WizThrift',
        description: `Order #${orderId.slice(0, 8)}`,
        order_id: razorpayOrder.orderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#000000',
        },
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment on backend
            const { data: verifyResult, error: verifyError } = await supabase.functions.invoke(
              'verify-razorpay-payment',
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: orderId,
                  productIds: productIds,
                },
              }
            );

            if (verifyError || !verifyResult?.verified) {
              logger.error('Payment verification failed', verifyError);
              toast.error('Payment verification failed');
              resolve(false);
              return;
            }

            toast.success('Payment successful!');
            resolve(true);
          } catch (error) {
            logger.error('Error verifying payment', error);
            toast.error('Payment verification failed');
            resolve(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
            resolve(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationErrors({});

    try {
      // Validate checkout form data
      const result = checkoutSchema.safeParse(formData);
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) errors[err.path[0] as string] = err.message;
        });
        setValidationErrors(errors);
        setIsSubmitting(false);
        toast.error('Please fix the validation errors');
        return;
      }

      // Calculate total shipping from all products
      const shipping = items.reduce((sum, { product }) => sum + (product.shipping_charge || 0), 0);
      const grandTotal = total + shipping;

      // Create order with pending payment status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customer_email: formData.email,
          shipping_name: formData.name,
          shipping_phone: formData.phone,
          shipping_street: formData.street,
          shipping_city: formData.city,
          shipping_state: formData.state,
          shipping_pincode: formData.pincode,
          payment_method: paymentMethod,
          payment_status: 'pending',
          subtotal: total,
          shipping: shipping,
          total: grandTotal,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(({ product }) => ({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_size: product.size,
        product_image: product.images?.[0] || null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      const productIds = items.map(({ product }) => product.id);
      let paymentSuccess = false;

      if (paymentMethod === 'cod') {
        paymentSuccess = await handleCODOrder(order.id, productIds);
      } else if (paymentMethod === 'upi') {
        paymentSuccess = await handleUPIPayment(order.id, grandTotal, productIds);
      }

      if (!paymentSuccess && paymentMethod === 'upi') {
        // Payment failed or cancelled - keep order but don't complete
        setIsSubmitting(false);
        return;
      }

      // Send order confirmation email (non-blocking)
      supabase.functions.invoke('send-order-confirmation', {
        body: {
          customerEmail: formData.email,
          customerName: formData.name,
          orderId: order.id,
          orderItems: orderItems.map(item => ({
            product_name: item.product_name,
            product_price: item.product_price,
            product_size: item.product_size,
          })),
          subtotal: total,
          shipping: shipping,
          total: grandTotal,
          shippingAddress: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
        },
      }).then(({ error }) => {
        if (error) {
          logger.error('Failed to send confirmation email', error);
        }
      });

      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation?orderId=${order.id}`);
    } catch (error) {
      logger.error('Error placing order', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total shipping from all products
  const shipping = items.reduce((sum, { product }) => sum + (product.shipping_charge || 0), 0);
  const grandTotal = total + shipping;

  return (
    <Layout>
      <div className="container-narrow py-8 md:py-12">
        <h1 className="text-title mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact */}
              <div>
                <h2 className="text-small font-medium mb-4">Contact</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-small text-muted-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-small text-muted-foreground">
                      Phone (10 digits, e.g., 9876543210)
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`mt-1 ${validationErrors.phone ? 'border-red-500' : ''}`}
                    />
                    {validationErrors.phone && (
                      <p className="text-micro text-red-500 mt-1">{validationErrors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="text-small font-medium mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-small text-muted-foreground">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="street" className="text-small text-muted-foreground">
                      Street Address
                    </Label>
                    <Input
                      id="street"
                      name="street"
                      required
                      value={formData.street}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-small text-muted-foreground">
                        City
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-small text-muted-foreground">
                        State
                      </Label>
                      <Input
                        id="state"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="w-1/2">
                    <Label htmlFor="pincode" className="text-small text-muted-foreground">
                      PIN Code (6 digits)
                    </Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      required
                      placeholder="110001"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className={`mt-1 ${validationErrors.pincode ? 'border-red-500' : ''}`}
                    />
                    {validationErrors.pincode && (
                      <p className="text-micro text-red-500 mt-1">{validationErrors.pincode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-small font-medium mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { value: 'upi', label: 'UPI (GPay, PhonePe, Paytm, etc.)' },
                    { value: 'cod', label: 'Cash on Delivery' },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${
                        paymentMethod === method.value
                          ? 'border-foreground'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 border-2 flex items-center justify-center ${
                          paymentMethod === method.value ? 'border-foreground' : 'border-border'
                        }`}
                      >
                        {paymentMethod === method.value && (
                          <div className="w-2 h-2 bg-foreground" />
                        )}
                      </div>
                      <span className="text-small">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="border border-border p-6 sticky top-24">
                <h2 className="text-small font-medium mb-4">Order Summary</h2>

                {/* Items */}
                <div className="space-y-4 mb-6">
                  {items.map(({ product }) => (
                    <div key={product.id} className="flex gap-3">
                      <div className="w-16 h-20 bg-secondary flex-shrink-0">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-small truncate">{product.name}</p>
                        <p className="text-micro text-muted-foreground">Size: {product.size}</p>
                        <p className="text-small mt-1">₹{product.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-small">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-small">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between text-small font-medium">
                    <span>Total</span>
                    <span>₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : paymentMethod === 'upi' ? (
                    'Pay with UPI'
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Checkout;
