-- تجديد رابط مفتوح/مغلق: منع إعادة استخدام رمز التأكيد (jti) بعد الاستهلاك الأول
CREATE TABLE IF NOT EXISTS public.barber_open_status_rotate_redemptions (
  jti uuid PRIMARY KEY,
  barber_id uuid NOT NULL REFERENCES public.barbers (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS barber_open_status_rotate_redemptions_barber_id_idx
  ON public.barber_open_status_rotate_redemptions (barber_id);

COMMENT ON TABLE public.barber_open_status_rotate_redemptions IS
  'سجلات استهلاك رموز تأكيد تجديد open_status_token (مرة واحدة لكل jti). الوصول عبر service_role فقط.';

ALTER TABLE public.barber_open_status_rotate_redemptions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON TABLE public.barber_open_status_rotate_redemptions TO service_role;

DROP POLICY IF EXISTS barber_open_status_rotate_redemptions_service_role ON public.barber_open_status_rotate_redemptions;
CREATE POLICY barber_open_status_rotate_redemptions_service_role
  ON public.barber_open_status_rotate_redemptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
