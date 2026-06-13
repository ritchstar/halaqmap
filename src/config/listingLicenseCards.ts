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

/**
 * منطق استخراج المزايا التسويقية:
 * نقرأ الميزة من أثرها على الحلاق، لا من اسمها التقني فقط:
 * جذب طلب قريب، رفع الثقة، تسريع التواصل، تقليل الفوضى، أو إدارة الملف دون انتظار.
 */
export const LISTING_LICENSE_FEATURE_DISCOVERY_LOGIC_AR = [
  'كل ما يساعد المستخدم المناسب على اختيار الصالون بسرعة يُصاغ كميزة تحويل.',
  'كل أداة تقلل مكالمة ضائعة أو سؤالاً متكرراً تُصاغ كميزة راحة تشغيلية.',
  'كل عنصر يثبت الجدية (صور، تقييم، QR، حالة مفتوح، شهادة تفعيل) يُصاغ كميزة ثقة.',
  'كل صلاحية لوحة تحكم تُصاغ كميزة استقلال للحلاق دون انتظار تعديل يدوي.',
] as const;

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
      'ابدأ بحضور رسمي: عند تنشّط الاستعلام يظهر صالونك ببيانات واضحة للمستخدم المناسب',
    priceSar: TIER_MONTHLY_SAR[SubscriptionTier.BRONZE],
    packageUnitLabelAr: SOFTWARE_PACKAGE_UNIT_LABEL_AR,
    validityLabel: SOFTWARE_PACKAGE_VALIDITY_LABEL_AR,
    highlights: [
      'ظهور عند الطلب للمستخدمين المناسبين وقت الاستعلام — لا تضيع لحظة الجاهزية',
      'بطاقة صالون جاهزة: موقع، اتصال، واتساب، وصور أساسية تقنع بسرعة',
      'صور واجهة وداخل + بنر أساسي تعطي الزبون انطباعاً حقيقياً قبل الزيارة',
      'أوقات عمل أسبوعية وحالة مفتوح/مغلق تقلل الاتصالات غير المناسبة',
      'شهادة تفعيل ورقم رخصة نفاذ بعد الدفع لإثبات أن حضورك رسمي على المنصة',
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
      'أعلى أولوية استجابة عند تنشّط الطلب — مناسب لمن يريد صدارة منطقته',
      'معرض حتى 40 صورة وبنر فاخر وشارة ماسية لعرض قوة الصالون بصرياً',
      'شات خاص مع ترجمة فورية يساعدك تخدم الزوار والعملاء متعددي اللغات',
      'إدارة مواعيد وحجوزات من اللوحة لتقليل الفوضى وتنظيم وقت الفريق',
      'زيارة منزلية + طلب تواصل عبر الشات (7 لغات مع المكتب الخاص) — ليس حجزاً نيابياً',
      'لوحة كاملة للصور والمنيو والأسعار وأوقات العمل وحالة التوفر',
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
      'ارفع الثقة والتحويل: صور أكثر، تقييمات، شات، وخدمات إضافية',
    priceSar: TIER_MONTHLY_SAR[SubscriptionTier.GOLD],
    packageUnitLabelAr: SOFTWARE_PACKAGE_UNIT_LABEL_AR,
    validityLabel: SOFTWARE_PACKAGE_VALIDITY_LABEL_AR,
    highlights: [
      'أولوية ذهبية عند الطلب تساعد صالونك يظهر بثقة أعلى داخل الاستعلامات النشطة',
      'معرض حتى 20 صورة يثبت جودة القصات والديكور قبل أول اتصال',
      'QR تقييم رسمي: اجمع آراء الزبائن وابرز الأفضل لرفع الثقة',
      'واتساب وشات مباشر بجلسة خاصة 60 دقيقة لتسريع قرار العميل',
      'لوحة تحكم للصور والبنر والمنيو والأسعار وأوقات العمل دون انتظار أحد',
      'زيارة منزلية: إعلان + طلب تواصل (واتساب/شات) — التنسيق مباشرة مع العميل',
      'خدمات كبار السن وذوي الاحتياجات مع تحكم في السعر والظهور والملاحظات',
    ],
  },
] as const;

/** ترتيب العرض: الماسي في الوسط كخيار استراتيجي */
export const LISTING_LICENSE_PRICING_DISPLAY_ORDER: readonly SubscriptionTier[] = [
  SubscriptionTier.BRONZE,
  SubscriptionTier.DIAMOND,
  SubscriptionTier.GOLD,
];
