import { Layout } from '@/components/layout/Layout';
import { Truck, Clock, MapPin, CreditCard, Package, Shield, RefreshCw } from 'lucide-react';

const Shipping = () => {
  return (
    <Layout>
      <div className="container-narrow py-8 md:py-12">
        <h1 className="text-title mb-8">Shipping Policy</h1>

        <div className="space-y-8">
          <p className="text-small text-muted-foreground">
            Last updated: January 14, 2026
          </p>

          {/* Overview */}
          <section>
            <h2 className="text-body font-medium mb-4">Shipping Overview</h2>
            <p className="text-small text-muted-foreground">
              At WizThrift, we strive to deliver your pre-owned fashion finds quickly and safely. We ship across India using reliable courier partners to ensure your order reaches you in perfect condition.
            </p>
          </section>

          {/* Delivery Times */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5" />
              <h2 className="text-body font-medium">Delivery Times</h2>
            </div>
            <div className="bg-secondary p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-small text-muted-foreground">Metro Cities (Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad)</span>
                <span className="text-small font-medium">3-5 business days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-small text-muted-foreground">Tier 1 & 2 Cities</span>
                <span className="text-small font-medium">5-7 business days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-small text-muted-foreground">Remote Areas & Hill Stations</span>
                <span className="text-small font-medium">7-10 business days</span>
              </div>
            </div>
            <p className="text-small text-muted-foreground mt-3">
              Note: Delivery times are estimated and may vary based on location, weather conditions, festivals, or unforeseen circumstances. We do not guarantee delivery dates.
            </p>
          </section>

          {/* Shipping Costs */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-5 h-5" />
              <h2 className="text-body font-medium">Shipping Charges</h2>
            </div>
            <div className="bg-secondary p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-small text-muted-foreground">Orders above ₹2,000</span>
                <span className="text-small font-medium text-green-600">FREE Shipping</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-small text-muted-foreground">Orders below ₹2,000</span>
                <span className="text-small font-medium">₹99</span>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-small text-muted-foreground">
                  Shipping charges are calculated at checkout based on your cart value and delivery location.
                </p>
              </div>
            </div>
          </section>

          {/* Processing Time */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-5 h-5" />
              <h2 className="text-body font-medium">Order Processing</h2>
            </div>
            <ul className="space-y-2 text-small text-muted-foreground">
              <li>• All orders are processed within 1-2 business days (excluding weekends and holidays)</li>
              <li>• Orders placed after 3 PM IST will be processed the next business day</li>
              <li>• You will receive an email confirmation once your order is placed</li>
              <li>• Once shipped, you'll receive a tracking number via email and SMS</li>
              <li>• During sale periods or festivals, processing may take an additional 1-2 days</li>
            </ul>
          </section>

          {/* Delivery Areas */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5" />
              <h2 className="text-body font-medium">Serviceable Areas</h2>
            </div>
            <p className="text-small text-muted-foreground mb-3">
              We currently ship to all serviceable pin codes across India. To check if we deliver to your area:
            </p>
            <ul className="space-y-2 text-small text-muted-foreground">
              <li>• Enter your pin code during checkout</li>
              <li>• Our system will automatically verify serviceability</li>
              <li>• If your pin code is not serviceable, you'll be notified before payment</li>
            </ul>
            <p className="text-small text-muted-foreground mt-3">
              We do not ship to PO Box addresses or military/diplomatic locations at this time.
            </p>
          </section>

          {/* Tracking */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="w-5 h-5" />
              <h2 className="text-body font-medium">Order Tracking</h2>
            </div>
            <p className="text-small text-muted-foreground mb-3">
              Once your order is shipped, you can track it using:
            </p>
            <ul className="space-y-2 text-small text-muted-foreground">
              <li>• The tracking link sent to your email</li>
              <li>• The tracking number sent via SMS</li>
              <li>• Your account's "Orders" section on our website</li>
            </ul>
            <p className="text-small text-muted-foreground mt-3">
              Please allow 24 hours after shipment for tracking information to update on the courier's website.
            </p>
          </section>

          {/* Payment Options */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5" />
              <h2 className="text-body font-medium">Payment Methods</h2>
            </div>
            <div className="bg-secondary p-6 space-y-2">
              <p className="text-small">✓ Credit Cards (Visa, Mastercard, American Express)</p>
              <p className="text-small">✓ Debit Cards (Visa, Mastercard, RuPay)</p>
              <p className="text-small">✓ UPI (Google Pay, PhonePe, Paytm, etc.)</p>
              <p className="text-small">✓ Net Banking</p>
              <p className="text-small">✓ Wallets (Paytm, Mobikwik, etc.)</p>
            </div>
            <p className="text-small text-muted-foreground mt-3">
              All payments are processed securely through Razorpay. We do not store your card details.
            </p>
          </section>

          {/* Packaging */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5" />
              <h2 className="text-body font-medium">Packaging & Safety</h2>
            </div>
            <p className="text-small text-muted-foreground mb-3">
              We take great care in packaging your items:
            </p>
            <ul className="space-y-2 text-small text-muted-foreground">
              <li>• All items are quality-checked before packing</li>
              <li>• Secure, eco-friendly packaging materials</li>
              <li>• Tamper-proof sealing to ensure product integrity</li>
              <li>• Water-resistant outer packaging</li>
              <li>• Clear labeling for fragile items</li>
            </ul>
          </section>

          {/* Failed Delivery */}
          <section>
            <h2 className="text-body font-medium mb-4">Failed Delivery Attempts</h2>
            <p className="text-small text-muted-foreground mb-3">
              If delivery fails due to:
            </p>
            <ul className="space-y-2 text-small text-muted-foreground">
              <li>• Incorrect address provided</li>
              <li>• Recipient unavailable after 3 attempts</li>
              <li>• Refusal to accept the package</li>
            </ul>
            <p className="text-small text-muted-foreground mt-3">
              The order will be returned to us. You may be charged return shipping fees, and refunds will be processed after deducting applicable charges.
            </p>
          </section>

          {/* International Shipping */}
          <section>
            <h2 className="text-body font-medium mb-4">International Shipping</h2>
            <p className="text-small text-muted-foreground">
              Currently, we only ship within India. We do not offer international shipping at this time. We hope to expand our services globally in the future.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-border pt-8">
            <h2 className="text-body font-medium mb-4">Shipping Support</h2>
            <p className="text-small text-muted-foreground mb-3">
              For any shipping-related queries, please contact us:
            </p>
            <ul className="space-y-2 text-small text-muted-foreground">
              <li>• Email: wizstorehelp@gmail.com</li>
              <li>• Phone: +91 81170 96317</li>
              <li>• Business Hours: Monday - Saturday, 10:00 AM - 7:00 PM IST</li>
            </ul>
          </section>

          {/* Important Notes */}
          <section className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-lg">
            <h2 className="text-body font-medium mb-3">Important Information</h2>
            <ul className="space-y-2 text-small text-muted-foreground">
              <li>• WizThrift is not responsible for delays caused by courier services or force majeure events</li>
              <li>• Please inspect your package upon delivery. Report any damage within 24 hours</li>
              <li>• Ensure someone is available to receive the package at the delivery address</li>
              <li>• We reserve the right to modify shipping charges and policies without prior notice</li>
              <li>• For concerns about damaged packages, please retain all packaging materials for investigation</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Shipping;