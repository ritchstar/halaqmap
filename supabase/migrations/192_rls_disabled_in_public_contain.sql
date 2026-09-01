-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- =====================================================
-- 192 — احتواء مستشار Supabase: rls_disabled_in_public
-- تاريخ التنبيه: 31 أغسطس 2026 — المشروع lqzuhkzfhdhaosstduas
-- يفعّل RLS على كل جدول public بلا حماية، ويسحب anon/authenticated
-- عن كتالوج PostGIS إن تعذّر ALTER. بلا سياسة مفتوحة للعموم.
-- آمن لإعادة التشغيل.
-- =====================================================

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
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.table_name);
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', r.table_name);
      RAISE NOTICE '192 enabled RLS on public.%', r.table_name;
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE NOTICE '192 ENABLE RLS skipped on public.% (not owner)', r.table_name;
    END;
  END LOOP;
END
$$;

-- كتالوج PostGIS: غالباً ملك supabase_admin. سحب Data API يكفي للاحتواء.
DO $$
DECLARE
  postgis_tbl text;
  postgis_tables constant text[] := ARRAY[
    'spatial_ref_sys',
    'geometry_columns',
    'geography_columns',
    'raster_columns',
    'raster_overviews'
  ];
BEGIN
  FOREACH postgis_tbl IN ARRAY postgis_tables
  LOOP
    IF to_regclass(format('public.%I', postgis_tbl)) IS NULL THEN
      CONTINUE;
    END IF;

    BEGIN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', postgis_tbl);
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE NOTICE '192 PostGIS ENABLE RLS skipped on public.%', postgis_tbl;
    END;

    BEGIN
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', postgis_tbl);
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', postgis_tbl);
      RAISE NOTICE '192 revoked Data API on public.%', postgis_tbl;
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE NOTICE '192 PostGIS REVOKE skipped on public.% — run as postgres in SQL Editor', postgis_tbl;
    END;
  END LOOP;
END
$$;
