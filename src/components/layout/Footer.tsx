import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch store settings for contact info
  const { data: settings } = useQuery({
    queryKey: ['store-settings-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('store_name, contact_email, contact_phone')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching store settings:', error);
        return null;
      }
      return data;
    },
  });

  const contactEmail = settings?.contact_email || 'wizstorehelp@gmail.com';
  const contactPhone = settings?.contact_phone || '+91 81170 96317';
  const storeName = settings?.store_name || 'Wiz Store';

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    
    setIsSubmitting(true);
    // Simulate subscription
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Thanks for subscribing!');
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <footer className="border-t border-border mt-auto bg-secondary/30">
      <div className="container-wide py-12 md:py-16">
        {/* Newsletter Section */}
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-6 md:p-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Join Our Newsletter</h3>
              <p className="text-small text-muted-foreground">
                Get exclusive deals, new arrivals, and style tips delivered to your inbox.
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 md:w-64"
              />
              <Button type="submit" disabled={isSubmitting}>
                <Send className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="text-lg font-semibold tracking-tight">
              {storeName}
            </Link>
            <p className="text-small text-muted-foreground leading-relaxed">
              Curated pre-owned clothing.<br />
              Quality over quantity.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 pt-2">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Shop */}
          <div>
            <h4 className="text-small font-medium mb-4">Shop</h4>
            <div className="flex flex-col gap-3">
              <Link to="/products" className="text-small text-muted-foreground hover:text-foreground transition-colors">
                All Products
              </Link>
              <Link to="/products?category=Outerwear" className="text-small text-muted-foreground hover:text-foreground transition-colors">
                Outerwear
              </Link>
              <Link to="/products?category=Shirts" className="text-small text-muted-foreground hover:text-foreground transition-colors">
                Shirts
              </Link>
              <Link to="/products?category=Pants" className="text-small text-muted-foreground hover:text-foreground transition-colors">
                Pants
              </Link>
            </div>
          </div>
          
          {/* Customer Service */}
          <div>
            <h4 className="text-small font-medium mb-4">Customer Service</h4>
            <div className="flex flex-col gap-3">
              <Link to="/shipping" className="text-small text-muted-foreground hover:text-foreground transition-colors">
                Shipping Info
              </Link>
              <Link to="/returns" className="text-small text-muted-foreground hover:text-foreground transition-colors">
                Returns & Exchanges
              </Link>
              <Link to="/orders" className="text-small text-muted-foreground hover:text-foreground transition-colors">
                Track Order
              </Link>
              <Link to="/contact" className="text-small text-muted-foreground hover:text-foreground transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-small font-medium mb-4">Get In Touch</h4>
            <div className="flex flex-col gap-3">
              <a 
                href={`mailto:${contactEmail}`} 
                className="flex items-center gap-2 text-small text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-4 h-4" />
                {contactEmail}
              </a>
              <a 
                href={`tel:${contactPhone.replace(/\s/g, '')}`} 
                className="flex items-center gap-2 text-small text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="w-4 h-4" />
                {contactPhone}
              </a>
              <div className="flex items-start gap-2 text-small text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Suddhowala, Dehradun</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-micro text-muted-foreground">
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/shipping" className="text-micro text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-micro text-muted-foreground hover:text-foreground transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
