-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- تسجيل اهتمام كوافير ماب (يوتيوب / تحديثات) — إدراج عبر service_role فقط.

CREATE TABLE IF NOT EXISTS public.coiffeur_interest_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_normalized text NOT NULL,
  consent_follow_updates boolean NOT NULL,
  display_name text,
  role text,
  intent_id text,
  source text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT coiffeur_interest_signups_email_unique UNIQUE (email_normalized),
  CONSTRAINT coiffeur_interest_signups_consent_must_be_true CHECK (consent_follow_updates = true),
  CONSTRAINT coiffeur_interest_signups_email_len CHECK (char_length(email_normalized) BETWEEN 3 AND 254)
);

COMMENT ON TABLE public.coiffeur_interest_signups IS
  'اهتمام مسبق بكوافير ماب — بريد + موافقة. لا عقد ولا دفع من هذه الجدول.';

CREATE INDEX IF NOT EXISTS coiffeur_interest_signups_created_at_idx
  ON public.coiffeur_interest_signups (created_at DESC);

ALTER TABLE public.coiffeur_interest_signups ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.coiffeur_interest_signups FROM PUBLIC;
REVOKE ALL ON TABLE public.coiffeur_interest_signups FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.coiffeur_interest_signups TO service_role;

DROP POLICY IF EXISTS coiffeur_interest_signups_service_role ON public.coiffeur_interest_signups;
CREATE POLICY coiffeur_interest_signups_service_role
  ON public.coiffeur_interest_signups
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
