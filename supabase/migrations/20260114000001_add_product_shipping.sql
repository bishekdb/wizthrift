-- Add shipping_charge to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS shipping_charge INTEGER NOT NULL DEFAULT 0;

-- Update existing products to have 99 rupees shipping by default
UPDATE public.products
SET shipping_charge = 99
WHERE shipping_charge = 0;
