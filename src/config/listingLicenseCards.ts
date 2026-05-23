import { SubscriptionTier } from '@/lib';
import {
  DIAMOND_ADDON_OPTION_LINE_AR,
  DIAMOND_LICENSE_TECHNICAL_VALUE_AR,
  SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR,
  SOFTWARE_PACKAGE_UNIT_LABEL_AR,
  SOFTWARE_PACKAGE_VALIDITY_LABEL_AR,
  TIER_MONTHLY_SAR,
} from '@/config/subscriptionPricing';
import {
  ON_DEMAND_VISIBILITY_LEGAL_DEFINITION_AR,
} from '@/config/onDemandVisibilityDoctrine';

export const LISTING_LICENSE_LEGAL_FOOTNOTE =
  `تنبيه نظامي: جميع الباقات المذكورة هي حزم رخصة نفاذ حلاق ماب الرقمية (نظام الاستجابة الذكية) — نشاط برمجي رقم 474151. ${ON_DEMAND_VISIBILITY_LEGAL_DEFINITION_AR} المنتجات مسبقة الدفع وغير قابلة للإلغاء بعد التفعيل، ولا تشمل أي عمولات أو وساطة حجز.`;

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
    subtitleAr:
      'رخصة نفاذ بداية — يُفعَّل ظهور صالونك برمجياً عند وجود طلب نشط في حيّك',
    priceSar: TIER_MONTHLY_SAR[SubscriptionTier.BRONZE],
    packageUnitLabelAr: SOFTWARE_PACKAGE_UNIT_LABEL_AR,
    validityLabel: SOFTWARE_PACKAGE_VALIDITY_LABEL_AR,
    highlights: [
      'استجابة برمجية موثوقة لكل طلب نشط في محيطك الجغرافي',
      'بطاقة تعريف واضحة: موقع، اتصال، واتساب، وصور أساسية تظهر فور الاستجابة',
      'حالة مفتوح/مغلق سهلة التحديث لرفع كفاءة الاستجابة الذكية',
      'خيار مناسب لبداية رسمية ضمن نظام الاستجابة الذكية على حلاق ماب',
    ],
  },
  {
    tier: SubscriptionTier.DIAMOND,
    tierQuery: 'diamond',
    accent: 'diamond',
    title: 'ماسي',
    nameAr: 'الباقة الماسية',
    badge: '💎',
    premiumRibbonAr: 'أقوى رخصة نفاذ + Add-on اختياري',
    productTitleAr: SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR,
    subtitleAr: DIAMOND_LICENSE_TECHNICAL_VALUE_AR,
    priceSar: TIER_MONTHLY_SAR[SubscriptionTier.DIAMOND],
    packageUnitLabelAr: SOFTWARE_PACKAGE_UNIT_LABEL_AR,
    validityLabel: SOFTWARE_PACKAGE_VALIDITY_LABEL_AR,
    highlights: [
      'تمييز ماسي في الاستجابة — أعلى أولوية ظهور برمجي عند تنشّط الطلب',
      'معرض أعمال حتى 40 صورة مع شات مترجم وإدارة مواعيد من اللوحة',
      'أعلى مستوى رخصة نفاذ ضمن نظام الاستجابة الذكية للظهور عند الطلب',
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
    subtitleAr:
      'رخصة نفاذ ذهبية — أولوية أعلى في الاستجابة وثقة أرفع عند تنشّط الطلب',
    priceSar: TIER_MONTHLY_SAR[SubscriptionTier.GOLD],
    packageUnitLabelAr: SOFTWARE_PACKAGE_UNIT_LABEL_AR,
    validityLabel: SOFTWARE_PACKAGE_VALIDITY_LABEL_AR,
    highlights: [
      'إبراز ذهبي يرفع أولوية صالونك في استجابة النظام للطلبات داخل محيطك',
      'معرض موسّع حتى 20 صورة لإقناع العميل عند ظهور صالونك في الاستجابة',
      'QR للتقييم، واتساب، وشات مباشر لزيادة الثقة والتحويل بعد الاستجابة',
      'لوحة تحكم للصور والمنيو والأسعار وأوقات العمل لرفع كفاءة الاستهداف',
    ],
  },
] as const;

/** ترتيب العرض: الماسي في الوسط كخيار استراتيجي */
export const LISTING_LICENSE_PRICING_DISPLAY_ORDER: readonly SubscriptionTier[] = [
  SubscriptionTier.BRONZE,
  SubscriptionTier.DIAMOND,
  SubscriptionTier.GOLD,
];
