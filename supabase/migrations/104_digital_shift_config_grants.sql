-- =====================================================
-- صلاحيات المناوب الرقمي — إصلاح permission denied على barber_digital_shift_config
-- =====================================================

-- الـ trigger السابق كان SECURITY INVOKER فيفشل عند إنشاء حلاق ماسي (مثل حساب المعاينة)
CREATE OR REPLACE FUNCTION public.ensure_barber_digital_shift_on_diamond()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tier = 'diamond' THEN
    INSERT INTO public.barber_digital_shift_config (barber_id)
    VALUES (NEW.id)
    ON CONFLICT (barber_id) DO NOTHING;
    INSERT INTO public.barber_ai_wallet (barber_id)
    VALUES (NEW.id)
    ON CONFLICT (barber_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.barber_digital_shift_config TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.barber_ai_wallet TO service_role;
GRANT SELECT, INSERT ON TABLE public.barber_ai_wallet_transactions TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.barber_ai_recommendations TO service_role;

ALTER TABLE public.barber_digital_shift_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_ai_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_ai_wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_ai_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS barber_digital_shift_config_service_role ON public.barber_digital_shift_config;
CREATE POLICY barber_digital_shift_config_service_role
  ON public.barber_digital_shift_config
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS barber_ai_wallet_service_role ON public.barber_ai_wallet;
CREATE POLICY barber_ai_wallet_service_role
  ON public.barber_ai_wallet
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS barber_ai_wallet_tx_service_role ON public.barber_ai_wallet_transactions;
CREATE POLICY barber_ai_wallet_tx_service_role
  ON public.barber_ai_wallet_transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS barber_ai_recommendations_service_role ON public.barber_ai_recommendations;
CREATE POLICY barber_ai_recommendations_service_role
  ON public.barber_ai_recommendations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS barber_digital_shift_config_barber_read ON public.barber_digital_shift_config;
CREATE POLICY barber_digital_shift_config_barber_read
  ON public.barber_digital_shift_config
  FOR SELECT
  TO authenticated
  USING (
    barber_id IN (SELECT b.id FROM public.barbers b WHERE b.user_id = auth.uid())
  );

DROP POLICY IF EXISTS barber_ai_wallet_barber_read ON public.barber_ai_wallet;
CREATE POLICY barber_ai_wallet_barber_read
  ON public.barber_ai_wallet
  FOR SELECT
  TO authenticated
  USING (
    barber_id IN (SELECT b.id FROM public.barbers b WHERE b.user_id = auth.uid())
  );

COMMENT ON FUNCTION public.ensure_barber_digital_shift_on_diamond IS
  'SECURITY DEFINER — يزرع إعدادات المناوب الرقمي عند tier=diamond دون فشل صلاحيات الجلسة.';
