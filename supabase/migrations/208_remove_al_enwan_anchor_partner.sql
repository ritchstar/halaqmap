-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- إزالة نهائية لشريك صالون العنوان (al_enwan) وكل ما يرتبط به من منح ومقاعد.

DO $$
DECLARE
  v_cohort_id UUID;
BEGIN
  IF to_regclass('public.enterprise_partner_cohorts') IS NULL THEN
    RAISE NOTICE 'enterprise_partner_cohorts absent — skip al_enwan purge';
    RETURN;
  END IF;

  SELECT id INTO v_cohort_id
  FROM public.enterprise_partner_cohorts
  WHERE slug = 'al_enwan'
  LIMIT 1;

  IF v_cohort_id IS NULL THEN
    RAISE NOTICE 'al_enwan cohort already absent — nothing to purge';
    RETURN;
  END IF;

  -- إلغاء صلاحيات الرخصة الصادرة من مقاعد هذا الشريك
  UPDATE public.barber_listing_entitlements e
  SET revoked_at = COALESCE(e.revoked_at, NOW())
  FROM public.enterprise_cohort_seats s
  WHERE s.cohort_id = v_cohort_id
    AND s.entitlement_id IS NOT NULL
    AND e.id = s.entitlement_id
    AND e.revoked_at IS NULL;

  UPDATE public.barber_listing_entitlements e
  SET revoked_at = COALESCE(e.revoked_at, NOW())
  FROM public.listing_license_orders o
  WHERE o.payment_channel = 'enterprise_cohort'
    AND (
      o.payment_reference LIKE 'anchor:al_enwan:%'
      OR (o.metadata ? 'cohort_slug' AND o.metadata->>'cohort_slug' = 'al_enwan')
      OR (o.metadata ? 'cohort_id' AND o.metadata->>'cohort_id' = v_cohort_id::text)
    )
    AND e.order_id = o.id
    AND e.source = 'enterprise_cohort_grant'
    AND e.revoked_at IS NULL;

  -- تعطيل المناوب وإزالة شارة الشريك المرجعي من الفروع المرتبطة
  UPDATE public.barber_digital_shift_config cfg
  SET
    enabled = FALSE,
    banner_snapshot = (
      CASE
        WHEN cfg.banner_snapshot IS NULL THEN '{}'::jsonb
        WHEN jsonb_typeof(cfg.banner_snapshot) = 'object' THEN cfg.banner_snapshot
        ELSE '{}'::jsonb
      END
    ) - 'anchor_partner' - 'anchor_cohort_slug',
    updated_at = NOW()
  FROM public.enterprise_cohort_seats s
  WHERE s.cohort_id = v_cohort_id
    AND s.barber_id IS NOT NULL
    AND cfg.barber_id = s.barber_id;

  UPDATE public.barber_digital_shift_config cfg
  SET
    banner_snapshot = (
      CASE
        WHEN cfg.banner_snapshot IS NULL THEN '{}'::jsonb
        WHEN jsonb_typeof(cfg.banner_snapshot) = 'object' THEN cfg.banner_snapshot
        ELSE '{}'::jsonb
      END
    ) - 'anchor_partner' - 'anchor_cohort_slug',
    updated_at = NOW()
  WHERE cfg.banner_snapshot->>'anchor_cohort_slug' = 'al_enwan';

  -- إخفاء تعليمات العلامة المنسوخة من بذرة العنوان
  UPDATE public.barber_ai_recommendations r
  SET status = 'dismissed'
  FROM public.enterprise_cohort_seats s
  WHERE s.cohort_id = v_cohort_id
    AND s.barber_id IS NOT NULL
    AND r.barber_id = s.barber_id
    AND r.category = 'private_office_instruction'
    AND r.status = 'active'
    AND COALESCE(r.metadata->>'source', '') = 'enterprise_cohort_brand';

  -- عكس بذرة المحفظة التشغيلية إن وُجدت ولم تُستهلك بالكامل (خصم بمقدار الائتمان الأصلي فقط حتى لا يصبح الرصيد سالباً)
  WITH seed_tx AS (
    SELECT
      t.id AS tx_id,
      t.barber_id,
      t.amount_halalas,
      s.id AS seat_id
    FROM public.enterprise_cohort_seats s
    JOIN public.barber_ai_wallet_transactions t
      ON t.barber_id = s.barber_id
     AND t.direction = 'credit'
     AND t.reason = 'enterprise_cohort_seed:' || s.id::text
    WHERE s.cohort_id = v_cohort_id
  ),
  wallet_debit AS (
    UPDATE public.barber_ai_wallet w
    SET
      balance_halalas = GREATEST(0, COALESCE(w.balance_halalas, 0) - st.amount_halalas),
      updated_at = NOW()
    FROM seed_tx st
    WHERE w.barber_id = st.barber_id
    RETURNING w.barber_id, st.amount_halalas, st.seat_id
  )
  INSERT INTO public.barber_ai_wallet_transactions (
    barber_id,
    amount_halalas,
    direction,
    reason,
    metadata
  )
  SELECT
    wd.barber_id,
    wd.amount_halalas,
    'debit',
    'enterprise_cohort_seed_reversal:' || wd.seat_id::text,
    jsonb_build_object(
      'source', 'al_enwan_purge',
      'seat_id', wd.seat_id,
      'cohort_slug', 'al_enwan'
    )
  FROM wallet_debit wd
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.barber_ai_wallet_transactions x
    WHERE x.barber_id = wd.barber_id
      AND x.direction = 'debit'
      AND x.reason = 'enterprise_cohort_seed_reversal:' || wd.seat_id::text
  );

  -- أوامر الرخصة المرتبطة بالشريك
  UPDATE public.listing_license_orders o
  SET
    status = CASE WHEN o.status = 'paid' THEN 'cancelled' ELSE o.status END,
    metadata = COALESCE(o.metadata, '{}'::jsonb) || jsonb_build_object(
      'al_enwan_purged_at', NOW()::text,
      'purge_reason', 'anchor_partner_removed'
    )
  WHERE o.payment_channel = 'enterprise_cohort'
    AND (
      o.payment_reference LIKE 'anchor:al_enwan:%'
      OR (o.metadata ? 'cohort_slug' AND o.metadata->>'cohort_slug' = 'al_enwan')
      OR (o.metadata ? 'cohort_id' AND o.metadata->>'cohort_id' = v_cohort_id::text)
    );

  -- حذف المجموعة (CASCADE على المقاعد)
  DELETE FROM public.enterprise_partner_cohorts
  WHERE id = v_cohort_id;

  RAISE NOTICE 'purged al_enwan anchor partner cohort %', v_cohort_id;
END $$;
