-- Add shipping configuration to store_settings
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS shipping_charge INTEGER NOT NULL DEFAULT 99,
ADD COLUMN IF NOT EXISTS free_shipping_threshold INTEGER NOT NULL DEFAULT 2000;

-- Update existing row with default values
UPDATE public.store_settings
SET 
  shipping_charge = 99,
  free_shipping_threshold = 2000
WHERE shipping_charge IS NULL OR free_shipping_threshold IS NULL;
