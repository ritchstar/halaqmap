-- طلبات تقييم تجربة برونزي (طابور مراجعة مستقل عن التسجيل الرسمي)
-- + ربط كود التجربة بإيميل مُلزم

ALTER TABLE public.bronze_trial_codes
  ADD COLUMN IF NOT EXISTS bound_email TEXT;

ALTER TABLE public.bronze_trial_codes
  ADD COLUMN IF NOT EXISTS application_id UUID;

CREATE INDEX IF NOT EXISTS bronze_trial_codes_bound_email_idx
  ON public.bronze_trial_codes (lower(bound_email))
  WHERE bound_email IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.bronze_trial_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending_email'
    CHECK (status IN (
      'pending_email',
      'pending_review',
      'approved',
      'rejected',
      'cancelled'
    )),
  salon_name TEXT NOT NULL,
  establishment_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  city_ar TEXT NOT NULL,
  district_ar TEXT NOT NULL,
  region_ar TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  notes TEXT,
  photo_exterior_sign_url TEXT NOT NULL,
  photo_exterior_2_url TEXT NOT NULL,
  photo_interior_1_url TEXT NOT NULL,
  photo_interior_2_url TEXT NOT NULL,
  upload_order_id TEXT,
  email_confirmed_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by_admin_email TEXT,
  reject_reason TEXT,
  trial_code_id UUID REFERENCES public.bronze_trial_codes (id) ON DELETE SET NULL,
  code_emailed_at TIMESTAMPTZ,
  code_email_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bronze_trial_applications_lat_chk CHECK (latitude BETWEEN -90 AND 90),
  CONSTRAINT bronze_trial_applications_lng_chk CHECK (longitude BETWEEN -180 AND 180),
  CONSTRAINT bronze_trial_applications_email_len CHECK (char_length(trim(email)) BETWEEN 5 AND 200)
);

COMMENT ON TABLE public.bronze_trial_applications IS
  'طلبات تقييم تجربة برونزي — لا تنشئ حساباً ولا رخصة؛ مستقلة عن registration_submissions.';

CREATE INDEX IF NOT EXISTS bronze_trial_applications_status_idx
  ON public.bronze_trial_applications (status, created_at DESC);

CREATE INDEX IF NOT EXISTS bronze_trial_applications_email_idx
  ON public.bronze_trial_applications (lower(email));

-- ربط application_id بعد إنشاء الجدول
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bronze_trial_codes_application_id_fkey'
  ) THEN
    ALTER TABLE public.bronze_trial_codes
      ADD CONSTRAINT bronze_trial_codes_application_id_fkey
      FOREIGN KEY (application_id) REFERENCES public.bronze_trial_applications (id) ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE public.bronze_trial_applications ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.bronze_trial_applications FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bronze_trial_applications TO service_role;
