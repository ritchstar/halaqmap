-- =====================================================
-- استقرار مالي: bigint للهللات + سبب الفشل + إلغاء الدفع + تتبع بريد التنبيه بالفشل
-- =====================================================

ALTER TABLE public.barber_subscriptions
  ALTER COLUMN amount_halalas TYPE BIGINT USING amount_halalas::bigint;

ALTER TABLE public.barber_subscriptions
  ADD COLUMN IF NOT EXISTS failure_reason TEXT;

ALTER TABLE public.barber_subscriptions
  ADD COLUMN IF NOT EXISTS failure_notification_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN public.barber_subscriptions.failure_reason IS
  'آخر سبب فشل/إلغاء من Moyasar (غالباً source.message).';

COMMENT ON COLUMN public.barber_subscriptions.failure_notification_sent_at IS
  'توقيت إرسال بريد التنبيه عند فشل الدفع (لتجنب التكرار).';

ALTER TABLE public.barber_subscriptions DROP CONSTRAINT IF EXISTS barber_subscriptions_status_check;

ALTER TABLE public.barber_subscriptions ADD CONSTRAINT barber_subscriptions_status_check
  CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'voided', 'authorized', 'cancelled'));
