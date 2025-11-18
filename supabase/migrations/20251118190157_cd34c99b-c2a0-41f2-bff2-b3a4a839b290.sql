-- Add type column to image_uploads to differentiate original vs processed
ALTER TABLE public.image_uploads 
ADD COLUMN image_type TEXT DEFAULT 'original' CHECK (image_type IN ('original', 'processed'));

-- Add original_image_id to link processed images to their originals
ALTER TABLE public.image_uploads 
ADD COLUMN original_image_id UUID REFERENCES public.image_uploads(id) ON DELETE CASCADE;