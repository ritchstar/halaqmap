-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- =====================================================
-- يدوي — SQL Editor فقط
-- إغلاق رفع anon/public على shop-images (legacy — لا كود في الريبو)
-- =====================================================

BEGIN;

DROP POLICY IF EXISTS "allow_public_upload_shop_images" ON storage.objects;

COMMIT;

-- Rollback:
-- CREATE POLICY "allow_public_upload_shop_images"
--   ON storage.objects FOR INSERT
--   TO public
--   WITH CHECK (bucket_id = 'shop-images');
