-- =====================================================
-- Fix: infinite recursion on relation "admin_users"
-- =====================================================
-- هذا الإصلاح يعمل حتى لو كان لديك بقايا سياسات قديمة من نسخة سابقة.
-- الفكرة:
-- 1) إعادة تعريف is_jwt_platform_admin بدون أي استعلام على admin_users
-- 2) إن وُجد جدول admin_users: حذف سياساته القديمة وبناء سياسة آمنة واحدة

CREATE OR REPLACE FUNCTION public.is_jwt_platform_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  jwt_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  role_match boolean := false;
BEGIN
  -- Bootstrap emails (عدّلها عند الحاجة)
  IF jwt_email IN (
    lower(trim('ritchstar4@gmail.com')),
    lower(trim('admin@halaqmap.com'))
  ) THEN
    RETURN true;
  END IF;

  -- اختيارياً: دعم platform_admin_roles إن كان موجوداً.
  -- (لا نلمس admin_users هنا لتفادي أي recursion)
  IF to_regclass('public.platform_admin_roles') IS NOT NULL THEN
    EXECUTE
      'SELECT EXISTS (
         SELECT 1
         FROM public.platform_admin_roles ar
         WHERE lower(trim(ar.email)) = $1
           AND ar.is_active = true
       )'
      INTO role_match
      USING jwt_email;
    IF role_match THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.is_jwt_platform_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_jwt_platform_admin() TO authenticated;

DO $$
DECLARE
  pol RECORD;
BEGIN
  IF to_regclass('public.admin_users') IS NULL THEN
    RETURN;
  END IF;

  -- تنظيف كل السياسات القديمة على admin_users (قد تحتوي EXISTS على نفس الجدول)
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_users'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.admin_users;', pol.policyname);
  END LOOP;

  ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

  -- سياسة واحدة آمنة للأدمن
  CREATE POLICY "admin_users_admin_all"
    ON public.admin_users
    FOR ALL
    TO authenticated
    USING (public.is_jwt_platform_admin())
    WITH CHECK (public.is_jwt_platform_admin());
END
$$;
