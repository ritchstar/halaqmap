-- =====================================================
-- ضمان عمود rating_invite_token على barbers (مشاريع لم تُنفَّذ فيها ترحيل 16)
-- =====================================================

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS rating_invite_token TEXT;

UPDATE public.barbers
SET rating_invite_token = encode(gen_random_bytes(24), 'hex')
WHERE rating_invite_token IS NULL OR trim(rating_invite_token) = '';

COMMENT ON COLUMN public.barbers.rating_invite_token IS
  'رمز سري لروابط/QR التقييم — يُدار من الخادم عند الاعتماد؛ لا تُدرجه في استعلامات الخريطة العامة.';

-- قيمة افتراضية للصفوف الجديدة (متوافق مع ترحيل 16)
DO $$
BEGIN
  ALTER TABLE public.barbers
    ALTER COLUMN rating_invite_token SET DEFAULT encode(gen_random_bytes(24), 'hex');
EXCEPTION
  WHEN others THEN
    NULL;
END $$;
