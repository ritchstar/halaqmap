-- منحة المؤسس: تفعيل 90 يوماً بدون دفع (founder_comp)

-- توسيع مصادر الصلاحية
ALTER TABLE public.barber_listing_entitlements
  DROP CONSTRAINT IF EXISTS barber_listing_entitlements_source_check;

ALTER TABLE public.barber_listing_entitlements
  ADD CONSTRAINT barber_listing_entitlements_source_check CHECK (
    source IN (
      'voucher_redemption',
      'moyasar_auto_redeem',
      'admin_voucher_issue',
      'legacy_subscription_migration',
      'admin_payment_approve',
      'registration_approval_auto_redeem',
      'bronze_trial_code',
      'enterprise_cohort_grant',
      'founder_comp_grant'
    )
  );

ALTER TABLE public.listing_license_orders
  DROP CONSTRAINT IF EXISTS listing_license_orders_payment_channel_check;

ALTER TABLE public.listing_license_orders
  ADD CONSTRAINT listing_license_orders_payment_channel_check CHECK (
    payment_channel IN (
      'moyasar',
      'bank_transfer',
      'admin_manual',
      'legacy_migration',
      'bronze_trial',
      'enterprise_cohort',
      'founder_comp'
    )
  );

ALTER TABLE public.listing_license_redemption_events
  DROP CONSTRAINT IF EXISTS listing_license_redemption_events_event_type_check;

ALTER TABLE public.listing_license_redemption_events
  ADD CONSTRAINT listing_license_redemption_events_event_type_check CHECK (
    event_type IN (
      'redeem',
      'auto_redeem',
      'admin_grant',
      'migration',
      'bronze_trial',
      'enterprise_cohort',
      'founder_comp'
    )
  );

-- SKU لمدة 90 يوماً (سعر اسمي؛ الطلب المؤسسي amount_halalas = 0)
INSERT INTO public.listing_license_products (
  sku_code, tier, listing_days_granted, price_sar, amount_halalas, service_description_ar
) VALUES
  ('bronze_90', 'bronze', 90, 300.00, 30000, 'حزمة رخصة — إدراج برونزي 90 يوماً (منحة مؤسسية)'),
  ('gold_90', 'gold', 90, 450.00, 45000, 'حزمة رخصة — إدراج ذهبي 90 يوماً (منحة مؤسسية)'),
  ('diamond_90', 'diamond', 90, 600.00, 60000, 'حزمة رخصة — إدراج ماسي 90 يوماً (منحة مؤسسية)')
ON CONFLICT (sku_code) DO UPDATE SET
  listing_days_granted = EXCLUDED.listing_days_granted,
  price_sar = EXCLUDED.price_sar,
  amount_halalas = EXCLUDED.amount_halalas,
  service_description_ar = EXCLUDED.service_description_ar,
  updated_at = NOW();
