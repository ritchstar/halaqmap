-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- =====================================================================
-- Fix: /admin/cyber live security feed — two separate bugs
-- =====================================================================
-- المشكلة 1 (صلاحيات): src/app/admin/cyber/page.tsx يشترك في تحديثات
-- Realtime (postgres_changes) على جدول security_events مباشرة من المتصفح
-- (عميل يستخدم مفتاح anon + جلسة المستخدم المصادق عليه). لكن الجدول
-- محصور بسياسة RLS واحدة فقط لـ service_role (ترحيل 89)، وتم سحب أي
-- صلاحية عن anon/authenticated صراحة (ترحيل 120). النتيجة: فشل صامت
-- متكرر في فحص RLS الذي يجريه Realtime لأي مستخدم admin يفتح الصفحة.
--
-- الحل: نفس النمط المستخدم فعلياً لجدول مشابه بنفس الحساسية
-- (payment_security_events — ترحيل 55): GRANT SELECT + سياسة RLS
-- محصورة بدالة is_jwt_platform_admin() الموجودة، بدل فتح الجدول لأي
-- مستخدم authenticated عادي.
--
-- المشكلة 2 (Realtime publication): ترحيل 90 فعّل REPLICA IDENTITY FULL
-- على security_events لكنه لم يُضِف الجدول فعلياً إلى منشور
-- supabase_realtime — بدون هذا لا يُصدر Postgres أي حدث تغيير للجدول
-- إطلاقاً، بغض النظر عن الصلاحيات، فالبث اللحظي لم يعمل من الأساس.
-- =====================================================================

-- (1) صلاحية القراءة الأساسية + سياسة RLS للمدراء فقط
GRANT SELECT ON TABLE public.security_events TO authenticated;

DROP POLICY IF EXISTS "jwt_admin_select_security_events" ON public.security_events;
CREATE POLICY "jwt_admin_select_security_events"
  ON public.security_events FOR SELECT TO authenticated
  USING (public.is_jwt_platform_admin());

-- (2) تسجيل الجدول فعلياً في منشور Realtime (idempotent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'security_events'
  ) THEN
    RETURN;
  END IF;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.security_events;
END
$$;
