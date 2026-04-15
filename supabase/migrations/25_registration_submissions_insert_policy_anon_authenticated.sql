-- =====================================================
-- تعزيز سياسة إدراج طلبات التسجيل
-- =====================================================
-- يغطي حالتين:
-- 1) زائر بدون جلسة (role = anon)
-- 2) مستخدم لديه جلسة عالقة/سابقة (role = authenticated)
--
-- الهدف: منع فشل الإدراج المتكرر بسبب اختلاف الدور في المتصفح.

ALTER TABLE public.registration_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_registration_submissions" ON public.registration_submissions;
CREATE POLICY "anon_insert_registration_submissions"
  ON public.registration_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(id) <= 80
    AND octet_length(payload::text) <= 5242880
  );
