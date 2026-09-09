-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- =====================================================
-- يدوي — SQL Editor فقط (ليس db push / ليس migration CLI)
-- الهدف: إغلاق list على /storage/v1/object/list/<bucket> لـ anon/authenticated
--        مع الإبقاء على bucket.public = true → /object/public/... يعمل بلا RLS
-- =====================================================
--
-- تحقق قبل/بعد (انسخهما منفصلين):
--
-- SELECT b.id, b.public, p.policyname, p.cmd, p.roles, p.qual
-- FROM storage.buckets b
-- LEFT JOIN pg_policies p ON p.schemaname = 'storage' AND p.tablename = 'objects'
--   AND p.qual LIKE ('%' || b.id || '%')
-- WHERE b.id IN (
--   'barber-images', 'barber-portfolio', 'barber-team', 'partner-promo', 'shop-images'
-- )
-- ORDER BY b.id, p.policyname;
--
-- =====================================================

BEGIN;

-- ── barber-images ─────────────────────────────────────────────
-- يبقى INSERT/UPDATE/DELETE للمصادق (legacy). نستبدل SELECT العام بقراءة مجلد المالك فقط.
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "public_read_barber_images" ON storage.objects;

DROP POLICY IF EXISTS "authenticated_read_own_barber_images" ON storage.objects;
CREATE POLICY "authenticated_read_own_barber_images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'barber-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── barber-portfolio ──────────────────────────────────────────
-- list/upload/delete عبر API بـ service_role (يتجاوز RLS). لا SELECT عام.
DROP POLICY IF EXISTS "public_read_barber_portfolio" ON storage.objects;

-- ── barber-team ───────────────────────────────────────────────
-- service_role_write_barber_team (ALL) موجود مسبقاً — يكفي للخادم.
DROP POLICY IF EXISTS "public_read_barber_team" ON storage.objects;

-- ── partner-promo ─────────────────────────────────────────────
DROP POLICY IF EXISTS "public_read_partner_promo" ON storage.objects;

-- ── shop-images ───────────────────────────────────────────────
DROP POLICY IF EXISTS "allow_public_read_shop_images" ON storage.objects;
DROP POLICY IF EXISTS "public_read_shop_images" ON storage.objects;

-- لا نغيّر public على الحاويات — روابط /object/public/... تبقى كما هي
-- UPDATE storage.buckets SET public = true WHERE id IN (...);  -- intentionally omitted

COMMIT;

-- =====================================================
-- Rollback طوارئ (فقط إن لزم — يعيد list المفتوح):
--
-- CREATE POLICY "public_read_barber_images" ON storage.objects FOR SELECT
--   USING (bucket_id = 'barber-images');
-- CREATE POLICY "public_read_barber_portfolio" ON storage.objects FOR SELECT
--   USING (bucket_id = 'barber-portfolio');
-- CREATE POLICY "public_read_barber_team" ON storage.objects FOR SELECT
--   USING (bucket_id = 'barber-team');
-- CREATE POLICY "public_read_partner_promo" ON storage.objects FOR SELECT
--   USING (bucket_id = 'partner-promo');
-- CREATE POLICY "allow_public_read_shop_images" ON storage.objects FOR SELECT
--   USING (bucket_id = 'shop-images');
-- DROP POLICY IF EXISTS "authenticated_read_own_barber_images" ON storage.objects;
-- =====================================================
