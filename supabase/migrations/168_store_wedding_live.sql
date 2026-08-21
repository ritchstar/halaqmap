-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- دعوة زواج تفاعلية — جدول مستقل عن بطاقة المناسبة ورخصة النفاذ.

CREATE TABLE IF NOT EXISTS public.store_wedding_live_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending_payment',
  display_token text NOT NULL,
  guest_token text NOT NULL,
  host_token text NOT NULL,
  buyer_email text NOT NULL,
  buyer_name text,
  price_halalas integer NOT NULL DEFAULT 89900,
  moyasar_payment_id text,
  moyasar_invoice_id text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  policy_version text,
  expires_at timestamptz,
  last_public_change_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_wedding_live_status_chk
    CHECK (status IN ('pending_payment', 'live', 'expired', 'revoked')),
  CONSTRAINT store_wedding_live_token_len
    CHECK (
      char_length(display_token) BETWEEN 16 AND 80
      AND char_length(guest_token) BETWEEN 16 AND 80
      AND char_length(host_token) BETWEEN 16 AND 80
    ),
  CONSTRAINT store_wedding_live_price_chk
    CHECK (price_halalas = 89900)
);

CREATE UNIQUE INDEX IF NOT EXISTS store_wedding_live_display_uidx
  ON public.store_wedding_live_orders (display_token);
CREATE UNIQUE INDEX IF NOT EXISTS store_wedding_live_guest_uidx
  ON public.store_wedding_live_orders (guest_token);
CREATE UNIQUE INDEX IF NOT EXISTS store_wedding_live_host_uidx
  ON public.store_wedding_live_orders (host_token);
CREATE UNIQUE INDEX IF NOT EXISTS store_wedding_live_payment_uidx
  ON public.store_wedding_live_orders (moyasar_payment_id)
  WHERE moyasar_payment_id IS NOT NULL;

COMMENT ON TABLE public.store_wedding_live_orders IS
  'دعوة زواج تفاعلية. الوصول عبر رموز غير قابلة للتخمين من الـ API فقط. السعر الافتتاحي 899 ر.س.';

ALTER TABLE public.store_wedding_live_orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.store_wedding_live_orders FROM PUBLIC;
REVOKE ALL ON TABLE public.store_wedding_live_orders FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_wedding_live_orders TO service_role;

DROP POLICY IF EXISTS store_wedding_live_service_role ON public.store_wedding_live_orders;
CREATE POLICY store_wedding_live_service_role
  ON public.store_wedding_live_orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
