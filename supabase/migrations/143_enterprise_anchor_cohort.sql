-- برنامج الشريك المرجعي (Anchor Partner Cohort)
-- صالون العنوان: 12 مقعداً × ماسي 180 يوماً + مناوب/مكتب خاص
-- كل فرع = حساب مستقل؛ لا محفظة مشتركة ولا بيانات زبائن مشتركة

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
      'enterprise_cohort_grant'
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
      'enterprise_cohort'
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
      'enterprise_cohort'
    )
  );

CREATE TABLE IF NOT EXISTS public.enterprise_partner_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  seat_quota INTEGER NOT NULL CHECK (seat_quota > 0 AND seat_quota <= 100),
  listing_days_granted INTEGER NOT NULL DEFAULT 180 CHECK (listing_days_granted > 0),
  tier TEXT NOT NULL DEFAULT 'diamond' CHECK (tier = 'diamond'),
  product_sku TEXT NOT NULL DEFAULT 'diamond_180',
  digital_shift_included BOOLEAN NOT NULL DEFAULT TRUE,
  wallet_seed_halalas INTEGER NOT NULL DEFAULT 5000 CHECK (wallet_seed_halalas >= 0),
  wallet_funding_policy TEXT NOT NULL DEFAULT 'platform_seed_per_seat',
  conversion_policy TEXT NOT NULL DEFAULT 'individual_or_bundle_offer_before_expiry',
  grant_clock TEXT NOT NULL DEFAULT 'from_each_seat_activation',
  marketing_case_study_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  perks_tier_a JSONB NOT NULL DEFAULT '[]'::jsonb,
  perks_tier_b JSONB NOT NULL DEFAULT '[]'::jsonb,
  perks_tier_c_deferred JSONB NOT NULL DEFAULT '[]'::jsonb,
  brand_instruction_seeds JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'ended')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.enterprise_partner_cohorts IS
  'شركاء مرجعيون متعدد الفروع — مقاعد مستقلة؛ المنح عبر enterprise_cohort_seats.';

CREATE TABLE IF NOT EXISTS public.enterprise_cohort_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES public.enterprise_partner_cohorts (id) ON DELETE CASCADE,
  seat_index INTEGER NOT NULL CHECK (seat_index >= 1),
  branch_label TEXT,
  bound_email TEXT,
  status TEXT NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved', 'assigned', 'activated', 'expired', 'revoked')),
  barber_id UUID REFERENCES public.barbers (id) ON DELETE SET NULL,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  order_id UUID REFERENCES public.listing_license_orders (id) ON DELETE SET NULL,
  entitlement_id UUID REFERENCES public.barber_listing_entitlements (id) ON DELETE SET NULL,
  activated_by_admin_email TEXT,
  revoke_reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cohort_id, seat_index)
);

COMMENT ON TABLE public.enterprise_cohort_seats IS
  'مقاعد الشريك المرجعي — كل مقعد يفعّل حساب حلاق مستقل لماسي+مناوب لمدة listing_days.';

CREATE INDEX IF NOT EXISTS enterprise_cohort_seats_cohort_status_idx
  ON public.enterprise_cohort_seats (cohort_id, status);

CREATE INDEX IF NOT EXISTS enterprise_cohort_seats_barber_idx
  ON public.enterprise_cohort_seats (barber_id)
  WHERE barber_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS enterprise_cohort_seats_expires_idx
  ON public.enterprise_cohort_seats (expires_at)
  WHERE status = 'activated' AND expires_at IS NOT NULL;

-- بذرة صالون العنوان + 12 مقعداً
INSERT INTO public.enterprise_partner_cohorts (
  slug,
  name_ar,
  seat_quota,
  listing_days_granted,
  tier,
  product_sku,
  digital_shift_included,
  wallet_seed_halalas,
  wallet_funding_policy,
  conversion_policy,
  grant_clock,
  marketing_case_study_allowed,
  perks_tier_a,
  perks_tier_b,
  perks_tier_c_deferred,
  brand_instruction_seeds,
  status,
  notes
) VALUES (
  'al_enwan',
  'صالون العنوان — شريك مرجعي',
  12,
  180,
  'diamond',
  'diamond_180',
  TRUE,
  5000,
  'platform_seed_per_seat',
  'individual_or_bundle_offer_before_expiry',
  'from_each_seat_activation',
  FALSE,
  '["أولوية مراجعة تسجيل الفروع في طابور الأدمن","مدير حساب مخصّص لفترة التجربة","تدريب المكتب الخاص والمناوب الرقمي لمديري الفروع","توجيهات أسطول (Fleet) مخصّصة لعلامة العنوان عبر المدير العام للمناوبين"]'::jsonb,
  '["شارة شريك مرجعي على حسابات الفروع المفعّلة","حزمة تعليمات علامة موحّدة تُنسخ لكل فرع عند التفعيل (بدون حساب مشترك)","تقارير HQ للقراءة فقط: حالة الرخصة والمناوب والرصيد — دون محادثات الزبائن"]'::jsonb,
  '["واجهة بيضاء / تخصيص علامة كامل","تكامل POS أو أنظمة تشغيل خاصة","قواعد منتج لا تنطبق على بقية الشركاء","حصرية جغرافية مطلقة"]'::jsonb,
  '["قدّم الصالون كوجهة رجالية فاخرة — لا تذكر خدمات نسائية أو unisex.","عند السؤال عن العروض: ذكّر بعروض الفرع المسجّلة في تعليمات المكتب الخاص فقط؛ لا تختلق أسعاراً.","للهجة: مهنية دافئة بالعربية؛ إن كتب الزبون بغير العربية ردّ بلغته مع الحفاظ على هوية الصالون."]'::jsonb,
  'active',
  'اتفاق مبدئي: 12 فرعاً × ماسي + مكتب خاص × 6 أشهر — حساب مستقل لكل فرع.'
)
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  seat_quota = EXCLUDED.seat_quota,
  listing_days_granted = EXCLUDED.listing_days_granted,
  wallet_seed_halalas = EXCLUDED.wallet_seed_halalas,
  perks_tier_a = EXCLUDED.perks_tier_a,
  perks_tier_b = EXCLUDED.perks_tier_b,
  perks_tier_c_deferred = EXCLUDED.perks_tier_c_deferred,
  brand_instruction_seeds = EXCLUDED.brand_instruction_seeds,
  updated_at = NOW();

INSERT INTO public.enterprise_cohort_seats (cohort_id, seat_index, branch_label, status)
SELECT c.id, g.n, 'فرع ' || g.n::text, 'reserved'
FROM public.enterprise_partner_cohorts c
CROSS JOIN generate_series(1, 12) AS g(n)
WHERE c.slug = 'al_enwan'
ON CONFLICT (cohort_id, seat_index) DO NOTHING;

ALTER TABLE public.enterprise_partner_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_cohort_seats ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.enterprise_partner_cohorts FROM anon, authenticated;
REVOKE ALL ON public.enterprise_cohort_seats FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enterprise_partner_cohorts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enterprise_cohort_seats TO service_role;
