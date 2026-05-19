-- =====================================================
-- رخص إدراج رقمية مسبقة الدفع (ISIC4 474151)
-- جداول جديدة + ترحيل من subscriptions النشطة + تحديث عرض الخريطة
-- الجداول القديمة subscriptions / barber_subscriptions تبقى للتدقيق (لا حذف)
-- =====================================================

-- ─── كتالوج المنتجات (SKU) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.listing_license_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_code TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'gold', 'diamond')),
  listing_days_granted INTEGER NOT NULL CHECK (listing_days_granted > 0),
  price_sar NUMERIC(10, 2) NOT NULL CHECK (price_sar > 0),
  amount_halalas INTEGER NOT NULL CHECK (amount_halalas >= 100),
  currency TEXT NOT NULL DEFAULT 'SAR',
  is_active BOOLEAN NOT NULL DEFAULT true,
  service_description_ar TEXT NOT NULL DEFAULT 'حزمة برمجية مسبقة الدفع لخدمات الإدراج الموحّد للبرمجيات',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.listing_license_products IS
  'منتجات رخص الإدراج الرقمية (SKU) — بيع مسبق الدفع وليس اشتراكاً متكرراً.';

-- ─── طلبات الشراء ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.listing_license_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.listing_license_products (id),
  buyer_email TEXT,
  barber_id UUID REFERENCES public.barbers (id) ON DELETE SET NULL,
  payment_channel TEXT NOT NULL CHECK (
    payment_channel IN ('moyasar', 'bank_transfer', 'admin_manual', 'legacy_migration')
  ),
  payment_reference TEXT,
  moyasar_payment_id TEXT UNIQUE,
  barber_subscription_id UUID REFERENCES public.barber_subscriptions (id) ON DELETE SET NULL,
  registration_request_id TEXT,
  amount_halalas INTEGER,
  currency TEXT NOT NULL DEFAULT 'SAR',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS listing_license_orders_barber_id_idx
  ON public.listing_license_orders (barber_id);
CREATE INDEX IF NOT EXISTS listing_license_orders_status_idx
  ON public.listing_license_orders (status);
CREATE INDEX IF NOT EXISTS listing_license_orders_moyasar_payment_id_idx
  ON public.listing_license_orders (moyasar_payment_id)
  WHERE moyasar_payment_id IS NOT NULL;

-- ─── قسائم الرخص (بصمة فقط — لا نص صريح في DB) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.listing_license_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.listing_license_orders (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.listing_license_products (id),
  code_fingerprint TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'issued'
    CHECK (status IN ('issued', 'redeemed', 'revoked', 'expired')),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  redeem_by TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ,
  redeemed_barber_id UUID REFERENCES public.barbers (id) ON DELETE SET NULL,
  delivery_email TEXT,
  auto_redeemed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS listing_license_vouchers_order_id_idx
  ON public.listing_license_vouchers (order_id);
CREATE INDEX IF NOT EXISTS listing_license_vouchers_status_idx
  ON public.listing_license_vouchers (status);

-- ─── صلاحية الإدراج للحلاق ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.barber_listing_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES public.barbers (id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.listing_license_products (id) ON DELETE SET NULL,
  voucher_id UUID REFERENCES public.listing_license_vouchers (id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.listing_license_orders (id) ON DELETE SET NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'gold', 'diamond')),
  listing_days_granted INTEGER NOT NULL CHECK (listing_days_granted > 0),
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL CHECK (
    source IN (
      'voucher_redemption',
      'moyasar_auto_redeem',
      'admin_voucher_issue',
      'legacy_subscription_migration',
      'admin_payment_approve'
    )
  ),
  legacy_subscription_id UUID REFERENCES public.subscriptions (id) ON DELETE SET NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT barber_listing_entitlements_valid_range CHECK (valid_until > valid_from)
);

CREATE INDEX IF NOT EXISTS barber_listing_entitlements_barber_id_idx
  ON public.barber_listing_entitlements (barber_id);
CREATE INDEX IF NOT EXISTS barber_listing_entitlements_valid_until_idx
  ON public.barber_listing_entitlements (valid_until)
  WHERE revoked_at IS NULL;

