-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- كافينا1. جدول مستقل عن مطعم الحي وتموينات الحي والقاعات ولاونجا1 وبطاقة المناسبة ورخصة النفاذ.

CREATE TABLE IF NOT EXISTS public.store_cafe_live_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending_payment',
  display_token text NOT NULL,
  guest_token text NOT NULL,
  shop_token text NOT NULL,
  desk_token text NOT NULL,
  buyer_email text NOT NULL,
  buyer_name text,
  price_halalas integer NOT NULL DEFAULT 119900,
  moyasar_payment_id text,
  moyasar_invoice_id text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  policy_version text,
  expires_at timestamptz,
  last_public_change_at timestamptz,
  revoked_at timestamptz,
  is_trial boolean NOT NULL DEFAULT false,
  trial_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_cafe_live_status_chk
    CHECK (status IN ('pending_payment', 'live', 'expired', 'pending_renewal', 'revoked')),
  CONSTRAINT store_cafe_live_token_len
    CHECK (
      char_length(display_token) BETWEEN 16 AND 80
      AND char_length(guest_token) BETWEEN 16 AND 80
      AND char_length(shop_token) BETWEEN 16 AND 80
      AND char_length(desk_token) BETWEEN 16 AND 80
    ),
  CONSTRAINT store_cafe_live_price_chk
    CHECK (price_halalas IN (0, 119900, 209900))
);

CREATE UNIQUE INDEX IF NOT EXISTS store_cafe_live_display_uidx
  ON public.store_cafe_live_orders (display_token);
CREATE UNIQUE INDEX IF NOT EXISTS store_cafe_live_guest_uidx
  ON public.store_cafe_live_orders (guest_token);
CREATE UNIQUE INDEX IF NOT EXISTS store_cafe_live_shop_uidx
  ON public.store_cafe_live_orders (shop_token);
CREATE UNIQUE INDEX IF NOT EXISTS store_cafe_live_desk_uidx
  ON public.store_cafe_live_orders (desk_token);
CREATE UNIQUE INDEX IF NOT EXISTS store_cafe_live_payment_uidx
  ON public.store_cafe_live_orders (moyasar_payment_id)
  WHERE moyasar_payment_id IS NOT NULL;

COMMENT ON TABLE public.store_cafe_live_orders IS
  'كافينا1. 1199 ر.س لستة أشهر أو 2099 ر.س لاثني عشر شهراً أو صفر للتجربة. صندوق المحادثة مدرج. الوصول عبر رموز الـ API فقط.';

ALTER TABLE public.store_cafe_live_orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.store_cafe_live_orders FROM PUBLIC;
REVOKE ALL ON TABLE public.store_cafe_live_orders FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_cafe_live_orders TO service_role;

DROP POLICY IF EXISTS store_cafe_live_service_role ON public.store_cafe_live_orders;
CREATE POLICY store_cafe_live_service_role
  ON public.store_cafe_live_orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

ALTER TABLE public.store_product_trials
  DROP CONSTRAINT IF EXISTS store_product_trials_product_key_check;
ALTER TABLE public.store_product_trials
  ADD CONSTRAINT store_product_trials_product_key_check
  CHECK (product_key IN ('wedding', 'event', 'lounge', 'grocers', 'restaurant', 'cafe'));
