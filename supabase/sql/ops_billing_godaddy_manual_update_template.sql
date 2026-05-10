-- =============================================================================
-- GoDaddy — قيم فوترة نهائية (Microsoft 365 + تجديد النطاق)
-- =============================================================================
-- العمود الشهري في الجدول: monthly_estimate_sar (ر.س) — لا يوجد monthly_price.
-- نفّذ من Supabase → SQL Editor إن أردت ضبط قاعدة البيانات مباشرة دون انتظار نشر كود.
-- بعد نشر التطبيق، «مزامنة الآن» من لوحة التكاليف تطبّق نفس الأرقام من opsBillingSync.
-- =============================================================================

BEGIN;

UPDATE public.platform_ops_billing_commitments
SET
  display_label = 'GoDaddy — أساسيات البريد Microsoft 365 (admin@halaqmap.com)',
  next_renewal_at = timestamptz '2027-05-01 12:00:00+00',
  monthly_estimate_sar = 29.00,
  amount_currency = 'SAR',
  data_gap_kind = NULL,
  data_gap_message = NULL,
  last_sync_status = 'ok',
  last_sync_error = NULL,
  last_synced_at = now()
WHERE vendor = 'godaddy'
  AND external_stable_key = 'godaddy:m365-email-essentials';

UPDATE public.platform_ops_billing_commitments
SET
  display_label = 'GoDaddy — halaqmap.com (تجديد النطاق — حماية كاملة)',
  next_renewal_at = timestamptz '2029-05-01 12:00:00+00',
  monthly_estimate_sar = 11.66,
  amount_currency = 'SAR',
  data_gap_kind = NULL,
  data_gap_message = NULL,
  last_sync_status = 'ok',
  last_sync_error = NULL,
  last_synced_at = now()
WHERE vendor = 'godaddy'
  AND external_stable_key = 'godaddy:domain-halaqmap-protection';

UPDATE public.platform_ops_billing_commitments
SET
  amount_expected = 0,
  amount_currency = 'SAR',
  monthly_estimate_sar = 0,
  data_gap_kind = NULL,
  data_gap_message = NULL,
  last_sync_status = 'ok',
  last_sync_error = NULL,
  last_synced_at = now()
WHERE vendor = 'godaddy'
  AND external_stable_key = 'godaddy:website-marketing-free';

COMMIT;
