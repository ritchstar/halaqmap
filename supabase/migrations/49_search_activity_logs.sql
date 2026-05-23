-- =====================================================
-- تتبع عمليات البحث (Search Activity) — Sentinel / تحليل الطلب
-- =====================================================

CREATE TABLE IF NOT EXISTS public.search_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  query_text TEXT NOT NULL,
  scope_type TEXT NOT NULL CHECK (
    scope_type IN ('district', 'city', 'service', 'geo_nearby', 'filter', 'composite')
  ),
  district_name TEXT,
  city_name TEXT,
  service_tags TEXT[],
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  location_sharing BOOLEAN NOT NULL DEFAULT FALSE,
  filters_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_count INTEGER,
  rpc_result_count INTEGER
);

CREATE INDEX IF NOT EXISTS search_activity_logs_created_at_idx
  ON public.search_activity_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS search_activity_logs_district_created_idx
  ON public.search_activity_logs (district_name, created_at DESC)
  WHERE district_name IS NOT NULL AND district_name <> '';

COMMENT ON TABLE public.search_activity_logs IS 'سجلات بحث المستخدمين (مجهول/عام) — تُملأ عبر الدالة log_search_activity من الخادم.';

ALTER TABLE public.search_activity_logs ENABLE ROW LEVEL SECURITY;

-- لا سياسات قراءة/كتابة للأدوار العامة — الإدراج عبر الدالة SECURITY DEFINER فقط من خدمة الخادم.

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

  RETURN v_id;
END;
$$;

REVOKE ALL ON TABLE public.search_activity_logs FROM PUBLIC;
GRANT SELECT ON TABLE public.search_activity_logs TO postgres;
GRANT SELECT ON TABLE public.search_activity_logs TO service_role;

REVOKE ALL ON FUNCTION public.log_search_activity(
  TEXT, TEXT, TEXT, TEXT, TEXT[], DOUBLE PRECISION, DOUBLE PRECISION, BOOLEAN, JSONB, INTEGER, INTEGER
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.log_search_activity(
  TEXT, TEXT, TEXT, TEXT, TEXT[], DOUBLE PRECISION, DOUBLE PRECISION, BOOLEAN, JSONB, INTEGER, INTEGER
) TO service_role;
