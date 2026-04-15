-- =====================================================
-- HARD RESET for profiles RLS policies (no recursion)
-- =====================================================
-- استخدم هذا الملف عند استمرار الخطأ:
--   infinite recursion detected in policy for relation "profiles"
--
-- الفكرة: حذف كل سياسات profiles الحالية ثم إعادة سياسة آمنة فقط.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles;', pol.policyname);
  END LOOP;
END
$$;

-- المستخدم يرى/يحدّث ملفه فقط
CREATE POLICY "profiles_self_select"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_self_update"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- الأدمن يرى كل الملفات عبر دالة لا تعتمد على profiles نفسها
CREATE POLICY "profiles_admin_select_all"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_jwt_platform_admin());
