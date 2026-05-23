-- قوالب أدوار إدارية جاهزة (RBAC Presets)
-- يمكن تطبيقها مباشرة على أي مدير عبر:
--   UPDATE public.platform_admin_roles
--   SET permissions = public.platform_admin_permissions_template('finance_admin')
--   WHERE lower(trim(email)) = lower(trim('finance@yourcompany.com'));

CREATE OR REPLACE FUNCTION public.platform_admin_permissions_template(p_template text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  t text := lower(trim(coalesce(p_template, '')));
BEGIN
  -- السوبر أدمن: كل الصلاحيات
  IF t IN ('super_admin', 'super', 'owner') THEN
    RETURN jsonb_build_object(
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
      'manage_admins', true,
      'view_payment_settings', true,
      'manage_payment_settings', true,
      'manage_subscriber_comms', true,
      'manage_subscriber_lifecycle', true,
      'manage_partner_billing', true
    );
  END IF;

  -- المدير المالي: فوترة + مدفوعات + مراقبة إعدادات الدفع (بدون إدارة المدراء)
  IF t IN ('finance_admin', 'finance', 'billing') THEN
    RETURN jsonb_build_object(
      'view_overview', true,
      'view_requests', false,
      'review_requests', false,
      'view_barbers', true,
      'manage_barbers', false,
      'view_payments', true,
      'review_payments', true,
      'view_command_center', false,
      'manage_command_center', false,
      'view_messages', false,
      'view_settings', false,
      'manage_admins', false,
      'view_payment_settings', true,
      'manage_payment_settings', false,
      'manage_subscriber_comms', false,
      'manage_subscriber_lifecycle', false,
      'manage_partner_billing', true
    );
  END IF;

  -- دعم المشتركين: التعامل الفردي مع الطلبات والحسابات
  IF t IN ('subscriber_support', 'support', 'customer_support') THEN
    RETURN jsonb_build_object(
      'view_overview', true,
      'view_requests', true,
      'review_requests', true,
      'view_barbers', true,
      'manage_barbers', false,
      'view_payments', true,
      'review_payments', false,
      'view_command_center', false,
      'manage_command_center', false,
      'view_messages', true,
      'view_settings', false,
      'manage_admins', false,
      'view_payment_settings', false,
      'manage_payment_settings', false,
      'manage_subscriber_comms', true,
      'manage_subscriber_lifecycle', true,
      'manage_partner_billing', false
    );
  END IF;

  -- مشرف المدفوعات: تشغيل يومي لعمليات الدفع فقط
  IF t IN ('payment_ops', 'payment_operator', 'ops') THEN
    RETURN jsonb_build_object(
      'view_overview', true,
      'view_requests', false,
      'review_requests', false,
      'view_barbers', true,
      'manage_barbers', false,
      'view_payments', true,
      'review_payments', true,
      'view_command_center', false,
      'manage_command_center', false,
      'view_messages', false,
      'view_settings', false,
      'manage_admins', false,
      'view_payment_settings', true,
      'manage_payment_settings', true,
      'manage_subscriber_comms', false,
      'manage_subscriber_lifecycle', false,
      'manage_partner_billing', true
    );
  END IF;

  -- افتراضي: أقل صلاحيات (عرض النظرة العامة فقط)
  RETURN jsonb_build_object(
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
    'manage_admins', false,
    'view_payment_settings', false,
    'manage_payment_settings', false,
    'manage_subscriber_comms', false,
    'manage_subscriber_lifecycle', false,
    'manage_partner_billing', false
  );
END;
$$;

COMMENT ON FUNCTION public.platform_admin_permissions_template(text) IS
'يرجع JSON صلاحيات جاهز للقوالب: super_admin, finance_admin, subscriber_support, payment_ops.';

REVOKE ALL ON FUNCTION public.platform_admin_permissions_template(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.platform_admin_permissions_template(text) TO authenticated;

