-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- حلانا1 — نصوص المعرض ولقطات يوتيوب في الصفحة الرئيسية.

ALTER TABLE public.store_halana_copies
  ADD COLUMN IF NOT EXISTS promo_title_ar text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS promo_ar text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS youtube_urls text NOT NULL DEFAULT '';

COMMENT ON COLUMN public.store_halana_copies.promo_ar IS
  'حلانا1. نص دعائي يظهر في معرض الأعمال لا في صفحة الطلب.';
COMMENT ON COLUMN public.store_halana_copies.youtube_urls IS
  'حلانا1. روابط يوتيوب، سطراً لكل لقطة، تُعرض في المعرض فقط.';

NOTIFY pgrst, 'reload schema';
