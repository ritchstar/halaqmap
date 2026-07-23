-- تطبيع أرقام الجوال المحلية 05xxxxxxxx → +9665xxxxxxxx
-- يمنع فشل روابط wa.me التي ترفض الصيغة المحلية.

UPDATE public.barbers
SET phone = '+966' || substring(regexp_replace(phone, '[^0-9]', '', 'g') from 2),
    updated_at = now()
WHERE regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') ~ '^05[0-9]{8}$';
