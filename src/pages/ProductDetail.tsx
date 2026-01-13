import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const [currentImage, setCurrentImage] = useState(0);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container-wide py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!product || error) {
    return (
      <Layout>
        <div className="container-wide py-16 text-center">
          <h1 className="text-title mb-4">Product not found</h1>
          <Button variant="outline" onClick={() => navigate('/products')}>
            Back to Shop
          </Button>
        </div>
      </Layout>
    );
  }

  const isInCart = items.some((item) => item.product.id === product.id);
  const isSold = product.status === 'sold';
  const images = product.images || [];
  const measurements = (product.measurements as Record<string, string>) || {};

  const handleAddToCart = () => {
    if (isSold) return;
    addToCart(product);
    toast.success('Added to cart');
  };

  const conditionLabels: Record<string, string> = {
    'new': 'New with tags',
    'like-new': 'Like new',
    'excellent': 'Excellent condition',
    'good': 'Good condition',
    'fair': 'Fair condition',
  };

  return (
    <Layout>
      <div className="container-wide py-8 md:py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-small text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-secondary relative overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={images[currentImage]}
                  alt={product.name}
                  className={`w-full h-full object-cover ${isSold ? 'opacity-50' : ''}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
              {isSold && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-background px-4 py-2 text-small uppercase tracking-wider">
                    Sold
                  </span>
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`w-16 h-20 bg-secondary overflow-hidden border-2 transition-colors ${
                      currentImage === idx ? 'border-foreground' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-title mb-2">{product.name}</h1>
              <div className="flex items-center gap-3">
                <span className="text-title">₹{product.price.toLocaleString()}</span>
                {product.original_price && (
                  <span className="text-body text-muted-foreground line-through">
                    ₹{product.original_price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-small text-muted-foreground">Size</span>
                <span className="text-small">{product.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-small text-muted-foreground">Condition</span>
                <span className="text-small">{conditionLabels[product.condition] || product.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-small text-muted-foreground">Category</span>
                <span className="text-small capitalize">{product.category}</span>
              </div>
            </div>

            {/* Measurements */}
            {Object.keys(measurements).length > 0 && (
              <div className="border-t border-border pt-6">
                <h3 className="text-small font-medium mb-3">Measurements</h3>
                <div className="space-y-2">
                  {Object.entries(measurements).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-small text-muted-foreground capitalize">{key}</span>
                      <span className="text-small">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="border-t border-border pt-6">
                <h3 className="text-small font-medium mb-3">Description</h3>
                <p className="text-small text-muted-foreground">{product.description}</p>
              </div>
            )}

            {/* Add to Cart */}
            <div className="border-t border-border pt-6">
              {isSold ? (
                <Button disabled className="w-full" size="lg">
                  Sold Out
                </Button>
              ) : isInCart ? (
                <Button variant="outline" className="w-full" size="lg" onClick={() => navigate('/cart')}>
                  View Cart
                </Button>
              ) : (
                <Button className="w-full" size="lg" onClick={handleAddToCart}>
                  Add to Cart
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
