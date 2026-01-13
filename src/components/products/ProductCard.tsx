import { Link } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';

interface ProductCardProps {
  product: Tables<'products'>;
}

export function ProductCard({ product }: ProductCardProps) {
  const isSold = product.status === 'sold';

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative aspect-square bg-secondary overflow-hidden mb-3 max-h-48 sm:max-h-56">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className={`w-full h-full object-contain transition-opacity duration-300 ${
              isSold ? 'opacity-50' : 'group-hover:opacity-90'
            }`}
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-muted-foreground text-micro ${
            isSold ? 'opacity-50' : ''
          }`}>
            No image
          </div>
        )}
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-background px-3 py-1 text-micro uppercase tracking-wider">
              Sold
            </span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-small truncate">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-small">₹{product.price.toLocaleString()}</span>
          {product.original_price && (
            <span className="text-small text-muted-foreground line-through">
              ₹{product.original_price.toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-micro text-muted-foreground">
          <span>{product.size}</span>
          <span>·</span>
          <span className="capitalize">{product.condition.replace('-', ' ')}</span>
        </div>
      </div>
    </Link>
  );
}
