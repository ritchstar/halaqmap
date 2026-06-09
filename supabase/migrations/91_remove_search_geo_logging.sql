-- =====================================================
-- 91 — Remove public geo search logging بالكامل
-- الهدف: إيقاف تخزين/بث إحداثيات المستخدم نهائياً
-- والاعتماد على المعالجة اللحظية في الذاكرة فقط.
-- =====================================================

-- إسقاط المشغلات والدوال المرتبطة بسجل البحث والرادار
DROP TRIGGER IF EXISTS user_searches_platform_radar_broadcast_trg ON public.user_searches;

DROP FUNCTION IF EXISTS public.user_searches_platform_radar_broadcast();
DROP FUNCTION IF EXISTS public.platform_radar_compute_search_suspicious(TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS public.log_search_activity(
  TEXT, TEXT, TEXT, TEXT, TEXT[], DOUBLE PRECISION, DOUBLE PRECISION, BOOLEAN, JSONB, INTEGER, INTEGER
);
DROP FUNCTION IF EXISTS public.platform_radar_is_ksa_coordinate(DOUBLE PRECISION, DOUBLE PRECISION);

-- إزالة جدول user_searches من realtime publication إن وُجد
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'user_searches'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.user_searches;
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    RAISE NOTICE 'supabase_realtime publication missing — skip drop user_searches';
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not drop user_searches from publication: %', SQLERRM;
END
$$;

-- إسقاط الجداول نهائياً
DROP TABLE IF EXISTS public.user_searches;
DROP TABLE IF EXISTS public.search_activity_logs;

-- إعادة تعريف لقطة الموارد بدون سجلات البحث الجغرافي
CREATE OR REPLACE FUNCTION public.get_platform_resource_snapshot()
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  IF NOT public.is_jwt_platform_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN jsonb_build_object(
    'generated_at', to_jsonb(now()),
    'registration_uploads', (
      SELECT COALESCE(
        jsonb_build_object(
          'object_count', COUNT(*)::bigint,
          'approx_bytes', COALESCE(
            SUM(COALESCE(NULLIF(o.metadata->>'size', '')::bigint, 0::bigint)),
            0::bigint
          ),
          'banner_object_count', COUNT(*) FILTER (WHERE o.name LIKE '%/banners/%')::bigint
        ),
        '{"object_count":0,"approx_bytes":0,"banner_object_count":0}'::jsonb
      )
      FROM storage.objects o
      WHERE o.bucket_id = 'registration-uploads'
    ),
    'partner_promo', (
      SELECT COALESCE(
        jsonb_build_object(
          'object_count', COUNT(*)::bigint,
          'approx_bytes', COALESCE(
            SUM(COALESCE(NULLIF(o.metadata->>'size', '')::bigint, 0::bigint)),
            0::bigint
          )
        ),
        '{"object_count":0,"approx_bytes":0}'::jsonb
      )
      FROM storage.objects o
      WHERE o.bucket_id = 'partner-promo'
    ),
    'barber_portfolio', (
      SELECT COALESCE(
        jsonb_build_object(
          'object_count', COUNT(*)::bigint,
          'approx_bytes', COALESCE(
            SUM(COALESCE(NULLIF(o.metadata->>'size', '')::bigint, 0::bigint)),
            0::bigint
          )
        ),
        '{"object_count":0,"approx_bytes":0}'::jsonb
      )
      FROM storage.objects o
      WHERE o.bucket_id = 'barber-portfolio'
    ),
    'logs', jsonb_build_object(
      'search_activity_logs_count', 0::bigint,
      'payment_security_events_count', (SELECT COUNT(*)::bigint FROM public.payment_security_events)
    )
  );
END;
$$;

COMMENT ON FUNCTION public.get_platform_resource_snapshot() IS
  'لقطة تخزين وسجلات — بعد إزالة search_activity_logs/user_searches نهائياً من البنية.';

-- إعادة تعريف تنظيف السجلات دون الإشارة لسجل البحث المحذوف
CREATE OR REPLACE FUNCTION public.admin_purge_old_platform_logs(p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p bigint;
  cutoff timestamptz;
BEGIN
  IF NOT public.is_bootstrap_platform_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF p_days IS NULL OR p_days < 1 THEN
    RAISE EXCEPTION 'invalid_days' USING ERRCODE = '22023';
  END IF;
  cutoff := now() - make_interval(days => p_days);

  DELETE FROM public.payment_security_events WHERE created_at < cutoff;
  GET DIAGNOSTICS p = ROW_COUNT;

  RETURN jsonb_build_object(
    'cutoff', cutoff,
    'days_kept', p_days,
    'deleted_search_activity_logs', 0,
    'deleted_payment_security_events', p
  );
END;
$$;

COMMENT ON FUNCTION public.admin_purge_old_platform_logs(integer) IS
  'حذف أحداث الأمان القديمة فقط بعد إزالة سجلات البحث الجغرافي نهائياً.';
