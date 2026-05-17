-- إعدادات عرض صفحة فيديوهات شرح التراخيص (تفعيل/إيقاف من لوحة الإدارة)

CREATE TABLE IF NOT EXISTS public.partner_tutorial_videos_config (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_tutorial_videos_config ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.partner_tutorial_videos_config IS
  'تفعيل أو إيقاف صفحة فيديوهات شرح التراخيص للزوار — القراءة/التحديث عبر API الخادم (service role) فقط.';

INSERT INTO public.partner_tutorial_videos_config (id, enabled)
VALUES (1, true)
ON CONFLICT (id) DO NOTHING;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.partner_tutorial_videos_config TO service_role;
REVOKE ALL ON TABLE public.partner_tutorial_videos_config FROM anon, authenticated;
