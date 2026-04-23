-- =====================================================
-- حجز آمن: منع التداخل الزمني (pending + confirmed)
-- قفل استشاري لكل (barber_id, booking_date) + SELECT FOR UPDATE
-- على الحجوزات النشطة في نافذة التواريخ المجاورة
-- =====================================================

CREATE INDEX IF NOT EXISTS bookings_overlap_guard_idx
  ON public.bookings (barber_id, booking_date)
  WHERE status IN ('pending', 'confirmed');

CREATE OR REPLACE FUNCTION public.create_booking_safe(
  p_barber_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_service_name text,
  p_booking_date date,
  p_booking_time time,
  p_customer_email text DEFAULT NULL,
  p_service_price numeric DEFAULT NULL,
  p_duration_minutes integer DEFAULT 30,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id uuid;
  v_barber_exists boolean;
  v_new_start timestamp;
  v_new_end timestamp;
  v_dur int;
  v_booking_id uuid;
  b record;
  b_start timestamp;
  b_end timestamp;
  b_dur int;
BEGIN
  IF auth.role() NOT IN ('authenticated', 'anon') THEN
    RAISE EXCEPTION 'create_booking_safe: role not allowed'
      USING ERRCODE = '42501';
  END IF;

  IF auth.role() = 'authenticated' THEN
    v_customer_id := auth.uid();
  ELSE
    v_customer_id := NULL;
  END IF;

  IF p_customer_name IS NULL OR btrim(p_customer_name) = '' THEN
    RAISE EXCEPTION 'create_booking_safe: customer_name required'
      USING ERRCODE = '23502';
  END IF;

  IF p_customer_phone IS NULL OR btrim(p_customer_phone) = '' THEN
    RAISE EXCEPTION 'create_booking_safe: customer_phone required'
      USING ERRCODE = '23502';
  END IF;

  IF p_service_name IS NULL OR btrim(p_service_name) = '' THEN
    RAISE EXCEPTION 'create_booking_safe: service_name required'
      USING ERRCODE = '23502';
  END IF;

  v_dur := coalesce(p_duration_minutes, 30);
  IF v_dur < 1 OR v_dur > 1440 THEN
    RAISE EXCEPTION 'create_booking_safe: duration_minutes out of range (1..1440)'
      USING ERRCODE = '23514';
  END IF;

  SELECT EXISTS (SELECT 1 FROM public.barbers b WHERE b.id = p_barber_id)
  INTO v_barber_exists;
  IF NOT v_barber_exists THEN
    RAISE EXCEPTION 'create_booking_safe: barber not found'
      USING ERRCODE = '23503';
  END IF;

  IF v_customer_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = v_customer_id) THEN
      RAISE EXCEPTION 'create_booking_safe: profile not found'
        USING ERRCODE = '23503';
    END IF;
  END IF;

  v_new_start := (p_booking_date + p_booking_time)::timestamp;
  v_new_end := v_new_start + make_interval(mins => v_dur);

  PERFORM pg_advisory_xact_lock(
    hashtext('halaqmap_booking:' || p_barber_id::text),
    hashtext('halaqmap_booking_date:' || p_booking_date::text)
  );

  FOR b IN
    SELECT id, booking_date, booking_time, duration_minutes
    FROM public.bookings
    WHERE barber_id = p_barber_id
      AND status IN ('pending', 'confirmed')
      AND booking_date BETWEEN (p_booking_date - 1) AND (p_booking_date + 1)
    ORDER BY booking_date, booking_time, id
    FOR UPDATE
  LOOP
    b_dur := coalesce(b.duration_minutes, 30);
    b_start := (b.booking_date + b.booking_time)::timestamp;
    b_end := b_start + make_interval(mins => b_dur);
    IF v_new_start < b_end AND b_start < v_new_end THEN
      RAISE EXCEPTION 'create_booking_safe: slot overlaps existing booking'
        USING ERRCODE = '23P01';
    END IF;
  END LOOP;

  INSERT INTO public.bookings (
    barber_id,
    customer_id,
    customer_name,
    customer_phone,
    customer_email,
    service_name,
    service_price,
    booking_date,
    booking_time,
    duration_minutes,
    status,
    notes
  ) VALUES (
    p_barber_id,
    v_customer_id,
    btrim(p_customer_name),
    btrim(p_customer_phone),
    NULLIF(btrim(p_customer_email), ''),
    btrim(p_service_name),
    p_service_price,
    p_booking_date,
    p_booking_time,
    v_dur,
    'pending',
    NULLIF(btrim(p_notes), '')
  )
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$;

COMMENT ON FUNCTION public.create_booking_safe IS
  'Creates a booking with advisory lock + FOR UPDATE overlap check (pending/confirmed only).';

REVOKE ALL ON FUNCTION public.create_booking_safe(
  uuid, text, text, text, date, time, text, numeric, integer, text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_booking_safe(
  uuid, text, text, text, date, time, text, numeric, integer, text
) TO authenticated, anon;

-- منع الإدراج المباشر من العملاء (تجاوز فحص التداخل). الإدارة والحلاق يبقون عبر سياساتهم.
DROP POLICY IF EXISTS "Customers can create bookings" ON public.bookings;
