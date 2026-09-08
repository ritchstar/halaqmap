-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- =====================================================
-- 205 — تقرير Security Advisor: سحب EXECUTE عن authenticated/anon
--       للدوال الإدارية والصيانة؛ service_role + مسارات API فقط.
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_service_role_executor()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT coalesce(auth.role(), '') = 'service_role';
$$;

COMMENT ON FUNCTION public.is_service_role_executor() IS
  'true عند استدعاء RPC بمفتاح service_role من خادم موثوق (بعد تحقق API).';

REVOKE ALL ON FUNCTION public.is_service_role_executor() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_service_role_executor() TO service_role;

-- لقطة الموارد — JWT admin أو خادم موثوق فقط
CREATE OR REPLACE FUNCTION public.get_platform_resource_snapshot()
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  IF NOT (public.is_jwt_platform_admin() OR public.is_service_role_executor()) THEN
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
  IF NOT (public.is_bootstrap_platform_admin() OR public.is_service_role_executor()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  DELETE FROM storage.objects WHERE bucket_id = 'registration-uploads';
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN jsonb_build_object('bucket', 'registration-uploads', 'deleted_rows', n);
END;
$$;

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
  IF NOT (public.is_bootstrap_platform_admin() OR public.is_service_role_executor()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  DELETE FROM storage.objects WHERE bucket_id = 'partner-promo';
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN jsonb_build_object('bucket', 'partner-promo', 'deleted_rows', n);
END;
$$;

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
  IF NOT (public.is_bootstrap_platform_admin() OR public.is_service_role_executor()) THEN
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

CREATE OR REPLACE FUNCTION public.admin_purge_orphan_barber_portfolio_objects()
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  n bigint;
BEGIN
  IF NOT (public.is_bootstrap_platform_admin() OR public.is_service_role_executor()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  DELETE FROM storage.objects o
  WHERE o.bucket_id = 'barber-portfolio'
    AND NOT EXISTS (
      SELECT 1
      FROM public.barbers b
      WHERE o.name LIKE (b.id::text || '/%')
    );

  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN jsonb_build_object('bucket', 'barber-portfolio', 'deleted_orphan_rows', n);
END;
$$;

REVOKE ALL ON FUNCTION public.get_platform_resource_snapshot() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_platform_resource_snapshot() TO service_role;

REVOKE ALL ON FUNCTION public.admin_purge_registration_storage_objects() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_purge_registration_storage_objects() TO service_role;

REVOKE ALL ON FUNCTION public.admin_purge_partner_promo_storage_objects() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_purge_partner_promo_storage_objects() TO service_role;

REVOKE ALL ON FUNCTION public.admin_purge_old_platform_logs(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_purge_old_platform_logs(integer) TO service_role;

REVOKE ALL ON FUNCTION public.admin_purge_orphan_barber_portfolio_objects() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_purge_orphan_barber_portfolio_objects() TO service_role;

-- صيانة الشات — كرون service_role فقط
REVOKE ALL ON FUNCTION public.run_private_chat_maintenance() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.run_private_chat_maintenance() TO service_role;

-- الحجز الآمن — إنتاج يستخدم service_role من الخادم؛ المحاكاة أيضاً
REVOKE ALL ON FUNCTION public.create_booking_safe(
  uuid, text, text, text, date, time, text, numeric, integer, text, uuid
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_booking_safe(
  uuid, text, text, text, date, time, text, numeric, integer, text, uuid
) TO service_role;
