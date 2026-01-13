-- Allow anyone to view store settings (for footer display)
CREATE POLICY "Anyone can view store settings" 
ON public.store_settings 
FOR SELECT 
USING (true);