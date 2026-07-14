-- طابور طلبات السفراء + أعمدة مراجعة أدمن
-- يكمّل 138/139

ALTER TABLE public.ambassadors
  ADD COLUMN IF NOT EXISTS reviewed_by_admin_email text;

ALTER TABLE public.ambassadors
  ADD COLUMN IF NOT EXISTS email text;

COMMENT ON COLUMN public.ambassadors.reviewed_by_admin_email IS
  'بريد الأدمن الذي قبل/رفض طلب الانضمام';

CREATE INDEX IF NOT EXISTS ambassadors_account_status_idx
  ON public.ambassadors (account_status, application_submitted_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS ambassadors_phone_idx
  ON public.ambassadors (phone);

-- عزل عن العملاء: service_role فقط
REVOKE ALL ON public.ambassadors FROM anon, authenticated;
REVOKE ALL ON public.ambassador_target_requests FROM anon, authenticated;
REVOKE ALL ON public.ambassador_wallet_ledger FROM anon, authenticated;
REVOKE ALL ON public.ambassador_payout_requests FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ambassadors TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ambassador_target_requests TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ambassador_wallet_ledger TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ambassador_payout_requests TO service_role;
