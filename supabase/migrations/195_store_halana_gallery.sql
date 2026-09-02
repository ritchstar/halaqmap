-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- حلانا1 — معرض أعمال المتخصصة. صور تُرفع من اللوحة وتظهر لعميلة الصفحة فقط.

CREATE TABLE IF NOT EXISTS public.store_halana_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_id uuid NOT NULL REFERENCES public.store_halana_copies(id) ON DELETE CASCADE,
  caption text NOT NULL DEFAULT '',
  image_src text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_halana_gallery_src_len
    CHECK (char_length(image_src) BETWEEN 12 AND 180000)
);

CREATE INDEX IF NOT EXISTS store_halana_gallery_copy_idx
  ON public.store_halana_gallery (copy_id, sort_order, created_at);

COMMENT ON TABLE public.store_halana_gallery IS
  'حلانا1. صور منتجات ترفعها المتخصصة من اللوحة وتعرض في صفحة العميلة.';

ALTER TABLE public.store_halana_gallery ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.store_halana_gallery FROM PUBLIC;
REVOKE ALL ON TABLE public.store_halana_gallery FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_halana_gallery TO service_role;

DROP POLICY IF EXISTS store_halana_gallery_service_role ON public.store_halana_gallery;
CREATE POLICY store_halana_gallery_service_role
  ON public.store_halana_gallery
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
