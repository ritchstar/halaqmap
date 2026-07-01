-- إصلاح: migration 39 مُسجَّلة لكن الجدول غير موجود على الإنتاج (انحراف schema).
CREATE TABLE IF NOT EXISTS public.barber_portal_magic_redemptions (
  jti uuid PRIMARY KEY,
  barber_id uuid NOT NULL REFERENCES public.barbers (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS barber_portal_magic_redemptions_barber_id_idx
  ON public.barber_portal_magic_redemptions (barber_id);

COMMENT ON TABLE public.barber_portal_magic_redemptions IS
  'سجلات استهلاك رموز الدخول السريع من البريد (مرة واحدة لكل jti). الوصول فقط عبر API بمفتاح service_role.';

ALTER TABLE public.barber_portal_magic_redemptions ENABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';
