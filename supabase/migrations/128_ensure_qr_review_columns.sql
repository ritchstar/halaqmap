-- تأكيد أعمدة تقييم QR (آمن للتكرار — يُصلح بيئات لم تُطبَّق عليها migration 16)

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS via_qr_invite BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS is_highlighted BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.reviews.via_qr_invite IS 'Submitted via barber QR invite URL.';
COMMENT ON COLUMN public.reviews.is_public IS 'Barber can hide review from public profile.';
COMMENT ON COLUMN public.reviews.is_highlighted IS 'Barber can pin review to top of list.';
