-- مواءمة reply_delay_seconds مع reply_delay_minutes (حتى 30 دقيقة)

ALTER TABLE public.barber_digital_shift_config
  DROP CONSTRAINT IF EXISTS barber_digital_shift_config_reply_delay_seconds_check;

ALTER TABLE public.barber_digital_shift_config
  ADD CONSTRAINT barber_digital_shift_config_reply_delay_seconds_check
  CHECK (reply_delay_seconds BETWEEN 3 AND 1800);

UPDATE public.barber_digital_shift_config
SET reply_delay_seconds = LEAST(1800, GREATEST(3, COALESCE(reply_delay_minutes, 3) * 60))
WHERE reply_delay_minutes IS NOT NULL;
