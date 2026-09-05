-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- تشغيل وهمي لمراجعي متجر آبل على لوحة مشغّلي خريطة الحل.
-- بيانات مصطنعة بالكامل: لا اسم مشغّل حقيقي ولا بريد زبون ولا رقم جوال عامل.
-- البريد هنا يجب أن يطابق STORE_OPERATORS_REVIEW_EMAIL في بيئة الخادم،
-- وإلا فتحت الجلسة بلا لوحات. الرمز الثابت في المتغيّر STORE_OPERATORS_REVIEW_CODE فقط.

INSERT INTO public.store_kitchen_live_orders (
  status,
  shop_token,
  desk_token,
  buyer_email,
  buyer_name,
  price_halalas,
  payload,
  expires_at
)
SELECT
  'live',
  'appreviewdemokitchenshop01',
  'appreviewdemokitchendesk01',
  'appreview@halaqmap.com',
  'مطبخ تجريبي للمراجعة',
  30000,
  jsonb_build_object(
    'shopName', 'مطبخ تجريبي للمراجعة',
    'demo', true,
    'note', 'تشغيل وهمي لمراجعة متجر آبل. لا يخص أسرة منتجة حقيقية.'
  ),
  now() + interval '3650 days'
WHERE NOT EXISTS (
  SELECT 1 FROM public.store_kitchen_live_orders
  WHERE desk_token = 'appreviewdemokitchendesk01'
);
