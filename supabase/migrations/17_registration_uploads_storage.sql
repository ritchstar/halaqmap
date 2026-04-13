-- =====================================================
-- تخزين مرفقات طلبات التسجيل (مستندات + صور + إيصال)
-- للتنفيذ دفعة واحدة مع الجدول: ../REGISTRATION_PUBLIC_FULL_SETUP.sql
-- نفّذ في Supabase بعد migration 13 (storage).
-- المسار: {orderId}/documents|health|shop|banners|receipt/...
-- معرف الطلب من الواجهة بصيغة HM-YYYYMMDD-XXXXXX حيث XXXXXX = 6 أحرف من [A-Z0-9] (يجب تطابق generateRegistrationOrderId في الكود)
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('registration-uploads', 'registration-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- رفع من نموذج التسجيل بدون تسجيل دخول؛ تنظيم المسارات في الواجهة بـ orderId (RLS لا يفرض شكل المسار)
DROP POLICY IF EXISTS "anon_insert_registration_uploads" ON storage.objects;
CREATE POLICY "anon_insert_registration_uploads"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'registration-uploads');

-- قراءة عامة بالرابط المباشر (الروابط تُخزَّن في payload الطلب وليست قابلة للتخمين بسهولة)
DROP POLICY IF EXISTS "public_read_registration_uploads" ON storage.objects;
CREATE POLICY "public_read_registration_uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'registration-uploads');

-- لا سياسات UPDATE/DELETE لـ anon — التعديل من لوحة Supabase أو service_role عند الحاجة.
