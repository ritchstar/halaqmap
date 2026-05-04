-- =====================================================
-- اشتراكات مرتبطة بدفع ميسر (Moyasar) — يحدّثها webhook على Edge
-- =====================================================

CREATE TABLE IF NOT EXISTS public.barber_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moyasar_payment_id TEXT NOT NULL UNIQUE,
  moyasar_webhook_event_id TEXT UNIQUE,
  registration_request_id TEXT,
  barber_id UUID REFERENCES public.barbers (id) ON DELETE SET NULL,
  tier TEXT CHECK (tier IN ('bronze', 'gold', 'diamond')),
  amount_halalas INTEGER,
  currency TEXT NOT NULL DEFAULT 'SAR',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'voided', 'authorized')),
  last_webhook_type TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  confirmation_email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS barber_subscriptions_registration_request_id_idx
  ON public.barber_subscriptions (registration_request_id);

CREATE INDEX IF NOT EXISTS barber_subscriptions_barber_id_idx
  ON public.barber_subscriptions (barber_id);

CREATE INDEX IF NOT EXISTS barber_subscriptions_status_idx
  ON public.barber_subscriptions (status);

ALTER TABLE public.barber_subscriptions ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.barber_subscriptions IS
  'تتبع دفع اشتراك عبر Moyasar؛ التحديث عبر Edge Function بمفتاح service_role.';

COMMENT ON COLUMN public.barber_subscriptions.moyasar_webhook_event_id IS
  'معرّف حدث الـ webhook من Moyasar (لمنع التكرار عند إعادة الإرسال).';

DROP TRIGGER IF EXISTS on_barber_subscription_updated ON public.barber_subscriptions;
CREATE TRIGGER on_barber_subscription_updated
  BEFORE UPDATE ON public.barber_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
