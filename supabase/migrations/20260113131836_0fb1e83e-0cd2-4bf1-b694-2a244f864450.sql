-- Phase 1: Add unique constraint on profiles.user_id to prevent duplicate profiles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- Phase 2: Add explicit DELETE policy for addresses (GDPR/privacy compliance)
CREATE POLICY "Users can delete their own addresses"
ON public.addresses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Phase 3: Create secure guest order lookup function (requires order_id AND email)
CREATE OR REPLACE FUNCTION public.lookup_guest_order(p_order_id UUID, p_customer_email TEXT)
RETURNS TABLE (
  id UUID,
  status TEXT,
  total_amount NUMERIC,
  payment_status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate email format
  IF p_customer_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  RETURN QUERY
  SELECT 
    o.id,
    o.status,
    o.total_amount,
    o.payment_status,
    o.created_at
  FROM orders o
  WHERE o.id = p_order_id 
    AND o.customer_email = lower(trim(p_customer_email))
    AND o.user_id IS NULL;  -- Only for guest orders
END;
$$;

-- Phase 4: Add admin policies for order management (corrections/refunds)
CREATE POLICY "Admins can update order items"
ON public.order_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete order items"
ON public.order_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Phase 5: Create a secure view for public store info (hides sensitive contact info from anonymous)
CREATE OR REPLACE VIEW public.public_store_info AS
SELECT 
  id,
  store_name,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN contact_email
    ELSE NULL
  END as contact_email,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN contact_phone
    ELSE NULL
  END as contact_phone
FROM public.store_settings;