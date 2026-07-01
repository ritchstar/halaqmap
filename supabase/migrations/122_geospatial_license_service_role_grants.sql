-- إصلاح: permission denied for table digital_activation_certificates
-- مسار تفعيل ميسر/webhook يُنشئ geospatial_license_assets + digital_activation_certificates عبر service_role.

GRANT SELECT, INSERT, UPDATE ON TABLE public.geospatial_license_assets TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.digital_activation_certificates TO service_role;

DROP POLICY IF EXISTS geospatial_license_assets_service_role_all ON public.geospatial_license_assets;
CREATE POLICY geospatial_license_assets_service_role_all
  ON public.geospatial_license_assets FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS digital_activation_certificates_service_role_all ON public.digital_activation_certificates;
CREATE POLICY digital_activation_certificates_service_role_all
  ON public.digital_activation_certificates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.digital_activation_certificates IS
  'Digital Activation Certificate — شهادة تفعيل رقمية؛ service_role مُصرّح له بالإدراج من webhook/fulfill.';
