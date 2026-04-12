-- =====================================================
-- أدمن المنصة عبر JWT (رابط سحري) — RLS
-- =====================================================
-- عند تغيير VITE_ADMIN_EMAIL غيّر البريد في الدالة أدناه ثم نفّذ الملف من جديد
-- (أو استبدل القيمة في is_jwt_platform_admin فقط).
-- لا تستخدم service_role في المتصفح؛ الجلسة + RLS كافية للوحة الإدارة.

CREATE OR REPLACE FUNCTION public.is_jwt_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT lower(trim(coalesce(auth.jwt() ->> 'email', ''))) = lower(trim('ritchstar4@gmail.com'));
$$;

COMMENT ON FUNCTION public.is_jwt_platform_admin() IS
  'لوحة الإدارة: يطابق البريد في JWT مع بريد الأدمن. زامن مع VITE_ADMIN_EMAIL في التطبيق.';

REVOKE ALL ON FUNCTION public.is_jwt_platform_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_jwt_platform_admin() TO authenticated;

-- ----- registration_submissions -----
DROP POLICY IF EXISTS "jwt_admin_select_registration_submissions" ON public.registration_submissions;
CREATE POLICY "jwt_admin_select_registration_submissions"
  ON public.registration_submissions FOR SELECT TO authenticated
  USING (public.is_jwt_platform_admin());

DROP POLICY IF EXISTS "jwt_admin_update_registration_submissions" ON public.registration_submissions;
CREATE POLICY "jwt_admin_update_registration_submissions"
  ON public.registration_submissions FOR UPDATE TO authenticated
  USING (public.is_jwt_platform_admin())
  WITH CHECK (public.is_jwt_platform_admin());

-- ----- barbers (عرض الكل + تفعيل/تعطيل) -----
DROP POLICY IF EXISTS "jwt_admin_select_all_barbers" ON public.barbers;
CREATE POLICY "jwt_admin_select_all_barbers"
  ON public.barbers FOR SELECT TO authenticated
  USING (public.is_jwt_platform_admin());

DROP POLICY IF EXISTS "jwt_admin_update_any_barber" ON public.barbers;
CREATE POLICY "jwt_admin_update_any_barber"
  ON public.barbers FOR UPDATE TO authenticated
  USING (public.is_jwt_platform_admin())
  WITH CHECK (public.is_jwt_platform_admin());

-- ----- payments -----
DROP POLICY IF EXISTS "jwt_admin_select_all_payments" ON public.payments;
CREATE POLICY "jwt_admin_select_all_payments"
  ON public.payments FOR SELECT TO authenticated
  USING (public.is_jwt_platform_admin());

DROP POLICY IF EXISTS "jwt_admin_update_payments" ON public.payments;
CREATE POLICY "jwt_admin_update_payments"
  ON public.payments FOR UPDATE TO authenticated
  USING (public.is_jwt_platform_admin())
  WITH CHECK (public.is_jwt_platform_admin());

-- ----- profiles (عدّ المستخدمين) -----
DROP POLICY IF EXISTS "jwt_admin_select_profiles" ON public.profiles;
CREATE POLICY "jwt_admin_select_profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_jwt_platform_admin());

-- ----- bookings (إحصائيات) -----
DROP POLICY IF EXISTS "jwt_admin_select_bookings" ON public.bookings;
CREATE POLICY "jwt_admin_select_bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (public.is_jwt_platform_admin());
