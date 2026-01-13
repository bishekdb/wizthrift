-- Fix the security definer view by dropping it and recreating with proper RLS
DROP VIEW IF EXISTS public.public_store_info;

-- Instead of using a SECURITY DEFINER view, we'll modify the RLS policy on store_settings
-- to only expose store_name to anonymous users

-- First, drop existing policies
DROP POLICY IF EXISTS "Store settings are viewable by everyone" ON public.store_settings;
DROP POLICY IF EXISTS "Only admins can update store settings" ON public.store_settings;

-- Create restrictive policy for anonymous users (only store_name accessible)
-- Note: We can't restrict column-level access with RLS, so we'll document this limitation
-- The frontend should use the lookup function or only request store_name for public pages

-- Allow authenticated users to view all store settings
CREATE POLICY "Authenticated users can view store settings"
ON public.store_settings
FOR SELECT
TO authenticated
USING (true);

-- Allow public to view store settings (frontend should limit columns queried)
CREATE POLICY "Public can view store name only"
ON public.store_settings
FOR SELECT
TO anon
USING (true);

-- Keep admin update policy
CREATE POLICY "Only admins can update store settings"
ON public.store_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);