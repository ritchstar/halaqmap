-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- تجارب تسويقية لمنتجات المتجر: ستون يوماً من أول دخول، خمسة لكل منتج لكل مسوّق.
-- لا كاردي8 ولا خلط برخصة النفاذ أو محفظة الحلاق.

CREATE TABLE IF NOT EXISTS public.store_product_trials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_key text NOT NULL
    CHECK (product_key IN ('wedding', 'event', 'lounge', 'grocers', 'restaurant')),
  beneficiary_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'declined', 'issued', 'activated', 'expired', 'converted')),
  issuer_kind text NOT NULL
    CHECK (issuer_kind IN ('admin', 'marketer')),
  marketer_id uuid REFERENCES public.store_affiliate_marketers (id) ON DELETE SET NULL,
  issued_by_label text NOT NULL DEFAULT '',
  order_id uuid,
  first_opened_at timestamptz,
  trial_ends_at timestamptz,
  review_note text NOT NULL DEFAULT '',
  reviewed_by text NOT NULL DEFAULT '',
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS store_product_trials_email_product_uidx
  ON public.store_product_trials (product_key, beneficiary_email)
  WHERE status <> 'declined';

CREATE INDEX IF NOT EXISTS store_product_trials_marketer_idx
  ON public.store_product_trials (marketer_id, product_key, status)
  WHERE marketer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS store_product_trials_status_idx
  ON public.store_product_trials (status, updated_at DESC);

COMMENT ON TABLE public.store_product_trials IS
  'نماذج تجريبية لمتجر خريطة الحل. الساعة تبدأ عند أول دخول. الإيميل مرجع البيانات بعد الانقطاع.';

ALTER TABLE public.store_product_trials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.store_product_trials FROM PUBLIC;
REVOKE ALL ON TABLE public.store_product_trials FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_product_trials TO service_role;

DROP POLICY IF EXISTS store_product_trials_service_role ON public.store_product_trials;
CREATE POLICY store_product_trials_service_role
  ON public.store_product_trials
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- أعمدة التجربة على جداول الطلبات + السماح بسعر صفر للنموذج التجريبي
ALTER TABLE public.store_wedding_live_orders
  ADD COLUMN IF NOT EXISTS is_trial boolean NOT NULL DEFAULT false;
ALTER TABLE public.store_wedding_live_orders
  ADD COLUMN IF NOT EXISTS trial_id uuid;
ALTER TABLE public.store_wedding_live_orders
  DROP CONSTRAINT IF EXISTS store_wedding_live_price_chk;
ALTER TABLE public.store_wedding_live_orders
  ADD CONSTRAINT store_wedding_live_price_chk
  CHECK (price_halalas IN (0, 89900));

ALTER TABLE public.store_event_live_orders
  ADD COLUMN IF NOT EXISTS is_trial boolean NOT NULL DEFAULT false;
ALTER TABLE public.store_event_live_orders
  ADD COLUMN IF NOT EXISTS trial_id uuid;
ALTER TABLE public.store_event_live_orders
  DROP CONSTRAINT IF EXISTS store_event_live_price_chk;
ALTER TABLE public.store_event_live_orders
  ADD CONSTRAINT store_event_live_price_chk
  CHECK (price_halalas IN (0, 89900));

ALTER TABLE public.store_lounge_live_orders
  ADD COLUMN IF NOT EXISTS is_trial boolean NOT NULL DEFAULT false;
ALTER TABLE public.store_lounge_live_orders
  ADD COLUMN IF NOT EXISTS trial_id uuid;
ALTER TABLE public.store_lounge_live_orders
  DROP CONSTRAINT IF EXISTS store_lounge_live_price_chk;
ALTER TABLE public.store_lounge_live_orders
  ADD CONSTRAINT store_lounge_live_price_chk
  CHECK (price_halalas IN (0, 60000, 120000, 240000));

ALTER TABLE public.store_grocers_live_orders
  ADD COLUMN IF NOT EXISTS is_trial boolean NOT NULL DEFAULT false;
ALTER TABLE public.store_grocers_live_orders
  ADD COLUMN IF NOT EXISTS trial_id uuid;
ALTER TABLE public.store_grocers_live_orders
  DROP CONSTRAINT IF EXISTS store_grocers_live_price_chk;
ALTER TABLE public.store_grocers_live_orders
  ADD CONSTRAINT store_grocers_live_price_chk
  CHECK (price_halalas IN (0, 59900, 89900, 89800, 139800));

ALTER TABLE public.store_restaurant_live_orders
  ADD COLUMN IF NOT EXISTS is_trial boolean NOT NULL DEFAULT false;
ALTER TABLE public.store_restaurant_live_orders
  ADD COLUMN IF NOT EXISTS trial_id uuid;
ALTER TABLE public.store_restaurant_live_orders
  DROP CONSTRAINT IF EXISTS store_restaurant_live_price_chk;
ALTER TABLE public.store_restaurant_live_orders
  ADD CONSTRAINT store_restaurant_live_price_chk
  CHECK (price_halalas IN (0, 69900, 99900));

NOTIFY pgrst, 'reload schema';
