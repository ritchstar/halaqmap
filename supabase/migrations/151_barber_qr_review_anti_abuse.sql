-- تقييم QR: تأكيد أعمدة الدعوة + منع تكرار التقييم من نفس متصفح/جهاز لنفس الصالون
-- + تتبع IP مُجزّأ. الرابط المشترك يبقى صالحاً لزبائن مختلفين (أجهزة مختلفة).
-- آمن للتكرار — يغطي بيئات لم تُطبَّق عليها migrations 16/128.

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS via_qr_invite BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS is_highlighted BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.reviews.via_qr_invite IS 'Submitted via barber QR invite URL.';
COMMENT ON COLUMN public.reviews.is_public IS 'Barber can hide review from public profile.';
COMMENT ON COLUMN public.reviews.is_highlighted IS 'Barber can pin review to top of list.';

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS qr_client_key_hash text,
  ADD COLUMN IF NOT EXISTS qr_submitter_ip_hash text;

COMMENT ON COLUMN public.reviews.qr_client_key_hash IS
  'HMAC/SHA-256 لمعرّف متصفح المقيّم — يمنع تقييمين QR من نفس الجهاز لنفس الصالون.';
COMMENT ON COLUMN public.reviews.qr_submitter_ip_hash IS
  'تجزئة IP للإرسال (بدون تخزين IP خام) — لمراقبة الإغراق.';

CREATE UNIQUE INDEX IF NOT EXISTS reviews_qr_one_per_client_uidx
  ON public.reviews (barber_id, qr_client_key_hash)
  WHERE via_qr_invite IS TRUE
    AND qr_client_key_hash IS NOT NULL
    AND length(trim(qr_client_key_hash)) > 0;

CREATE INDEX IF NOT EXISTS reviews_qr_ip_created_idx
  ON public.reviews (barber_id, qr_submitter_ip_hash, created_at DESC)
  WHERE via_qr_invite IS TRUE
    AND qr_submitter_ip_hash IS NOT NULL;
