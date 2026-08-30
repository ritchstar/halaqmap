-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- تجربة طبختنا1 من مكتب الطلبات: مئة وثمانون يوماً من أول دخول. بلا خلط بهدية طبختنا1.

ALTER TABLE public.store_kitchen_live_orders
  ADD COLUMN IF NOT EXISTS is_trial boolean NOT NULL DEFAULT false;
ALTER TABLE public.store_kitchen_live_orders
  ADD COLUMN IF NOT EXISTS trial_id uuid;

ALTER TABLE public.store_kitchen_live_orders
  DROP CONSTRAINT IF EXISTS store_kitchen_live_price_chk;
ALTER TABLE public.store_kitchen_live_orders
  ADD CONSTRAINT store_kitchen_live_price_chk
  CHECK (price_halalas IN (0, 30000, 60000));

ALTER TABLE public.store_product_trials
  DROP CONSTRAINT IF EXISTS store_product_trials_product_key_check;
ALTER TABLE public.store_product_trials
  ADD CONSTRAINT store_product_trials_product_key_check
  CHECK (product_key IN ('wedding', 'event', 'lounge', 'grocers', 'restaurant', 'cafe', 'kitchen', 'produce'));

COMMENT ON COLUMN public.store_kitchen_live_orders.is_trial IS
  'تجربة مكتب الطلبات. الساعة من أول دخول لمئة وثمانين يوماً. لا تُخلط بهدية طبختنا1.';
