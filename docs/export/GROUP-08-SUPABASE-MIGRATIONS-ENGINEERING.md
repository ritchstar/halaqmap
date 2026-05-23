# Supabase Migrations — Engineering & Handshake

> Export group `GROUP-08-SUPABASE-MIGRATIONS-ENGINEERING` · Commit `b0e9e73`

### `supabase/migrations/85_platform_engineering_council.sql`

```sql
-- Engineering Council — agent-to-agent messaging + pending execution queue (Founder approval gate).

CREATE TABLE IF NOT EXISTS public.platform_agent_council_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  thread_id text NOT NULL,
  from_agent text NOT NULL,
  to_agent text NOT NULL,
  message_type text NOT NULL DEFAULT 'consultation',
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS platform_agent_council_messages_thread_idx
  ON public.platform_agent_council_messages (thread_id, created_at DESC);

CREATE INDEX IF NOT EXISTS platform_agent_council_messages_to_agent_idx
  ON public.platform_agent_council_messages (to_agent, created_at DESC);

CREATE TABLE IF NOT EXISTS public.platform_engineering_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'planning',
  initiator_agent text NOT NULL DEFAULT 'technical_consultant_engineering',
  title text NOT NULL,
  task_description text NOT NULL,
  plan_markdown text,
  prosecutor_verdict jsonb,
  draft_branch text,
  unit_tests_plan text,
  cursor_job_ref text,
  approved_by text,
  approved_at timestamptz,
  rejected_by text,
  rejected_at timestamptz,
  reporter_email text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS platform_engineering_executions_status_idx
  ON public.platform_engineering_executions (status, updated_at DESC);

COMMENT ON TABLE public.platform_agent_council_messages IS
  'Agent-to-agent council bus — consultations, compliance verdicts, refactor proposals.';

COMMENT ON TABLE public.platform_engineering_executions IS
  'Self-development protocol executions — held pending Founder approval before Cursor/CLI commit.';

ALTER TABLE public.platform_agent_council_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_engineering_executions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_agent_council_messages_no_client" ON public.platform_agent_council_messages;
CREATE POLICY "platform_agent_council_messages_no_client"
  ON public.platform_agent_council_messages FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "platform_engineering_executions_no_client" ON public.platform_engineering_executions;
CREATE POLICY "platform_engineering_executions_no_client"
  ON public.platform_engineering_executions FOR ALL USING (false) WITH CHECK (false);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_agent_council_messages TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_engineering_executions TO service_role;
REVOKE ALL ON TABLE public.platform_agent_council_messages FROM anon, authenticated;
REVOKE ALL ON TABLE public.platform_engineering_executions FROM anon, authenticated;

```

### `supabase/migrations/86_platform_engineering_handshake.sql`

```sql
-- Engineering Wing Handshake — founder activation gate for Operations Controller.

CREATE TABLE IF NOT EXISTS public.platform_engineering_handshake (
  id text PRIMARY KEY DEFAULT 'founder',
  status text NOT NULL DEFAULT 'pending',
  handshake_at timestamptz,
  services jsonb NOT NULL DEFAULT '{}'::jsonb,
  vercel_deployment_url text,
  vercel_deployment_id text,
  ops_controller_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.platform_engineering_handshake IS
  'Founder Engineering Wing handshake — service pings + Ops Controller activation gate.';

ALTER TABLE public.platform_engineering_handshake ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_engineering_handshake_no_client" ON public.platform_engineering_handshake;
CREATE POLICY "platform_engineering_handshake_no_client"
  ON public.platform_engineering_handshake FOR ALL USING (false) WITH CHECK (false);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_engineering_handshake TO service_role;
REVOKE ALL ON TABLE public.platform_engineering_handshake FROM anon, authenticated;

INSERT INTO public.platform_engineering_handshake (id, status, ops_controller_enabled)
VALUES ('founder', 'pending', false)
ON CONFLICT (id) DO NOTHING;

```

### `supabase/migrations/84_platform_radar_broadcast_resilience.sql`

