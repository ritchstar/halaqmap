-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- مدرسة الشطرنج الاحترافية — المرحلة ٢: الدفع الحقيقي عبر Moyasar (175 ر.س = 17500 هللة، دفعة واحدة).
-- يضيف أعمدة الدفع فقط على جدول المرحلة ١ (chess_school_registrations) — لا جدول جديد،
-- ولا يمسّ عمود الصفحة الخاصة الدائمة (تلك المرحلة ٣ التالية، على عمود منفصل لاحقاً).

ALTER TABLE public.chess_school_registrations
  ADD COLUMN IF NOT EXISTS moyasar_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS amount_halalas INTEGER,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pay_email_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pay_email_send_count INTEGER NOT NULL DEFAULT 0;

-- الحالة 'paid' هي الحالة النهائية لهذه المرحلة — لا 'pending_payment' منفصلة،
-- لأن 'email_confirmed' هي فعلياً حالة «قابل للدفع» (لا حاجة لحالة وسيطة إضافية).
ALTER TABLE public.chess_school_registrations
  DROP CONSTRAINT IF EXISTS chess_school_registrations_status_check;
ALTER TABLE public.chess_school_registrations
  ADD CONSTRAINT chess_school_registrations_status_check
  CHECK (status IN ('pending_email', 'email_confirmed', 'paid', 'cancelled'));

-- قفل المبلغ على سعر مدرسة الشطرنج فقط (175 ر.س) — يمنع أي تلاعب لاحق بالقيمة.
ALTER TABLE public.chess_school_registrations
  DROP CONSTRAINT IF EXISTS chess_school_registrations_amount_check;
ALTER TABLE public.chess_school_registrations
  ADD CONSTRAINT chess_school_registrations_amount_check
  CHECK (amount_halalas IS NULL OR amount_halalas = 17500);

-- منع استخدام نفس معرّف دفعة ميسر لأكثر من تسجيل واحد.
CREATE UNIQUE INDEX IF NOT EXISTS chess_school_registrations_payment_id_idx
  ON public.chess_school_registrations (moyasar_payment_id)
  WHERE moyasar_payment_id IS NOT NULL;

COMMENT ON COLUMN public.chess_school_registrations.moyasar_payment_id IS
  'معرّف دفعة ميسر (payment.id) بعد نجاح الدفع الحقيقي — فريد عبر كل التسجيلات.';
COMMENT ON COLUMN public.chess_school_registrations.amount_halalas IS
  'المبلغ المدفوع فعلياً بالهللة — يجب أن يطابق 17500 (175 ر.س) دائماً.';

NOTIFY pgrst, 'reload schema';
