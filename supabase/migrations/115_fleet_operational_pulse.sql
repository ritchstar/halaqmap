-- =====================================================
-- 115 — Fleet operational pulse (نبض تشغيلي صاعد)
-- B2B only — no end-user PII; one row per salon per day (upsert)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.fleet_operational_pulse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  city_ar TEXT NOT NULL DEFAULT '',
  bucket_day DATE NOT NULL DEFAULT (CURRENT_DATE),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'watch', 'urgent')),
  friction_score INT NOT NULL DEFAULT 0 CHECK (friction_score >= 0 AND friction_score <= 100),
  listing_days_remaining INT,
  shop_open BOOLEAN NOT NULL DEFAULT true,
  wallet_low BOOLEAN NOT NULL DEFAULT false,
  banner_count INT NOT NULL DEFAULT 0 CHECK (banner_count >= 0),
  broken_banner_count INT NOT NULL DEFAULT 0 CHECK (broken_banner_count >= 0),
  gallery_count INT NOT NULL DEFAULT 0 CHECK (gallery_count >= 0),
  stagnant BOOLEAN NOT NULL DEFAULT false,
  conversations_7d INT NOT NULL DEFAULT 0 CHECK (conversations_7d >= 0),
  findings_count INT NOT NULL DEFAULT 0 CHECK (findings_count >= 0),
  summary_ar TEXT NOT NULL DEFAULT '',
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  pulse_source TEXT NOT NULL DEFAULT 'salon_insights' CHECK (
    pulse_source IN ('salon_insights', 'refresh', 'barber_chat', 'banner_chat')
  ),
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (barber_id, bucket_day)
);

CREATE INDEX IF NOT EXISTS fleet_operational_pulse_city_day_idx
  ON public.fleet_operational_pulse (city_ar, bucket_day DESC);

CREATE INDEX IF NOT EXISTS fleet_operational_pulse_severity_day_idx
  ON public.fleet_operational_pulse (severity, bucket_day DESC);

COMMENT ON TABLE public.fleet_operational_pulse IS
  'نبض تشغيلي صاعد من فحص المناوب — B2B فقط، بدون بيانات زبون.';

ALTER TABLE public.fleet_operational_pulse ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.fleet_operational_pulse FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE ON TABLE public.fleet_operational_pulse TO service_role;
