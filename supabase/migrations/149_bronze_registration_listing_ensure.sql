-- منح إدراج برونزي 30 يوماً لطلبات التسجيل المعتمدة بلا إدراج نشط.
-- يغطي الفجوة: اعتماد برونزي يفعّل الحساب دون entitlement → يختفي من البحث.

DO $$
DECLARE
  r record;
  v_product_id uuid;
  v_order_id uuid;
  v_now timestamptz := now();
  v_until timestamptz := now() + interval '30 days';
BEGIN
  SELECT id INTO v_product_id
  FROM public.listing_license_products
  WHERE sku_code = 'bronze_30'
  LIMIT 1;

  IF v_product_id IS NULL THEN
    RAISE EXCEPTION 'bronze_30 product missing';
  END IF;

  FOR r IN
    SELECT DISTINCT
      b.id AS barber_id,
      lower(trim(b.email)) AS email,
      rs.id AS registration_id
    FROM public.registration_submissions rs
    JOIN public.barbers b
      ON b.id::text = nullif(trim(rs.payload->>'linkedBarberId'), '')
    WHERE coalesce(rs.payload->>'status', '') = 'approved'
      AND lower(coalesce(nullif(trim(rs.payload->>'tier'), ''), b.tier, 'bronze')) = 'bronze'
      AND b.is_active IS TRUE
      AND NOT public.barber_has_active_listing(b.id)
  LOOP
    INSERT INTO public.listing_license_orders (
      product_id, buyer_email, barber_id, payment_channel, payment_reference,
      amount_halalas, currency, status, paid_at, registration_request_id, metadata
    ) VALUES (
      v_product_id,
      r.email,
      r.barber_id,
      'admin_manual',
      'reg:' || r.registration_id || ':bronze_listing_backfill',
      0, 'SAR', 'paid', v_now,
      r.registration_id,
      jsonb_build_object(
        'product', 'bronze_registration_listing',
        'auto_ensure', true,
        'backfill', true
      )
    )
    RETURNING id INTO v_order_id;

    INSERT INTO public.barber_listing_entitlements (
      barber_id, product_id, order_id, tier, listing_days_granted,
      valid_from, valid_until, source
    ) VALUES (
      r.barber_id, v_product_id, v_order_id, 'bronze', 30,
      v_now, v_until, 'registration_approval_auto_redeem'
    );

    UPDATE public.barbers
    SET is_active = true,
        is_verified = true,
        open_for_customers = true,
        tier = CASE WHEN tier IN ('gold', 'diamond') THEN tier ELSE 'bronze' END,
        updated_at = v_now
    WHERE id = r.barber_id;
  END LOOP;
END $$;
