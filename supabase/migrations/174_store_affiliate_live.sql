-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- تسويق بالعمولة لمنتجات المتجر: مسوّق، رابط سري، جلسة، دفتر قيد.
-- لا كاردي8 ولا رخصة النفاذ ولا محفظة الحلاق.

CREATE TABLE IF NOT EXISTS public.store_affiliate_marketers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_affiliate_marketers_email_chk CHECK (char_length(email) BETWEEN 5 AND 180),
  CONSTRAINT store_affiliate_marketers_code_chk CHECK (code ~ '^[a-z0-9]{8,12}$')
);

CREATE UNIQUE INDEX IF NOT EXISTS store_affiliate_marketers_email_uidx
  ON public.store_affiliate_marketers (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS store_affiliate_marketers_code_uidx
  ON public.store_affiliate_marketers (code);

CREATE TABLE IF NOT EXISTS public.store_affiliate_magic_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  marketer_id uuid NOT NULL REFERENCES public.store_affiliate_marketers (id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_affiliate_magic_links_hash_chk CHECK (char_length(token_hash) = 64)
);

CREATE UNIQUE INDEX IF NOT EXISTS store_affiliate_magic_links_hash_uidx
  ON public.store_affiliate_magic_links (token_hash);
CREATE INDEX IF NOT EXISTS store_affiliate_magic_links_marketer_idx
  ON public.store_affiliate_magic_links (marketer_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.store_affiliate_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  marketer_id uuid NOT NULL REFERENCES public.store_affiliate_marketers (id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_affiliate_sessions_hash_chk CHECK (char_length(token_hash) = 64)
);

CREATE UNIQUE INDEX IF NOT EXISTS store_affiliate_sessions_hash_uidx
  ON public.store_affiliate_sessions (token_hash);
CREATE INDEX IF NOT EXISTS store_affiliate_sessions_marketer_idx
  ON public.store_affiliate_sessions (marketer_id, expires_at DESC);

CREATE TABLE IF NOT EXISTS public.store_affiliate_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  marketer_id uuid NOT NULL REFERENCES public.store_affiliate_marketers (id) ON DELETE RESTRICT,
  moyasar_payment_id text NOT NULL,
  product_tag text NOT NULL,
  line_id text NOT NULL,
  price_halalas integer NOT NULL,
  commission_halalas integer NOT NULL,
  net_halalas integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_affiliate_ledger_tag_chk CHECK (
    product_tag IN ('store_wedding_live', 'store_event_live', 'store_lounge_live', 'store_grocers_live')
  ),
  CONSTRAINT store_affiliate_ledger_no_occasion_chk CHECK (product_tag <> 'store_occasion_card'),
  CONSTRAINT store_affiliate_ledger_amounts_chk CHECK (
    price_halalas > 0
    AND commission_halalas > 0
    AND net_halalas >= 0
    AND commission_halalas + net_halalas = price_halalas
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS store_affiliate_ledger_payment_uidx
  ON public.store_affiliate_ledger (moyasar_payment_id);
CREATE INDEX IF NOT EXISTS store_affiliate_ledger_marketer_idx
  ON public.store_affiliate_ledger (marketer_id, created_at DESC);

ALTER TABLE public.store_affiliate_marketers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_affiliate_magic_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_affiliate_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_affiliate_ledger ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_affiliate_marketers TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_affiliate_magic_links TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_affiliate_sessions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_affiliate_ledger TO service_role;

NOTIFY pgrst, 'reload schema';
