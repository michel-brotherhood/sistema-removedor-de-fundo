-- Create storage bucket for uploaded images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploaded-images', 'uploaded-images', true);

-- Create policy to allow anyone to upload images
CREATE POLICY "Anyone can upload images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'uploaded-images');

-- Create policy to allow anyone to view images
CREATE POLICY "Anyone can view uploaded images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'uploaded-images');

-- Create table to store image metadata
CREATE TABLE public.image_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.image_uploads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert image metadata
CREATE POLICY "Anyone can insert image metadata"
ON public.image_uploads
FOR INSERT
WITH CHECK (true);

-- Allow anyone to view image metadata
CREATE POLICY "Anyone can view image metadata"
ON public.image_uploads
FOR SELECT
USING (true);