-- =====================================================
-- مراقبة موارد التخزين/السجلات + تنظيف (مالك bootstrap فقط للحذف)
-- =====================================================

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
    'logs', jsonb_build_object(
      'search_activity_logs_count', (SELECT COUNT(*)::bigint FROM public.search_activity_logs),
      'payment_security_events_count', (SELECT COUNT(*)::bigint FROM public.payment_security_events)
    )
  );
END;
$$;

COMMENT ON FUNCTION public.get_platform_resource_snapshot() IS
  'لقطة تخزين وسجلات — لأعضاء الإدارة JWT. أحجام storage تقريبية من metadata.size.';

REVOKE ALL ON FUNCTION public.get_platform_resource_snapshot() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_platform_resource_snapshot() TO authenticated;


CREATE OR REPLACE FUNCTION public.admin_purge_registration_storage_objects()
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  n bigint;
BEGIN
  IF NOT public.is_bootstrap_platform_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  DELETE FROM storage.objects WHERE bucket_id = 'registration-uploads';
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN jsonb_build_object('bucket', 'registration-uploads', 'deleted_rows', n);
END;
$$;

COMMENT ON FUNCTION public.admin_purge_registration_storage_objects() IS
  'حذف جميع كائنات registration-uploads — للمالك bootstrap فقط.';

REVOKE ALL ON FUNCTION public.admin_purge_registration_storage_objects() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_purge_registration_storage_objects() TO authenticated;


CREATE OR REPLACE FUNCTION public.admin_purge_partner_promo_storage_objects()
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  n bigint;
BEGIN
  IF NOT public.is_bootstrap_platform_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  DELETE FROM storage.objects WHERE bucket_id = 'partner-promo';
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN jsonb_build_object('bucket', 'partner-promo', 'deleted_rows', n);
END;
$$;

COMMENT ON FUNCTION public.admin_purge_partner_promo_storage_objects() IS
  'حذف جميع كائنات partner-promo — قد يعطل فيديوهات الشركاء حتى إعادة الرفع. للمالك bootstrap فقط.';

REVOKE ALL ON FUNCTION public.admin_purge_partner_promo_storage_objects() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_purge_partner_promo_storage_objects() TO authenticated;


CREATE OR REPLACE FUNCTION public.admin_purge_old_platform_logs(p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s bigint;
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

  DELETE FROM public.search_activity_logs WHERE created_at < cutoff;
  GET DIAGNOSTICS s = ROW_COUNT;

  DELETE FROM public.payment_security_events WHERE created_at < cutoff;
  GET DIAGNOSTICS p = ROW_COUNT;

  RETURN jsonb_build_object(
    'cutoff', cutoff,
    'days_kept', p_days,
    'deleted_search_activity_logs', s,
    'deleted_payment_security_events', p
  );
END;
$$;

COMMENT ON FUNCTION public.admin_purge_old_platform_logs(integer) IS
  'حذف سجلات بحث وأحداث أمان أقدم من N يوماً — للمالك bootstrap فقط.';

REVOKE ALL ON FUNCTION public.admin_purge_old_platform_logs(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_purge_old_platform_logs(integer) TO authenticated;
