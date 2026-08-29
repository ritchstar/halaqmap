-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- مسار عربة مشمول في السعر: 799 ر.س / 180 يوماً و1250 ر.س / 365 يوماً.
-- الوسم أولاً ثم المبلغ. ليست إضافة مدفوعة وليست منتجاً رابعاً.

ALTER TABLE public.store_grocers_live_orders
  DROP CONSTRAINT IF EXISTS store_grocers_live_price_chk;

ALTER TABLE public.store_grocers_live_orders
  ADD CONSTRAINT store_grocers_live_price_chk
    CHECK (price_halalas IN (0, 59900, 89900, 89800, 139800, 79900, 125000));

ALTER TABLE public.store_restaurant_live_orders
  DROP CONSTRAINT IF EXISTS store_restaurant_live_price_chk;

ALTER TABLE public.store_restaurant_live_orders
  ADD CONSTRAINT store_restaurant_live_price_chk
    CHECK (price_halalas IN (0, 69900, 99900, 79900, 125000));

ALTER TABLE public.store_cafe_live_orders
  DROP CONSTRAINT IF EXISTS store_cafe_live_price_chk;

ALTER TABLE public.store_cafe_live_orders
  ADD CONSTRAINT store_cafe_live_price_chk
    CHECK (price_halalas IN (0, 119900, 209900, 79900, 125000));

COMMENT ON TABLE public.store_grocers_live_orders IS
  'تمويناتا1. ثابت 599 أو 899، أو مع صندوق 898 أو 1398، أو متحرك 799 أو 1250. الوصول عبر رموز الـ API فقط.';

COMMENT ON TABLE public.store_restaurant_live_orders IS
  'مطعمنا1. ثابت 699 أو 999، أو متحرك 799 أو 1250، أو صفر للتجربة. صندوق المحادثة مدرج.';

COMMENT ON TABLE public.store_cafe_live_orders IS
  'كافينا1. ثابت 1199 أو 2099، أو متحرك 799 أو 1250، أو صفر للتجربة. صندوق المحادثة مدرج.';
