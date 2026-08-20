-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- إصدار بطاقات المتجر: مناسبة مدفوعة + بلاغ وفاة مجتمعي.
-- الوصول عبر service_role فقط — لا قراءة عامة مباشرة (الرابط غير قابل للتخمين يُخدم من الـ API).

CREATE TABLE IF NOT EXISTS public.store_issued_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  public_token text NOT NULL,
  admin_token_hash text NOT NULL,
  publisher_phone_hash text,
  publisher_phone_last4 text,
  template_id text,
  price_halalas integer,
  moyasar_payment_id text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  attestor_name text,
  attestor_role text,
  policy_version text,
  expires_at timestamptz,
  last_public_change_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_issued_cards_kind_chk
    CHECK (kind IN ('paid_invite', 'bereavement')),
  CONSTRAINT store_issued_cards_status_chk
    CHECK (status IN ('draft', 'pending_payment', 'live', 'expired', 'revoked')),
  CONSTRAINT store_issued_cards_public_token_len
    CHECK (char_length(public_token) BETWEEN 16 AND 80),
  CONSTRAINT store_issued_cards_price_chk
    CHECK (price_halalas IS NULL OR price_halalas IN (1200, 2900, 5900))
);

CREATE UNIQUE INDEX IF NOT EXISTS store_issued_cards_public_token_uidx
  ON public.store_issued_cards (public_token);

CREATE INDEX IF NOT EXISTS store_issued_cards_kind_status_idx
  ON public.store_issued_cards (kind, status, created_at DESC);

COMMENT ON TABLE public.store_issued_cards IS
  'بطاقات مناسبة مدفوعة وبلاغات وفاة. القراءة العامة عبر رمز غير قابل للتخمين من الـ API فقط.';

CREATE TABLE IF NOT EXISTS public.store_issued_card_otp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_hash text NOT NULL,
  code_hash text NOT NULL,
  purpose text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_issued_card_otp_purpose_chk
    CHECK (purpose IN ('bereavement_publish', 'bereavement_manage')),
  CONSTRAINT store_issued_card_otp_attempts_chk
    CHECK (attempts >= 0 AND attempts <= 12)
);

CREATE INDEX IF NOT EXISTS store_issued_card_otp_phone_idx
  ON public.store_issued_card_otp (phone_hash, purpose, created_at DESC);

ALTER TABLE public.store_issued_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_issued_card_otp ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.store_issued_cards FROM PUBLIC;
REVOKE ALL ON TABLE public.store_issued_cards FROM anon, authenticated;
REVOKE ALL ON TABLE public.store_issued_card_otp FROM PUBLIC;
REVOKE ALL ON TABLE public.store_issued_card_otp FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_issued_cards TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_issued_card_otp TO service_role;

DROP POLICY IF EXISTS store_issued_cards_service_role ON public.store_issued_cards;
CREATE POLICY store_issued_cards_service_role
  ON public.store_issued_cards
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS store_issued_card_otp_service_role ON public.store_issued_card_otp;
CREATE POLICY store_issued_card_otp_service_role
  ON public.store_issued_card_otp
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
