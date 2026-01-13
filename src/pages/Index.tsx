import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { data: featuredProducts = [], isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      return data;
    },
    staleTime: 60000, // Cache for 1 minute - homepage can be slightly stale
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="container-wide py-16 md:py-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            Pre-owned clothing,<br />
            curated with care.
          </h1>
          <p className="text-base text-muted-foreground mb-8 max-w-md leading-relaxed">
            Quality secondhand pieces at fair prices. Each item inspected, cleaned, and ready to wear.
          </p>
          <Link to="/products">
            <Button size="lg" className="text-base">Shop All</Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-wide py-12 md:py-16 border-t border-border">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">New Arrivals</h2>
          <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            View all →
          </Link>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No products available yet
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Value Props */}
      <section className="container-wide py-12 md:py-16 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div>
            <h3 className="text-sm font-medium mb-2">Quality Checked</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every item is inspected for quality and condition before listing.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Fair Pricing</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Transparent pricing based on condition and original value.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Sustainable Choice</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Extend the life of quality garments. Better for your wallet and the planet.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-wide py-12 md:py-16 border-t border-border">
        <h2 className="text-2xl font-semibold tracking-tight mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Outerwear', 'Shirts', 'Pants', 'Accessories'].map((category) => (
            <Link
              key={category}
              to={`/products?category=${category}`}
              className="group border border-border p-6 md:p-8 text-center hover:border-foreground hover:bg-secondary/50 transition-all"
            >
              <span className="text-sm font-medium">{category}</span>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
