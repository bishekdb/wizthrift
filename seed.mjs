import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rjusmspyboytjrnvxroc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqdXNtc3B5Ym95dGpybnZ4cm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMjM5MTMsImV4cCI6MjA4Mzg5OTkxM30.piAPz_qebl67D85kMXmsVEsGBYinpCQvSslwY-6vll8';

const supabase = createClient(supabaseUrl, supabaseKey);

const products = [
  {
    name: 'Wool Blend Overcoat',
    description: 'Classic camel wool blend overcoat. Minimal wear, professionally dry cleaned. Perfect for layering.',
    category: 'Outerwear',
    size: 'M',
    condition: 'like-new',
    price: 2400,
    original_price: 8500,
    images: ['https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop&q=80'],
    status: 'available'
  },
  {
    name: 'Linen Button-Down Shirt',
    description: 'Relaxed fit white linen shirt. Some minor fading, adds to the character.',
    category: 'Shirts',
    size: 'L',
    condition: 'good',
    price: 650,
    original_price: 2200,
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80'],
    status: 'available'
  },
  {
    name: 'Slim Fit Chinos',
    description: 'Navy blue chinos in excellent condition. Tailored fit with slight stretch.',
    category: 'Pants',
    size: 'S',
    condition: 'excellent',
    price: 800,
    original_price: 2800,
    images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80'],
    status: 'available'
  },
  {
    name: 'Leather Chelsea Boots',
    description: 'Premium brown leather Chelsea boots. Well-maintained with natural patina.',
    category: 'Shoes',
    size: '10',
    condition: 'good',
    price: 2800,
    original_price: 9500,
    images: ['https://images.unsplash.com/photo-1542840410-3092f99611a3?w=800&auto=format&fit=crop&q=80'],
    status: 'available'
  },
  {
    name: 'Cashmere V-Neck Sweater',
    description: 'Soft grey cashmere sweater. Minimal pilling, excellent warmth.',
    category: 'Knitwear',
    size: 'M',
    condition: 'excellent',
    price: 1500,
    original_price: 5200,
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80'],
    status: 'available'
  },
  {
    name: 'Denim Jacket',
    description: 'Classic blue denim jacket with vintage fade. Authentic lived-in look.',
    category: 'Outerwear',
    size: 'L',
    condition: 'good',
    price: 1200,
    original_price: 4200,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80'],
    status: 'available'
  },
  {
    name: 'Oxford Dress Shoes',
    description: 'Black cap-toe oxfords. Minimal creasing, excellent for formal occasions.',
    category: 'Shoes',
    size: '9',
    condition: 'like-new',
    price: 3200,
    original_price: 12000,
    images: ['https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&auto=format&fit=crop&q=80'],
    status: 'available'
  },
  {
    name: 'Wool Scarf',
    description: 'Charcoal grey merino wool scarf. Soft texture, versatile styling.',
    category: 'Accessories',
    size: 'One Size',
    condition: 'excellent',
    price: 450,
    original_price: 1500,
    images: ['https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop&q=80'],
    status: 'available'
  },
  {
    name: 'Tailored Blazer',
    description: 'Navy wool blazer with subtle texture. Single-breasted, two-button.',
    category: 'Outerwear',
    size: 'M',
    condition: 'excellent',
    price: 2200,
    original_price: 7800,
    images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80'],
    status: 'available'
  },
  {
    name: 'Canvas Sneakers',
    description: 'White canvas low-tops. Clean and minimal design.',
    category: 'Shoes',
    size: '10',
    condition: 'good',
    price: 900,
    original_price: 2800,
    images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80'],
    status: 'available'
  }
];

async function seedProducts() {
  console.log('🌱 Seeding products...');
  
  const { data, error } = await supabase
    .from('products')
    .insert(products)
    .select();

  if (error) {
    console.error('❌ Error inserting products:', error);
  } else {
    console.log(`✅ Inserted ${data.length} products successfully!`);
  }

  // Insert default store settings
  const { error: settingsError } = await supabase
    .from('store_settings')
    .insert({
      store_name: 'WizThrift',
      contact_email: 'contact@wizthrift.com',
      contact_phone: '+1-555-0123',
      new_order_notifications: true,
      low_stock_alerts: true,
      customer_messages: true
    });

  if (settingsError && !settingsError.message.includes('duplicate')) {
    console.error('❌ Error inserting store settings:', settingsError);
  } else {
    console.log('✅ Store settings configured!');
  }

  process.exit(0);
}

seedProducts();
