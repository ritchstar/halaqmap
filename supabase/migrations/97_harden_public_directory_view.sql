-- Harden public views/tables flagged by Supabase advisors:
-- 1) public.admin_dashboard_stats        -> view should respect invoker privileges
-- 2) public.barbers_public_directory     -> view should respect invoker privileges
-- 3) public.spatial_ref_sys              -> PostGIS table should have RLS enabled

ALTER VIEW IF EXISTS public.admin_dashboard_stats
  SET (security_invoker = true);

COMMENT ON VIEW public.admin_dashboard_stats IS
  'إحصائيات لوحة الإدارة. security_invoker=true حتى تُطبَّق صلاحيات وسياسات المستعلم الحالي بدل صلاحيات مالك الـ view.';

ALTER VIEW IF EXISTS public.barbers_public_directory
  SET (security_invoker = true);

COMMENT ON VIEW public.barbers_public_directory IS
  'حلاق يظهر على الخريطة: نشط + حزمة إدراج برمجية سارية. security_invoker=true حتى تُطبَّق صلاحيات وسياسات المستعلم الحالي.';

DO $$
BEGIN
  IF to_regclass('public.spatial_ref_sys') IS NULL THEN
    RETURN;
  END IF;

  ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "spatial_ref_sys_select_anon_authenticated" ON public.spatial_ref_sys;
  CREATE POLICY "spatial_ref_sys_select_anon_authenticated"
    ON public.spatial_ref_sys
    FOR SELECT
    TO anon, authenticated
    USING (true);

  COMMENT ON TABLE public.spatial_ref_sys IS
    'مرجع PostGIS لأنظمة الإحداثيات؛ RLS مفعّل مع قراءة فقط لـ anon/authenticated.';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'spatial_ref_sys RLS skipped (not table owner). Apply manually in Supabase SQL editor if required.';
END
$$;
