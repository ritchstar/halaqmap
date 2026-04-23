-- إصلاح بيئات نُفِّذ فيها 31 دون 32: أعمدة inclusive_care الإضافية (آمن مع IF NOT EXISTS)
-- يزيل خطأ PostgREST «column … not found in schema cache» عند المزامنة/الـ upsert

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS inclusive_care_public_visible boolean NOT NULL DEFAULT true;

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS inclusive_care_restrict_days boolean NOT NULL DEFAULT false;

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS inclusive_care_days jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS inclusive_care_customer_note text;

COMMENT ON COLUMN public.barbers.inclusive_care_public_visible IS
  'عند false تُخفى بيانات الخدمة عن واجهة العملاء رغم بقاء الإعدادات للحلاق.';
COMMENT ON COLUMN public.barbers.inclusive_care_restrict_days IS
  'عند true يُفترض الاعتماد على inclusive_care_days لأيام التوفّر.';
COMMENT ON COLUMN public.barbers.inclusive_care_days IS
  'خريطة أيام (مفاتيح عربية مثل «السبت») → boolean.';
COMMENT ON COLUMN public.barbers.inclusive_care_customer_note IS
  'ملاحظة قصيرة للعميل (ظروف، حجز مسبق، نطاق زيارة منزلية، …).';
