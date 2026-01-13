-- Strengthen RLS policies by targeting authenticated role instead of public

-- Orders table
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

CREATE POLICY "Users can create orders" ON orders FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT TO authenticated 
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE TO authenticated 
  USING (has_role(auth.uid(), 'admin'));

-- Addresses table
DROP POLICY IF EXISTS "Users can manage their own addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can view all addresses" ON addresses;

CREATE POLICY "Users can manage their own addresses" ON addresses FOR ALL TO authenticated 
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all addresses" ON addresses FOR SELECT TO authenticated 
  USING (has_role(auth.uid(), 'admin'));

-- Profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT TO authenticated 
  USING (has_role(auth.uid(), 'admin'));

-- Order items table
DROP POLICY IF EXISTS "Users can create order items for their orders" ON order_items;
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

CREATE POLICY "Users can create order items for their orders" ON order_items FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can view their own order items" ON order_items FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT TO authenticated 
  USING (has_role(auth.uid(), 'admin'));

-- User roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;

CREATE POLICY "Users can view their own roles" ON user_roles FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON user_roles FOR SELECT TO authenticated 
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON user_roles FOR ALL TO authenticated 
  USING (has_role(auth.uid(), 'admin'));

-- Store settings table - update admin policies to target authenticated
DROP POLICY IF EXISTS "Admins can insert settings" ON store_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON store_settings;
DROP POLICY IF EXISTS "Admins can view settings" ON store_settings;

CREATE POLICY "Admins can insert settings" ON store_settings FOR INSERT TO authenticated 
  WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update settings" ON store_settings FOR UPDATE TO authenticated 
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view settings" ON store_settings FOR SELECT TO authenticated 
  USING (has_role(auth.uid(), 'admin'));

-- Products table - update admin policy to target authenticated
DROP POLICY IF EXISTS "Admins can manage products" ON products;

CREATE POLICY "Admins can manage products" ON products FOR ALL TO authenticated 
  USING (has_role(auth.uid(), 'admin'));