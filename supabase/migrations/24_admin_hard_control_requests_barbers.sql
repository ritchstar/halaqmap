-- =====================================================
-- صلاحيات إدارة قوية للطلبات والحلاقين (JWT Admin)
-- =====================================================
-- الهدف:
-- 1) السماح للأدمن بحذف طلبات التسجيل من registration_submissions
-- 2) السماح للأدمن بإضافة/حذف حسابات الحلاقين (barbers)
-- 3) الإبقاء على الحماية عبر دالة is_jwt_platform_admin()

-- ----- registration_submissions -----
DROP POLICY IF EXISTS "jwt_admin_delete_registration_submissions" ON public.registration_submissions;
CREATE POLICY "jwt_admin_delete_registration_submissions"
  ON public.registration_submissions FOR DELETE TO authenticated
  USING (public.is_jwt_platform_admin());

-- ----- barbers -----
DROP POLICY IF EXISTS "jwt_admin_insert_any_barber" ON public.barbers;
CREATE POLICY "jwt_admin_insert_any_barber"
  ON public.barbers FOR INSERT TO authenticated
  WITH CHECK (public.is_jwt_platform_admin());

DROP POLICY IF EXISTS "jwt_admin_delete_any_barber" ON public.barbers;
CREATE POLICY "jwt_admin_delete_any_barber"
  ON public.barbers FOR DELETE TO authenticated
  USING (public.is_jwt_platform_admin());
