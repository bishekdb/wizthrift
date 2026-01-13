import { Layout } from '@/components/layout/Layout';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const Contact = () => {
  return (
    <Layout>
      <div className="container-narrow py-8 md:py-12">
        <h1 className="text-title mb-8">Contact Us</h1>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <p className="text-small text-muted-foreground">
              Have questions about an order, our products, or just want to say hello? We'd love to hear from you!
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="text-small font-medium">Email</p>
                  <a 
                    href="mailto:support@example.com" 
                    className="text-small text-muted-foreground hover:text-foreground transition-colors"
                  >
                    support@example.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="text-small font-medium">Phone</p>
                  <a 
                    href="tel:+919876543210" 
                    className="text-small text-muted-foreground hover:text-foreground transition-colors"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="text-small font-medium">Address</p>
                  <p className="text-small text-muted-foreground">
                    123 Fashion Street<br />
                    Mumbai, Maharashtra 400001<br />
                    India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="text-small font-medium">Business Hours</p>
                  <p className="text-small text-muted-foreground">
                    Monday - Saturday: 10:00 AM - 7:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-body font-medium mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="bg-secondary p-4">
                <p className="text-small font-medium mb-1">How long does shipping take?</p>
                <p className="text-small text-muted-foreground">
                  Delivery takes 3-7 business days depending on your location. Check our shipping page for details.
                </p>
              </div>

              <div className="bg-secondary p-4">
                <p className="text-small font-medium mb-1">Can I return an item?</p>
                <p className="text-small text-muted-foreground">
                  Yes! We accept returns within 7 days of delivery. See our returns policy for eligibility.
                </p>
              </div>

              <div className="bg-secondary p-4">
                <p className="text-small font-medium mb-1">Are items authentic?</p>
                <p className="text-small text-muted-foreground">
                  All items are verified for authenticity and quality before being listed on our platform.
                </p>
              </div>

              <div className="bg-secondary p-4">
                <p className="text-small font-medium mb-1">How do I track my order?</p>
                <p className="text-small text-muted-foreground">
                  Once shipped, you'll receive a tracking link via email. You can also check your order status in your account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;