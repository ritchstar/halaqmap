-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- تجمع عائلي مستقل (sa1) — تهانٍ حية + مضيفون متوازون. وصول عبر API فقط.

CREATE TABLE IF NOT EXISTS public.family_gathering_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  family_name_ar text NOT NULL DEFAULT '',
  title_ar text NOT NULL DEFAULT '',
  welcome_ar text NOT NULL DEFAULT '',
  event_date_ar text NOT NULL DEFAULT '',
  event_time_ar text NOT NULL DEFAULT '',
  place_ar text NOT NULL DEFAULT '',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT family_gathering_slug_chk
    CHECK (char_length(trim(slug)) BETWEEN 2 AND 40)
);

CREATE UNIQUE INDEX IF NOT EXISTS family_gathering_instances_slug_uidx
  ON public.family_gathering_instances (slug);

COMMENT ON TABLE public.family_gathering_instances IS
  'نسخ تجمع عائلي مستقلة (مثل sa1). بلا دفع وبلا ربط بأجواء1 أو مجتمع ماب.';

CREATE TABLE IF NOT EXISTS public.family_gathering_hosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL REFERENCES public.family_gathering_instances (id) ON DELETE CASCADE,
  host_token text NOT NULL,
  email text,
  label_ar text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT family_gathering_host_token_len
    CHECK (char_length(host_token) BETWEEN 16 AND 80)
);

CREATE UNIQUE INDEX IF NOT EXISTS family_gathering_hosts_token_uidx
  ON public.family_gathering_hosts (host_token);

CREATE INDEX IF NOT EXISTS family_gathering_hosts_instance_idx
  ON public.family_gathering_hosts (instance_id);

COMMENT ON TABLE public.family_gathering_hosts IS
  'رموز إدارة متوازية لنسخة تجمع عائلي — حيازة الرابط هي الصلاحية.';

CREATE TABLE IF NOT EXISTS public.family_gathering_greetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL REFERENCES public.family_gathering_instances (id) ON DELETE CASCADE,
  name_ar text NOT NULL DEFAULT '',
  message_ar text NOT NULL DEFAULT '',
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT family_gathering_greeting_name_len
    CHECK (char_length(trim(name_ar)) BETWEEN 1 AND 40),
  CONSTRAINT family_gathering_greeting_msg_len
    CHECK (char_length(trim(message_ar)) BETWEEN 1 AND 140)
);

CREATE INDEX IF NOT EXISTS family_gathering_greetings_instance_created_idx
  ON public.family_gathering_greetings (instance_id, created_at DESC);

COMMENT ON TABLE public.family_gathering_greetings IS
  'تهاني تظهر على شاشة المجلس للتجمع العائلي.';

ALTER TABLE public.family_gathering_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_gathering_hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_gathering_greetings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.family_gathering_instances FROM PUBLIC;
REVOKE ALL ON TABLE public.family_gathering_hosts FROM PUBLIC;
REVOKE ALL ON TABLE public.family_gathering_greetings FROM PUBLIC;
REVOKE ALL ON TABLE public.family_gathering_instances FROM anon, authenticated;
REVOKE ALL ON TABLE public.family_gathering_hosts FROM anon, authenticated;
REVOKE ALL ON TABLE public.family_gathering_greetings FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.family_gathering_instances TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.family_gathering_hosts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.family_gathering_greetings TO service_role;

INSERT INTO public.family_gathering_instances (
  slug,
  family_name_ar,
  title_ar,
  welcome_ar,
  event_date_ar,
  event_time_ar,
  place_ar
)
VALUES (
  'sa1',
  'عائلة السراء',
  'صباحكم عيد، يا آل السراء',
  'كل عام وأنتم بخير، تقبل الله منا ومنكم صالح الأعمال. هذه لوحة تجمعنا صباح العيد — أرسل تهنئتك من جوالك لتظهر هنا فوراً أمام الجميع.',
  'صباح أول أيام عيد الفطر',
  'بعد صلاة العيد',
  'مجلس العائلة'
)
ON CONFLICT (slug) DO NOTHING;
