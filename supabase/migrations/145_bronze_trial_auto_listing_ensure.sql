-- ضمان إدراج نشط لأي صالون مرتبط بتجربة برونزي بلا entitlement
-- يغطي: تسجيل رسمي أنشأ barber قبل استرداد HM-TRY

CREATE OR REPLACE FUNCTION public.ensure_bronze_trial_listing_for_barber(p_barber_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_code_id uuid;
  v_product_id uuid;
  v_order_id uuid;
  v_entitlement_id uuid;
  v_now timestamptz := now();
  v_until timestamptz := now() + interval '30 days';
BEGIN
  IF p_barber_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF public.barber_has_active_listing(p_barber_id) THEN
    RETURN NULL;
  END IF;

  SELECT lower(trim(email)) INTO v_email FROM public.barbers WHERE id = p_barber_id;
  IF v_email IS NULL OR position('@' in v_email) = 0 THEN
    RETURN NULL;
  END IF;

  -- كود مسترد بلا entitlement
  SELECT c.id INTO v_code_id
  FROM public.bronze_trial_codes c
  WHERE c.redeemed_barber_id = p_barber_id
    AND c.status = 'redeemed'
    AND c.redeemed_entitlement_id IS NULL
  ORDER BY c.created_at DESC
  LIMIT 1;

  -- كود صادر مربوط بالإيميل
  IF v_code_id IS NULL THEN
    SELECT c.id INTO v_code_id
    FROM public.bronze_trial_codes c
    WHERE c.status = 'issued'
      AND lower(trim(c.bound_email)) = v_email
    ORDER BY c.created_at DESC
    LIMIT 1;
  END IF;

  -- كود طلب تجربة موافق عليه
  IF v_code_id IS NULL THEN
    SELECT c.id INTO v_code_id
    FROM public.bronze_trial_applications a
    JOIN public.bronze_trial_codes c ON c.id = a.trial_code_id
    WHERE a.status = 'approved'
      AND lower(trim(a.email)) = v_email
      AND (
        c.status = 'issued'
        OR (c.status = 'redeemed' AND c.redeemed_entitlement_id IS NULL)
      )
    ORDER BY a.created_at DESC
    LIMIT 1;
  END IF;

  IF v_code_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO v_product_id
  FROM public.listing_license_products
  WHERE sku_code = 'bronze_30'
  LIMIT 1;

  IF v_product_id IS NULL THEN
    RAISE EXCEPTION 'bronze_30 product missing';
  END IF;

  INSERT INTO public.listing_license_orders (
    product_id, buyer_email, barber_id, payment_channel, payment_reference,
    amount_halalas, currency, status, paid_at, metadata
  ) VALUES (
    v_product_id, v_email, p_barber_id, 'bronze_trial',
    'trial:' || v_code_id::text || ':sql_ensure',
    0, 'SAR', 'paid', v_now,
    jsonb_build_object('product', 'bronze_trial', 'auto_ensure', true, 'trial_code_id', v_code_id)
  )
  RETURNING id INTO v_order_id;

  INSERT INTO public.barber_listing_entitlements (
    barber_id, product_id, order_id, tier, listing_days_granted,
    valid_from, valid_until, source
  ) VALUES (
    p_barber_id, v_product_id, v_order_id, 'bronze', 30,
    v_now, v_until, 'bronze_trial_code'
  )
  RETURNING id INTO v_entitlement_id;

  INSERT INTO public.listing_license_redemption_events (
    voucher_id, barber_id, entitlement_id, event_type
  ) VALUES (
    NULL, p_barber_id, v_entitlement_id, 'bronze_trial'
  );

  UPDATE public.barbers
  SET is_active = true,
      is_verified = true,
      open_for_customers = true,
      tier = CASE
        WHEN tier IN ('gold', 'diamond') THEN tier
        ELSE 'bronze'
      END,
      updated_at = v_now
  WHERE id = p_barber_id;

  UPDATE public.bronze_trial_codes
  SET status = 'redeemed',
      redeemed_at = COALESCE(redeemed_at, v_now),
      redeemed_barber_id = p_barber_id,
      redeemed_order_id = v_order_id,
      redeemed_entitlement_id = v_entitlement_id,
      updated_at = v_now
  WHERE id = v_code_id;

  RETURN v_entitlement_id;
END;
$$;

COMMENT ON FUNCTION public.ensure_bronze_trial_listing_for_barber IS
  'يمنح إدراج برونزي 30 يوماً إن وُجد كود تجربة مؤهل للحلاق ولا إدراج نشط.';

REVOKE ALL ON FUNCTION public.ensure_bronze_trial_listing_for_barber(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_bronze_trial_listing_for_barber(uuid) TO service_role;

-- ترحيل: كل حلاق مرتبط بطلب تجربة موافق عليه بلا إدراج نشط
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT DISTINCT b.id AS barber_id
    FROM public.bronze_trial_applications a
    JOIN public.barbers b ON lower(trim(b.email)) = lower(trim(a.email))
    WHERE a.status = 'approved'
      AND NOT public.barber_has_active_listing(b.id)
  LOOP
    PERFORM public.ensure_bronze_trial_listing_for_barber(r.barber_id);
  END LOOP;

  FOR r IN
    SELECT DISTINCT c.redeemed_barber_id AS barber_id
    FROM public.bronze_trial_codes c
    WHERE c.status = 'redeemed'
      AND c.redeemed_barber_id IS NOT NULL
      AND c.redeemed_entitlement_id IS NULL
      AND NOT public.barber_has_active_listing(c.redeemed_barber_id)
  LOOP
    PERFORM public.ensure_bronze_trial_listing_for_barber(r.barber_id);
  END LOOP;
END $$;
