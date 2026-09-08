-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- حلانا1 — اختيار ما يظهر في مستكشف «وش المناسبة؟».

ALTER TABLE public.store_halana_copies
  ADD COLUMN IF NOT EXISTS occasions_visible text NOT NULL DEFAULT '';

COMMENT ON COLUMN public.store_halana_copies.occasions_visible IS
  'حلانا1. معرّفات المناسبات الظاهرة في المستكشف، مفصولة بفاصلة. فارغ = الكل.';

NOTIFY pgrst, 'reload schema';
