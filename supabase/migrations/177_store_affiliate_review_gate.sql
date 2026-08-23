-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- مراجعة إدارة لمسوّقي المتجر. المسوّقون الحاليون يبقون معتمدين.
-- لا خلط بسفراء حلاق ماب ولا مسوّقات كوافير ماب.

ALTER TABLE public.store_affiliate_marketers
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS channel_plan text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS experience text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS review_note text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by text NOT NULL DEFAULT '';

ALTER TABLE public.store_affiliate_marketers
  DROP CONSTRAINT IF EXISTS store_affiliate_marketers_status_chk;

ALTER TABLE public.store_affiliate_marketers
  ADD CONSTRAINT store_affiliate_marketers_status_chk
  CHECK (status IN ('pending_review', 'approved', 'declined'));

COMMENT ON COLUMN public.store_affiliate_marketers.status IS
  'pending_review بعد الطلب. approved يفتح الرابط السري. declined اعتذار الإدارة.';

CREATE INDEX IF NOT EXISTS store_affiliate_marketers_status_idx
  ON public.store_affiliate_marketers (status, updated_at DESC);

NOTIFY pgrst, 'reload schema';
