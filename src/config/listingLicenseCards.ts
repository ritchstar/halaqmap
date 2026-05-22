import { SubscriptionTier } from '@/lib';
import {
  DIAMOND_ADDON_OPTION_LINE_AR,
  DIAMOND_LICENSE_TECHNICAL_VALUE_AR,
  SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR,
  SOFTWARE_PACKAGE_UNIT_LABEL_AR,
  SOFTWARE_PACKAGE_VALIDITY_LABEL_AR,
  TIER_MONTHLY_SAR,
} from '@/config/subscriptionPricing';

export const LISTING_LICENSE_LEGAL_FOOTNOTE =
  'تنبيه نظامي: جميع الباقات المذكورة هي حزم رخصة رقمية موحدة لخدمات الإدراج البرمجية على نظام الرصد الذكي التفاعلي لمنصة حلاق ماب (نشاط رقم 474151). المنتجات مسبقة الدفع وغير قابلة للإلغاء بعد التفعيل، ولا تشمل أي عمولات أو وساطة حجز.';

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
    subtitleAr: 'بداية ذكية ليظهر صالونك لعملاء الحي في لحظة البحث',
    priceSar: TIER_MONTHLY_SAR[SubscriptionTier.BRONZE],
    packageUnitLabelAr: SOFTWARE_PACKAGE_UNIT_LABEL_AR,
    validityLabel: SOFTWARE_PACKAGE_VALIDITY_LABEL_AR,
    highlights: [
      'ظهور محلي موثوق عندما يبحث العميل عن صالون قريب',
      'بطاقة تعريف واضحة: موقع، اتصال، واتساب، وصور أساسية',
      'حالة مفتوح/مغلق سهلة التحديث لتقليل الاتصالات غير المناسبة',
      'خيار مناسب لبداية رسمية ومنظمة على حلاق ماب',
    ],
  },
  {
    tier: SubscriptionTier.DIAMOND,
    tierQuery: 'diamond',
    accent: 'diamond',
    title: 'ماسي',
    nameAr: 'الباقة الماسية',
    badge: '💎',
    premiumRibbonAr: 'أقوى رخصة تقنية + Add-on اختياري',
    productTitleAr: SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR,
    subtitleAr: DIAMOND_LICENSE_TECHNICAL_VALUE_AR,
    priceSar: TIER_MONTHLY_SAR[SubscriptionTier.DIAMOND],
    packageUnitLabelAr: SOFTWARE_PACKAGE_UNIT_LABEL_AR,
    validityLabel: SOFTWARE_PACKAGE_VALIDITY_LABEL_AR,
    highlights: [
      'تمييز ماسي في الظهور — واجهة نخبة وبنر فاخر وشارة صدارة',
      'معرض أعمال حتى 40 صورة مع شات مترجم وإدارة مواعيد من اللوحة',
      'أعلى مستوى رخصة تقنية للإدراج الجغرافي على نظام الرصد الذكي',
      DIAMOND_ADDON_OPTION_LINE_AR,
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
    subtitleAr: 'ظهور أقوى وثقة أعلى للصالونات الجاهزة لاستقبال طلب أكبر',
    priceSar: TIER_MONTHLY_SAR[SubscriptionTier.GOLD],
    packageUnitLabelAr: SOFTWARE_PACKAGE_UNIT_LABEL_AR,
    validityLabel: SOFTWARE_PACKAGE_VALIDITY_LABEL_AR,
    highlights: [
      'إبراز ذهبي يرفع وضوح صالونك داخل نتائج القرب',
      'معرض موسّع حتى 20 صورة لإقناع العميل قبل الزيارة',
      'QR للتقييم، واتساب، وشات مباشر لزيادة الثقة والتحويل',
      'لوحة تحكم للصور والمنيو والأسعار وأوقات العمل',
    ],
  },
] as const;

/** ترتيب العرض: الماسي في الوسط كخيار استراتيجي */
export const LISTING_LICENSE_PRICING_DISPLAY_ORDER: readonly SubscriptionTier[] = [
  SubscriptionTier.BRONZE,
  SubscriptionTier.DIAMOND,
  SubscriptionTier.GOLD,
];
