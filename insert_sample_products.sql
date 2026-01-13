-- Insert sample products
INSERT INTO products (name, description, category, size, condition, price, original_price, images, status) VALUES
('Wool Blend Overcoat', 'Classic camel wool blend overcoat. Minimal wear, professionally dry cleaned. Perfect for layering.', 'Outerwear', 'M', 'like-new', 2400, 8500, ARRAY['https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop&q=80'], 'available'),

('Linen Button-Down Shirt', 'Relaxed fit white linen shirt. Some minor fading, adds to the character.', 'Shirts', 'L', 'good', 650, 2200, ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80'], 'available'),

('Slim Fit Chinos', 'Navy blue chinos in excellent condition. Tailored fit with slight stretch.', 'Pants', 'S', 'excellent', 800, 2800, ARRAY['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80'], 'available'),

('Leather Chelsea Boots', 'Premium brown leather Chelsea boots. Well-maintained with natural patina.', 'Shoes', '10', 'good', 2800, 9500, ARRAY['https://images.unsplash.com/photo-1542840410-3092f99611a3?w=800&auto=format&fit=crop&q=80'], 'available'),

('Cashmere V-Neck Sweater', 'Soft grey cashmere sweater. Minimal pilling, excellent warmth.', 'Knitwear', 'M', 'excellent', 1500, 5200, ARRAY['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80'], 'available'),

('Denim Jacket', 'Classic blue denim jacket with vintage fade. Authentic lived-in look.', 'Outerwear', 'L', 'good', 1200, 4200, ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80'], 'available'),

('Oxford Dress Shoes', 'Black cap-toe oxfords. Minimal creasing, excellent for formal occasions.', 'Shoes', '9', 'like-new', 3200, 12000, ARRAY['https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&auto=format&fit=crop&q=80'], 'available'),

('Wool Scarf', 'Charcoal grey merino wool scarf. Soft texture, versatile styling.', 'Accessories', 'One Size', 'excellent', 450, 1500, ARRAY['https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop&q=80'], 'available'),

('Tailored Blazer', 'Navy wool blazer with subtle texture. Single-breasted, two-button.', 'Outerwear', 'M', 'excellent', 2200, 7800, ARRAY['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80'], 'available'),

('Canvas Sneakers', 'White canvas low-tops. Clean and minimal design.', 'Shoes', '10', 'good', 900, 2800, ARRAY['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80'], 'available');

-- Insert default store settings
INSERT INTO store_settings (store_name, contact_email, contact_phone, new_order_notifications, low_stock_alerts, customer_messages)
VALUES ('Second Chance Threads', 'contact@secondchancethreads.com', '+1-555-0123', true, true, true)
ON CONFLICT DO NOTHING;
