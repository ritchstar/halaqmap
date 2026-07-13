-- أكواد تجربة برونزي 30 يوماً (استخدام لمرة واحدة) — مسار موازٍ لميسر
-- لا يمس webhook ميسر ولا مسار الدفع المدفوع

-- توسيع مصادر صلاحية الإدراج
ALTER TABLE public.barber_listing_entitlements
  DROP CONSTRAINT IF EXISTS barber_listing_entitlements_source_check;

ALTER TABLE public.barber_listing_entitlements
  ADD CONSTRAINT barber_listing_entitlements_source_check CHECK (
    source IN (
      'voucher_redemption',
      'moyasar_auto_redeem',
      'admin_voucher_issue',
      'legacy_subscription_migration',
      'admin_payment_approve',
      'registration_approval_auto_redeem',
      'bronze_trial_code'
    )
  );

-- توسيع قناة طلب الرخصة لتشمل التجربة
ALTER TABLE public.listing_license_orders
  DROP CONSTRAINT IF EXISTS listing_license_orders_payment_channel_check;

ALTER TABLE public.listing_license_orders
  ADD CONSTRAINT listing_license_orders_payment_channel_check CHECK (
    payment_channel IN (
      'moyasar',
      'bank_transfer',
      'admin_manual',
      'legacy_migration',
      'bronze_trial'
    )
  );

ALTER TABLE public.listing_license_redemption_events
  DROP CONSTRAINT IF EXISTS listing_license_redemption_events_event_type_check;

ALTER TABLE public.listing_license_redemption_events
  ADD CONSTRAINT listing_license_redemption_events_event_type_check CHECK (
    event_type IN ('redeem', 'auto_redeem', 'admin_grant', 'migration', 'bronze_trial')
  );

CREATE TABLE IF NOT EXISTS public.bronze_trial_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_fingerprint TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'issued'
    CHECK (status IN ('issued', 'redeemed', 'revoked')),
  tier TEXT NOT NULL DEFAULT 'bronze'
    CHECK (tier = 'bronze'),
  listing_days_granted INTEGER NOT NULL DEFAULT 30
    CHECK (listing_days_granted = 30),
  created_by_admin_email TEXT,
  note TEXT,
  redeemed_at TIMESTAMPTZ,
  redeemed_barber_id UUID REFERENCES public.barbers (id) ON DELETE SET NULL,
  redeemed_registration_request_id TEXT,
  redeemed_order_id UUID REFERENCES public.listing_license_orders (id) ON DELETE SET NULL,
  redeemed_entitlement_id UUID REFERENCES public.barber_listing_entitlements (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.bronze_trial_codes IS
  'أكواد تجربة برونزي 30 يوماً — بصمة HMAC فقط؛ الاستخدام لمرة واحدة عبر /api/bronze-trial-redeem.';

CREATE INDEX IF NOT EXISTS bronze_trial_codes_status_idx
  ON public.bronze_trial_codes (status, created_at DESC);

CREATE INDEX IF NOT EXISTS bronze_trial_codes_redeemed_barber_idx
  ON public.bronze_trial_codes (redeemed_barber_id)
  WHERE redeemed_barber_id IS NOT NULL;

ALTER TABLE public.bronze_trial_codes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.bronze_trial_codes FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bronze_trial_codes TO service_role;
