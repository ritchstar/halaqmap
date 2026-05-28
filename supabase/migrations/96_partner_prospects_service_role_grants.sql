-- partner_prospects: منح service_role للوصول عبر /api/admin-partner-prospects
-- (بعد ترحيل 74 أُلغيت المنح الافتراضية؛ جدول 94 لم يُمنَح service_role)

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.partner_prospects TO service_role;

REVOKE ALL ON TABLE public.partner_prospects FROM anon, authenticated;

DROP POLICY IF EXISTS partner_prospects_service_role_all ON public.partner_prospects;
CREATE POLICY partner_prospects_service_role_all
  ON public.partner_prospects
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE public.partner_prospects IS
  'B2B outreach pipeline for partner acquisition — managed from Admin Command Center; inserts/updates via service role API only.';