-- ─── سجل الاسترداد ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.listing_license_redemption_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID REFERENCES public.listing_license_vouchers (id) ON DELETE SET NULL,
  barber_id UUID NOT NULL REFERENCES public.barbers (id) ON DELETE CASCADE,
  entitlement_id UUID REFERENCES public.barber_listing_entitlements (id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('redeem', 'auto_redeem', 'admin_grant', 'migration')),
  client_ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── بذور SKU (أسعار وم durations الحالية) ─────────────────────────────
INSERT INTO public.listing_license_products (
  sku_code, tier, listing_days_granted, price_sar, amount_halalas, service_description_ar
) VALUES
  ('bronze_30', 'bronze', 30, 100.00, 10000, 'حزمة برمجية — إدراج برونزي 30 يوماً'),
  ('gold_30', 'gold', 30, 150.00, 15000, 'حزمة برمجية — إدراج ذهبي 30 يوماً'),
  ('diamond_30', 'diamond', 30, 200.00, 20000, 'حزمة برمجية — إدراج ماسي 30 يوماً'),
  ('bronze_180', 'bronze', 180, 600.00, 60000, 'حزمة برمجية — إدراج برونزي 180 يوماً (تحويل بنكي 6 أشهر)'),
  ('gold_180', 'gold', 180, 900.00, 90000, 'حزمة برمجية — إدراج ذهبي 180 يوماً'),
  ('diamond_180', 'diamond', 180, 1200.00, 120000, 'حزمة برمجية — إدراج ماسي 180 يوماً'),
  ('bronze_270', 'bronze', 270, 810.00, 81000, 'حزمة برمجية — إدراج برونزي 270 يوماً (عرض 9 أشهر)'),
  ('gold_270', 'gold', 270, 1215.00, 121500, 'حزمة برمجية — إدراج ذهبي 270 يوماً'),
  ('diamond_270', 'diamond', 270, 1620.00, 162000, 'حزمة برمجية — إدراج ماسي 270 يوماً')
ON CONFLICT (sku_code) DO UPDATE SET
  listing_days_granted = EXCLUDED.listing_days_granted,
  price_sar = EXCLUDED.price_sar,
  amount_halalas = EXCLUDED.amount_halalas,
  service_description_ar = EXCLUDED.service_description_ar,
  updated_at = NOW();

-- ─── ترحيل الاشتراكات النشطة → entitlements (بدون فقدان) ───────────────
INSERT INTO public.barber_listing_entitlements (
  barber_id,
  tier,
  listing_days_granted,
  valid_from,
  valid_until,
  source,
  legacy_subscription_id
)
SELECT
  s.barber_id,
  s.tier,
  GREATEST(1, (s.end_date - CURRENT_DATE) + 1),
  NOW(),
  ((s.end_date::timestamp AT TIME ZONE 'UTC') + INTERVAL '23 hours 59 minutes 59 seconds'),
  'legacy_subscription_migration',
  s.id
FROM public.subscriptions s
WHERE s.status = 'active'
  AND s.end_date >= CURRENT_DATE
  AND NOT EXISTS (
    SELECT 1
    FROM public.barber_listing_entitlements e
    WHERE e.legacy_subscription_id = s.id
  );

-- ─── دالة: هل للحلاق إدراج نشط ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.barber_has_active_listing(p_barber_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.barber_listing_entitlements e
    WHERE e.barber_id = p_barber_id
      AND e.valid_until > NOW()
      AND e.revoked_at IS NULL
  );
$$;

COMMENT ON FUNCTION public.barber_has_active_listing IS
  'صلاحية إدراج نشطة: valid_until في المستقبل وغير ملغاة.';

