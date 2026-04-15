-- =====================================================
-- Fix: infinite recursion in profiles RLS policy
-- =====================================================
-- السبب:
-- سياسة قديمة على public.profiles كانت تستخدم:
--   EXISTS (SELECT 1 FROM public.profiles ...)
-- وهذا يؤدي إلى recursion داخل نفس الجدول.
--
-- الحل:
-- 1) حذف السياسة المتسببة في recursion
-- 2) إنشاء سياسة اختيار آمنة للأدمن تعتمد على is_jwt_platform_admin()
--    (لا تستعلم من profiles نفسها)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "jwt_admin_select_profiles" ON public.profiles;

CREATE POLICY "jwt_admin_select_profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_jwt_platform_admin());
