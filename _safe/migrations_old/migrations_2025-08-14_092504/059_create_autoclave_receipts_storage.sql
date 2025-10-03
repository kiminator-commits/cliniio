-- =====================================================
-- CREATE AUTOCLAVE RECEIPTS STORAGE BUCKET
-- =====================================================

-- Create storage bucket for autoclave receipt images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'autoclave-receipts',
  'autoclave-receipts',
  false, -- Private bucket for security
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policy for authenticated users to upload receipts
CREATE POLICY "Authenticated users can upload autoclave receipts" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'autoclave-receipts' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create storage policy for users to view receipts from their facility
CREATE POLICY "Users can view autoclave receipts from their facility" ON storage.objects
FOR SELECT USING (
  bucket_id = 'autoclave-receipts'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM users u
    JOIN autoclave_receipts ar ON u.facility_id = ar.facility_id
    WHERE u.id = auth.uid()
    AND ar.photo_filename = storage.objects.name
  )
);

-- Create storage policy for users to update their own receipts
CREATE POLICY "Users can update their own autoclave receipts" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'autoclave-receipts'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create storage policy for users to delete their own receipts
CREATE POLICY "Users can delete their own autoclave receipts" ON storage.objects
FOR DELETE USING (
  bucket_id = 'autoclave-receipts'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
); 