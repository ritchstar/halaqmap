-- صلاحية تفعيل ض.ق.م حياً من مكتب ZATCA عند بلوغ الحد الإلزامي (375,000 ر.س)

UPDATE public.platform_admin_roles
SET permissions = permissions || jsonb_build_object(
  'activate_zatca_tax_live',
  COALESCE(
    (permissions->>'activate_zatca_tax_live')::boolean,
    (permissions->>'manage_platform_commerce_rules')::boolean,
    (
      (permissions->>'view_ops_billing_monitor')::boolean = true
      AND (permissions->>'manage_admin_financial_archive')::boolean = true
    ),
    false
  )
);

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
      'activate_zatca_tax_live', true,
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
      'view_settings', true,
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
      'activate_zatca_tax_live', true,
      'manage_centralized_billing_ops', false,
      'view_admin_financial_archive', true,
      'manage_admin_financial_archive', true
    );
  END IF;

  IF t IN ('zatca_tax_advisor', 'zatca', 'zatca_advisor') THEN
    RETURN jsonb_build_object(
      'view_overview', true,
      'view_requests', false,
      'review_requests', false,
      'view_barbers', false,
      'manage_barbers', false,
      'view_payments', true,
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
      'view_ops_billing_monitor', true,
      'view_partner_marketing', false,
      'manage_partner_marketing', false,
      'manage_platform_commerce_rules', false,
      'activate_zatca_tax_live', true,
      'manage_centralized_billing_ops', false,
      'view_admin_financial_archive', true,
      'manage_admin_financial_archive', false
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
      'activate_zatca_tax_live', false,
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
      'activate_zatca_tax_live', false,
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
      'activate_zatca_tax_live', false,
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
      'activate_zatca_tax_live', false,
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
    'activate_zatca_tax_live', false,
    'manage_centralized_billing_ops', false,
    'view_admin_financial_archive', false,
    'manage_admin_financial_archive', false
  );
END;
$$;

COMMENT ON FUNCTION public.platform_admin_permissions_template(text) IS
  'قوالب: super_admin, finance_admin, zatca_tax_advisor, subscriber_support, payment_ops, marketing_content, ops_readonly — يتضمن activate_zatca_tax_live.';

DROP POLICY IF EXISTS platform_zatca_tax_advisor_state_admin_write ON public.platform_zatca_tax_advisor_state;
CREATE POLICY platform_zatca_tax_advisor_state_admin_write
  ON public.platform_zatca_tax_advisor_state FOR ALL TO authenticated
  USING (
    public.jwt_platform_admin_has_permission('manage_platform_commerce_rules')
    OR public.jwt_platform_admin_has_permission('activate_zatca_tax_live')
  )
  WITH CHECK (
    public.jwt_platform_admin_has_permission('manage_platform_commerce_rules')
    OR public.jwt_platform_admin_has_permission('activate_zatca_tax_live')
  );

COMMENT ON COLUMN public.platform_zatca_tax_advisor_state.tax_enabled IS
  'Live public VAT flag — set true only via explicit activation at mandatory threshold (activate_zatca_tax_live or manage_platform_commerce_rules).';
