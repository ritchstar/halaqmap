-- رادار ZATCA: صلاحيات service_role على جداول الإيرادات
-- يُصلح: "permission denied for table listing_license_orders"

-- جدول طلبات رخص الإدراج (الإيرادات الرئيسية للمنصة)
GRANT SELECT, INSERT, UPDATE ON TABLE public.listing_license_orders TO service_role;

-- جدول الجلسات (إيرادات legacy)
GRANT SELECT ON TABLE public.payments TO service_role;

-- جداول مرتبطة بالرادار (قراءة فقط)
GRANT SELECT ON TABLE public.listing_license_vouchers TO service_role;
GRANT SELECT ON TABLE public.barber_listing_entitlements TO service_role;
GRANT SELECT ON TABLE public.listing_license_products TO service_role;
GRANT SELECT ON TABLE public.listing_license_redemption_events TO service_role;

-- سياسة RLS لـ service_role على listing_license_orders (bypass RLS)
-- service_role يتجاوز RLS تلقائياً في Supabase عند SECURITY DEFINER
-- لكن نُضيف سياسة صريحة احترازاً
DROP POLICY IF EXISTS listing_license_orders_service_role_all ON public.listing_license_orders;
CREATE POLICY listing_license_orders_service_role_all
  ON public.listing_license_orders FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- سياسة RLS لـ service_role على payments
DROP POLICY IF EXISTS payments_service_role_read ON public.payments;
CREATE POLICY payments_service_role_read
  ON public.payments FOR SELECT
  USING (auth.role() = 'service_role');

COMMENT ON TABLE public.listing_license_orders IS
  'طلبات شراء حزم رخصة الإدراج — الإيرادات الرئيسية للمنصة (ZATCA رادار).';
