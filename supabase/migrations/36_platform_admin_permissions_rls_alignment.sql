-- =====================================================
-- مزامنة RLS مع مفاتيح platform_admin_roles (الاثنا عشر)
-- + سجل أمان للحجز (create_booking_safe) يظهر في لوحة الإدارة
-- + is_jwt_platform_admin = أي عضو إداري نشط أو bootstrap (للتوافق)
-- =====================================================

-- ----- 1) فحص صلاحية مفردة من JWT (SECURITY DEFINER لتفادي تعارض RLS) -----
CREATE OR REPLACE FUNCTION public.jwt_platform_admin_has_permission(p_key text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  e text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  j jsonb;
BEGIN
  IF e = '' THEN
    RETURN false;
  END IF;
  IF public.is_bootstrap_platform_admin() THEN
    RETURN true;
  END IF;
  SELECT ar.permissions INTO j
  FROM public.platform_admin_roles ar
  WHERE lower(trim(ar.email)) = e
    AND ar.is_active = true;
  IF j IS NULL THEN
    RETURN false;
  END IF;
  RETURN COALESCE((j ->> p_key)::boolean, false);
END;
$$;

COMMENT ON FUNCTION public.jwt_platform_admin_has_permission(text) IS
  'يرجع true لبريد bootstrap أو إذا كان عمود permissions للمستخدم النشط يحتوي المفتاح المطلوب.';

REVOKE ALL ON FUNCTION public.jwt_platform_admin_has_permission(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.jwt_platform_admin_has_permission(text) TO authenticated;

-- ----- 2) أي مستخدم إداري نشط (بدون تمييز المفتاح) — للتوافق مع استدعاءات قديمة -----
CREATE OR REPLACE FUNCTION public.is_jwt_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT public.is_bootstrap_platform_admin()
    OR EXISTS (
      SELECT 1
      FROM public.platform_admin_roles ar
      WHERE lower(trim(ar.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        AND ar.is_active = true
    );
$$;

COMMENT ON FUNCTION public.is_jwt_platform_admin() IS
  'Bootstrap أو صف نشط في platform_admin_roles — لا يستبدل فحص المفتاح الدقيق في السياسات الجديدة.';

REVOKE ALL ON FUNCTION public.is_jwt_platform_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_jwt_platform_admin() TO authenticated;

-- ----- 3) سجل أمان الحجز -----
CREATE TABLE IF NOT EXISTS public.platform_booking_security_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  severity text NOT NULL DEFAULT 'warn',
  event_code text NOT NULL,
  message text,
  barber_id uuid REFERENCES public.barbers(id) ON DELETE SET NULL,
  detail jsonb
);

CREATE INDEX IF NOT EXISTS platform_booking_security_log_created_idx
  ON public.platform_booking_security_log (created_at DESC);

COMMENT ON TABLE public.platform_booking_security_log IS
  'أحداث أمان مرتبطة بـ create_booking_safe (تعارض، دور غير مسموح، إلخ). قراءة من لوحة الإدارة بصلاحية view_overview أو manage_barbers.';

ALTER TABLE public.platform_booking_security_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_booking_security_log_admin_select" ON public.platform_booking_security_log;
CREATE POLICY "platform_booking_security_log_admin_select"
  ON public.platform_booking_security_log
  FOR SELECT
  TO authenticated
  USING (
    public.is_bootstrap_platform_admin()
    OR public.jwt_platform_admin_has_permission('view_overview')
    OR public.jwt_platform_admin_has_permission('manage_barbers')
  );

CREATE OR REPLACE FUNCTION public.log_booking_security_event(
  p_severity text,
  p_event_code text,
  p_message text,
  p_barber_id uuid DEFAULT NULL,
  p_detail jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.platform_booking_security_log (severity, event_code, message, barber_id, detail)
  VALUES (
    COALESCE(NULLIF(btrim(p_severity), ''), 'warn'),
    COALESCE(NULLIF(btrim(p_event_code), ''), 'unknown'),
    COALESCE(NULLIF(btrim(p_message), ''), ''),
    p_barber_id,
    p_detail
  );
END;
$$;

REVOKE ALL ON FUNCTION public.log_booking_security_event(text, text, text, uuid, jsonb) FROM PUBLIC;

-- ----- 4) سياسات JWT الإدارية — استبدال is_jwt_platform_admin بفحوص المفاتيح -----

-- registration_submissions
DROP POLICY IF EXISTS "jwt_admin_select_registration_submissions" ON public.registration_submissions;
CREATE POLICY "jwt_admin_select_registration_submissions"
  ON public.registration_submissions FOR SELECT TO authenticated
  USING (
    public.jwt_platform_admin_has_permission('view_requests')
    OR public.jwt_platform_admin_has_permission('review_requests')
    OR public.jwt_platform_admin_has_permission('manage_barbers')
  );

DROP POLICY IF EXISTS "jwt_admin_update_registration_submissions" ON public.registration_submissions;
CREATE POLICY "jwt_admin_update_registration_submissions"
  ON public.registration_submissions FOR UPDATE TO authenticated
  USING (
    public.jwt_platform_admin_has_permission('review_requests')
    OR public.jwt_platform_admin_has_permission('manage_barbers')
  )
  WITH CHECK (
    public.jwt_platform_admin_has_permission('review_requests')
    OR public.jwt_platform_admin_has_permission('manage_barbers')
  );

DROP POLICY IF EXISTS "jwt_admin_delete_registration_submissions" ON public.registration_submissions;
CREATE POLICY "jwt_admin_delete_registration_submissions"
  ON public.registration_submissions FOR DELETE TO authenticated
  USING (public.jwt_platform_admin_has_permission('manage_barbers'));

-- barbers
DROP POLICY IF EXISTS "jwt_admin_select_all_barbers" ON public.barbers;
CREATE POLICY "jwt_admin_select_all_barbers"
  ON public.barbers FOR SELECT TO authenticated
  USING (
    public.jwt_platform_admin_has_permission('view_barbers')
    OR public.jwt_platform_admin_has_permission('manage_barbers')
    OR public.jwt_platform_admin_has_permission('view_overview')
  );

DROP POLICY IF EXISTS "jwt_admin_update_any_barber" ON public.barbers;
CREATE POLICY "jwt_admin_update_any_barber"
  ON public.barbers FOR UPDATE TO authenticated
  USING (public.jwt_platform_admin_has_permission('manage_barbers'))
  WITH CHECK (public.jwt_platform_admin_has_permission('manage_barbers'));

DROP POLICY IF EXISTS "jwt_admin_insert_any_barber" ON public.barbers;
CREATE POLICY "jwt_admin_insert_any_barber"
  ON public.barbers FOR INSERT TO authenticated
  WITH CHECK (public.jwt_platform_admin_has_permission('manage_barbers'));

DROP POLICY IF EXISTS "jwt_admin_delete_any_barber" ON public.barbers;
CREATE POLICY "jwt_admin_delete_any_barber"
  ON public.barbers FOR DELETE TO authenticated
  USING (public.jwt_platform_admin_has_permission('manage_barbers'));

-- payments
DROP POLICY IF EXISTS "jwt_admin_select_all_payments" ON public.payments;
CREATE POLICY "jwt_admin_select_all_payments"
  ON public.payments FOR SELECT TO authenticated
  USING (
    public.jwt_platform_admin_has_permission('view_payments')
    OR public.jwt_platform_admin_has_permission('review_payments')
  );

DROP POLICY IF EXISTS "jwt_admin_update_payments" ON public.payments;
CREATE POLICY "jwt_admin_update_payments"
  ON public.payments FOR UPDATE TO authenticated
  USING (public.jwt_platform_admin_has_permission('review_payments'))
  WITH CHECK (public.jwt_platform_admin_has_permission('review_payments'));

-- profiles (إحصائيات المستخدمين)
DROP POLICY IF EXISTS "jwt_admin_select_profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;
CREATE POLICY "profiles_admin_select_all"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.jwt_platform_admin_has_permission('view_overview'));

