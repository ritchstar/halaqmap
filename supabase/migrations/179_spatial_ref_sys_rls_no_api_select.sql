-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- =====================================================
-- 179 — تفعيل RLS على public.spatial_ref_sys (كتالوج PostGIS)
-- ليس بيانات زبائن. المستشار: rls_disabled_in_public.
-- لا سياسة SELECT لـ anon. دوال الخريطة تعمل داخلياً.
-- إن كان مالك الجدول supabase_admin وفشل ALTER، نفّذ الأوامر
-- نفسها من SQL Editor بدور postgres.
-- =====================================================

DO $$
BEGIN
  IF to_regclass('public.spatial_ref_sys') IS NULL THEN
    RETURN;
  END IF;

  ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "spatial_ref_sys_select_anon_authenticated" ON public.spatial_ref_sys;

  COMMENT ON TABLE public.spatial_ref_sys IS
    'مرجع PostGIS لأنظمة الإحداثيات. RLS مفعّل بلا قراءة عبر Data API.';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE '179 spatial_ref_sys ENABLE RLS skipped (not table owner). Run in SQL Editor as postgres.';
END
$$;

DO $$
BEGIN
  IF to_regclass('public.spatial_ref_sys') IS NULL THEN
    RETURN;
  END IF;

  REVOKE ALL ON TABLE public.spatial_ref_sys FROM PUBLIC;
  REVOKE ALL ON TABLE public.spatial_ref_sys FROM anon, authenticated;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE '179 spatial_ref_sys REVOKE skipped (not table owner). Run in SQL Editor as postgres.';
END
$$;
