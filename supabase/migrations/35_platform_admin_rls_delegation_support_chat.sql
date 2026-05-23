-- =====================================================
-- 1) تفويض إدارة platform_admin_roles لمن يملك manage_admins (مع حماية صفوف الـ bootstrap)
-- 2) جدول رسائل دعم المنصة (مالك/إدارة ↔ حلاق) — وصول التطبيق عبر API + service_role
-- =====================================================

-- ----- دوال مساعدة (تفادي تكرار RLS على نفس الجدول) -----
CREATE OR REPLACE FUNCTION public.jwt_platform_admin_email()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT lower(trim(coalesce(auth.jwt() ->> 'email', '')));
$$;

REVOKE ALL ON FUNCTION public.jwt_platform_admin_email() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.jwt_platform_admin_email() TO authenticated;

CREATE OR REPLACE FUNCTION public.is_protected_platform_admin_row(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT lower(trim(coalesce(p_email, ''))) IN (
    lower(trim('ritchstar4@gmail.com')),
    lower(trim('admin@halaqmap.com'))
  );
$$;

REVOKE ALL ON FUNCTION public.is_protected_platform_admin_row(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_protected_platform_admin_row(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.actor_has_platform_manage_admins()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  e text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
BEGIN
  IF e = '' THEN
    RETURN false;
  END IF;
  IF public.is_bootstrap_platform_admin() THEN
    RETURN true;
  END IF;
  RETURN EXISTS (
    SELECT 1
    FROM public.platform_admin_roles ar
    WHERE lower(trim(ar.email)) = e
      AND ar.is_active = true
      AND COALESCE((ar.permissions->>'manage_admins')::boolean, false)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.actor_has_platform_manage_admins() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.actor_has_platform_manage_admins() TO authenticated;

CREATE OR REPLACE FUNCTION public.actor_has_platform_view_messages()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  e text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
BEGIN
  IF e = '' THEN
    RETURN false;
  END IF;
  IF public.is_bootstrap_platform_admin() THEN
    RETURN true;
  END IF;
  RETURN EXISTS (
    SELECT 1
    FROM public.platform_admin_roles ar
    WHERE lower(trim(ar.email)) = e
      AND ar.is_active = true
      AND COALESCE((ar.permissions->>'view_messages')::boolean, false)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.actor_has_platform_view_messages() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.actor_has_platform_view_messages() TO authenticated;

-- ----- إعادة سياسات platform_admin_roles -----
DROP POLICY IF EXISTS "platform_admin_roles_select" ON public.platform_admin_roles;
DROP POLICY IF EXISTS "platform_admin_roles_insert" ON public.platform_admin_roles;
DROP POLICY IF EXISTS "platform_admin_roles_update" ON public.platform_admin_roles;
DROP POLICY IF EXISTS "platform_admin_roles_delete" ON public.platform_admin_roles;

CREATE POLICY "platform_admin_roles_select"
  ON public.platform_admin_roles
  FOR SELECT
  TO authenticated
  USING (
    public.is_bootstrap_platform_admin()
    OR lower(trim(email)) = public.jwt_platform_admin_email()
    OR public.actor_has_platform_manage_admins()
  );

CREATE POLICY "platform_admin_roles_insert"
  ON public.platform_admin_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_bootstrap_platform_admin()
    OR (
      public.actor_has_platform_manage_admins()
      AND NOT public.is_protected_platform_admin_row(email)
    )
  );

CREATE POLICY "platform_admin_roles_update"
  ON public.platform_admin_roles
  FOR UPDATE
  TO authenticated
  USING (
    public.is_bootstrap_platform_admin()
    OR (
      public.actor_has_platform_manage_admins()
      AND (
        NOT public.is_protected_platform_admin_row(email)
        OR lower(trim(email)) = public.jwt_platform_admin_email()
      )
    )
  )
  WITH CHECK (
    public.is_bootstrap_platform_admin()
    OR (
      public.actor_has_platform_manage_admins()
      AND (
        NOT public.is_protected_platform_admin_row(email)
        OR lower(trim(email)) = public.jwt_platform_admin_email()
      )
    )
  );

CREATE POLICY "platform_admin_roles_delete"
  ON public.platform_admin_roles
  FOR DELETE
  TO authenticated
  USING (
    public.is_bootstrap_platform_admin()
    OR (
      public.actor_has_platform_manage_admins()
      AND NOT public.is_protected_platform_admin_row(email)
      AND lower(trim(email)) <> public.jwt_platform_admin_email()
    )
  );

-- ----- رسائل دعم المنصة -----
CREATE TABLE IF NOT EXISTS public.platform_support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  from_admin boolean NOT NULL DEFAULT false,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  admin_sender_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT platform_support_messages_admin_email_chk CHECK (
    (from_admin = false AND admin_sender_email IS NULL)
    OR (from_admin = true AND admin_sender_email IS NOT NULL AND char_length(trim(admin_sender_email)) > 0)
  )
);

CREATE INDEX IF NOT EXISTS platform_support_messages_barber_created_idx
  ON public.platform_support_messages (barber_id, created_at DESC);

COMMENT ON TABLE public.platform_support_messages IS
  'دردشة دعم بين الإدارة والحلاق. النقل عبر HTTPS؛ الوصول للقراءة/الكتابة من التطبيق عبر واجهات API بمفتاح service_role بعد التحقق من الهوية. لا تُعرّف سياسات RLS للمصادقة المباشرة — الحلاق يستخدم بوابة بدون JWT Supabase.';

ALTER TABLE public.platform_support_messages ENABLE ROW LEVEL SECURITY;

-- لا سياسات = رفض access_token للجدول؛ service_role يتجاوز RLS لمسارات API.