```sql
-- =====================================================
-- 84 — Platform Radar: broadcast trigger + resilient log_search_activity
-- يتطلب 83. لا يُسقِط تسجيل search_activity_logs عند فشل البث.
-- =====================================================

CREATE OR REPLACE FUNCTION public.platform_radar_compute_search_suspicious(
  p_scope_type TEXT,
  p_result_count INTEGER,
  p_rpc_result_count INTEGER
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    (p_result_count IS NOT NULL AND p_result_count = 0)
    OR (p_rpc_result_count IS NOT NULL AND p_rpc_result_count = 0)
    OR lower(trim(coalesce(p_scope_type, ''))) IN ('filter', 'composite');
$$;

REVOKE ALL ON FUNCTION public.platform_radar_compute_search_suspicious(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.platform_radar_compute_search_suspicious(text, integer, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.user_searches_platform_radar_broadcast()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, realtime, pg_temp
AS $$
DECLARE
  v_cluster_count integer;
  v_suspicious boolean;
  v_label text;
BEGIN
  SELECT COUNT(*)::integer INTO v_cluster_count
  FROM public.user_searches
  WHERE created_at >= NOW() - interval '15 minutes'
    AND id <> NEW.id
    AND abs(user_lat - NEW.user_lat) < 0.01
    AND abs(user_lng - NEW.user_lng) < 0.01;

  v_suspicious := NEW.suspicious OR v_cluster_count >= 2;

  v_label := nullif(
    trim(
      coalesce(NEW.district_name, '')
      || CASE
        WHEN NEW.city_name IS NOT NULL AND btrim(NEW.city_name) <> '' THEN ' · ' || btrim(NEW.city_name)
        ELSE ''
      END
    ),
    ''
  );

  BEGIN
    PERFORM realtime.send(
      jsonb_build_object(
        'id', NEW.id,
        'kind', 'user_search',
        'lat', NEW.user_lat,
        'lng', NEW.user_lng,
        'createdAt', NEW.created_at,
        'label', coalesce(v_label, NEW.scope_type),
        'suspicious', v_suspicious,
        'scopeType', NEW.scope_type
      ),
      'user_search',
      'platform_radar_channel',
      true
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'platform_radar broadcast failed for user_searches %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_searches_platform_radar_broadcast_trg ON public.user_searches;
CREATE TRIGGER user_searches_platform_radar_broadcast_trg
  AFTER INSERT ON public.user_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.user_searches_platform_radar_broadcast();

CREATE OR REPLACE FUNCTION public.log_search_activity(
  p_query_text TEXT,
  p_scope_type TEXT,
  p_district_name TEXT DEFAULT NULL,
  p_city_name TEXT DEFAULT NULL,
  p_service_tags TEXT[] DEFAULT NULL,
  p_user_lat DOUBLE PRECISION DEFAULT NULL,
  p_user_lng DOUBLE PRECISION DEFAULT NULL,
  p_location_sharing BOOLEAN DEFAULT FALSE,
  p_filters_json JSONB DEFAULT '{}'::jsonb,
  p_result_count INTEGER DEFAULT NULL,
  p_rpc_result_count INTEGER DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_id UUID;
  v_query TEXT;
  v_scope TEXT;
  v_district TEXT;
  v_city TEXT;
  v_suspicious BOOLEAN;
BEGIN
  v_query := left(btrim(coalesce(p_query_text, '')), 500);
  IF v_query = '' THEN
    RAISE EXCEPTION 'query_text required';
  END IF;

  v_scope := lower(btrim(coalesce(p_scope_type, '')));
  IF v_scope NOT IN ('district', 'city', 'service', 'geo_nearby', 'filter', 'composite') THEN
    RAISE EXCEPTION 'invalid scope_type';
  END IF;

  v_district := CASE WHEN p_district_name IS NULL THEN NULL ELSE left(btrim(p_district_name), 200) END;
  v_city := CASE WHEN p_city_name IS NULL THEN NULL ELSE left(btrim(p_city_name), 200) END;

  INSERT INTO public.search_activity_logs (
    query_text,
    scope_type,
    district_name,
    city_name,
    service_tags,
    user_lat,
    user_lng,
    location_sharing,
    filters_json,
    result_count,
    rpc_result_count
  ) VALUES (
    v_query,
    v_scope,
    v_district,
    v_city,
    p_service_tags,
    p_user_lat,
    p_user_lng,
    COALESCE(p_location_sharing, FALSE),
    COALESCE(p_filters_json, '{}'::jsonb),
    p_result_count,
    p_rpc_result_count
  )
  RETURNING id INTO v_id;

  IF public.platform_radar_is_ksa_coordinate(p_user_lat, p_user_lng) THEN
    v_suspicious := public.platform_radar_compute_search_suspicious(
      v_scope,
      p_result_count,
      p_rpc_result_count
    );

    BEGIN
      INSERT INTO public.user_searches (
        search_log_id,
        query_text,
        scope_type,
        district_name,
        city_name,
        user_lat,
        user_lng,
        location_sharing,
        suspicious,
        result_count,
        rpc_result_count
      ) VALUES (
        v_id,
        v_query,
        v_scope,
        v_district,
        v_city,
        p_user_lat,
        p_user_lng,
        COALESCE(p_location_sharing, FALSE),
        COALESCE(v_suspicious, FALSE),
        p_result_count,
        p_rpc_result_count
      )
      ON CONFLICT (search_log_id) WHERE search_log_id IS NOT NULL DO NOTHING;
    EXCEPTION
      WHEN undefined_table THEN
        RAISE WARNING 'user_searches missing — run migration 83';
      WHEN OTHERS THEN
        RAISE WARNING 'user_searches insert failed for search_log %: %', v_id, SQLERRM;
    END;
  END IF;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_search_activity(
  TEXT, TEXT, TEXT, TEXT, TEXT[], DOUBLE PRECISION, DOUBLE PRECISION, BOOLEAN, JSONB, INTEGER, INTEGER
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.log_search_activity(
  TEXT, TEXT, TEXT, TEXT, TEXT[], DOUBLE PRECISION, DOUBLE PRECISION, BOOLEAN, JSONB, INTEGER, INTEGER
) TO service_role;

-- Backfill: mirror recent geo logs that never reached user_searches
INSERT INTO public.user_searches (
  search_log_id,
  query_text,
  scope_type,
  district_name,
  city_name,
  user_lat,
  user_lng,
  location_sharing,
  suspicious,
  result_count,
  rpc_result_count,
  created_at
)
SELECT
  s.id,
  s.query_text,
  s.scope_type,
  s.district_name,
  s.city_name,
  s.user_lat,
  s.user_lng,
  s.location_sharing,
  public.platform_radar_compute_search_suspicious(s.scope_type, s.result_count, s.rpc_result_count),
  s.result_count,
  s.rpc_result_count,
  s.created_at
FROM public.search_activity_logs s
WHERE s.created_at >= NOW() - interval '48 hours'
  AND public.platform_radar_is_ksa_coordinate(s.user_lat, s.user_lng)
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_searches u
    WHERE u.search_log_id = s.id
  )
ON CONFLICT (search_log_id) WHERE search_log_id IS NOT NULL DO NOTHING;

```

