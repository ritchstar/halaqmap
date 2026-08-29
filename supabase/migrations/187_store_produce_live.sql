-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- خضارنا1. جدول مستقل عن التموينات والمطبخ والمطاعم والمقاهي والقاعات ولاونجا1 وبطاقة المناسبة ورخصة النفاذ.

CREATE TABLE IF NOT EXISTS public.store_produce_live_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending_payment',
  shop_token text NOT NULL,
  desk_token text NOT NULL,
  buyer_email text NOT NULL,
  buyer_name text,
  price_halalas integer NOT NULL DEFAULT 135000,
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
  CONSTRAINT store_produce_live_status_chk
    CHECK (status IN ('pending_payment', 'live', 'expired', 'pending_renewal', 'revoked')),
  CONSTRAINT store_produce_live_token_len
    CHECK (
      char_length(shop_token) BETWEEN 16 AND 80
      AND char_length(desk_token) BETWEEN 16 AND 80
    ),
  CONSTRAINT store_produce_live_price_chk
    CHECK (price_halalas IN (0, 135000, 250000))
);

CREATE UNIQUE INDEX IF NOT EXISTS store_produce_live_shop_uidx
  ON public.store_produce_live_orders (shop_token);
CREATE UNIQUE INDEX IF NOT EXISTS store_produce_live_desk_uidx
  ON public.store_produce_live_orders (desk_token);
CREATE UNIQUE INDEX IF NOT EXISTS store_produce_live_payment_uidx
  ON public.store_produce_live_orders (moyasar_payment_id)
  WHERE moyasar_payment_id IS NOT NULL;

COMMENT ON TABLE public.store_produce_live_orders IS
  'خضارنا1. 1350 ر.س لمئة وثمانين يوماً أو 2500 ر.س لثلاثمئة وستين يوماً أو صفر للتجربة. الوصول عبر رموز الـ API فقط. المطابقة بوسم store_produce_live.';

ALTER TABLE public.store_produce_live_orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.store_produce_live_orders FROM PUBLIC;
REVOKE ALL ON TABLE public.store_produce_live_orders FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_produce_live_orders TO service_role;

DROP POLICY IF EXISTS store_produce_live_service_role ON public.store_produce_live_orders;
CREATE POLICY store_produce_live_service_role
  ON public.store_produce_live_orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

ALTER TABLE public.store_product_trials
  DROP CONSTRAINT IF EXISTS store_product_trials_product_key_check;
ALTER TABLE public.store_product_trials
  ADD CONSTRAINT store_product_trials_product_key_check
  CHECK (product_key IN ('wedding', 'event', 'lounge', 'grocers', 'restaurant', 'cafe', 'produce'));

ALTER TABLE public.store_shop_presence
  DROP CONSTRAINT IF EXISTS store_shop_presence_tag_chk;
ALTER TABLE public.store_shop_presence
  ADD CONSTRAINT store_shop_presence_tag_chk
  CHECK (product_tag IN (
    'store_grocers_live',
    'store_restaurant_live',
    'store_cafe_live',
    'store_kitchen_live',
    'store_produce_live'
  ));
