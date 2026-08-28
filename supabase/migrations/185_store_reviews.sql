-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- تقييمات متجر خريطة الحل. نجوم وتعليق. لا وصول عام مباشر.

CREATE TABLE IF NOT EXISTS public.store_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stars smallint NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment text NOT NULL CHECK (char_length(comment) BETWEEN 8 AND 600),
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'published'
    CHECK (status IN ('published', 'hidden')),
  admin_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS store_reviews_created_idx
  ON public.store_reviews (created_at DESC);

CREATE INDEX IF NOT EXISTS store_reviews_public_idx
  ON public.store_reviews (created_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS store_reviews_unseen_idx
  ON public.store_reviews (created_at DESC)
  WHERE admin_seen_at IS NULL;

COMMENT ON TABLE public.store_reviews IS
  'تقييمات واجهة المتجر: نجوم وتعليق. القراءة والكتابة عبر الـ API فقط.';

ALTER TABLE public.store_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.store_reviews FROM PUBLIC;
REVOKE ALL ON TABLE public.store_reviews FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_reviews TO service_role;

DROP POLICY IF EXISTS store_reviews_service_role ON public.store_reviews;
CREATE POLICY store_reviews_service_role
  ON public.store_reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
