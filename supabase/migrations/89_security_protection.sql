-- =====================================================================
-- Security Protection — قائمة الحظر وسجل الأحداث الأمنية الحقيقية
-- يُفعَّل من غرفة العمليات السيبرانية بواسطة المدعي العام
-- =====================================================================

-- ── قائمة الحظر الحقيقية ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.security_block_list (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip           TEXT NOT NULL,
  reason       TEXT NOT NULL DEFAULT 'Admin block',
  blocked_by   TEXT NOT NULL DEFAULT 'cyber_ops',     -- admin email
  expires_at   TIMESTAMPTZ,                           -- null = دائم
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS security_block_list_ip_idx
  ON public.security_block_list (ip) WHERE active = TRUE;

-- ── سجل الأحداث الأمنية الحقيقية ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.security_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip           TEXT NOT NULL DEFAULT 'unknown',
  event_type   TEXT NOT NULL,                         -- 'rate_limit_exceeded' | 'blocked_ip_attempt' | 'suspicious_pattern'
  severity     TEXT NOT NULL DEFAULT 'warning'
                 CHECK (severity IN ('info', 'warning', 'critical')),
  endpoint     TEXT,
  user_agent   TEXT,
  detail       JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS security_events_created_at_idx
  ON public.security_events (created_at DESC);

CREATE INDEX IF NOT EXISTS security_events_ip_idx
  ON public.security_events (ip, created_at DESC);

-- RLS: قراءة للمدير فقط، كتابة للـ service role
ALTER TABLE public.security_block_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- service role يكتب ويقرأ بحرية (من API)
DROP POLICY IF EXISTS "service_role_all_block_list" ON public.security_block_list;
CREATE POLICY "service_role_all_block_list"
  ON public.security_block_list FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service_role_all_security_events" ON public.security_events;
CREATE POLICY "service_role_all_security_events"
  ON public.security_events FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
