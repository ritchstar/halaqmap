-- =====================================================================
-- Cyber DVR Sessions — تخزين جلسات التسجيل الأمني الحقيقية في Supabase
-- تُحفَظ إلى الأبد للمراجعة الجنائية والاستعراض من أي جهاز
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.cyber_dvr_sessions (
  id             TEXT PRIMARY KEY,              -- 'dvr-{timestamp}'
  recorded_at    TIMESTAMPTZ NOT NULL,
  title_ar       TEXT NOT NULL,
  subtitle_ar    TEXT NOT NULL DEFAULT '',
  duration_ms    INTEGER NOT NULL DEFAULT 0,
  events         JSONB NOT NULL DEFAULT '[]'::jsonb,  -- RecordedEvent[]
  stats          JSONB NOT NULL DEFAULT '{}'::jsonb,
  prosecutor_report JSONB NOT NULL DEFAULT '{}'::jsonb,
  viewed         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cyber_dvr_sessions_recorded_at_idx
  ON public.cyber_dvr_sessions (recorded_at DESC);

-- Realtime enabled for live ops room streaming
ALTER TABLE public.cyber_dvr_sessions REPLICA IDENTITY FULL;

-- RLS: service role فقط
ALTER TABLE public.cyber_dvr_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_dvr"
  ON public.cyber_dvr_sessions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================================
-- security_events Realtime — لتدفق الأحداث الحية للغرفة
-- =====================================================================
ALTER TABLE public.security_events REPLICA IDENTITY FULL;

-- إضافة عمود ip_geo لتخزين الموقع الجغرافي الحقيقي للـ IP
ALTER TABLE public.security_events
  ADD COLUMN IF NOT EXISTS ip_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS ip_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS ip_country TEXT,
  ADD COLUMN IF NOT EXISTS ip_city TEXT;
