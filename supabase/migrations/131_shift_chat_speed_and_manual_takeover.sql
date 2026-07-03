-- تسريع رد المناوب (ثوانٍ) + تعليق المناوب عند تدخل الحلاق يدوياً

ALTER TABLE public.barber_digital_shift_config
  ADD COLUMN IF NOT EXISTS reply_delay_seconds INT NOT NULL DEFAULT 5
    CHECK (reply_delay_seconds BETWEEN 3 AND 120);

COMMENT ON COLUMN public.barber_digital_shift_config.reply_delay_seconds IS
  'مهلة انتظار رد الحلاق قبل تدخل المناوب أثناء الدوام (بالثواني).';

ALTER TABLE public.private_conversations
  ADD COLUMN IF NOT EXISTS shift_manual_takeover BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.private_conversations.shift_manual_takeover IS
  'true عندما يتولى الحلاق الرد يدوياً — المناوب متوقف حتى يُعاد تفعيله.';
