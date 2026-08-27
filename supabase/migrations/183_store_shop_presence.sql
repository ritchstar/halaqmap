-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- نبض حضور مجهول لصفحات الحي: تمويناتا1 ومطعمنا1 وكافينا1 وطبختنا1.
-- بلا اسم ولا هاتف ولا دفتر زيارات. لا يُستخدم في افراحي1 ولا اجواء1 ولا لاونجا1.

CREATE TABLE IF NOT EXISTS public.store_shop_presence (
  product_tag text NOT NULL,
  shop_token text NOT NULL,
  visitor_key text NOT NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_tag, shop_token, visitor_key),
  CONSTRAINT store_shop_presence_tag_chk
    CHECK (product_tag IN (
      'store_grocers_live',
      'store_restaurant_live',
      'store_cafe_live',
      'store_kitchen_live'
    )),
  CONSTRAINT store_shop_presence_token_len
    CHECK (char_length(shop_token) BETWEEN 16 AND 80),
  CONSTRAINT store_shop_presence_visitor_chk
    CHECK (visitor_key ~ '^[a-z0-9]{16,40}$')
);

CREATE INDEX IF NOT EXISTS store_shop_presence_seen_idx
  ON public.store_shop_presence (product_tag, shop_token, last_seen_at DESC);

COMMENT ON TABLE public.store_shop_presence IS
  'عدد من يفتح صفحة الطلب في تلك اللحظة. مفتاح زائر مجهول فقط. يزول بعد انقطاع النبض.';

ALTER TABLE public.store_shop_presence ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.store_shop_presence FROM PUBLIC;
REVOKE ALL ON TABLE public.store_shop_presence FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_shop_presence TO service_role;

DROP POLICY IF EXISTS store_shop_presence_service_role ON public.store_shop_presence;
CREATE POLICY store_shop_presence_service_role
  ON public.store_shop_presence
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
