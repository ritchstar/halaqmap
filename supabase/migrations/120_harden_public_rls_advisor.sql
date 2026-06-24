-- =====================================================
-- 120 — Harden public tables flagged by Supabase advisor
-- rls_disabled_in_public — idempotent, safe to re-run
-- =====================================================

DO $$
DECLARE
  tbl text;
  service_only_tables constant text[] := ARRAY[
    'salon_members',
    'salon_ops_events',
    'barber_push_subscriptions',
    'fleet_operational_pulse',
    'fleet_demand_counters',
    'fleet_salon_stagnation_pulse',
    'agent_conversations',
    'partner_prospects',
    'barber_interest_signups',
    'platform_showcase_settings',
    'cyber_dvr_sessions',
    'security_block_list',
    'security_events'
  ];
BEGIN
  FOREACH tbl IN ARRAY service_only_tables
  LOOP
    IF to_regclass(format('public.%I', tbl)) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', tbl);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', tbl);
  END LOOP;
END $$;

-- PostGIS spatial_ref_sys — مالك الجدول supabase_admin (لا يمكن ALTER … ENABLE RLS)
-- الحل المعتمد: سحب وصول Data API؛ دوال PostGIS/RPC تعمل داخلياً
DO $$
DECLARE
  postgis_tbl text;
  postgis_tables constant text[] := ARRAY[
    'spatial_ref_sys',
    'geometry_columns',
    'geography_columns'
  ];
BEGIN
  FOREACH postgis_tbl IN ARRAY postgis_tables
  LOOP
    IF to_regclass(format('public.%I', postgis_tbl)) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format(
      'REVOKE ALL ON TABLE public.%I FROM anon, authenticated',
      postgis_tbl
    );
    RAISE NOTICE 'Revoked API access on public.%', postgis_tbl;
  END LOOP;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PostGIS revoke skipped — run REVOKE in SQL editor as postgres, or contact Supabase support.';
END
$$;

-- أي جدول public مُعرَّض لـ anon/authenticated بدون RLS (باستثناء جداول PostGIS المملوكة لـ supabase_admin)
DO $$
DECLARE
  r record;
  postgis_excluded constant text[] := ARRAY[
    'spatial_ref_sys',
    'geometry_columns',
    'geography_columns',
    'raster_columns',
    'raster_overviews'
  ];
BEGIN
  FOR r IN
    SELECT c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND NOT c.relrowsecurity
      AND NOT (c.relname = ANY (postgis_excluded))
      AND (
        has_table_privilege('anon', c.oid, 'SELECT')
        OR has_table_privilege('anon', c.oid, 'INSERT')
        OR has_table_privilege('anon', c.oid, 'UPDATE')
        OR has_table_privilege('anon', c.oid, 'DELETE')
        OR has_table_privilege('authenticated', c.oid, 'SELECT')
        OR has_table_privilege('authenticated', c.oid, 'INSERT')
        OR has_table_privilege('authenticated', c.oid, 'UPDATE')
        OR has_table_privilege('authenticated', c.oid, 'DELETE')
      )
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.table_name);
    RAISE NOTICE 'Enabled RLS on public.% (advisor catch-all)', r.table_name;
  END LOOP;
END $$;
