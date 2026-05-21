-- =====================================================
-- 83 — Platform Radar: user_searches schema + Realtime infra
-- يُشغَّل قبل 84. لا يعدّل log_search_activity هنا.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  search_log_id UUID REFERENCES public.search_activity_logs(id) ON DELETE SET NULL,
  query_text TEXT NOT NULL,
  scope_type TEXT NOT NULL CHECK (
    scope_type IN ('district', 'city', 'service', 'geo_nearby', 'filter', 'composite')
  ),
  district_name TEXT,
  city_name TEXT,
  user_lat DOUBLE PRECISION NOT NULL,
  user_lng DOUBLE PRECISION NOT NULL,
  location_sharing BOOLEAN NOT NULL DEFAULT FALSE,
  suspicious BOOLEAN NOT NULL DEFAULT FALSE,
  result_count INTEGER,
  rpc_result_count INTEGER
);

-- ترقية آمنة إذا وُجد الجدول من نسخة سابقة
ALTER TABLE public.user_searches
  ADD COLUMN IF NOT EXISTS location_sharing BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.user_searches
  ADD COLUMN IF NOT EXISTS suspicious BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS user_searches_created_at_idx
  ON public.user_searches (created_at DESC);

CREATE INDEX IF NOT EXISTS user_searches_geo_created_idx
  ON public.user_searches (user_lat, user_lng, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS user_searches_search_log_id_uidx
  ON public.user_searches (search_log_id)
  WHERE search_log_id IS NOT NULL;

COMMENT ON TABLE public.user_searches IS
  'نبضات بحث المستخدم للرادار التكتيكي — تُبث عبر platform_radar_channel/user_search.';

ALTER TABLE public.user_searches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_searches_admin_select" ON public.user_searches;
CREATE POLICY "user_searches_admin_select"
  ON public.user_searches
  FOR SELECT
  TO authenticated
  USING (
    public.is_bootstrap_platform_admin()
    OR public.is_jwt_platform_admin()
    OR public.jwt_platform_admin_has_permission('view_command_center')
    OR public.jwt_platform_admin_has_permission('view_overview')
  );

REVOKE ALL ON TABLE public.user_searches FROM PUBLIC;
GRANT SELECT ON TABLE public.user_searches TO authenticated;
GRANT SELECT ON TABLE public.user_searches TO service_role;

-- Realtime postgres_changes fallback (INSERT على user_searches)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'user_searches'
  ) THEN
    RETURN;
  END IF;

  ALTER PUBLICATION supabase_realtime ADD TABLE public.user_searches;
EXCEPTION
  WHEN undefined_object THEN
    RAISE NOTICE 'supabase_realtime publication missing — skip user_searches publication';
END
$$;

-- Realtime Broadcast authorization (platform_radar_channel / private)
DO $$
BEGIN
  IF to_regclass('realtime.messages') IS NULL THEN
    RAISE NOTICE 'realtime.messages not found — skip radar broadcast RLS policy';
    RETURN;
  END IF;

  DROP POLICY IF EXISTS "platform_admins_receive_radar_broadcasts" ON realtime.messages;

  CREATE POLICY "platform_admins_receive_radar_broadcasts"
    ON realtime.messages
    FOR SELECT
    TO authenticated
    USING (
      public.is_bootstrap_platform_admin()
      OR public.is_jwt_platform_admin()
      OR public.jwt_platform_admin_has_permission('view_command_center')
      OR public.jwt_platform_admin_has_permission('view_overview')
    );
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not create realtime.messages policy: %', SQLERRM;
END
$$;

-- Helpers (used by 84)
CREATE OR REPLACE FUNCTION public.platform_radar_is_ksa_coordinate(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_lat IS NOT NULL
     AND p_lng IS NOT NULL
     AND p_lat >= 16.0
     AND p_lat <= 33.5
     AND p_lng >= 34.0
     AND p_lng <= 56.5;
$$;

COMMENT ON FUNCTION public.platform_radar_is_ksa_coordinate(double precision, double precision) IS
  'Bounding-box check for KSA geo pulses on Platform Radar.';

REVOKE ALL ON FUNCTION public.platform_radar_is_ksa_coordinate(double precision, double precision) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.platform_radar_is_ksa_coordinate(double precision, double precision) TO authenticated;
GRANT EXECUTE ON FUNCTION public.platform_radar_is_ksa_coordinate(double precision, double precision) TO service_role;