-- ─── دالة: ملخص أيام الإدراج المتبقية ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.barber_listing_summary(p_barber_id UUID)
RETURNS TABLE (
  has_active_listing BOOLEAN,
  listing_days_remaining INTEGER,
  valid_until TIMESTAMPTZ,
  active_tier TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH active AS (
    SELECT
      e.tier,
      e.valid_until,
      GREATEST(
        0,
        CEIL(EXTRACT(EPOCH FROM (e.valid_until - NOW())) / 86400.0)::INTEGER
      ) AS days_left
    FROM public.barber_listing_entitlements e
    WHERE e.barber_id = p_barber_id
      AND e.valid_until > NOW()
      AND e.revoked_at IS NULL
  )
  SELECT
    EXISTS (SELECT 1 FROM active),
    COALESCE((SELECT MAX(days_left) FROM active), 0),
    (SELECT MAX(valid_until) FROM active),
    (
      SELECT a.tier
      FROM active a
      ORDER BY
        CASE a.tier WHEN 'diamond' THEN 3 WHEN 'gold' THEN 2 ELSE 1 END DESC,
        a.valid_until DESC
      LIMIT 1
    );
$$;

GRANT EXECUTE ON FUNCTION public.barber_has_active_listing(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.barber_listing_summary(UUID) TO anon, authenticated, service_role;

-- ─── عرض الخريطة: إدراج نشط عبر entitlements ─────────────────────────────
CREATE OR REPLACE VIEW public.barbers_public_directory AS
SELECT
  b.*,
  true AS has_active_subscription
FROM public.barbers b
WHERE b.is_active = true
  AND public.barber_has_active_listing(b.id);

COMMENT ON VIEW public.barbers_public_directory IS
  'حلاق يظهر على الخريطة: نشط + حزمة إدراج برمجية سارية (barber_listing_entitlements.valid_until).';

-- search_barbers_nearby يقرأ من العرض — لا حاجة لإعادة تعريف الدالة إن لم تتغير التوقيعات

-- ─── RLS ─────────────────────────────────────────────────────────────────
ALTER TABLE public.listing_license_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_license_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_license_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_listing_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_license_redemption_events ENABLE ROW LEVEL SECURITY;

-- منتجات: قراءة عامة للكتالوج النشط
DROP POLICY IF EXISTS listing_license_products_public_read ON public.listing_license_products;
CREATE POLICY listing_license_products_public_read
  ON public.listing_license_products FOR SELECT
  USING (is_active = true);

-- entitlements: الحلاق يرى صلاحيته
DROP POLICY IF EXISTS barber_listing_entitlements_barber_read ON public.barber_listing_entitlements;
CREATE POLICY barber_listing_entitlements_barber_read
  ON public.barber_listing_entitlements FOR SELECT
  USING (
    barber_id IN (
      SELECT id FROM public.barbers WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS barber_listing_entitlements_admin_all ON public.barber_listing_entitlements;
CREATE POLICY barber_listing_entitlements_admin_all
  ON public.barber_listing_entitlements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- الطلبات والقسائم: إدارة فقط (الكتابة عبر service_role من API)
DROP POLICY IF EXISTS listing_license_orders_admin_read ON public.listing_license_orders;
CREATE POLICY listing_license_orders_admin_read
  ON public.listing_license_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

DROP POLICY IF EXISTS listing_license_vouchers_admin_read ON public.listing_license_vouchers;
CREATE POLICY listing_license_vouchers_admin_read
  ON public.listing_license_vouchers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- منع كتابة جديدة على subscriptions من المستخدمين العاديين (تدقيق فقط)
COMMENT ON TABLE public.subscriptions IS
  'LEGACY AUDIT — لا تُستخدم للإدراج بعد migration 76. المصدر: barber_listing_entitlements.';

DROP TRIGGER IF EXISTS on_barber_listing_entitlement_updated ON public.barber_listing_entitlements;
CREATE TRIGGER on_barber_listing_entitlement_updated
  BEFORE UPDATE ON public.barber_listing_entitlements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_listing_license_product_updated ON public.listing_license_products;
CREATE TRIGGER on_listing_license_product_updated
  BEFORE UPDATE ON public.listing_license_products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_listing_license_order_updated ON public.listing_license_orders;
CREATE TRIGGER on_listing_license_order_updated
  BEFORE UPDATE ON public.listing_license_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_listing_license_voucher_updated ON public.listing_license_vouchers;
CREATE TRIGGER on_listing_license_voucher_updated
  BEFORE UPDATE ON public.listing_license_vouchers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- تحديث tier الحلاق عند إضافة entitlement (نفس منطق الاشتراك السابق)
CREATE OR REPLACE FUNCTION public.update_barber_tier_on_listing_entitlement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.revoked_at IS NULL AND NEW.valid_until > NOW() THEN
    UPDATE public.barbers
    SET tier = NEW.tier
    WHERE id = NEW.barber_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_listing_entitlement_tier_sync ON public.barber_listing_entitlements;
CREATE TRIGGER on_listing_entitlement_tier_sync
  AFTER INSERT ON public.barber_listing_entitlements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_barber_tier_on_listing_entitlement();
