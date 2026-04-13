-- =====================================================
-- إصلاح سياسة إدراج مرفقات التسجيل في التخزين
-- استبدال storage.foldername(name)[1] بـ split_part(name, '/', 1)
-- لأن بعض إصدارات/إعدادات Supabase لا تُرجع المجلد الأول كما يُتوقع في WITH CHECK.
-- نفّذ في SQL Editor إذا بقي رفض الرفع رغم تشغيل 17 أو REGISTRATION_PUBLIC_FULL_SETUP.sql
-- =====================================================

DROP POLICY IF EXISTS "anon_insert_registration_uploads" ON storage.objects;
CREATE POLICY "anon_insert_registration_uploads"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'registration-uploads'
    AND split_part(name, '/', 1) ~ '^HM-[0-9]{8}-[A-Z0-9]{6}$'
  );
