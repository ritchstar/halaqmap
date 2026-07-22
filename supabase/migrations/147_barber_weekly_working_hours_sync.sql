-- أوقات العمل المسجّلة في الطلب → عمود سريع للعرض العام + ترحيل من registration_submissions

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS weekly_working_hours jsonb;

COMMENT ON COLUMN public.barbers.weekly_working_hours IS
  'جدول أسبوعي كما سُجّل عند التسجيل [{day,open,close}] — مصدر عرض البنر/التفاصيل للعامة.';

-- ترحيل من طلبات التسجيل المرتبطة
DO $$
DECLARE
  r record;
  slots jsonb;
  slot jsonb;
  day_ar text;
  dow int;
  is_closed boolean;
  open_t time;
  close_t time;
BEGIN
  FOR r IN
    SELECT
      b.id AS barber_id,
      s.payload->'weeklyWorkingHours' AS weekly
    FROM public.barbers b
    JOIN public.registration_submissions s
      ON (
        (s.payload->>'linkedBarberId') = b.id::text
        OR lower(trim(coalesce(s.payload->>'email',''))) = lower(trim(b.email))
      )
    WHERE jsonb_typeof(s.payload->'weeklyWorkingHours') = 'array'
      AND jsonb_array_length(s.payload->'weeklyWorkingHours') > 0
  LOOP
    slots := r.weekly;
    UPDATE public.barbers
    SET weekly_working_hours = slots, updated_at = NOW()
    WHERE id = r.barber_id
      AND (weekly_working_hours IS NULL OR weekly_working_hours = '[]'::jsonb);

    FOR slot IN SELECT * FROM jsonb_array_elements(slots)
    LOOP
      day_ar := trim(slot->>'day');
      dow := CASE day_ar
        WHEN 'الأحد' THEN 0
        WHEN 'الاثنين' THEN 1
        WHEN 'الثلاثاء' THEN 2
        WHEN 'الأربعاء' THEN 3
        WHEN 'الخميس' THEN 4
        WHEN 'الجمعة' THEN 5
        WHEN 'السبت' THEN 6
        ELSE NULL
      END;
      IF dow IS NULL THEN CONTINUE; END IF;

      is_closed :=
        coalesce(slot->>'open','') IN ('مغلق', '')
        OR coalesce(slot->>'close','') IN ('مغلق', '');

      IF is_closed THEN
        open_t := NULL;
        close_t := NULL;
      ELSE
        BEGIN
          open_t := (slot->>'open')::time;
          close_t := (slot->>'close')::time;
        EXCEPTION WHEN others THEN
          CONTINUE;
        END;
      END IF;

      INSERT INTO public.working_hours (
        barber_id, day_of_week, is_open, open_time, close_time, updated_at
      ) VALUES (
        r.barber_id, dow, NOT is_closed, open_t, close_t, NOW()
      )
      ON CONFLICT (barber_id, day_of_week) DO UPDATE SET
        is_open = EXCLUDED.is_open,
        open_time = EXCLUDED.open_time,
        close_time = EXCLUDED.close_time,
        updated_at = NOW();
    END LOOP;
  END LOOP;
END $$;
