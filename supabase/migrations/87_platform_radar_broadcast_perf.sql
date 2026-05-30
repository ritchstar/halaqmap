-- ============================================================================
-- 87 — Platform Radar: trigger throughput tuning (self-contained, idempotent)
--
-- الغرض:
--   استبدال المُسند `abs() < 0.01` داخل user_searches_platform_radar_broadcast()
--   بـ BETWEEN ليستفيد من user_searches_geo_created_idx
--   (user_lat, user_lng, created_at DESC) تحت الحِمل العالي.
--
-- ضمانات السلامة:
--   * idempotent — يمكن تشغيله مرات متعددة دون أثر سلبي.
--   * لا يلمس بيانات جدول user_searches إطلاقاً (يعدّل دالة الـ trigger فقط).
--   * يتحقق من المتطلبات الأساسية (الجدول + العمود + الفهرس) قبل التنفيذ.
--   * يعيد ربط الـ trigger بنفسه (DROP + CREATE) في حال أن سابقاً مسحه أحد.
--   * يطبع رسائل NOTICE لتأكيد كل خطوة في لوحة Supabase Logs.
--
-- المتطلب: نُفِّذت 83 (الجدول والفهارس) و 84 (الـ trigger والدالة الأصلية).
-- ============================================================================

DO $precheck$
BEGIN
  IF to_regclass('public.user_searches') IS NULL THEN
    RAISE EXCEPTION
      'Migration 87 prerequisite missing: public.user_searches table not found. Run migration 83 first.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_searches'
      AND column_name = 'user_lat'
  ) THEN
    RAISE EXCEPTION
      'Migration 87 prerequisite missing: public.user_searches.user_lat column not found. Run migration 83 first.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'user_searches_geo_created_idx'
  ) THEN
    RAISE NOTICE
      'Migration 87 notice: user_searches_geo_created_idx not found. The BETWEEN predicate will still work, but performance gain depends on this index (created by migration 83).';
  END IF;

  RAISE NOTICE 'Migration 87 prerequisites OK — proceeding with function replacement.';
END
$precheck$;

-- ----------------------------------------------------------------------------
-- 1) استبدال دالة الـ trigger (idempotent)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_searches_platform_radar_broadcast()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, realtime, pg_temp
AS $fn$
DECLARE
  v_cluster_count integer;
  v_suspicious    boolean;
  v_label         text;
BEGIN
  -- bounding-box predicate يستخدم user_searches_geo_created_idx بكفاءة.
  SELECT COUNT(*)::integer
    INTO v_cluster_count
  FROM public.user_searches
  WHERE created_at >= NOW() - interval '15 minutes'
    AND id <> NEW.id
    AND user_lat BETWEEN NEW.user_lat - 0.01 AND NEW.user_lat + 0.01
    AND user_lng BETWEEN NEW.user_lng - 0.01 AND NEW.user_lng + 0.01;

  v_suspicious := COALESCE(NEW.suspicious, FALSE) OR v_cluster_count >= 2;

  v_label := nullif(
    trim(
      coalesce(NEW.district_name, '')
      || CASE
           WHEN NEW.city_name IS NOT NULL AND btrim(NEW.city_name) <> ''
             THEN ' · ' || btrim(NEW.city_name)
           ELSE ''
         END
    ),
    ''
  );

  BEGIN
    PERFORM realtime.send(
      jsonb_build_object(
        'id',         NEW.id,
        'kind',       'user_search',
        'lat',        NEW.user_lat,
        'lng',        NEW.user_lng,
        'createdAt',  NEW.created_at,
        'label',      coalesce(v_label, NEW.scope_type),
        'suspicious', v_suspicious,
        'scopeType',  NEW.scope_type
      ),
      'user_search',
      'platform_radar_channel',
      true
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING
        'platform_radar broadcast failed for user_searches %: %',
        NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$fn$;

COMMENT ON FUNCTION public.user_searches_platform_radar_broadcast() IS
  'Platform Radar broadcast trigger — BETWEEN bounding box for index-friendly cluster lookup (migration 87).';

-- ----------------------------------------------------------------------------
-- 2) إعادة ربط الـ trigger بنفسه (في حال أن سابقاً تم مسحه/تعطيله)
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS user_searches_platform_radar_broadcast_trg
  ON public.user_searches;

CREATE TRIGGER user_searches_platform_radar_broadcast_trg
  AFTER INSERT ON public.user_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.user_searches_platform_radar_broadcast();

-- ----------------------------------------------------------------------------
-- 3) صلاحيات تنفيذ الدالة (آمنة وقابلة للتكرار)
-- ----------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.user_searches_platform_radar_broadcast() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.user_searches_platform_radar_broadcast() TO service_role;

-- ----------------------------------------------------------------------------
-- 4) تحقق ختامي + تقرير حالة
-- ----------------------------------------------------------------------------
DO $verify$
DECLARE
  v_function_present boolean;
  v_trigger_present  boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'user_searches_platform_radar_broadcast'
  ) INTO v_function_present;

  SELECT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'user_searches'
      AND t.tgname  = 'user_searches_platform_radar_broadcast_trg'
      AND NOT t.tgisinternal
  ) INTO v_trigger_present;

  IF NOT v_function_present THEN
    RAISE EXCEPTION 'Migration 87 verification failed: function user_searches_platform_radar_broadcast not present.';
  END IF;

  IF NOT v_trigger_present THEN
    RAISE EXCEPTION 'Migration 87 verification failed: trigger user_searches_platform_radar_broadcast_trg not bound to public.user_searches.';
  END IF;

  RAISE NOTICE 'Migration 87 OK — broadcast function + trigger present and active.';
END
$verify$;