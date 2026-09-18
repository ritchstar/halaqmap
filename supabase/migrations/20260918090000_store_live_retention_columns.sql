-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- إتلاف فعلي لبيانات أفراحي1/اجواء1 غير التجريبية بعد انتهاء مدة التفعيل (٩٠ يوماً).
-- عمودان فقط: طابع تنفيذ الإتلاف (لمنع التكرار ولتوثيق أنه تمّ) وطابع إشعار المشتري.
-- لا يُنشأ جدول جديد؛ الإتلاف نفسه (تفريغ payload + إخفاء اسم المشتري) يُنفَّذ من كود
-- api/_lib/storeLiveRetention.ts عبر UPDATE عادي، فلا حاجة لدالة SQL منفصلة هنا.

ALTER TABLE public.store_wedding_live_orders
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.store_wedding_live_orders
  ADD COLUMN IF NOT EXISTS deletion_notice_sent_at timestamptz;

ALTER TABLE public.store_event_live_orders
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.store_event_live_orders
  ADD COLUMN IF NOT EXISTS deletion_notice_sent_at timestamptz;

CREATE INDEX IF NOT EXISTS store_wedding_live_retention_due_idx
  ON public.store_wedding_live_orders (expires_at)
  WHERE status = 'live' AND deleted_at IS NULL AND is_trial = false;

CREATE INDEX IF NOT EXISTS store_event_live_retention_due_idx
  ON public.store_event_live_orders (expires_at)
  WHERE status = 'live' AND deleted_at IS NULL AND is_trial = false;

COMMENT ON COLUMN public.store_wedding_live_orders.deleted_at IS
  'وقت إتلاف محتوى الدعوة (payload) فعلياً بعد انتهاء مدة التفعيل — سجل الدفع والفاتورة يبقى لأغراض محاسبية.';
COMMENT ON COLUMN public.store_event_live_orders.deleted_at IS
  'وقت إتلاف محتوى الدعوة (payload) فعلياً بعد انتهاء مدة التفعيل — سجل الدفع والفاتورة يبقى لأغراض محاسبية.';

NOTIFY pgrst, 'reload schema';
