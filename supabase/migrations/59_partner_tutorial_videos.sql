-- فيديوهات تعليم الاشتراك (Landing مستقلة) — تخزين الملفات في bucket: partner-promo

CREATE TABLE IF NOT EXISTS public.partner_tutorial_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  object_path text NOT NULL UNIQUE,
  mime_type text,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS partner_tutorial_videos_sort_idx
  ON public.partner_tutorial_videos (sort_order ASC, created_at DESC);

ALTER TABLE public.partner_tutorial_videos ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.partner_tutorial_videos IS
  'فيديوهات تعليم الاشتراك للشركاء. القراءة/الكتابة عبر API الخادم (service role) فقط.';

CREATE OR REPLACE FUNCTION public.set_partner_tutorial_videos_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_partner_tutorial_videos_updated_at ON public.partner_tutorial_videos;
CREATE TRIGGER trg_partner_tutorial_videos_updated_at
BEFORE UPDATE ON public.partner_tutorial_videos
FOR EACH ROW
EXECUTE FUNCTION public.set_partner_tutorial_videos_updated_at();

