-- سير عمل الموافقة اليدوية بعد دفع ميسر: pending_review → approved (أو refunded)
-- =====================================================

ALTER TABLE public.barber_subscriptions DROP CONSTRAINT IF EXISTS barber_subscriptions_status_check;

ALTER TABLE public.barber_subscriptions ADD CONSTRAINT barber_subscriptions_status_check
  CHECK (
    status IN (
      'pending',
      'paid',
      'failed',
      'refunded',
      'voided',
      'authorized',
      'cancelled',
      'pending_review',
      'approved'
    )
  );

COMMENT ON CONSTRAINT barber_subscriptions_status_check ON public.barber_subscriptions IS
  'pending_review = تم استلام الدفع عبر ميسر وقيد مراجعة الجودة؛ approved = اعتماد إداري واكتمال التفعيل.';

-- سياسات JWT للإدارة (is_jwt_platform_admin) — قراءة وتحديث صفوف الاشتراك المالي
DROP POLICY IF EXISTS "jwt_admin_select_barber_subscriptions" ON public.barber_subscriptions;
CREATE POLICY "jwt_admin_select_barber_subscriptions"
  ON public.barber_subscriptions FOR SELECT TO authenticated
  USING (public.is_jwt_platform_admin());

DROP POLICY IF EXISTS "jwt_admin_update_barber_subscriptions" ON public.barber_subscriptions;
CREATE POLICY "jwt_admin_update_barber_subscriptions"
  ON public.barber_subscriptions FOR UPDATE TO authenticated
  USING (public.is_jwt_platform_admin())
  WITH CHECK (public.is_jwt_platform_admin());
