-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- تمرتنا1. جدول مستقل عن التموينات والمطبخ والمطاعم والمقاهي والقاعات ولاونجا1 وبطاقة المناسبة ورخصة النفاذ وخضارنا1.
-- منتج غير مسجّل لدى الهيئة السعودية للملكية الفكرية — لا شهادة SAIP لهذا المنتج.

CREATE TABLE IF NOT EXISTS public.store_dates_live_orders (
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
  CONSTRAINT store_dates_live_status_chk
    CHECK (status IN ('pending_payment', 'live', 'expired', 'pending_renewal', 'revoked')),
  CONSTRAINT store_dates_live_token_len
    CHECK (
      char_length(shop_token) BETWEEN 16 AND 80
      AND char_length(desk_token) BETWEEN 16 AND 80
    ),
  CONSTRAINT store_dates_live_price_chk
    CHECK (price_halalas IN (0, 135000, 250000))
);

CREATE UNIQUE INDEX IF NOT EXISTS store_dates_live_shop_uidx
  ON public.store_dates_live_orders (shop_token);
CREATE UNIQUE INDEX IF NOT EXISTS store_dates_live_desk_uidx
  ON public.store_dates_live_orders (desk_token);
CREATE UNIQUE INDEX IF NOT EXISTS store_dates_live_payment_uidx
  ON public.store_dates_live_orders (moyasar_payment_id)
  WHERE moyasar_payment_id IS NOT NULL;

COMMENT ON TABLE public.store_dates_live_orders IS
  'تمرتنا1. 1350 ر.س لمئة وثمانين يوماً أو 2500 ر.س لثلاثمئة وستين يوماً أو صفر للتجربة. الوصول عبر رموز الـ API فقط. المطابقة بوسم store_dates_live. منتج غير مسجّل SAIP.';

ALTER TABLE public.store_dates_live_orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.store_dates_live_orders FROM PUBLIC;
REVOKE ALL ON TABLE public.store_dates_live_orders FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_dates_live_orders TO service_role;

DROP POLICY IF EXISTS store_dates_live_service_role ON public.store_dates_live_orders;
CREATE POLICY store_dates_live_service_role
  ON public.store_dates_live_orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- القائمة الكاملة المحدّثة (آخر لمسة: 199_store_halana_live_billing.sql) + dates.
ALTER TABLE public.store_product_trials
  DROP CONSTRAINT IF EXISTS store_product_trials_product_key_check;
ALTER TABLE public.store_product_trials
  ADD CONSTRAINT store_product_trials_product_key_check
  CHECK (product_key IN ('wedding', 'event', 'lounge', 'grocers', 'restaurant', 'cafe', 'kitchen', 'produce', 'halana', 'dates'));

-- القائمة الكاملة المحدّثة (آخر لمسة: 187_store_produce_live.sql) + dates.
ALTER TABLE public.store_shop_presence
  DROP CONSTRAINT IF EXISTS store_shop_presence_tag_chk;
ALTER TABLE public.store_shop_presence
  ADD CONSTRAINT store_shop_presence_tag_chk
  CHECK (product_tag IN (
    'store_grocers_live',
    'store_restaurant_live',
    'store_cafe_live',
    'store_kitchen_live',
    'store_produce_live',
    'store_dates_live'
  ));

-- القائمة الكاملة المحدّثة (آخر لمسة: 198_store_direct_pay.sql) + dates.
ALTER TABLE public.store_direct_pay_profiles
  DROP CONSTRAINT IF EXISTS store_direct_pay_profiles_tag_chk;
ALTER TABLE public.store_direct_pay_profiles
  ADD CONSTRAINT store_direct_pay_profiles_tag_chk CHECK (
    product_tag IN (
      'store_halana_live',
      'store_kitchen_live',
      'store_grocers_live',
      'store_produce_live',
      'store_restaurant_live',
      'store_cafe_live',
      'store_wedding_live',
      'store_event_live',
      'store_lounge_live',
      'store_dates_live'
    )
  );

NOTIFY pgrst, 'reload schema';
