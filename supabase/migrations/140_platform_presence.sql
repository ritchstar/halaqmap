-- رصد وجود المنصة (Presence) بدون إحداثيات جغرافية
-- الكتابة عبر service_role / API فقط — لا يُعاد سجل البحث الجغرافي (migration 91)

CREATE TABLE IF NOT EXISTS public.platform_presence (
  presence_key text PRIMARY KEY,
  persona text NOT NULL
    CHECK (persona IN ('anon', 'barber', 'admin', 'ambassador')),
  subject_id uuid NULL,
  route_bucket text NOT NULL DEFAULT 'other'
    CHECK (route_bucket IN ('map', 'partner', 'admin', 'ambassador', 'public', 'other')),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT platform_presence_key_len CHECK (char_length(trim(presence_key)) BETWEEN 16 AND 64)
);

COMMENT ON TABLE public.platform_presence IS
  'نبضات «متصل الآن» بدون lat/lng — يحدّثها /api/presence-heartbeat عبر service_role فقط.';

COMMENT ON COLUMN public.platform_presence.presence_key IS
  'UUID عميل ثابت في localStorage — ليس معرف مستخدم عام.';

COMMENT ON COLUMN public.platform_presence.subject_id IS
  'barber.id أو auth.users.id عند إثبات الجلسة فقط؛ وإلا NULL.';

COMMENT ON COLUMN public.platform_presence.route_bucket IS
  'تصنيف خشن للمسار — لا يُخزَّن path كامل ولا إحداثيات.';

CREATE INDEX IF NOT EXISTS platform_presence_last_seen_idx
  ON public.platform_presence (last_seen_at DESC);

CREATE INDEX IF NOT EXISTS platform_presence_persona_seen_idx
  ON public.platform_presence (persona, last_seen_at DESC);

ALTER TABLE public.platform_presence ENABLE ROW LEVEL SECURITY;

-- لا سياسات للـ anon/authenticated: القراءة/الكتابة من service_role فقط (يتجاوز RLS).
REVOKE ALL ON public.platform_presence FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_presence TO service_role;
