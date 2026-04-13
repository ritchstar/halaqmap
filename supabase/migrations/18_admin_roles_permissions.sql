-- =====================================================
-- إدارة عدة أدمن بصلاحيات دقيقة
-- =====================================================

-- بريدان احتياطيان للوصول الكامل (Bootstrap).
-- يمكن إبقاؤهما كصمام أمان حتى اكتمال إدارة الصلاحيات عبر الجدول.
CREATE OR REPLACE FUNCTION public.is_bootstrap_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT lower(trim(coalesce(auth.jwt() ->> 'email', ''))) IN (
    lower(trim('ritchstar4@gmail.com')),
    lower(trim('admin@halaqmap.com'))
  );
$$;

COMMENT ON FUNCTION public.is_bootstrap_platform_admin() IS
  'Bootstrap admin check by JWT email for emergency/full access.';

REVOKE ALL ON FUNCTION public.is_bootstrap_platform_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_bootstrap_platform_admin() TO authenticated;

-- جدول صلاحيات الأدمن.
CREATE TABLE IF NOT EXISTS public.platform_admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  display_name text,
  is_active boolean NOT NULL DEFAULT true,
  permissions jsonb NOT NULL DEFAULT jsonb_build_object(
    'view_overview', true,
    'view_requests', false,
    'review_requests', false,
    'view_barbers', false,
    'manage_barbers', false,
    'view_payments', false,
    'review_payments', false,
    'view_command_center', false,
    'manage_command_center', false,
    'view_messages', false,
    'view_settings', false,
    'manage_admins', false
  ),
  created_by_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_platform_admin_roles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_platform_admin_roles_updated_at ON public.platform_admin_roles;
CREATE TRIGGER trg_platform_admin_roles_updated_at
BEFORE UPDATE ON public.platform_admin_roles
FOR EACH ROW
EXECUTE FUNCTION public.set_platform_admin_roles_updated_at();

ALTER TABLE public.platform_admin_roles ENABLE ROW LEVEL SECURITY;

-- القراءة:
-- - أدمن bootstrap يقرأ كل الجدول
-- - أي مستخدم مصادق يقرأ صفه فقط (حسب البريد)
DROP POLICY IF EXISTS "platform_admin_roles_select" ON public.platform_admin_roles;
CREATE POLICY "platform_admin_roles_select"
  ON public.platform_admin_roles
  FOR SELECT
  TO authenticated
  USING (
    public.is_bootstrap_platform_admin()
    OR lower(trim(email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
  );

-- الكتابة (إنشاء/تعديل/حذف) محصورة على أدمن bootstrap.
DROP POLICY IF EXISTS "platform_admin_roles_insert" ON public.platform_admin_roles;
CREATE POLICY "platform_admin_roles_insert"
  ON public.platform_admin_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_bootstrap_platform_admin());

DROP POLICY IF EXISTS "platform_admin_roles_update" ON public.platform_admin_roles;
CREATE POLICY "platform_admin_roles_update"
  ON public.platform_admin_roles
  FOR UPDATE
  TO authenticated
  USING (public.is_bootstrap_platform_admin())
  WITH CHECK (public.is_bootstrap_platform_admin());

DROP POLICY IF EXISTS "platform_admin_roles_delete" ON public.platform_admin_roles;
CREATE POLICY "platform_admin_roles_delete"
  ON public.platform_admin_roles
  FOR DELETE
  TO authenticated
  USING (public.is_bootstrap_platform_admin());

-- استبدال دالة فحص الأدمن لتدعم:
-- 1) bootstrap emails
-- 2) أي صف نشط في platform_admin_roles
CREATE OR REPLACE FUNCTION public.is_jwt_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT
    public.is_bootstrap_platform_admin()
    OR EXISTS (
      SELECT 1
      FROM public.platform_admin_roles ar
      WHERE lower(trim(ar.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        AND ar.is_active = true
    );
$$;

COMMENT ON FUNCTION public.is_jwt_platform_admin() IS
  'Admin access by bootstrap emails OR active row in platform_admin_roles.';

REVOKE ALL ON FUNCTION public.is_jwt_platform_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_jwt_platform_admin() TO authenticated;

-- Seed (idempotent) for fallback bootstrap email.
INSERT INTO public.platform_admin_roles (email, display_name, is_active, permissions, created_by_email)
VALUES (
  'admin@halaqmap.com',
  'Admin Root',
  true,
  jsonb_build_object(
    'view_overview', true,
    'view_requests', true,
    'review_requests', true,
    'view_barbers', true,
    'manage_barbers', true,
    'view_payments', true,
    'review_payments', true,
    'view_command_center', true,
    'manage_command_center', true,
    'view_messages', true,
    'view_settings', true,
    'manage_admins', true
  ),
  'system'
)
ON CONFLICT (email) DO UPDATE
SET is_active = EXCLUDED.is_active,
    permissions = EXCLUDED.permissions,
    updated_at = now();
