
-- Add the missing columns to the categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS display_on_homepage boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS homepage_order bigint DEFAULT NULL;

-- Update existing categories to have proper default values
UPDATE public.categories 
SET display_on_homepage = true 
WHERE display_on_homepage IS NULL;
