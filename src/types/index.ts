export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  size: string;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  description: string;
  measurements: {
    chest?: string;
    length?: string;
    shoulders?: string;
    waist?: string;
  };
  images: string[];
  status: 'available' | 'sold';
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'upi' | 'stripe';
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingAddress: Address;
  createdAt: string;
}

export interface Address {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}
