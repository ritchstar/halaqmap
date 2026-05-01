-- فيديو ترويجي لمسار الشركاء: تخزين عام للقراءة + إعدادات في جدول (يُحدَّث عبر API بصلاحية الإدارة فقط)

INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-promo', 'partner-promo', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_partner_promo" ON storage.objects;
CREATE POLICY "public_read_partner_promo"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'partner-promo');

CREATE TABLE IF NOT EXISTS public.partner_promo_video_config (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled boolean NOT NULL DEFAULT false,
  object_path text,
  mime_type text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_promo_video_config ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.partner_promo_video_config IS
  'إعدادات الفيديو الترويجي لمسار الشركاء — القراءة/التحديث عبر خادم التطبيق (service role) فقط.';

INSERT INTO public.partner_promo_video_config (id, enabled, object_path, mime_type)
VALUES (1, false, NULL, NULL)
ON CONFLICT (id) DO NOTHING;
