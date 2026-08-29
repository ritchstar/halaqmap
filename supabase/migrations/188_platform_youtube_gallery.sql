-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- صناديق يوتيوب لحلاق ماب ومتجر خريطة الحل. المسودة تُنشر بعد الاستعراض.
-- القراءة والكتابة عبر API الخادم (service role) فقط.

CREATE TABLE IF NOT EXISTS public.platform_youtube_galleries (
  page_id text PRIMARY KEY CHECK (page_id IN ('halaq', 'store')),
  draft_boxes jsonb NOT NULL DEFAULT '[]'::jsonb,
  published_boxes jsonb NOT NULL DEFAULT '[]'::jsonb,
  published_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text NOT NULL DEFAULT ''
);

ALTER TABLE public.platform_youtube_galleries ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.platform_youtube_galleries IS
  'معارض يوتيوب عامة بعد النشر. لا وصول مباشر من anon.';

INSERT INTO public.platform_youtube_galleries (page_id)
VALUES ('halaq'), ('store')
ON CONFLICT (page_id) DO NOTHING;

REVOKE ALL ON TABLE public.platform_youtube_galleries FROM PUBLIC;
REVOKE ALL ON TABLE public.platform_youtube_galleries FROM anon;
REVOKE ALL ON TABLE public.platform_youtube_galleries FROM authenticated;
