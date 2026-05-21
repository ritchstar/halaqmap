-- =====================================================
-- Platform Radar — user_searches + realtime broadcast (platform_radar_channel)
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
  suspicious BOOLEAN NOT NULL DEFAULT FALSE,
  result_count INTEGER,
  rpc_result_count INTEGER
);

CREATE INDEX IF NOT EXISTS user_searches_created_at_idx
  ON public.user_searches (created_at DESC);

CREATE INDEX IF NOT EXISTS user_searches_geo_created_idx
  ON public.user_searches (user_lat, user_lng, created_at DESC);

COMMENT ON TABLE public.user_searches IS
  'نبضات بحث المستخدم للرادار التكتيكي — تُبث فوراً عبر platform_radar_channel/user_search.';

ALTER TABLE public.user_searches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_searches_admin_select" ON public.user_searches;
CREATE POLICY "user_searches_admin_select"
  ON public.user_searches
  FOR SELECT
  TO authenticated
  USING (
    public.is_bootstrap_platform_admin()
    OR public.jwt_platform_admin_has_permission('view_command_center')
    OR public.jwt_platform_admin_has_permission('view_overview')
  );

REVOKE ALL ON TABLE public.user_searches FROM PUBLIC;
GRANT SELECT ON TABLE public.user_searches TO authenticated;
GRANT SELECT ON TABLE public.user_searches TO service_role;

-- Realtime authorization: admins may receive platform_radar_channel broadcasts
DROP POLICY IF EXISTS "platform_admins_receive_radar_broadcasts" ON realtime.messages;
CREATE POLICY "platform_admins_receive_radar_broadcasts"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    public.is_bootstrap_platform_admin()
    OR public.jwt_platform_admin_has_permission('view_command_center')
    OR public.jwt_platform_admin_has_permission('view_overview')
  );

CREATE OR REPLACE FUNCTION public.user_searches_platform_radar_broadcast()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
        WHEN NEW.city_name IS NOT NULL AND trim(NEW.city_name) <> '' THEN ' · ' || trim(NEW.city_name)
        ELSE ''
      END
    ),
    ''
  );

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

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_searches_platform_radar_broadcast_trg ON public.user_searches;
CREATE TRIGGER user_searches_platform_radar_broadcast_trg
  AFTER INSERT ON public.user_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.user_searches_platform_radar_broadcast();

-- Publish table for optional postgres_changes fallback
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
END
$$;

-- Extend log_search_activity: mirror geo searches into user_searches (fires broadcast trigger)
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
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_query TEXT;
  v_scope TEXT;
  v_suspicious BOOLEAN;
BEGIN
  v_query := left(trim(coalesce(p_query_text, '')), 500);
  IF v_query = '' THEN
    RAISE EXCEPTION 'query_text required';
  END IF;

  v_scope := lower(trim(coalesce(p_scope_type, '')));
  IF v_scope NOT IN ('district', 'city', 'service', 'geo_nearby', 'filter', 'composite') THEN
    RAISE EXCEPTION 'invalid scope_type';
  END IF;

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
    CASE WHEN p_district_name IS NULL THEN NULL ELSE left(trim(p_district_name), 200) END,
    CASE WHEN p_city_name IS NULL THEN NULL ELSE left(trim(p_city_name), 200) END,
    p_service_tags,
    p_user_lat,
    p_user_lng,
    COALESCE(p_location_sharing, FALSE),
    COALESCE(p_filters_json, '{}'::jsonb),
    p_result_count,
    p_rpc_result_count
  )
  RETURNING id INTO v_id;

  IF p_user_lat IS NOT NULL
     AND p_user_lng IS NOT NULL
     AND p_user_lat >= 16
     AND p_user_lat <= 33.5
     AND p_user_lng >= 34
     AND p_user_lng <= 56.5
  THEN
    v_suspicious :=
      (p_result_count IS NOT NULL AND p_result_count = 0)
      OR (p_rpc_result_count IS NOT NULL AND p_rpc_result_count = 0)
      OR v_scope IN ('filter', 'composite');

    INSERT INTO public.user_searches (
      search_log_id,
      query_text,
      scope_type,
      district_name,
      city_name,
      user_lat,
      user_lng,
      suspicious,
      result_count,
      rpc_result_count
    ) VALUES (
      v_id,
      v_query,
      v_scope,
      CASE WHEN p_district_name IS NULL THEN NULL ELSE left(trim(p_district_name), 200) END,
      CASE WHEN p_city_name IS NULL THEN NULL ELSE left(trim(p_city_name), 200) END,
      p_user_lat,
      p_user_lng,
      COALESCE(v_suspicious, FALSE),
      p_result_count,
      p_rpc_result_count
    );
  END IF;

  RETURN v_id;
END;
$$;
