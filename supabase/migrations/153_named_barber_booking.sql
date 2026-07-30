-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- =====================================================
-- الحجز بالاسم: contact_mode + طاقم الحلاقين + team_member_id
-- =====================================================

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS contact_mode text NOT NULL DEFAULT 'classic';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'barbers_contact_mode_check'
      AND conrelid = 'public.barbers'::regclass
  ) THEN
    ALTER TABLE public.barbers
      ADD CONSTRAINT barbers_contact_mode_check
      CHECK (contact_mode IN ('classic', 'booking_only'));
  END IF;
END $$;

COMMENT ON COLUMN public.barbers.contact_mode IS
  'classic = هاتف/واتساب/موقع؛ booking_only = موقع + حجز فقط (إخفاء الاتصال المباشر).';

-- ملاحظة: لا نُسقط barbers_public_directory هنا لتجنّب CASCADE على search_barbers_nearby.
-- contact_mode يُقرأ من barbers مباشرة عبر واجهات الـ API عند الحاجة.

-- طاقم الحلاقين (موارد حجز تحت حساب الصالون — ليست حسابات دخول)
CREATE TABLE IF NOT EXISTS public.barber_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  photo_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  default_duration_minutes integer NOT NULL DEFAULT 30
    CHECK (default_duration_minutes BETWEEN 5 AND 480),
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS barber_team_members_barber_id_idx
  ON public.barber_team_members (barber_id, sort_order, created_at);

CREATE INDEX IF NOT EXISTS barber_team_members_active_idx
  ON public.barber_team_members (barber_id)
  WHERE is_active = true;

COMMENT ON TABLE public.barber_team_members IS
  'حلاقو الطاقم داخل الصالون للحجز بالاسم — موارد حجز وليست حسابات بوابة.';

ALTER TABLE public.barber_team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active team members" ON public.barber_team_members;
CREATE POLICY "Public can read active team members"
  ON public.barber_team_members FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access team members" ON public.barber_team_members;
CREATE POLICY "Service role full access team members"
  ON public.barber_team_members FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- فترات مشغولية/إجازة يدوية لكل عضو طاقم
CREATE TABLE IF NOT EXISTS public.barber_team_member_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  team_member_id uuid NOT NULL REFERENCES public.barber_team_members(id) ON DELETE CASCADE,
  block_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT barber_team_member_blocks_time_range CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS barber_team_member_blocks_lookup_idx
  ON public.barber_team_member_blocks (team_member_id, block_date);

CREATE INDEX IF NOT EXISTS barber_team_member_blocks_barber_idx
  ON public.barber_team_member_blocks (barber_id, block_date);

COMMENT ON TABLE public.barber_team_member_blocks IS
  'فترات محظورة يدوياً لعضو الطاقم (إجازة/مشغول) — تُخفى من أوقات الحجز العامة.';

ALTER TABLE public.barber_team_member_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access team blocks" ON public.barber_team_member_blocks;
CREATE POLICY "Service role full access team blocks"
  ON public.barber_team_member_blocks FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ربط الحجز بعضو الطاقم
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS team_member_id uuid REFERENCES public.barber_team_members(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS bookings_team_member_overlap_idx
  ON public.bookings (team_member_id, booking_date)
  WHERE status IN ('pending', 'confirmed') AND team_member_id IS NOT NULL;

COMMENT ON COLUMN public.bookings.team_member_id IS
  'عضو الطاقم المحجوز عنده (اختياري) — قفل التداخل على مستوى الحلاق بالاسم.';

-- توسيع create_booking_safe بـ team_member_id اختياري
DROP FUNCTION IF EXISTS public.create_booking_safe(
  uuid, text, text, text, date, time, text, numeric, integer, text
);

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
  p_notes text DEFAULT NULL,
  p_team_member_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id uuid;
  v_barber_exists boolean;
  v_member_ok boolean;
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

  IF p_team_member_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.barber_team_members m
      WHERE m.id = p_team_member_id
        AND m.barber_id = p_barber_id
        AND m.is_active = true
    )
    INTO v_member_ok;
    IF NOT v_member_ok THEN
      RAISE EXCEPTION 'create_booking_safe: team member not found or inactive'
        USING ERRCODE = '23503';
    END IF;
  END IF;

  IF v_customer_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = v_customer_id) THEN
      RAISE EXCEPTION 'create_booking_safe: profile not found'
        USING ERRCODE = '23503';
    END IF;
  END IF;

  v_new_start := (p_booking_date + p_booking_time)::timestamp;
  v_new_end := v_new_start + make_interval(mins => v_dur);

  IF p_team_member_id IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(
      hashtext('halaqmap_booking_member:' || p_team_member_id::text),
      hashtext('halaqmap_booking_date:' || p_booking_date::text)
    );
  ELSE
    PERFORM pg_advisory_xact_lock(
      hashtext('halaqmap_booking:' || p_barber_id::text),
      hashtext('halaqmap_booking_date:' || p_booking_date::text)
    );
  END IF;

  FOR b IN
    SELECT id, booking_date, booking_time, duration_minutes, team_member_id
    FROM public.bookings
    WHERE barber_id = p_barber_id
      AND status IN ('pending', 'confirmed')
      AND booking_date BETWEEN (p_booking_date - 1) AND (p_booking_date + 1)
      AND (
        (p_team_member_id IS NULL AND team_member_id IS NULL)
        OR (p_team_member_id IS NOT NULL AND team_member_id = p_team_member_id)
      )
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
    notes,
    team_member_id
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
    NULLIF(btrim(p_notes), ''),
    p_team_member_id
  )
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$;

COMMENT ON FUNCTION public.create_booking_safe IS
  'Creates a booking with advisory lock + FOR UPDATE overlap check; optional team_member_id scopes the lock.';

REVOKE ALL ON FUNCTION public.create_booking_safe(
  uuid, text, text, text, date, time, text, numeric, integer, text, uuid
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_booking_safe(
  uuid, text, text, text, date, time, text, numeric, integer, text, uuid
) TO authenticated, anon;
