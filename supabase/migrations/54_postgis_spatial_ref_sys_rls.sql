-- PostGIS في المخطط public يُنشئ جدول spatial_ref_sys (بيانات مرجعية لأنظمة الإحداثيات).
-- من دون RLS يظهر تنبيه Supabase: rls_disabled_in_public.
-- الحل: تفعيل RLS مع سياسة قراءة فقط لأدوار واجهة الـ API.

-- على Supabase السحابي قد لا يملك دور الهجرة الجدول؛ نُكمِل الهجرة دون فشل ويُنفَّذ الـ RLS يدوياً من لوحة التحكم إن لزم.
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
    RAISE NOTICE 'spatial_ref_sys RLS skipped (not table owner). Apply via SQL editor as owner if advisors require it.';
END
$$;
