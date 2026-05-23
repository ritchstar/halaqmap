-- زميل لخازن — حالة رادار الزكاة/الضريبة (ZATCA) وإعداد التفعيل غير الحاجز

CREATE TABLE IF NOT EXISTS public.platform_zatca_tax_advisor_state (
  id TEXT PRIMARY KEY DEFAULT 'platform',
  tax_enabled BOOLEAN NOT NULL DEFAULT false,
  mandatory_breached_at TIMESTAMPTZ,
  fulfillment_prepared_at TIMESTAMPTZ,
  cached_vat_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  cached_revenue_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  active_warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  admin_activation_alert JSONB,
  last_radar_run_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.platform_zatca_tax_advisor_state (id)
VALUES ('platform')
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.platform_zatca_tax_advisor_state IS
  'ZATCA tax advisor agent: revenue radar, prepared 15% VAT config, non-blocking admin activation (tax_enabled).';

COMMENT ON COLUMN public.platform_zatca_tax_advisor_state.tax_enabled IS
  'Live public VAT flag — only set true by Super Admin explicit activation; never auto-flipped by the agent.';

ALTER TABLE public.platform_zatca_tax_advisor_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS platform_zatca_tax_advisor_state_admin_read ON public.platform_zatca_tax_advisor_state;
CREATE POLICY platform_zatca_tax_advisor_state_admin_read
  ON public.platform_zatca_tax_advisor_state FOR SELECT TO authenticated
  USING (
    public.jwt_platform_admin_has_permission('manage_platform_commerce_rules')
    OR public.jwt_platform_admin_has_permission('view_ops_billing_monitor')
    OR public.jwt_platform_admin_has_permission('manage_centralized_billing_ops')
  );

DROP POLICY IF EXISTS platform_zatca_tax_advisor_state_admin_write ON public.platform_zatca_tax_advisor_state;
CREATE POLICY platform_zatca_tax_advisor_state_admin_write
  ON public.platform_zatca_tax_advisor_state FOR ALL TO authenticated
  USING (public.jwt_platform_admin_has_permission('manage_platform_commerce_rules'))
  WITH CHECK (public.jwt_platform_admin_has_permission('manage_platform_commerce_rules'));

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_zatca_tax_advisor_state TO service_role;
REVOKE ALL ON TABLE public.platform_zatca_tax_advisor_state FROM anon;
