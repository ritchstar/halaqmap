-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- =====================================================
-- تخزين ملفات لشعار المتجر وخلفيات الصفحة/الهيدر في منتجات "حيّك" الحيّة
-- (طبختنا/تمويناتا/خضارنا/مطعمنا/تمرتنا/كافينا وغيرها ممن تستخدم
-- StoreShopIdentityDesk / StoreShopBackgroundDesk).
--
-- الهدف: عدم تخزين الصور كنص base64 داخل عمود payload بعد الآن (كان يُعاد
-- إرساله كاملاً مع كل استطلاع (polling) للوحة الكاشير/صفحة الزبون كل بضع
-- ثوانٍ — أحد أسباب ارتفاع Fast Data Transfer). الآن يُرفع الملف مرة واحدة
-- عند الحفظ من الخادم (service_role)، ويُخزَّن رابط عام صغير بدل النص الضخم؛
-- المتصفح يخزّن الصورة نفسها مؤقتاً (HTTP cache) تلقائياً.
--
-- الرفع من الخادم فقط (service_role يتجاوز RLS)، فلا حاجة لسياسة INSERT لـ anon.
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('store-shop-media', 'store-shop-media', true)
ON CONFLICT (id) DO NOTHING;

-- قراءة عامة بالرابط المباشر (شعار/خلفية المتجر تُعرض للزبائن بلا تسجيل دخول)
DROP POLICY IF EXISTS "public_read_store_shop_media" ON storage.objects;
CREATE POLICY "public_read_store_shop_media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'store-shop-media');

-- لا سياسات INSERT/UPDATE/DELETE لـ anon أو authenticated — الرفع من الخادم
-- فقط عبر service_role عند حفظ بيانات المتجر (saveHost في كل منتج).
