import { SubscriptionTier } from '@/lib';
import { TIER_MONTHLY_SAR } from '@/config/subscriptionPricing';

export const LISTING_LICENSE_LEGAL_FOOTNOTE =
  'تنبيه نظامي: جميع الباقات المذكورة هي تراخيص رقمية موحدة لخدمات الإدراج البرمجية على نظام الرصد الذكي التفاعلي لمنصة حلاق ماب (نشاط رقم 474151). المنتجات مسبقة الدفع وغير قابلة للإلغاء بعد التفعيل، ولا تشمل أي عمولات أو وساطة حجز.';

export type ListingLicenseCardAccent = 'bronze' | 'gold' | 'diamond';

export type ListingLicenseCardConfig = {
  tier: SubscriptionTier;
  tierQuery: string;
  accent: ListingLicenseCardAccent;
  nameAr: string;
  badge: string;
  /** شارة علوية للباقة الماسية فقط */
  premiumRibbonAr?: string;
  subtitleAr: string;
  priceSar: number;
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
    nameAr: 'برونزي',
    badge: '🥉',
    subtitleAr: 'بداية قوية عبر نظام الرصد الذكي',
    priceSar: TIER_MONTHLY_SAR[SubscriptionTier.BRONZE],
    validityLabel: 'ترخيص رقمي · 30 يوم',
    highlights: ['ظهور في الحي والبحث', 'بيانات وتواصل واضحة', 'أيقونة مفتوح/مغلق برابط سري'],
  },
  {
    tier: SubscriptionTier.DIAMOND,
    tierQuery: 'diamond',
    accent: 'diamond',
    nameAr: 'الباقة الماسية',
    badge: '💎',
    premiumRibbonAr: 'نخبة الأعمال',
    subtitleAr: 'الخيار الأسمى — قمة نظام الرصد الذكي',
    priceSar: TIER_MONTHLY_SAR[SubscriptionTier.DIAMOND],
    validityLabel: 'ترخيص رقمي · 30 يوم',
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
    nameAr: 'ذهبي',
    badge: '🥇',
    subtitleAr: 'ظهور أقوى وثقة أعلى',
    priceSar: TIER_MONTHLY_SAR[SubscriptionTier.GOLD],
    validityLabel: 'ترخيص رقمي · 30 يوم',
    highlights: ['أولوية أفضل في النتائج', 'تقييمات وربط بالزيارة', 'تحكم مفتوح/مغلق من اللوحة'],
  },
] as const;
