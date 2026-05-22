-- المناوب الذكي: enabled=false افتراضياً — يُفعَّل فقط بعد شراء Add-on المناوب مع رخصة ماسية (+25 ر.س/حزمة)

ALTER TABLE public.barber_digital_shift_config
  ALTER COLUMN enabled SET DEFAULT false;

UPDATE public.barber_digital_shift_config
SET enabled = false;

UPDATE public.barber_digital_shift_config c
SET enabled = true
WHERE EXISTS (
  SELECT 1
  FROM public.listing_license_orders o
  WHERE o.barber_id = c.barber_id
    AND o.status = 'paid'
    AND COALESCE(o.metadata->>'digital_shift_addon', '') IN ('true', '1')
);

COMMENT ON COLUMN public.barber_digital_shift_config.enabled IS
  'true only after Smart Diamond (+25 SAR) addon purchase; standard Diamond rows stay false.';
