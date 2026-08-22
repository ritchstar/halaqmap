-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- تمويناتا1: صندوق المحادثة 299 ر.س لستة أشهر أو 499 ر.س لاثني عشر شهراً.

ALTER TABLE public.store_grocers_live_orders
  DROP CONSTRAINT IF EXISTS store_grocers_live_price_chk;

ALTER TABLE public.store_grocers_live_orders
  ADD CONSTRAINT store_grocers_live_price_chk
    CHECK (price_halalas IN (59900, 89900, 89800, 139800));

COMMENT ON TABLE public.store_grocers_live_orders IS
  'تمويناتا1. 599 أو 899 ر.س، أو 898 أو 1398 ر.س مع صندوق محادثة اختياري. الوصول عبر رموز الـ API فقط.';
