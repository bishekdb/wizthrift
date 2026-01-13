import { Layout } from '@/components/layout/Layout';
import { Truck, Clock, MapPin, CreditCard } from 'lucide-react';

const Shipping = () => {
  return (
    <Layout>
      <div className="container-narrow py-8 md:py-12">
        <h1 className="text-title mb-8">Shipping Information</h1>

        <div className="space-y-8">
          {/* Delivery Times */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5" />
              <h2 className="text-body font-medium">Delivery Times</h2>
            </div>
            <div className="bg-secondary p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-small text-muted-foreground">Metro Cities</span>
                <span className="text-small">3-5 business days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-small text-muted-foreground">Other Cities</span>
                <span className="text-small">5-7 business days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-small text-muted-foreground">Remote Areas</span>
                <span className="text-small">7-10 business days</span>
              </div>
            </div>
          </section>

          {/* Shipping Costs */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-5 h-5" />
              <h2 className="text-body font-medium">Shipping Costs</h2>
            </div>
            <div className="bg-secondary p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-small text-muted-foreground">Orders above ₹2,000</span>
                <span className="text-small font-medium text-green-600">Free Shipping</span>
              </div>
              <div className="flex justify-between">
                <span className="text-small text-muted-foreground">Orders below ₹2,000</span>
                <span className="text-small">₹99</span>
              </div>
            </div>
          </section>

          {/* Delivery Areas */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5" />
              <h2 className="text-body font-medium">Delivery Areas</h2>
            </div>
            <p className="text-small text-muted-foreground">
              We currently ship to all major cities and towns across India. Enter your pincode during checkout to verify if we deliver to your area.
            </p>
          </section>

          {/* Payment Options */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5" />
              <h2 className="text-body font-medium">Payment Options</h2>
            </div>
            <div className="bg-secondary p-6 space-y-3">
              <p className="text-small">• Cash on Delivery (COD)</p>
              <p className="text-small">• UPI Payment</p>
              <p className="text-small">• Credit/Debit Cards via Stripe</p>
            </div>
          </section>

          {/* Additional Info */}
          <section className="border-t border-border pt-8">
            <h2 className="text-body font-medium mb-4">Important Notes</h2>
            <ul className="space-y-2 text-small text-muted-foreground">
              <li>• All orders are dispatched within 1-2 business days</li>
              <li>• You will receive tracking information via email once shipped</li>
              <li>• Delivery times may vary during sale periods or holidays</li>
              <li>• For any shipping queries, please contact us at support@example.com</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Shipping;