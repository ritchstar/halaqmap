-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- تمويناتا1: صندوق محادثة اختياري +99 ر.س على نفس فاتورة الباقة.

ALTER TABLE public.store_grocers_live_orders
  DROP CONSTRAINT IF EXISTS store_grocers_live_price_chk;

ALTER TABLE public.store_grocers_live_orders
  ADD CONSTRAINT store_grocers_live_price_chk
    CHECK (price_halalas IN (59900, 89900, 69800, 99800));

COMMENT ON TABLE public.store_grocers_live_orders IS
  'تمويناتا1. 599 أو 899 ر.س، أو 698 أو 998 ر.س مع صندوق محادثة اختياري. الوصول عبر رموز الـ API فقط.';
