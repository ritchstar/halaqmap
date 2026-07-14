/**
 * برنامج الشريك المرجعي — قرارات مغلقة لصالون العنوان (12 فرعاً).
 * مصدر حقيقة للمنتج والعمليات؛ لا تُغيَّر دون موافقة تجارية صريحة.
 */

export const ANCHOR_PARTNER_AL_ENWAN_SLUG = 'al_enwan' as const;

/** مدة المنحة لكل فرع من تاريخ تفعيله (يوماً). */
export const ANCHOR_LISTING_DAYS = 180;

/** عدد المقاعد المستقلة (فرع = حساب). */
export const ANCHOR_SEAT_QUOTA = 12;

/** SKU الرخصة الماسية 180 يوماً في listing_license_products. */
export const ANCHOR_PRODUCT_SKU = 'diamond_180' as const;

/**
 * ائتمان تشغيلي لمحفظة المناوب عند تفعيل المقعد (هللات).
 * 50 ر.س ≈ ~33 رداً آلياً — تمويل المنصة خلال التجربة؛ لا محفظة مشتركة بين الفروع.
 */
export const ANCHOR_WALLET_SEED_HALALAS = 5000;

/** تنبيه انتهاء قبل N يوماً. */
export const ANCHOR_EXPIRY_WARN_DAYS = 30;

/** طبقة A — تشغيل فوري دون تفريع منتج. */
export const ANCHOR_PERKS_TIER_A = [
  'أولوية مراجعة تسجيل الفروع في طابور الأدمن',
  'مدير حساب مخصّص لفترة التجربة',
  'تدريب المكتب الخاص والمناوب الرقمي لمديري الفروع',
  'توجيهات أسطول (Fleet) مخصّصة لعلامة العنوان عبر المدير العام للمناوبين',
] as const;

/** طبقة B — منتج داخل المنصة مربوط بـ cohort_id. */
export const ANCHOR_PERKS_TIER_B = [
  'شارة شريك مرجعي على حسابات الفروع المفعّلة',
  'حزمة تعليمات علامة موحّدة تُنسخ لكل فرع عند التفعيل (بدون حساب مشترك)',
  'تقارير HQ للقراءة فقط: حالة الرخصة والمناوب والرصيد — دون محادثات الزبائن',
] as const;

/** طبقة C — مؤجّلة حتى عقد تحويل مدفوع. */
export const ANCHOR_PERKS_TIER_C_DEFERRED = [
  'واجهة بيضاء / تخصيص علامة كامل',
  'تكامل POS أو أنظمة تشغيل خاصة',
  'قواعد منتج لا تنطبق على بقية الشركاء',
  'حصرية جغرافية مطلقة',
] as const;

export type AnchorWalletFundingPolicy = 'platform_seed_per_seat';
export type AnchorConversionPolicy = 'individual_or_bundle_offer_before_expiry';
export type AnchorGrantClock = 'from_each_seat_activation';

/** قرارات تجارية مغلقة (افتراضات الخطة). */
export const ANCHOR_COMMERCIAL = {
  walletFunding: 'platform_seed_per_seat' as AnchorWalletFundingPolicy,
  walletSeedHalalas: ANCHOR_WALLET_SEED_HALALAS,
  conversion: 'individual_or_bundle_offer_before_expiry' as AnchorConversionPolicy,
  grantClock: 'from_each_seat_activation' as AnchorGrantClock,
  /** حق استخدام الاسم/الصور كقصة نجاح — يُفعَّل فقط بموافقة مكتوبة في المذكرة. */
  marketingCaseStudyAllowedDefault: false,
  noSilentExtension: true,
  independentAccountsOnly: true,
  noSharedWallet: true,
  noCrossBranchCustomerData: true,
} as const;

export const AL_ENWAN_BRAND_INSTRUCTION_SEEDS = [
  'قدّم الصالون كوجهة رجالية فاخرة — لا تذكر خدمات نسائية أو unisex.',
  'عند السؤال عن العروض: ذكّر بعروض الفرع المسجّلة في تعليمات المكتب الخاص فقط؛ لا تختلق أسعاراً.',
  'للهجة: مهنية دافئة بالعربية؛ إن كتب الزبون بغير العربية ردّ بلغته مع الحفاظ على هوية الصالون.',
] as const;

export const AL_ENWAN_COHORT_NAME_AR = 'صالون العنوان — شريك مرجعي';
