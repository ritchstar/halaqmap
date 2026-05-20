import { SubscriptionTier } from '@/lib';
import {
  SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR,
  SOFTWARE_PACKAGE_UNIT_LABEL_AR,
  SOFTWARE_PACKAGE_VALIDITY_LABEL_AR,
  TIER_MONTHLY_SAR,
} from '@/config/subscriptionPricing';

export const LISTING_LICENSE_LEGAL_FOOTNOTE =
  'تنبيه نظامي: جميع الباقات المذكورة هي حزم برمجية رقمية موحدة لخدمات الإدراج البرمجية على نظام الرصد الذكي التفاعلي لمنصة حلاق ماب (نشاط رقم 474151). المنتجات مسبقة الدفع وغير قابلة للإلغاء بعد التفعيل، ولا تشمل أي عمولات أو وساطة حجز.';

export type ListingLicenseCardAccent = 'bronze' | 'gold' | 'diamond';

export type ListingLicenseCardConfig = {
  tier: SubscriptionTier;
  tierQuery: string;
  accent: ListingLicenseCardAccent;
  /** مستوى الباقة (برونزي / ذهبي / ماسي) */
  title: string;
  nameAr: string;
  badge: string;
  premiumRibbonAr?: string;
  /** اسم المنتج الموحّد B2B */
  productTitleAr: string;
  subtitleAr: string;
  priceSar: number;
  packageUnitLabelAr: string;
  validityLabel: string;
  highlights: readonly string[];
  digitalShiftAddonAvailable?: boolean;
};

export const LISTING_LICENSE_PRICING_CARDS: readonly ListingLicenseCardConfig[] = [
  {
    tier: SubscriptionTier.BRONZE,
    tierQuery: 'bronze',
    accent: 'bronze',
    title: 'برونزي',
    nameAr: 'برونزي',
    badge: '🥉',
    productTitleAr: SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR,
    subtitleAr: 'مدخل احترافي للتواجد الجغرافي عبر نظام الرصد الذكي',
    priceSar: TIER_MONTHLY_SAR[SubscriptionTier.BRONZE],
    packageUnitLabelAr: SOFTWARE_PACKAGE_UNIT_LABEL_AR,
    validityLabel: SOFTWARE_PACKAGE_VALIDITY_LABEL_AR,
    highlights: [
      'نظام الرصد الذكي — ظهور جغرافي دقيق في محيط الصالون',
      'السيادة الرقمية — ملف تشغيلي واضح تحت سيطرتك',
      'بيانات تواصل وحالة مفتوح/مغلق للعملاء',
    ],
  },
  {
    tier: SubscriptionTier.DIAMOND,
    tierQuery: 'diamond',
    accent: 'diamond',
    title: 'ماسي',
    nameAr: 'الباقة الماسية',
    badge: '💎',
    premiumRibbonAr: 'الاختيار الاستراتيجي',
    productTitleAr: SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR,
    subtitleAr: 'الحزمة الأم للسيادة الرقمية والامتثال التشغيلي B2B',
    priceSar: TIER_MONTHLY_SAR[SubscriptionTier.DIAMOND],
    packageUnitLabelAr: SOFTWARE_PACKAGE_UNIT_LABEL_AR,
    validityLabel: SOFTWARE_PACKAGE_VALIDITY_LABEL_AR,
    highlights: [
      'نظام الرصد الذكي — أعلى أولوية استراتيجية في شبكة المنصة',
      'السيادة الرقمية — حوكمة بيانات وامتثال تشغيلي بمعايير B2B',
      'بوابة الخصوصية (NDMO) — مسار امتثال وتصاريح خصوصية للشركاء',
      'الأتمتة الجغرافية — توسيع ذكي للظهور وإدارة المواقع المرتبطة',
    ],
    digitalShiftAddonAvailable: true,
  },
  {
    tier: SubscriptionTier.GOLD,
    tierQuery: 'gold',
    accent: 'gold',
    title: 'ذهبي',
    nameAr: 'ذهبي',
    badge: '🥇',
    productTitleAr: SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR,
    subtitleAr: 'توسّع موثوق في الظهور الجغرافي والثقة التشغيلية',
    priceSar: TIER_MONTHLY_SAR[SubscriptionTier.GOLD],
    packageUnitLabelAr: SOFTWARE_PACKAGE_UNIT_LABEL_AR,
    validityLabel: SOFTWARE_PACKAGE_VALIDITY_LABEL_AR,
    highlights: [
      'نظام الرصد الذكي — أولوية أعلى في النتائج الجغرافية',
      'السيادة الرقمية — تحكم موسّع في الصور والظهور من لوحة التحكم',
      'تقييمات، واتساب، وشات مباشر مع العملاء',
    ],
  },
] as const;

/** ترتيب العرض: الماسي في الوسط كخيار استراتيجي */
export const LISTING_LICENSE_PRICING_DISPLAY_ORDER: readonly SubscriptionTier[] = [
  SubscriptionTier.BRONZE,
  SubscriptionTier.DIAMOND,
  SubscriptionTier.GOLD,
];
