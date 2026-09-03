-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- حلانا1 — اشتراك معلن: تجربة ستون يوماً، وباقتا 894 و1788 ر.س.
-- لا ميسر على طلب العميلة. المطابقة بوسم store_halana_live أولاً.

ALTER TABLE public.store_halana_copies
  ADD COLUMN IF NOT EXISTS pack_id text NOT NULL DEFAULT 'm6',
  ADD COLUMN IF NOT EXISTS price_halalas integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_trial boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS trial_id uuid,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS moyasar_payment_id text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS buyer_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS buyer_email text NOT NULL DEFAULT '';

UPDATE public.store_halana_copies
SET
  buyer_name = CASE WHEN buyer_name = '' THEN specialist_name ELSE buyer_name END,
  buyer_email = CASE WHEN buyer_email = '' THEN beneficiary_email ELSE buyer_email END
WHERE buyer_name = '' OR buyer_email = '';

ALTER TABLE public.store_halana_copies
  DROP CONSTRAINT IF EXISTS store_halana_copies_status_chk;

ALTER TABLE public.store_halana_copies
  ADD CONSTRAINT store_halana_copies_status_chk
  CHECK (status IN (
    'issued',
    'pending_payment',
    'pending_renewal',
    'live',
    'expired',
    'closed'
  ));

ALTER TABLE public.store_halana_copies
  DROP CONSTRAINT IF EXISTS store_halana_copies_pack_chk;

ALTER TABLE public.store_halana_copies
  ADD CONSTRAINT store_halana_copies_pack_chk
  CHECK (pack_id IN ('m6', 'm12'));

CREATE UNIQUE INDEX IF NOT EXISTS store_halana_copies_moyasar_uidx
  ON public.store_halana_copies (moyasar_payment_id)
  WHERE moyasar_payment_id <> '';

CREATE INDEX IF NOT EXISTS store_halana_copies_trial_idx
  ON public.store_halana_copies (trial_id)
  WHERE trial_id IS NOT NULL;

COMMENT ON TABLE public.store_halana_copies IS
  'حلانا1. اشتراك المتخصصة بوسم store_halana_live. لا ميسر على طلب العميلة.';

ALTER TABLE public.store_product_trials
  DROP CONSTRAINT IF EXISTS store_product_trials_product_key_check;

ALTER TABLE public.store_product_trials
  ADD CONSTRAINT store_product_trials_product_key_check
  CHECK (product_key IN ('wedding', 'event', 'lounge', 'grocers', 'restaurant', 'cafe', 'kitchen', 'produce', 'halana'));
