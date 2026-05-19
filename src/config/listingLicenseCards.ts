import { SubscriptionTier } from '@/lib';
import {
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
  /** عنوان البطاقة (برونزي / ذهبي / ماسي) */
  title: string;
  /** @deprecated استخدم title — يُبقى للتوافق مع المكوّنات الحالية */
  nameAr: string;
  badge: string;
  /** شارة علوية للباقة الماسية فقط */
  premiumRibbonAr?: string;
  subtitleAr: string;
  priceSar: number;
  /** وحدة التسعير — تُعرض بجانب السعر (مثال: /حزمة برمجية) */
  packageUnitLabelAr: string;
  validityLabel: string;
  highlights: readonly string[];
  /** إضافة المناوب الرقمي — ماسي فقط */
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
    subtitleAr: 'بداية قوية عبر نظام الرصد الذكي',
    priceSar: TIER_MONTHLY_SAR[SubscriptionTier.BRONZE],
    packageUnitLabelAr: SOFTWARE_PACKAGE_UNIT_LABEL_AR,
    validityLabel: SOFTWARE_PACKAGE_VALIDITY_LABEL_AR,
    highlights: ['ظهور في الحي والبحث', 'بيانات وتواصل واضحة', 'أيقونة مفتوح/مغلق برابط سري'],
  },
  {
    tier: SubscriptionTier.DIAMOND,
    tierQuery: 'diamond',
    accent: 'diamond',
    title: 'الباقة الماسية',
    nameAr: 'الباقة الماسية',
    badge: '💎',
    premiumRibbonAr: 'نخبة الأعمال',
    subtitleAr: 'الخيار الأسمى — قمة نظام الرصد الذكي',
    priceSar: TIER_MONTHLY_SAR[SubscriptionTier.DIAMOND],
    packageUnitLabelAr: SOFTWARE_PACKAGE_UNIT_LABEL_AR,
    validityLabel: SOFTWARE_PACKAGE_VALIDITY_LABEL_AR,
    highlights: [
      'تمييز بصري حصري: دبوس موقع مُشعّ ونابض على واجهة المستخدم النهائي لضمان خطف الأنظار فوراً.',
      'شارة «صالون النخبة المعتمد»: وسام ذهبي/ماسي بجانب اسم الصالون لرفع الموثوقية والمقرات.',
      'واجهة متقدمة: إمكانية تحميل بنر فيديو عالي الجودة لعرض مهارات صالونك في واجهة البحث.',
      'أولوية الدعم الفني: شريك دعم مخصص للمساعدة في تحسين ملفك وجذب الزبائن.',
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
    subtitleAr: 'ظهور أقوى وثقة أعلى',
    priceSar: TIER_MONTHLY_SAR[SubscriptionTier.GOLD],
    packageUnitLabelAr: SOFTWARE_PACKAGE_UNIT_LABEL_AR,
    validityLabel: SOFTWARE_PACKAGE_VALIDITY_LABEL_AR,
    highlights: ['أولوية أفضل في النتائج', 'تقييمات وربط بالزيارة', 'تحكم مفتوح/مغلق من اللوحة'],
  },
] as const;
