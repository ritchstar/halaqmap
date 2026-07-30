-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- =====================================================
-- ظواهر البطاقة المستقلة + عودة الطاقم للعمل + حاوية صور الطاقم
-- =====================================================

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS card_show_phone boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS card_show_whatsapp boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS card_show_chat boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS card_show_booking boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.barbers.card_show_phone IS 'إظهار أيقونة الاتصال على بطاقة الماسي.';
COMMENT ON COLUMN public.barbers.card_show_whatsapp IS 'إظهار أيقونة واتساب على بطاقة الماسي.';
COMMENT ON COLUMN public.barbers.card_show_chat IS 'إظهار أيقونة الشات الكتابي على بطاقة الماسي.';
COMMENT ON COLUMN public.barbers.card_show_booking IS 'إظهار أيقونة الحجز على بطاقة الماسي.';

-- مزامنة من contact_mode القديم booking_only
UPDATE public.barbers
SET
  card_show_phone = false,
  card_show_whatsapp = false,
  card_show_booking = true
WHERE contact_mode = 'booking_only';

ALTER TABLE public.barber_team_members
  ADD COLUMN IF NOT EXISTS return_to_work_date date;

COMMENT ON COLUMN public.barber_team_members.return_to_work_date IS
  'تاريخ العودة للعمل عند وضع الحلاق خارج الخدمة (إجازة).';

-- حاوية صور الطاقم (عامة للقراءة، الكتابة عبر service role)
INSERT INTO storage.buckets (id, name, public)
VALUES ('barber-team', 'barber-team', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_barber_team" ON storage.objects;
CREATE POLICY "public_read_barber_team"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'barber-team');

-- دالة خفيفة لإرجاع ظواهر الأيقونات للدليل العام (بدون كشف الهاتف)
CREATE OR REPLACE FUNCTION public.get_barber_card_cta_flags(p_ids uuid[])
RETURNS TABLE (
  id uuid,
  contact_mode text,
  card_show_phone boolean,
  card_show_whatsapp boolean,
  card_show_chat boolean,
  card_show_booking boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.id,
    COALESCE(b.contact_mode, 'classic')::text AS contact_mode,
    COALESCE(b.card_show_phone, true) AS card_show_phone,
    COALESCE(b.card_show_whatsapp, true) AS card_show_whatsapp,
    COALESCE(b.card_show_chat, true) AS card_show_chat,
    COALESCE(b.card_show_booking, false) AS card_show_booking
  FROM public.barbers b
  WHERE b.id = ANY (p_ids)
    AND b.is_active IS TRUE;
$$;

COMMENT ON FUNCTION public.get_barber_card_cta_flags IS
  'ظواهر أيقونات بطاقة الماسي للقراءة العامة بعد بحث RPC.';

REVOKE ALL ON FUNCTION public.get_barber_card_cta_flags(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_barber_card_cta_flags(uuid[]) TO anon, authenticated, service_role;
