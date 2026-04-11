-- =====================================================
-- إعداد Storage للصور
-- =====================================================

-- إنشاء Bucket للصور
INSERT INTO storage.buckets (id, name, public)
VALUES ('barber-images', 'barber-images', true)
ON CONFLICT (id) DO NOTHING;

-- السياسات للصور
CREATE POLICY "Anyone can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'barber-images');

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'barber-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'barber-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'barber-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );