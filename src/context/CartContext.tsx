import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

type Product = Tables<'products'>;

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Validate cart item structure and integrity
const validateCartItem = (item: any): item is CartItem => {
  if (!item || typeof item !== 'object') return false;
  if (!item.product || typeof item.product !== 'object') return false;
  if (!item.product.id || typeof item.product.id !== 'string') return false;
  if (typeof item.product.price !== 'number' || item.product.price < 0) return false;
  if (typeof item.quantity !== 'number' || item.quantity < 1) return false;
  return true;
};

// Verify product prices against database
const verifyCartPrices = async (items: CartItem[]): Promise<CartItem[]> => {
  if (items.length === 0) return [];
  
  const productIds = items.map(item => item.product.id);
  
  const { data: dbProducts, error } = await supabase
    .from('products')
    .select('id, price, status')
    .in('id', productIds);
  
  if (error || !dbProducts) {
    // If verification fails, clear cart for security
    return [];
  }
  
  // Filter out sold products and fix prices
  return items
    .filter(item => {
      const dbProduct = dbProducts.find(p => p.id === item.product.id);
      return dbProduct && dbProduct.status === 'available';
    })
    .map(item => {
      const dbProduct = dbProducts.find(p => p.id === item.product.id);
      if (dbProduct && dbProduct.price !== item.product.price) {
        // Price mismatch - use database price
        return {
          ...item,
          product: { ...item.product, price: dbProduct.price }
        };
      }
      return item;
    });
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isVerifying, setIsVerifying] = useState(true);

  // Load and validate cart on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const saved = localStorage.getItem('cart');
        if (!saved) {
          setIsVerifying(false);
          return;
        }
        
        const parsed = JSON.parse(saved);
        
        // Validate structure
        if (!Array.isArray(parsed)) {
          localStorage.removeItem('cart');
          setIsVerifying(false);
          return;
        }
        
        const validItems = parsed.filter(validateCartItem);
        
        // Verify prices against database
        const verifiedItems = await verifyCartPrices(validItems);
        
        setItems(verifiedItems);
      } catch (error) {
        // Invalid JSON or other error - clear cart
        localStorage.removeItem('cart');
      } finally {
        setIsVerifying(false);
      }
    };
    
    loadCart();
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!isVerifying) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isVerifying]);

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
