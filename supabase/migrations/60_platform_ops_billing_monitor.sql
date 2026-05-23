-- Centralized Billing & Ops Monitor — التزامات تشغيلية (Vercel, Supabase, GitHub, GoDaddy, يدوي)
-- القراءة/الكتابة عبر Vercel API بـ service role فقط؛ بدون سياسات لـ anon/authenticated.

CREATE TABLE IF NOT EXISTS public.platform_ops_billing_commitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  vendor text NOT NULL
    CHECK (vendor IN ('vercel', 'supabase_mgmt', 'github', 'godaddy', 'manual')),

  display_label text NOT NULL,

  integration_mode text NOT NULL DEFAULT 'api_polling'
    CHECK (integration_mode IN ('api_polling', 'manual_only')),

  billing_cycle text NOT NULL DEFAULT 'unknown'
    CHECK (billing_cycle IN ('monthly', 'annual', 'custom', 'unknown')),

  amount_expected numeric,
  amount_currency text NOT NULL DEFAULT 'SAR',

  -- تقدير شهري بالريال للوحة الملخص (يُحدَّث من المزامنة أو يدوياً)
  monthly_estimate_sar numeric,

  next_renewal_at timestamptz,

  last_synced_at timestamptz,
  last_sync_status text NOT NULL DEFAULT 'never'
    CHECK (last_sync_status IN ('never', 'ok', 'partial', 'auth_error', 'error')),

  last_sync_error text,

  -- مفتاح ثابت لدمج صفوف المزامنة (مثل teamId أو project ref)
  external_stable_key text NOT NULL DEFAULT '',

  external_ref jsonb NOT NULL DEFAULT '{}'::jsonb,
  vendor_payload jsonb NOT NULL DEFAULT '{}'::jsonb,

  is_manual boolean NOT NULL DEFAULT false,
  manual_notes text,

  -- تنبيه نقص بيانات — يملأه المزامن أو الإدارة
  data_gap_kind text
    CHECK (
      data_gap_kind IS NULL
      OR data_gap_kind IN (
        'missing_api_key',
        'missing_price',
        'token_expired',
        'discovery_pending',
        'vendor_api_changed'
      )
    ),
  data_gap_message text,

  -- اسم متغير بيئة على الخادم فقط (لا تُخزَّن القيمة في هذا العمود). مثال: VERCEL_OPS_API_TOKEN
  credential_env_hint text,

  -- اختياري: سر مشفّر at-rest (AES-256-GCM) عند تفعيل OPS_BILLING_CREDENTIALS_AES_KEY في Vercel
  integration_secret_ciphertext text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS platform_ops_billing_commitments_vendor_stable_uidx
  ON public.platform_ops_billing_commitments (vendor, external_stable_key);

CREATE OR REPLACE FUNCTION public.platform_ops_billing_manual_stable_key()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.vendor = 'manual' AND (NEW.external_stable_key IS NULL OR btrim(NEW.external_stable_key) = '') THEN
    NEW.external_stable_key := 'manual:' || gen_random_uuid()::text;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_platform_ops_billing_manual_stable_key
  ON public.platform_ops_billing_commitments;
CREATE TRIGGER trg_platform_ops_billing_manual_stable_key
  BEFORE INSERT ON public.platform_ops_billing_commitments
  FOR EACH ROW
  EXECUTE FUNCTION public.platform_ops_billing_manual_stable_key();

CREATE INDEX IF NOT EXISTS platform_ops_billing_commitments_renewal_idx
  ON public.platform_ops_billing_commitments (next_renewal_at ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS platform_ops_billing_commitments_gap_idx
  ON public.platform_ops_billing_commitments (data_gap_kind)
  WHERE data_gap_kind IS NOT NULL;

ALTER TABLE public.platform_ops_billing_commitments ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.platform_ops_billing_commitments IS
  'التزامات مالية/تشغيلية للمنصّة (مزامنة API أو إدخال يدوي). الوصول عبر خادم Vercel بمفتاح service role.';

CREATE OR REPLACE FUNCTION public.set_platform_ops_billing_commitments_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_platform_ops_billing_commitments_updated_at
  ON public.platform_ops_billing_commitments;
CREATE TRIGGER trg_platform_ops_billing_commitments_updated_at
  BEFORE UPDATE ON public.platform_ops_billing_commitments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_platform_ops_billing_commitments_updated_at();

-- صف واحد لحالة آخر استطلاع (للمراقبة ولـ Cron لاحقاً)
CREATE TABLE IF NOT EXISTS public.platform_ops_billing_poll_state (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_poll_started_at timestamptz,
  last_poll_finished_at timestamptz,
  last_poll_status text,
  last_poll_detail jsonb NOT NULL DEFAULT '{}'::jsonb
);

INSERT INTO public.platform_ops_billing_poll_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.platform_ops_billing_poll_state ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.platform_ops_billing_poll_state IS
  'حالة آخر دورة مزامنة لـ Ops Billing Monitor (id=1).';
