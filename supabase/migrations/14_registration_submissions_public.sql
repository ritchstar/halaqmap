-- =====================================================
-- طلبات التسجيل العامة (نموذج «سجل كحلاق») — JSONB
-- نفّذ هذا الملف في Supabase → SQL Editor بعد إنشاء المشروع.
-- الإدراج: مفتاح anon من الواجهة. القراءة: اضبط سياسة SELECT لاحقاً
-- (مثلاً عبر Edge Function بمفتاح service_role أو تسجيل دخول أدمن حقيقي).
-- =====================================================

CREATE TABLE IF NOT EXISTS public.registration_submissions (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS registration_submissions_created_at_idx
  ON public.registration_submissions (created_at DESC);

ALTER TABLE public.registration_submissions ENABLE ROW LEVEL SECURITY;

-- إدراج من الموقع بدون تسجيل دخول (نموذج التسجيل)
DROP POLICY IF EXISTS "anon_insert_registration_submissions" ON public.registration_submissions;
CREATE POLICY "anon_insert_registration_submissions"
  ON public.registration_submissions
  FOR INSERT
  TO anon
  WITH CHECK (
    char_length(id) <= 80
    AND octet_length(payload::text) <= 1048576
  );

-- لا سياسة SELECT للـ anon افتراضياً (تجنب تسريب بيانات عبر مفتاح الواجهة).
-- لعرض الطلبات في لوحة الأدمن من التطبيق لاحقاً:
--   • أضف Edge Function مع service_role، أو
--   • سياسة SELECT مرتبطة بـ auth.uid() للأدمن فقط، أو
--   • راجع البيانات من Supabase → Table Editor.
