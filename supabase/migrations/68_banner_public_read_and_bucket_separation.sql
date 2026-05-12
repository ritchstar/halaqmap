-- =====================================================
-- سياسات البنر (Public Read) + فصل واضح عن معرض الأعمال
-- =====================================================
--
-- الهدف:
-- - صور البنرات/صور الحلاق العامة يجب أن تكون قابلة للقراءة بشكل عام (Public Read) لضمان ظهورها سريعاً على الخريطة.
-- - صور معرض الأعمال تُدار في حاوية مستقلة (barber-portfolio) بمسارات {barberId}/... ويتم ضبط الرفع/الحذف عبر خادم التطبيق.
--

-- تأكيد أن حاوية صور الحلاق العامة موجودة ومعلنة للقراءة العامة
INSERT INTO storage.buckets (id, name, public)
VALUES ('barber-images', 'barber-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- سياسة قراءة عامة صريحة لصور البنر/صور الحلاق (لا تؤثر على سياسات أخرى إن كانت موجودة)
DROP POLICY IF EXISTS "public_read_barber_images" ON storage.objects;
CREATE POLICY "public_read_barber_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'barber-images');

-- ملاحظة: سياسة public_read_registration_uploads موجودة مسبقاً في migration 17 للحاوية registration-uploads
-- ولا نحتاج لتعديلها هنا، لكنها تُغطي أيضاً مجلد banners داخلها.

