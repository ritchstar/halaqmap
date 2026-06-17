-- =====================================================
-- 116 — Harden B2B fleet tables: enforce RLS + revoke client roles
-- Resolves Supabase advisor: rls_disabled_in_public
-- Safe to re-run (idempotent).
-- =====================================================

DO $$
DECLARE
  tbl text;
  grants_sql text;
  fleet_tables constant text[] := ARRAY[
    'fleet_operational_pulse',
    'fleet_demand_counters',
    'fleet_salon_stagnation_pulse',
    'agent_conversations',
    'barber_gallery_items'
  ];
BEGIN
  FOREACH tbl IN ARRAY fleet_tables
  LOOP
    IF to_regclass(format('public.%I', tbl)) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', tbl);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', tbl);

    IF tbl IN ('fleet_operational_pulse', 'fleet_demand_counters', 'fleet_salon_stagnation_pulse') THEN
      grants_sql := format(
        'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO service_role',
        tbl
      );
      EXECUTE grants_sql;
      IF tbl = 'fleet_operational_pulse' THEN
        EXECUTE $cmt$COMMENT ON TABLE public.fleet_operational_pulse IS
          'نبض تشغيلي صاعد — B2B فقط. RLS إلزامي؛ الوصول عبر service_role فقط.'$cmt$;
      END IF;
    ELSIF tbl = 'agent_conversations' THEN
      EXECUTE 'GRANT SELECT, INSERT ON TABLE public.agent_conversations TO service_role';
    ELSIF tbl = 'barber_gallery_items' THEN
      EXECUTE 'GRANT SELECT ON TABLE public.barber_gallery_items TO anon, authenticated, service_role';
    END IF;
  END LOOP;
END $$;
