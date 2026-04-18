-- =====================================================
-- رقم عضوية الحلاق (مرجع دعم وأرشفة) — 6 أرقام، تسلسل حتى 999999
-- يُولَّد تلقائياً عند INSERT؛ ويُحفظ عند UPDATE إن وُجد مسبقاً.
-- رقم طلب التسجيل HM-... يبقى مرحلياً حتى الموافقة؛ هذا الرقم دائم بعد الاعتماد.
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS public.barber_member_number_seq
  AS INTEGER
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 999999
  NO CYCLE;

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS member_number INTEGER;

COMMENT ON COLUMN public.barbers.member_number IS
  'رقم عضوية ثابت للحلاق على المنصة (6 أرقام للعرض مع pad) — للدعم والأرشفة بعد اعتماد الحساب';

CREATE UNIQUE INDEX IF NOT EXISTS barbers_member_number_uidx
  ON public.barbers (member_number)
  WHERE member_number IS NOT NULL;

CREATE OR REPLACE FUNCTION public.barbers_assign_member_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.member_number IS NULL THEN
      NEW.member_number := nextval('public.barber_member_number_seq');
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.member_number IS NULL AND OLD.member_number IS NOT NULL THEN
      NEW.member_number := OLD.member_number;
    END IF;
    IF NEW.member_number IS NULL AND OLD.member_number IS NULL THEN
      NEW.member_number := nextval('public.barber_member_number_seq');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS barbers_assign_member_number_trg ON public.barbers;
CREATE TRIGGER barbers_assign_member_number_trg
  BEFORE INSERT OR UPDATE ON public.barbers
  FOR EACH ROW
  EXECUTE FUNCTION public.barbers_assign_member_number();

-- تعبئة الصفوف القديمة ثم ضبط التسلسل
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT id FROM public.barbers WHERE member_number IS NULL ORDER BY created_at NULLS LAST, id
  LOOP
    UPDATE public.barbers
    SET member_number = nextval('public.barber_member_number_seq')
    WHERE id = r.id;
  END LOOP;
END $$;

SELECT setval(
  'public.barber_member_number_seq',
  (SELECT COALESCE(MAX(member_number), 0) FROM public.barbers)
);

ALTER TABLE public.barbers
  ALTER COLUMN member_number SET NOT NULL;
