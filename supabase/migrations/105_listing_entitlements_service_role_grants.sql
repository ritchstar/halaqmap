-- =====================================================
-- صلاحيات service_role على رخص الإدراج — إصلاح permission denied
-- على barber_listing_entitlements عند إنشاء حساب المعاينة الماسي
-- (migration 92 منح SELECT فقط؛ Vercel API يحتاج INSERT/UPDATE)
-- =====================================================

GRANT SELECT, INSERT, UPDATE ON TABLE public.barber_listing_entitlements TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.listing_license_vouchers TO service_role;
GRANT SELECT, INSERT ON TABLE public.listing_license_redemption_events TO service_role;

DROP POLICY IF EXISTS barber_listing_entitlements_service_role ON public.barber_listing_entitlements;
CREATE POLICY barber_listing_entitlements_service_role
  ON public.barber_listing_entitlements
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS listing_license_vouchers_service_role ON public.listing_license_vouchers;
CREATE POLICY listing_license_vouchers_service_role
  ON public.listing_license_vouchers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS listing_license_redemption_events_service_role ON public.listing_license_redemption_events;
CREATE POLICY listing_license_redemption_events_service_role
  ON public.listing_license_redemption_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.barber_listing_entitlements IS
  'صلاحية إدراج الحلاق — service_role يكتب عبر Vercel API؛ الحلاق يقرأ صلاحيته فقط.';
