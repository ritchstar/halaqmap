-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- مدرسة البلوت — المرحلة ٢: الدفع الحقيقي عبر Moyasar (199 ر.س = 19900 هللة، دفعة واحدة).
-- يضيف أعمدة الدفع فقط على جدول المرحلة ١ (baloot_school_registrations) — لا جدول جديد.

ALTER TABLE public.baloot_school_registrations
  ADD COLUMN IF NOT EXISTS moyasar_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS amount_halalas INTEGER,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pay_email_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pay_email_send_count INTEGER NOT NULL DEFAULT 0;

-- الحالة 'paid' هي الحالة النهائية لهذه المرحلة — 'email_confirmed' هي فعلياً حالة
-- «قابل للدفع» (لا حاجة لحالة وسيطة إضافية)، مطابقةً لنمط مدرسة الشطرنج.
ALTER TABLE public.baloot_school_registrations
  DROP CONSTRAINT IF EXISTS baloot_school_registrations_status_check;
ALTER TABLE public.baloot_school_registrations
  ADD CONSTRAINT baloot_school_registrations_status_check
  CHECK (status IN ('pending_email', 'email_confirmed', 'paid', 'cancelled'));

-- قفل المبلغ على سعر مدرسة البلوت فقط (199 ر.س) — يمنع أي تلاعب لاحق بالقيمة.
ALTER TABLE public.baloot_school_registrations
  DROP CONSTRAINT IF EXISTS baloot_school_registrations_amount_check;
ALTER TABLE public.baloot_school_registrations
  ADD CONSTRAINT baloot_school_registrations_amount_check
  CHECK (amount_halalas IS NULL OR amount_halalas = 19900);

-- منع استخدام نفس معرّف دفعة ميسر لأكثر من تسجيل واحد.
CREATE UNIQUE INDEX IF NOT EXISTS baloot_school_registrations_payment_id_idx
  ON public.baloot_school_registrations (moyasar_payment_id)
  WHERE moyasar_payment_id IS NOT NULL;

COMMENT ON COLUMN public.baloot_school_registrations.moyasar_payment_id IS
  'معرّف دفعة ميسر (payment.id) بعد نجاح الدفع الحقيقي — فريد عبر كل التسجيلات.';
COMMENT ON COLUMN public.baloot_school_registrations.amount_halalas IS
  'المبلغ المدفوع فعلياً بالهللة — يجب أن يطابق 19900 (199 ر.س) دائماً.';

NOTIFY pgrst, 'reload schema';
