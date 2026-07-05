-- =====================================================
-- صلاحيات service_role على digital_shift_intercept_claims
--  · إصلاح: permission denied for table digital_shift_intercept_claims
--  · المُهاجرة 132 أنشأت الجدول وفعّلت RLS دون GRANT ولا سياسة،
--    فيفشل /api/customer-digital-shift-intercept عند acquireInterceptClaim.
--  · الجدول للخادم فقط — لا وصول authenticated/anon.
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.digital_shift_intercept_claims TO service_role;

ALTER TABLE public.digital_shift_intercept_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS digital_shift_intercept_claims_service_role ON public.digital_shift_intercept_claims;
CREATE POLICY digital_shift_intercept_claims_service_role
  ON public.digital_shift_intercept_claims
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