-- bookings (إحصائيات المواعيد للإدارة)
DROP POLICY IF EXISTS "jwt_admin_select_bookings" ON public.bookings;
CREATE POLICY "jwt_admin_select_bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (public.jwt_platform_admin_has_permission('view_overview'));

-- ----- 5) admin_users إن وُجد — إدارة صارمة بـ manage_admins -----
DO $$
BEGIN
  IF to_regclass('public.admin_users') IS NULL THEN
    RETURN;
  END IF;
  DROP POLICY IF EXISTS "admin_users_admin_all" ON public.admin_users;
  CREATE POLICY "admin_users_admin_all"
    ON public.admin_users
    FOR ALL
    TO authenticated
    USING (public.jwt_platform_admin_has_permission('manage_admins'))
    WITH CHECK (public.jwt_platform_admin_has_permission('manage_admins'));
END
$$;

-- ----- 6) create_booking_safe مع تسجيل أحداث الأمان -----
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
    PERFORM public.log_booking_security_event(
      'critical',
      'role_not_allowed',
      'create_booking_safe: role not allowed',
      p_barber_id,
      jsonb_build_object('auth_role', auth.role())
    );
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
    PERFORM public.log_booking_security_event(
      'warn',
      'barber_not_found',
      'create_booking_safe: barber not found (possible probe)',
      p_barber_id,
      jsonb_build_object('customer_id', v_customer_id)
    );
    RAISE EXCEPTION 'create_booking_safe: barber not found'
      USING ERRCODE = '23503';
  END IF;

  IF v_customer_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = v_customer_id) THEN
      PERFORM public.log_booking_security_event(
        'warn',
        'profile_not_found',
        'create_booking_safe: profile not found',
        p_barber_id,
        jsonb_build_object('customer_id', v_customer_id)
      );
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
      PERFORM public.log_booking_security_event(
        'warn',
        'booking_overlap_denied',
        'create_booking_safe: slot overlaps existing booking',
        p_barber_id,
        jsonb_build_object(
          'booking_date', p_booking_date,
          'booking_time', p_booking_time,
          'conflict_booking_id', b.id
        )
      );
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
  'Creates a booking with advisory lock + overlap check; logs security-relevant denials to platform_booking_security_log.';

REVOKE ALL ON FUNCTION public.create_booking_safe(
  uuid, text, text, text, date, time, text, numeric, integer, text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_booking_safe(
  uuid, text, text, text, date, time, text, numeric, integer, text
) TO authenticated, anon;
