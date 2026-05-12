-- إضافة مفاتيح أرشيف الفواتير إلى قوالب SQL (مع بقية المفاتيح كما في 71)

CREATE OR REPLACE FUNCTION public.platform_admin_permissions_template(p_template text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  t text := lower(trim(coalesce(p_template, '')));
BEGIN
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
      'manage_partner_billing', true,
      'view_ops_billing_monitor', true,
      'view_partner_marketing', true,
      'manage_partner_marketing', true,
      'manage_platform_commerce_rules', true,
      'manage_centralized_billing_ops', true,
      'view_admin_financial_archive', true,
      'manage_admin_financial_archive', true
    );
  END IF;

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
      'manage_partner_billing', true,
      'view_ops_billing_monitor', true,
      'view_partner_marketing', false,
      'manage_partner_marketing', false,
      'manage_platform_commerce_rules', false,
      'manage_centralized_billing_ops', false,
      'view_admin_financial_archive', true,
      'manage_admin_financial_archive', true
    );
  END IF;

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
      'view_settings', true,
      'manage_admins', false,
      'view_payment_settings', false,
      'manage_payment_settings', false,
      'manage_subscriber_comms', true,
      'manage_subscriber_lifecycle', true,
      'manage_partner_billing', false,
      'view_ops_billing_monitor', false,
      'view_partner_marketing', true,
      'manage_partner_marketing', true,
      'manage_platform_commerce_rules', false,
      'manage_centralized_billing_ops', false,
      'view_admin_financial_archive', true,
      'manage_admin_financial_archive', false
    );
  END IF;

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
      'manage_partner_billing', true,
      'view_ops_billing_monitor', true,
      'view_partner_marketing', false,
      'manage_partner_marketing', false,
      'manage_platform_commerce_rules', false,
      'manage_centralized_billing_ops', false,
      'view_admin_financial_archive', true,
      'manage_admin_financial_archive', true
    );
  END IF;

  IF t IN ('marketing_content', 'marketing') THEN
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
      'view_settings', true,
      'manage_admins', false,
      'view_payment_settings', false,
      'manage_payment_settings', false,
      'manage_subscriber_comms', false,
      'manage_subscriber_lifecycle', false,
      'manage_partner_billing', false,
      'view_ops_billing_monitor', false,
      'view_partner_marketing', true,
      'manage_partner_marketing', true,
      'manage_platform_commerce_rules', false,
      'manage_centralized_billing_ops', false,
      'view_admin_financial_archive', false,
      'manage_admin_financial_archive', false
    );
  END IF;

  IF t IN ('ops_readonly', 'ops_viewer') THEN
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
      'manage_partner_billing', false,
      'view_ops_billing_monitor', true,
      'view_partner_marketing', false,
      'manage_partner_marketing', false,
      'manage_platform_commerce_rules', false,
      'manage_centralized_billing_ops', false,
      'view_admin_financial_archive', true,
      'manage_admin_financial_archive', false
    );
  END IF;

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
    'manage_partner_billing', false,
    'view_ops_billing_monitor', false,
    'view_partner_marketing', false,
    'manage_partner_marketing', false,
    'manage_platform_commerce_rules', false,
    'manage_centralized_billing_ops', false,
    'view_admin_financial_archive', false,
    'manage_admin_financial_archive', false
  );
END;
$$;

COMMENT ON FUNCTION public.platform_admin_permissions_template(text) IS
  'قوالب: super_admin, finance_admin, subscriber_support, payment_ops, marketing_content, ops_readonly — يتضمن أرشيف الفواتير.';

REVOKE ALL ON FUNCTION public.platform_admin_permissions_template(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.platform_admin_permissions_template(text) TO authenticated;
