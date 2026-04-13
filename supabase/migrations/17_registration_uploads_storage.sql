-- =====================================================
-- تخزين مرفقات طلبات التسجيل (مستندات + صور + إيصال)
-- نفّذ في Supabase بعد migration 13 (storage).
-- المسار: {orderId}/documents|health|shop|banners|receipt/...
-- معرف الطلب من الواجهة بصيغة HM-YYYYMMDD-XXXXXX
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('registration-uploads', 'registration-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- رفع من نموذج التسجيل بدون تسجيل دخول: المجلد الأول يجب أن يطابق رقم الطلب
DROP POLICY IF EXISTS "anon_insert_registration_uploads" ON storage.objects;
CREATE POLICY "anon_insert_registration_uploads"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'registration-uploads'
    AND (storage.foldername(name))[1] ~ '^HM-[0-9]{8}-[A-Z0-9]{6}$'
  );

-- قراءة عامة بالرابط المباشر (الروابط تُخزَّن في payload الطلب وليست قابلة للتخمين بسهولة)
DROP POLICY IF EXISTS "public_read_registration_uploads" ON storage.objects;
CREATE POLICY "public_read_registration_uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'registration-uploads');

-- لا سياسات UPDATE/DELETE لـ anon — التعديل من لوحة Supabase أو service_role عند الحاجة.
