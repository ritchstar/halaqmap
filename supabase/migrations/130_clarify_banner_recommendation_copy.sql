-- صياغة أوضح لتوصيات البنر — بدون مصطلحات «أصل رقمي جغرافي»
UPDATE public.barber_ai_recommendations
SET
  title = 'أضف بنراً لصالونك',
  body = 'لم يُرفع بنر بعد على بطاقة صالونك. ارفع صورة بنر واضحة (اسم الصالون + عرض أو سعر إن وُجد) — العميل يقرر من أول نظرة على الخريطة والبحث.'
WHERE status = 'active'
  AND metadata @> '{"dedupeKey":"banner_missing"}'::jsonb;

UPDATE public.barber_ai_recommendations
SET
  title = replace(title, 'تدقيق الأصول الرقمية الجغرافية', 'راجع بنرك على الجوال'),
  body = replace(replace(body, 'خريطة الرصد', 'الخريطة'), 'الأصول الرقمية الجغرافية', 'بنر الصالون')
WHERE status = 'active'
  AND metadata @> '{"dedupeKey":"banner_audit"}'::jsonb;
