-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- =====================================================
-- 178 — مستشار أمان سوباباس (WARN): منح الدوال + search_path + سرد التخزين
-- لا يمس PostGIS ولا دوال البحث/الحجز العامة المقصودة لـ anon.
-- =====================================================

-- 1) منع EXECUTE الافتراضي لـ PUBLIC على الدوال الجديدة التي ينشئها postgres
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- 2) سحب EXECUTE عن anon (وعن authenticated للمحفّزات/الداخلي)
--    ثم إعادة المنح للدور المقصود فقط.
DO $$
DECLARE
  r record;
  fn_name text;
  internal_only constant text[] := ARRAY[
    'handle_new_user',
    'notify_new_message',
    'notify_new_booking',
    'create_subscription_on_approval',
    'log_admin_activity',
    'update_barber_rating',
    'update_barber_tier_on_subscription',
    'update_barber_tier_on_listing_entitlement',
    'ensure_barber_digital_shift_on_diamond',
    'fleet_demand_on_conversation_started',
    'purge_barber_portfolio_storage_before_barber_delete',
    'increment_fleet_demand_counter',
    'ensure_bronze_trial_listing_for_barber',
    'ensure_salon_owner_member',
    'refresh_barber_gallery_public_snapshot',
    'admin_create_magic_login_token',
    'admin_invalidate_magic_login_tokens',
    'log_booking_security_event',
    'expire_private_conversations',
    'mark_notification_as_read',
    'mark_message_as_read',
    'update_barber_location',
    'handle_updated_at',
    'update_updated_at_column',
    'update_barber_status_change',
    'set_platform_admin_roles_updated_at',
    'touch_private_conversation_last_message',
    'guard_private_conversation_update',
    'barbers_assign_member_number',
    'set_partner_tutorial_videos_updated_at',
    'set_platform_ops_billing_commitments_updated_at',
    'touch_barber_digital_shift_config_updated_at',
    'platform_ops_billing_manual_stable_key'
  ];
  keep_authenticated constant text[] := ARRAY[
    'actor_has_platform_manage_admins',
    'actor_has_platform_view_messages',
    'jwt_platform_admin_has_permission',
    'is_jwt_platform_admin',
    'is_bootstrap_platform_admin',
    'jwt_platform_admin_email',
    'is_protected_platform_admin_row',
    'platform_admin_permissions_template',
    'get_platform_resource_snapshot',
    'admin_purge_registration_storage_objects',
    'admin_purge_partner_promo_storage_objects',
    'admin_purge_old_platform_logs',
    'admin_purge_orphan_barber_portfolio_objects',
    'start_private_conversation',
    'start_private_conversation_by_barber_id',
    'close_private_conversation',
    'is_private_conversation_participant',
    'is_private_conversation_open'
  ];
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS fn
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    JOIN pg_language l ON l.oid = p.prolang
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
      AND l.lanname <> 'c'
      AND p.proname = ANY (internal_only)
  LOOP
    BEGIN
      EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', r.fn);
      EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon, authenticated', r.fn);
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', r.fn);
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE NOTICE '178 revoke/grant skipped (privilege): %', r.fn;
      WHEN undefined_function THEN
        RAISE NOTICE '178 function missing: %', r.fn;
    END;
  END LOOP;

  FOR r IN
    SELECT p.oid::regprocedure AS fn
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    JOIN pg_language l ON l.oid = p.prolang
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
      AND l.lanname <> 'c'
      AND p.proname = ANY (keep_authenticated)
  LOOP
    BEGIN
      EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', r.fn);
      EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', r.fn);
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', r.fn);
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE NOTICE '178 revoke/grant skipped (privilege): %', r.fn;
      WHEN undefined_function THEN
        RAISE NOTICE '178 function missing: %', r.fn;
    END;
  END LOOP;

  -- أسماء غير موجودة في هذا المستودع تُتخطى بصمت إن غابت عن الإنتاج أيضاً
  FOREACH fn_name IN ARRAY ARRAY[
    'admin_create_magic_login_token',
    'admin_invalidate_magic_login_tokens'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = fn_name
    ) THEN
      RAISE NOTICE '178 % not present — skipped', fn_name;
    END IF;
  END LOOP;
END
$$;

-- 3) تثبيت search_path للدوال التي بلّغ عنها المستشار بلا تغيير أجسامها
DO $$
DECLARE
  r record;
  flagged constant text[] := ARRAY[
    'handle_updated_at',
    'update_barber_location',
    'update_barber_tier_on_subscription',
    'update_barber_rating',
    'mark_notification_as_read',
    'mark_message_as_read',
    'notify_new_message',
    'create_subscription_on_approval',
    'log_admin_activity',
    'update_updated_at_column',
    'update_barber_status_change',
    'is_jwt_platform_admin',
    'is_bootstrap_platform_admin',
    'set_platform_admin_roles_updated_at',
    'is_private_conversation_participant',
    'is_private_conversation_open',
    'touch_private_conversation_last_message',
    'guard_private_conversation_update',
    'barbers_assign_member_number',
    'jwt_platform_admin_email',
    'is_protected_platform_admin_row',
    'platform_admin_permissions_template',
    'set_partner_tutorial_videos_updated_at',
    'platform_ops_billing_manual_stable_key',
    'set_platform_ops_billing_commitments_updated_at',
    'update_barber_tier_on_listing_entitlement',
    'touch_barber_digital_shift_config_updated_at'
  ];
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS fn
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    JOIN pg_language l ON l.oid = p.prolang
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
      AND l.lanname <> 'c'
      AND p.proname = ANY (flagged)
      AND (
        p.proconfig IS NULL
        OR NOT EXISTS (
          SELECT 1
          FROM unnest(p.proconfig) AS cfg
          WHERE cfg LIKE 'search_path=%'
        )
      )
  LOOP
    BEGIN
      EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', r.fn);
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE NOTICE '178 search_path skipped (privilege): %', r.fn;
    END;
  END LOOP;
END
$$;

-- 4) registration-uploads: الحاوية تبقى عامة للرابط المباشر، بلا سياسة SELECT تسرد كل الملفات
DROP POLICY IF EXISTS "public_read_registration_uploads" ON storage.objects;
