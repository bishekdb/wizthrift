import { Product } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Wool Blend Overcoat',
    price: 2400,
    originalPrice: 8500,
    category: 'Outerwear',
    size: 'M',
    condition: 'like-new',
    description: 'Classic camel wool blend overcoat. Minimal wear, professionally dry cleaned. Perfect for layering.',
    measurements: {
      chest: '42"',
      length: '38"',
      shoulders: '18"',
    },
    images: [
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Linen Button-Down Shirt',
    price: 650,
    originalPrice: 2200,
    category: 'Shirts',
    size: 'L',
    condition: 'good',
    description: 'Relaxed fit white linen shirt. Some minor fading, adds to the character.',
    measurements: {
      chest: '44"',
      length: '30"',
      shoulders: '19"',
    },
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
    createdAt: '2024-01-14',
  },
  {
    id: '3',
    name: 'Slim Fit Chinos',
    price: 800,
    originalPrice: 2800,
    category: 'Pants',
    size: '32',
    condition: 'like-new',
    description: 'Navy blue slim fit chinos. Worn twice, excellent condition.',
    measurements: {
      waist: '32"',
      length: '32"',
    },
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
    createdAt: '2024-01-13',
  },
  {
    id: '4',
    name: 'Cashmere Crew Neck Sweater',
    price: 1800,
    originalPrice: 6500,
    category: 'Knitwear',
    size: 'S',
    condition: 'good',
    description: 'Soft gray cashmere sweater. Minor pilling, otherwise excellent.',
    measurements: {
      chest: '38"',
      length: '26"',
    },
    images: [
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
    createdAt: '2024-01-12',
  },
  {
    id: '5',
    name: 'Denim Jacket',
    price: 1200,
    originalPrice: 4000,
    category: 'Outerwear',
    size: 'M',
    condition: 'good',
    description: 'Classic medium wash denim jacket. Natural fading and wear.',
    measurements: {
      chest: '42"',
      length: '24"',
      shoulders: '18"',
    },
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
    createdAt: '2024-01-11',
  },
  {
    id: '6',
    name: 'Oxford Dress Shoes',
    price: 2200,
    originalPrice: 7500,
    category: 'Footwear',
    size: '42',
    condition: 'like-new',
    description: 'Black leather oxford shoes. Worn to one event, includes original box.',
    measurements: {},
    images: [
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
    createdAt: '2024-01-10',
  },
  {
    id: '7',
    name: 'Cotton T-Shirt Pack',
    price: 450,
    originalPrice: 1500,
    category: 'Basics',
    size: 'L',
    condition: 'good',
    description: 'Set of 3 plain cotton t-shirts in black, white, and gray.',
    measurements: {
      chest: '44"',
      length: '28"',
    },
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
    createdAt: '2024-01-09',
  },
  {
    id: '8',
    name: 'Tailored Blazer',
    price: 1600,
    originalPrice: 5500,
    category: 'Outerwear',
    size: 'M',
    condition: 'like-new',
    description: 'Charcoal gray tailored blazer. Perfect for office or evening wear.',
    measurements: {
      chest: '40"',
      length: '28"',
      shoulders: '17.5"',
    },
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'sold',
    createdAt: '2024-01-08',
  },
];

export const categories = [
  'All',
  'Outerwear',
  'Shirts',
  'Pants',
  'Knitwear',
  'Basics',
  'Footwear',
];

export const sizes = ['XS', 'S', 'M', 'L', 'XL', '30', '32', '34', '36', '40', '42', '44'];

export const conditions = [
  { value: 'new', label: 'New with tags' },
  { value: 'like-new', label: 'Like new' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];
