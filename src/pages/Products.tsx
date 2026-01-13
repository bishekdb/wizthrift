import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';
import { supabase } from '@/integrations/supabase/client';
import { Filter, X, Loader2 } from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const selectedCategory = searchParams.get('category') || '';
  const selectedSize = searchParams.get('size') || '';
  const selectedCondition = searchParams.get('condition') || '';
  const minPrice = Number(searchParams.get('minPrice')) || 0;
  const maxPrice = Number(searchParams.get('maxPrice')) || 10000;

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 30000, // Cache for 30 seconds - reduces DB queries under high load
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on every tab focus
  });

  const updateFilter = (key: string, value: string | number) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, String(value));
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory && product.category !== selectedCategory) return false;
      if (selectedSize && product.size !== selectedSize) return false;
      if (selectedCondition && product.condition !== selectedCondition) return false;
      if (product.price < minPrice || product.price > maxPrice) return false;
      return true;
    });
  }, [products, selectedCategory, selectedSize, selectedCondition, minPrice, maxPrice]);

  const availableProducts = filteredProducts.filter(p => p.status === 'available');
  const soldProducts = filteredProducts.filter(p => p.status === 'sold');

  return (
    <Layout>
      <div className="container-wide py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-title mb-1">Shop</h1>
            <p className="text-small text-muted-foreground">
              {isLoading ? '...' : `${availableProducts.length} items available`}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 text-small border border-border px-4 py-2 hover:border-foreground transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="flex gap-8 md:gap-12">
          {/* Desktop Filters */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <ProductFilters
              selectedCategory={selectedCategory}
              selectedSize={selectedSize}
              selectedCondition={selectedCondition}
              priceRange={[minPrice, maxPrice]}
              onCategoryChange={(v) => updateFilter('category', v)}
              onSizeChange={(v) => updateFilter('size', v)}
              onConditionChange={(v) => updateFilter('condition', v)}
              onPriceChange={([min, max]) => {
                updateFilter('minPrice', min);
                updateFilter('maxPrice', max);
              }}
            />
          </aside>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="fixed inset-0 z-50 bg-background md:hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-title">Filters</h2>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <ProductFilters
                  selectedCategory={selectedCategory}
                  selectedSize={selectedSize}
                  selectedCondition={selectedCondition}
                  priceRange={[minPrice, maxPrice]}
                  onCategoryChange={(v) => updateFilter('category', v)}
                  onSizeChange={(v) => updateFilter('size', v)}
                  onConditionChange={(v) => updateFilter('condition', v)}
                  onPriceChange={([min, max]) => {
                    updateFilter('minPrice', min);
                    updateFilter('maxPrice', max);
                  }}
                />
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full mt-8 bg-foreground text-background py-3 text-small"
                >
                  Show {availableProducts.length} items
                </button>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : availableProducts.length === 0 && soldProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No products found matching your filters.</p>
              </div>
            ) : (
              <>
                {availableProducts.length > 0 && (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {availableProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
                
                {soldProducts.length > 0 && (
                  <div className="mt-12">
                    <h3 className="text-small text-muted-foreground mb-6">Recently Sold</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {soldProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
