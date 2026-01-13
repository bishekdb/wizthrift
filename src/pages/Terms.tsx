import { Layout } from '@/components/layout/Layout';

const Terms = () => {
  return (
    <Layout>
      <div className="container-narrow py-8 md:py-12">
        <h1 className="text-title mb-8">Terms and Conditions</h1>
        
        <div className="space-y-6 text-small">
          <p className="text-muted-foreground">
            Last updated: January 14, 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-body font-medium">1. Agreement to Terms</h2>
            <p>
              By accessing and using WizThrift ("we," "us," or "our"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms and Conditions, please do not use our website or services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-medium">2. Use of Our Service</h2>
            <p>
              WizThrift is an online marketplace for pre-owned and secondhand clothing. By using our platform, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Provide accurate and complete information when creating an account</li>
              <li>Maintain the security of your account credentials</li>
              <li>Not use the platform for any illegal or unauthorized purpose</li>
              <li>Not violate any laws in your jurisdiction</li>
              <li>Not transmit any viruses or malicious code</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-medium">3. Product Descriptions</h2>
            <p>
              We strive to provide accurate descriptions and images of all products. However, as we deal with pre-owned items:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Products are sold "as is" with any wear or defects clearly described</li>
              <li>Colors may vary slightly due to photography and screen settings</li>
              <li>All measurements are approximate</li>
              <li>We reserve the right to limit quantities purchased</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-medium">4. Pricing and Payment</h2>
            <p>
              All prices are listed in Indian Rupees (INR) and are subject to change without notice. Payment is processed securely through Razorpay. By making a purchase, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Provide valid payment information</li>
              <li>Pay all charges at the prices in effect when incurred</li>
              <li>Pay applicable taxes</li>
              <li>Be responsible for all charges on your account</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-medium">5. Shipping and Delivery</h2>
            <p>
              We ship throughout India. Delivery times are estimates and not guaranteed. We are not responsible for delays caused by courier services or circumstances beyond our control. Please see our Shipping Policy for detailed information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-medium">6. Returns and Refunds</h2>
            <p>
              We accept returns within 7 days of delivery for items that are:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Unworn with original tags attached</li>
              <li>In the same condition as received</li>
              <li>Not damaged or altered</li>
            </ul>
            <p className="mt-2">
              Please refer to our Returns & Exchanges policy for complete details. Sale items and certain product categories may not be eligible for returns.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-medium">7. User Accounts</h2>
            <p>
              When you create an account, you are responsible for maintaining the confidentiality of your account and password. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Ensure you log out at the end of each session</li>
            </ul>
            <p className="mt-2">
              We reserve the right to terminate accounts that violate these terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-medium">8. Intellectual Property</h2>
            <p>
              All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of WizThrift and is protected by copyright, trademark, and other intellectual property laws. You may not:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Reproduce, distribute, or create derivative works from our content</li>
              <li>Use our trademarks or logos without permission</li>
              <li>Frame or mirror any content from our website</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-medium">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, WizThrift shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Your use or inability to use our services</li>
              <li>Unauthorized access to your data or account</li>
              <li>Errors, mistakes, or inaccuracies in content</li>
              <li>Product defects or quality issues beyond what was described</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-medium">10. Privacy Policy</h2>
            <p>
              Your privacy is important to us. We collect and use your personal information in accordance with applicable data protection laws. By using our service, you consent to our collection and use of your information as described in our Privacy Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-medium">11. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting to the website. Your continued use of the service after changes are posted constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-medium">12. Governing Law</h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Dehradun, Uttarakhand.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-medium">13. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <ul className="list-none space-y-1 ml-4">
              <li>Email: wizstorehelp@gmail.com</li>
              <li>Phone: +91 81170 96317</li>
              <li>Address: Suddhowala, Dehradun, Uttarakhand, India</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-medium">14. Severability</h2>
            <p>
              If any provision of these Terms and Conditions is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-medium">15. Entire Agreement</h2>
            <p>
              These Terms and Conditions, together with our Privacy Policy and any other legal notices published on this website, constitute the entire agreement between you and WizThrift.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