### `supabase/migrations/81_platform_ops_controller_reports.sql`

```sql
-- تقارير مراقب العمليات (OPS_MANAGER) — تظهر في تغذية المؤسس.
-- الإدراج والقراءة عبر API (service_role) فقط.

CREATE TABLE IF NOT EXISTS public.platform_ops_controller_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  client_id text NOT NULL,
  client_label text,
  reporter_email text NOT NULL,
  reporter_role text NOT NULL DEFAULT 'OPS_MANAGER',
  category text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  summary text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS platform_ops_controller_reports_submitted_idx
  ON public.platform_ops_controller_reports (submitted_at DESC);

CREATE INDEX IF NOT EXISTS platform_ops_controller_reports_client_idx
  ON public.platform_ops_controller_reports (client_id);

CREATE INDEX IF NOT EXISTS platform_ops_controller_reports_reporter_idx
  ON public.platform_ops_controller_reports (reporter_email);

COMMENT ON TABLE public.platform_ops_controller_reports IS
  'تقارير OPS_MANAGER — مُوسَمة بـ client_id و submitted_at للتغذية التشغيلية للمؤسس.';

ALTER TABLE public.platform_ops_controller_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_ops_controller_reports_no_client" ON public.platform_ops_controller_reports;
CREATE POLICY "platform_ops_controller_reports_no_client"
  ON public.platform_ops_controller_reports
  FOR ALL
  USING (false)
  WITH CHECK (false);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_ops_controller_reports TO service_role;
REVOKE ALL ON TABLE public.platform_ops_controller_reports FROM anon, authenticated;

```
