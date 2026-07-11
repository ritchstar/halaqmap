-- سفراء: استمارة انضمام + حالات الحساب (قيد مراجعة / مؤقت / معتمد)
-- يكمّل 138_ambassador_field_program.sql

ALTER TABLE public.ambassadors
  ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'pending_review'
    CHECK (account_status IN ('pending_review', 'provisional', 'active', 'rejected', 'suspended', 'closed'));

ALTER TABLE public.ambassadors
  ADD COLUMN IF NOT EXISTS coverage_area text;

ALTER TABLE public.ambassadors
  ADD COLUMN IF NOT EXISTS sales_experience text;

ALTER TABLE public.ambassadors
  ADD COLUMN IF NOT EXISTS social_proof_url text;

ALTER TABLE public.ambassadors
  ADD COLUMN IF NOT EXISTS social_proof_path text;

ALTER TABLE public.ambassadors
  ADD COLUMN IF NOT EXISTS application_submitted_at timestamptz;

ALTER TABLE public.ambassadors
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

ALTER TABLE public.ambassadors
  ADD COLUMN IF NOT EXISTS reject_reason text;

ALTER TABLE public.ambassadors
  ADD COLUMN IF NOT EXISTS first_barber_close_at timestamptz;

COMMENT ON COLUMN public.ambassadors.account_status IS
  'pending_review → provisional (بعد قبول المراجعة) → active (بعد أول إغلاق صالون ناجح)';

COMMENT ON COLUMN public.ambassadors.first_barber_close_at IS
  'أول إغلاق صالون بمطابقة رخصة — يفتح المفروشات وصرف المحفظة والاعتماد الرسمي';
