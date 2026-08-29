-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- إكمال صلاحية service_role لصناديق اليوتيوب حتى ينجح الحفظ والنشر.

CREATE TABLE IF NOT EXISTS public.platform_youtube_galleries (
  page_id text PRIMARY KEY CHECK (page_id IN ('halaq', 'store')),
  draft_boxes jsonb NOT NULL DEFAULT '[]'::jsonb,
  published_boxes jsonb NOT NULL DEFAULT '[]'::jsonb,
  published_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text NOT NULL DEFAULT ''
);

ALTER TABLE public.platform_youtube_galleries ENABLE ROW LEVEL SECURITY;

INSERT INTO public.platform_youtube_galleries (page_id)
VALUES ('halaq'), ('store')
ON CONFLICT (page_id) DO NOTHING;

REVOKE ALL ON TABLE public.platform_youtube_galleries FROM PUBLIC;
REVOKE ALL ON TABLE public.platform_youtube_galleries FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_youtube_galleries TO service_role;

DROP POLICY IF EXISTS platform_youtube_galleries_service_role ON public.platform_youtube_galleries;
CREATE POLICY platform_youtube_galleries_service_role
  ON public.platform_youtube_galleries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
