-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- لوحة مشغّلي خريطة الحل: رموز بريد وجلسات. بلا شراء.

CREATE TABLE IF NOT EXISTS public.store_operator_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code_hash text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_operator_otps_email_chk CHECK (char_length(email) BETWEEN 5 AND 180),
  CONSTRAINT store_operator_otps_hash_chk CHECK (char_length(code_hash) = 64),
  CONSTRAINT store_operator_otps_attempts_chk CHECK (attempts >= 0 AND attempts <= 20)
);

CREATE INDEX IF NOT EXISTS store_operator_otps_email_idx
  ON public.store_operator_otps (email, created_at DESC);

CREATE TABLE IF NOT EXISTS public.store_operator_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_operator_sessions_email_chk CHECK (char_length(email) BETWEEN 5 AND 180),
  CONSTRAINT store_operator_sessions_hash_chk CHECK (char_length(token_hash) = 64)
);

CREATE UNIQUE INDEX IF NOT EXISTS store_operator_sessions_token_uidx
  ON public.store_operator_sessions (token_hash);
CREATE INDEX IF NOT EXISTS store_operator_sessions_email_idx
  ON public.store_operator_sessions (email);

ALTER TABLE public.store_operator_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_operator_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.store_operator_otps FROM PUBLIC;
REVOKE ALL ON TABLE public.store_operator_sessions FROM PUBLIC;
REVOKE ALL ON TABLE public.store_operator_otps FROM anon, authenticated;
REVOKE ALL ON TABLE public.store_operator_sessions FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_operator_otps TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_operator_sessions TO service_role;

DROP POLICY IF EXISTS store_operator_otps_service_role ON public.store_operator_otps;
CREATE POLICY store_operator_otps_service_role
  ON public.store_operator_otps
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS store_operator_sessions_service_role ON public.store_operator_sessions;
CREATE POLICY store_operator_sessions_service_role
  ON public.store_operator_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
