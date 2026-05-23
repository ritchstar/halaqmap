-- =====================================================
-- Payment Security Events (Sandbox/Production monitoring)
-- يسجل محاولات الدفع الفاشلة أو حالات التلاعب قبل التفعيل.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.payment_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL DEFAULT 'payment_pipeline',
  severity TEXT NOT NULL DEFAULT 'warning'
    CHECK (severity IN ('info', 'warning', 'critical')),
  event_type TEXT NOT NULL,
  payment_id TEXT,
  registration_request_id TEXT,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE SET NULL,
  reason TEXT,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS payment_security_events_created_at_idx
  ON public.payment_security_events (created_at DESC);
CREATE INDEX IF NOT EXISTS payment_security_events_event_type_idx
  ON public.payment_security_events (event_type);
CREATE INDEX IF NOT EXISTS payment_security_events_payment_id_idx
  ON public.payment_security_events (payment_id);

ALTER TABLE public.payment_security_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "jwt_admin_select_payment_security_events" ON public.payment_security_events;
CREATE POLICY "jwt_admin_select_payment_security_events"
  ON public.payment_security_events FOR SELECT TO authenticated
  USING (public.is_jwt_platform_admin());
