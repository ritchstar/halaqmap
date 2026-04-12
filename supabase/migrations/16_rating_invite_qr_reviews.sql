-- دعوة تقييم عبر QR: رمز سري لكل حلاق + حقول التقييم (للتكامل مع الواجهة والـRLS لاحقاً)
-- ملاحظة: لا تُدرِج rating_invite_token في استعلامات الخريطة العامة — استخدم قائمة أعمدة صريحة.

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS rating_invite_token TEXT UNIQUE;

UPDATE public.barbers
SET rating_invite_token = encode(gen_random_bytes(24), 'hex')
WHERE rating_invite_token IS NULL;

ALTER TABLE public.barbers
  ALTER COLUMN rating_invite_token SET DEFAULT encode(gen_random_bytes(24), 'hex');

COMMENT ON COLUMN public.barbers.rating_invite_token IS 'Secret for /rate links; omit from public SELECT in app.';

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS via_qr_invite BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS is_highlighted BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.reviews.via_qr_invite IS 'Submitted via barber QR invite URL.';
COMMENT ON COLUMN public.reviews.is_public IS 'Barber can hide review from public profile.';
COMMENT ON COLUMN public.reviews.is_highlighted IS 'Barber can pin review to top of list.';
