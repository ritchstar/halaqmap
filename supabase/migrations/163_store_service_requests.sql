-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- طلبات خدمات متجر halaqmap — إدراج عبر service_role فقط. لا قراءة عامة.

CREATE TABLE IF NOT EXISTS public.store_service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name text NOT NULL,
  entity_name text,
  freelance_work_doc text,
  email_normalized text NOT NULL,
  phone text NOT NULL,
  whatsapp text NOT NULL,
  request_body text NOT NULL,
  consent_study_reply boolean NOT NULL,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_service_requests_name_len CHECK (char_length(applicant_name) BETWEEN 2 AND 80),
  CONSTRAINT store_service_requests_email_len CHECK (char_length(email_normalized) BETWEEN 3 AND 254),
  CONSTRAINT store_service_requests_body_len CHECK (char_length(request_body) BETWEEN 12 AND 4000),
  CONSTRAINT store_service_requests_consent_must_be_true CHECK (consent_study_reply = true)
);

COMMENT ON TABLE public.store_service_requests IS
  'طلبات خدمات متجر halaqmap من واجهة store.halaqmap.com — تُدرس وترد الإدارة لاحقاً. لا عقد ولا دفع من هذا الجدول.';

CREATE INDEX IF NOT EXISTS store_service_requests_created_at_idx
  ON public.store_service_requests (created_at DESC);

ALTER TABLE public.store_service_requests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.store_service_requests FROM PUBLIC;
REVOKE ALL ON TABLE public.store_service_requests FROM anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.store_service_requests TO service_role;

DROP POLICY IF EXISTS store_service_requests_service_role ON public.store_service_requests;
CREATE POLICY store_service_requests_service_role
  ON public.store_service_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
