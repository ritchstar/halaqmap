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
