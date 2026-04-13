-- =====================================================
-- إعداد كامل — تسجيل الحلاقين ورفع المرفقات (ملف واحد)
-- نفّذ في Supabase → SQL Editor → Run (مرة واحدة، أو عند إعادة الإعداد)
--
-- يجمع منطق الملفات:
--   14_registration_submissions_public.sql
--   17_registration_uploads_storage.sql
--   19_registration_submissions_payload_limit.sql (حد payload 5 ميجابايت في سياسة الإدراج)
--
-- متطلب: وجود تخزين Supabase (عادة بعد 13_create_storage.sql أو المشروع الافتراضي).
-- =====================================================

-- ─── 1) جدول طلبات التسجيل + RLS + إدراج anon (حد payload 5 MB) ───

CREATE TABLE IF NOT EXISTS public.registration_submissions (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS registration_submissions_created_at_idx
  ON public.registration_submissions (created_at DESC);

ALTER TABLE public.registration_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_registration_submissions" ON public.registration_submissions;
CREATE POLICY "anon_insert_registration_submissions"
  ON public.registration_submissions
  FOR INSERT
  TO anon
  WITH CHECK (
    char_length(id) <= 80
    AND octet_length(payload::text) <= 5242880
  );

-- لا سياسة SELECT لـ anon (تجنب تسريب البيانات). مراجعة الطلبات من Table Editor أو لوحة أدمن بصلاحيات مناسبة.

-- ─── 2) حاوية مرفقات التسجيل + سياسات الرفع والقراءة ───

INSERT INTO storage.buckets (id, name, public)
VALUES ('registration-uploads', 'registration-uploads', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "anon_insert_registration_uploads" ON storage.objects;
CREATE POLICY "anon_insert_registration_uploads"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'registration-uploads'
    AND (storage.foldername(name))[1] ~ '^HM-[0-9]{8}-[A-Z0-9]{6}$'
  );

DROP POLICY IF EXISTS "public_read_registration_uploads" ON storage.objects;
CREATE POLICY "public_read_registration_uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'registration-uploads');

-- =====================================================
-- انتهى. تحقق: Storage →Buckets → registration-uploads
-- و Table Editor → registration_submissions
-- =====================================================
