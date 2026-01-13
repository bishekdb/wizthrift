-- Fix profiles table: Add explicit INSERT policy for authenticated users
CREATE POLICY "Authenticated users can create their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix user_roles table: Ensure only authenticated users can access
-- Drop existing policies first to recreate with explicit authentication requirement
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Recreate with explicit authenticated role
CREATE POLICY "Authenticated users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);