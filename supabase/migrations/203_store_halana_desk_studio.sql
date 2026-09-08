-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- حلانا1 — استوديو اللوحة: جاهزية استقبال الطلبات ونوع عنصر المعرض.

ALTER TABLE public.store_halana_copies
  ADD COLUMN IF NOT EXISTS accepting_orders boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.store_halana_copies.accepting_orders IS
  'حلانا1. false = اعتذار مؤقت عن استقبال طلبات جديدة في صفحة العميلة.';

ALTER TABLE public.store_halana_gallery
  ADD COLUMN IF NOT EXISTS item_kind text NOT NULL DEFAULT 'inspire';

ALTER TABLE public.store_halana_gallery
  DROP CONSTRAINT IF EXISTS store_halana_gallery_kind_chk;

ALTER TABLE public.store_halana_gallery
  ADD CONSTRAINT store_halana_gallery_kind_chk
  CHECK (item_kind IN ('inspire', 'featured'));

COMMENT ON COLUMN public.store_halana_gallery.item_kind IS
  'inspire = عمل للإلهام، featured = مميز في المعرض.';

NOTIFY pgrst, 'reload schema';
