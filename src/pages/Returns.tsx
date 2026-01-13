import { Layout } from '@/components/layout/Layout';
import { RotateCcw, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Returns = () => {
  return (
    <Layout>
      <div className="container-narrow py-8 md:py-12">
        <h1 className="text-title mb-8">Returns & Refunds</h1>

        <div className="space-y-8">
          {/* Return Policy */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <RotateCcw className="w-5 h-5" />
              <h2 className="text-body font-medium">Return Policy</h2>
            </div>
            <p className="text-small text-muted-foreground mb-4">
              We want you to love your preloved finds! If you're not completely satisfied with your purchase, we accept returns within 7 days of delivery.
            </p>
            <div className="bg-secondary p-6">
              <p className="text-small font-medium mb-2">Items eligible for return:</p>
              <ul className="space-y-1 text-small text-muted-foreground">
                <li>• Item significantly differs from the description</li>
                <li>• Item has undisclosed damage or defects</li>
                <li>• Wrong item was delivered</li>
              </ul>
            </div>
          </section>

          {/* Return Window */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5" />
              <h2 className="text-body font-medium">Return Window</h2>
            </div>
            <div className="bg-secondary p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-small text-muted-foreground">Return request deadline</span>
                <span className="text-small">7 days from delivery</span>
              </div>
              <div className="flex justify-between">
                <span className="text-small text-muted-foreground">Item must be shipped back within</span>
                <span className="text-small">3 days of approval</span>
              </div>
            </div>
          </section>

          {/* How to Return */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-5 h-5" />
              <h2 className="text-body font-medium">How to Return</h2>
            </div>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-foreground text-background flex items-center justify-center text-micro flex-shrink-0">1</span>
                <p className="text-small text-muted-foreground">Email us at returns@example.com with your order ID and reason for return</p>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-foreground text-background flex items-center justify-center text-micro flex-shrink-0">2</span>
                <p className="text-small text-muted-foreground">Wait for our team to review and approve your return request</p>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-foreground text-background flex items-center justify-center text-micro flex-shrink-0">3</span>
                <p className="text-small text-muted-foreground">Pack the item securely and ship it to the address provided</p>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-foreground text-background flex items-center justify-center text-micro flex-shrink-0">4</span>
                <p className="text-small text-muted-foreground">Once received and verified, your refund will be processed within 5-7 business days</p>
              </li>
            </ol>
          </section>

          {/* Non-Returnable */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5" />
              <h2 className="text-body font-medium">Non-Returnable Items</h2>
            </div>
            <div className="bg-secondary p-6">
              <ul className="space-y-1 text-small text-muted-foreground">
                <li>• Items that have been worn, washed, or altered</li>
                <li>• Items without original tags (if applicable)</li>
                <li>• Items marked as "Final Sale"</li>
                <li>• Intimate wear and accessories</li>
              </ul>
            </div>
          </section>

          {/* Refund Info */}
          <section className="border-t border-border pt-8">
            <h2 className="text-body font-medium mb-4">Refund Information</h2>
            <ul className="space-y-2 text-small text-muted-foreground">
              <li>• Refunds will be credited to the original payment method</li>
              <li>• For COD orders, refund will be processed via bank transfer</li>
              <li>• Shipping charges are non-refundable</li>
              <li>• Please allow 5-7 business days for the refund to reflect in your account</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Returns;