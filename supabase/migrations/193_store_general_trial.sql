-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- =====================================================
-- 193 — نظام التجربة العام: ستون يوماً، متصفح أو مسوّق
-- لا مدد أطول من ستين يوماً. افراحي1 واجواء1 يبقيان على مسار الهدية.
-- =====================================================

ALTER TABLE public.store_product_trials
  ADD COLUMN IF NOT EXISTS shop_name text NOT NULL DEFAULT '';
ALTER TABLE public.store_product_trials
  ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '';
ALTER TABLE public.store_product_trials
  ADD COLUMN IF NOT EXISTS neighborhood text NOT NULL DEFAULT '';
ALTER TABLE public.store_product_trials
  ADD COLUMN IF NOT EXISTS whatsapp text NOT NULL DEFAULT '';

ALTER TABLE public.store_product_trials
  DROP CONSTRAINT IF EXISTS store_product_trials_status_check;
ALTER TABLE public.store_product_trials
  ADD CONSTRAINT store_product_trials_status_check
  CHECK (status IN (
    'pending_confirm',
    'pending_review',
    'declined',
    'issued',
    'activated',
    'expired',
    'converted'
  ));

ALTER TABLE public.store_product_trials
  DROP CONSTRAINT IF EXISTS store_product_trials_issuer_kind_check;
ALTER TABLE public.store_product_trials
  ADD CONSTRAINT store_product_trials_issuer_kind_check
  CHECK (issuer_kind IN ('admin', 'marketer', 'visitor'));

COMMENT ON TABLE public.store_product_trials IS
  'نظام التجربة العام: ستون يوماً من أول دخول. طلب متصفح أو مسوّق ثم مراجعة الإدارة.';

NOTIFY pgrst, 'reload schema';
