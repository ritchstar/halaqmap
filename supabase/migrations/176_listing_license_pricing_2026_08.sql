-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- أسعار حزم رخصة النفاذ المعتمدة: برونزي 200 · ذهبي 300 · ماسي 400 شهرياً.
-- إضافة المناوب والمكتب الخاص +50 ر.س/حزمة تُحسب في الدفع وليست SKU مستقل.
-- لا يُعاد كتابة الطلبات التاريخية المدفوعة.

INSERT INTO public.listing_license_products (
  sku_code, tier, listing_days_granted, price_sar, amount_halalas, service_description_ar
) VALUES
  ('bronze_30', 'bronze', 30, 200.00, 20000, 'حزمة رخصة — إدراج برونزي 30 يوماً'),
  ('gold_30', 'gold', 30, 300.00, 30000, 'حزمة رخصة — إدراج ذهبي 30 يوماً'),
  ('diamond_30', 'diamond', 30, 400.00, 40000, 'حزمة رخصة — إدراج ماسي 30 يوماً'),
  ('bronze_90', 'bronze', 90, 600.00, 60000, 'حزمة رخصة — إدراج برونزي 90 يوماً'),
  ('gold_90', 'gold', 90, 900.00, 90000, 'حزمة رخصة — إدراج ذهبي 90 يوماً'),
  ('diamond_90', 'diamond', 90, 1200.00, 120000, 'حزمة رخصة — إدراج ماسي 90 يوماً'),
  ('bronze_180', 'bronze', 180, 1200.00, 120000, 'حزمة رخصة — إدراج برونزي 180 يوماً'),
  ('gold_180', 'gold', 180, 1800.00, 180000, 'حزمة رخصة — إدراج ذهبي 180 يوماً'),
  ('diamond_180', 'diamond', 180, 2400.00, 240000, 'حزمة رخصة — إدراج ماسي 180 يوماً'),
  ('bronze_270', 'bronze', 270, 1800.00, 180000, 'حزمة رخصة — إدراج برونزي 270 يوماً'),
  ('gold_270', 'gold', 270, 2700.00, 270000, 'حزمة رخصة — إدراج ذهبي 270 يوماً'),
  ('diamond_270', 'diamond', 270, 3600.00, 360000, 'حزمة رخصة — إدراج ماسي 270 يوماً')
ON CONFLICT (sku_code) DO UPDATE SET
  listing_days_granted = EXCLUDED.listing_days_granted,
  price_sar = EXCLUDED.price_sar,
  amount_halalas = EXCLUDED.amount_halalas,
  service_description_ar = EXCLUDED.service_description_ar,
  updated_at = NOW();

COMMENT ON TABLE public.listing_license_products IS
  'كتالوج حزم رخصة النفاذ. الأسعار الشهرية 200/300/400 ر.س. الإضافة +50 خارج هذا الجدول.';
