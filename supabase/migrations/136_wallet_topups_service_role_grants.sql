-- =====================================================
-- صلاحيات service_role على جدول شحن المحفظة barber_ai_wallet_topups
--  · إصلاح: permission denied for table barber_ai_wallet_topups
--  · المُهاجرة 134 أنشأت الجدول وفعّلت RLS دون منح صلاحيات ولا سياسة،
--    فيفشل /api/wallet-topup-fulfill عند القراءة/الإدراج بدور service_role.
--  · نتبع اتفاقية المشروع (المُهاجرة 104): GRANT صريح + سياسة service_role
--    + قراءة الحلاق لسجلّه فقط (مقيّدة بالملكية لمنع IDOR).
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.barber_ai_wallet_topups TO service_role;
GRANT SELECT ON TABLE public.barber_ai_wallet_topups TO authenticated;

ALTER TABLE public.barber_ai_wallet_topups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS barber_ai_wallet_topups_service_role ON public.barber_ai_wallet_topups;
CREATE POLICY barber_ai_wallet_topups_service_role
  ON public.barber_ai_wallet_topups
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- قراءة الحلاق لسجل شحناته فقط — مقيّدة بملكية الحلاق (لا يرى سجلّ غيره)
DROP POLICY IF EXISTS barber_ai_wallet_topups_barber_read ON public.barber_ai_wallet_topups;
CREATE POLICY barber_ai_wallet_topups_barber_read
  ON public.barber_ai_wallet_topups
  FOR SELECT
  TO authenticated
  USING (
    barber_id IN (SELECT b.id FROM public.barbers b WHERE b.user_id = auth.uid())
  );
