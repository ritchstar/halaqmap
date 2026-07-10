-- نظام سفراء التسويق الميداني — جداول أساسية (service_role / API لاحقاً)
-- القواعد: src/config/ambassadorFieldRulesPolicy.ts

CREATE TABLE IF NOT EXISTS public.ambassadors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  display_name text NOT NULL,
  phone text NOT NULL,
  iban text,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'closed')),
  marketing_locked boolean NOT NULL DEFAULT false,
  rules_version_accepted text,
  rules_accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ambassadors_code_len CHECK (char_length(trim(code)) BETWEEN 6 AND 32),
  CONSTRAINT ambassadors_name_len CHECK (char_length(trim(display_name)) BETWEEN 2 AND 80),
  CONSTRAINT ambassadors_phone_len CHECK (char_length(trim(phone)) BETWEEN 9 AND 20)
);

COMMENT ON TABLE public.ambassadors IS
  'مسوّقون ميدانيون — عمولة أول تفعيل رخصة / مكافأة مفروشات؛ المحفظة عبر ambassador_wallet_ledger.';

CREATE TABLE IF NOT EXISTS public.ambassador_target_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL REFERENCES public.ambassadors(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('barber', 'hospitality')),
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'rewarded', 'expired', 'rejected', 'cancelled')),
  shop_name text NOT NULL,
  shop_phone text,
  city text,
  district text,
  notes text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  accuracy_meters double precision,
  street_sign_path text,
  interior_photo_paths text[] NOT NULL DEFAULT '{}',
  opened_at timestamptz NOT NULL DEFAULT now(),
  reminder_at timestamptz,
  expires_at timestamptz NOT NULL,
  rewarded_at timestamptz,
  reward_sar numeric(10, 2),
  linked_barber_id uuid,
  linked_order_id uuid,
  reject_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ambassador_target_shop_name_len CHECK (char_length(trim(shop_name)) BETWEEN 2 AND 200),
  CONSTRAINT ambassador_target_lat CHECK (latitude BETWEEN 16 AND 33),
  CONSTRAINT ambassador_target_lng CHECK (longitude BETWEEN 34 AND 56)
);

COMMENT ON TABLE public.ambassador_target_requests IS
  'طلب استهداف ميداني: إثبات أولي (GPS+صور) ثم إثبات صارم آلي عند التفعيل/الاستلام.';

CREATE INDEX IF NOT EXISTS ambassador_target_requests_ambassador_idx
  ON public.ambassador_target_requests (ambassador_id, opened_at DESC);
CREATE INDEX IF NOT EXISTS ambassador_target_requests_status_idx
  ON public.ambassador_target_requests (status, expires_at);
CREATE INDEX IF NOT EXISTS ambassador_target_requests_geo_idx
  ON public.ambassador_target_requests (latitude, longitude);

CREATE TABLE IF NOT EXISTS public.ambassador_wallet_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL REFERENCES public.ambassadors(id) ON DELETE CASCADE,
  entry_type text NOT NULL
    CHECK (entry_type IN ('commission', 'hospitality', 'payout', 'clawback', 'adjustment')),
  amount_sar numeric(10, 2) NOT NULL,
  balance_after_sar numeric(10, 2) NOT NULL,
  target_request_id uuid REFERENCES public.ambassador_target_requests(id) ON DELETE SET NULL,
  payout_request_id uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ambassador_wallet_amount_nonzero CHECK (amount_sar <> 0)
);

CREATE INDEX IF NOT EXISTS ambassador_wallet_ledger_ambassador_idx
  ON public.ambassador_wallet_ledger (ambassador_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.ambassador_payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL REFERENCES public.ambassadors(id) ON DELETE CASCADE,
  amount_sar numeric(10, 2) NOT NULL CHECK (amount_sar >= 300),
  iban text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'paid', 'rejected', 'awaiting_receipt_ack')),
  transfer_document_path text,
  receipt_acknowledged_at timestamptz,
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ambassador_payout_requests_ambassador_idx
  ON public.ambassador_payout_requests (ambassador_id, created_at DESC);

ALTER TABLE public.ambassador_wallet_ledger
  DROP CONSTRAINT IF EXISTS ambassador_wallet_ledger_payout_fk;
ALTER TABLE public.ambassador_wallet_ledger
  ADD CONSTRAINT ambassador_wallet_ledger_payout_fk
  FOREIGN KEY (payout_request_id) REFERENCES public.ambassador_payout_requests(id) ON DELETE SET NULL;

ALTER TABLE public.ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_target_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_wallet_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_payout_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ambassadors TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ambassador_target_requests TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ambassador_wallet_ledger TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ambassador_payout_requests TO service_role;
