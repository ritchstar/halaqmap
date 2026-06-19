/**
 * Growth Pitch Deck — شرائح العرض التقديمي (مصدر واحد من عقيدة المنصة).
 *
 * ═══ TEXT LOCK ═══
 * النصوص هنا معتمدة — لا يُعدّلها مصمم العرض.
 * الترتيب البصري والتجميل: `growthPitchTheme.ts` + `GrowthPitchSlideDeck.tsx`.
 */
import { LISTING_LICENSE_PRICING_CARDS } from '@/config/listingLicenseCards';
import { END_USER_TRANSPARENCY_CONTENT } from '@/config/endUserExperiencePolicy';
import {
  DIGITAL_SHIFT_MONTHLY_ADDON_SAR,
  SOFTWARE_PACKAGE_FOUNDATION_LABEL_AR,
  TIER_MONTHLY_SAR,
} from '@/config/subscriptionPricing';
import {
  FOUNDER_END_USER_ACTION_AR,
  FOUNDER_PARTNER_ACTION_AR,
  FOUNDER_PLATFORM_ACTION_DOCTRINE_AR,
  HALAQMAP_GROWTH_INEVITABILITY_AR,
  ON_DEMAND_VISIBILITY_LABEL_EN,
  ON_DEMAND_VISIBILITY_TAGLINE_SHORT_AR,
  SMART_RESPONSE_SYSTEM_LABEL_AR,
} from '@/config/onDemandVisibilityDoctrine';
import {
  PLATFORM_HERO_TRUST_LINE,
  PLATFORM_HOW_IT_WORKS_STEPS,
  PLATFORM_HOME_WELCOME_FEATURES,
  PLATFORM_SMART_TRACKING_SLOGAN,
  PLATFORM_SMART_TRACKING_SUBTEXT,
} from '@/config/platformSmartTracking';
import { PLATFORM_B2B_TECHNICAL_PARTNER_ROLE_AR } from '@/config/platformIdentity';
import { SubscriptionTier, ROUTE_PATHS } from '@/lib';

export const GROWTH_PITCH_DECK_TITLE_AR = 'عرض النمو — حلاق ماب';
export const GROWTH_PITCH_DECK_SUBTITLE_AR =
  'مقارنة تسويقية نهائية · جذب الزبائن · نظام الاستجابة الذكية';

export type GrowthPitchSlideAccent = 'teal' | 'amber' | 'violet' | 'slate';

export type GrowthPitchTierColumn = {
  tier: SubscriptionTier;
  badge: string;
  title: string;
  priceLabel: string;
  highlights: readonly string[];
};

export type GrowthPitchSlide =
  | {
      id: string;
      kind: 'hero';
      eyebrow: string;
      title: string;
      subtitle: string;
      accent: GrowthPitchSlideAccent;
    }
  | {
      id: string;
      kind: 'bullets';
      eyebrow: string;
      title: string;
      subtitle?: string;
      bullets: readonly string[];
      accent: GrowthPitchSlideAccent;
    }
  | {
      id: string;
      kind: 'steps';
      eyebrow: string;
      title: string;
      steps: typeof PLATFORM_HOW_IT_WORKS_STEPS;
      accent: GrowthPitchSlideAccent;
    }
  | {
      id: string;
      kind: 'comparison';
      eyebrow: string;
      title: string;
      subtitle: string;
      tiers: readonly GrowthPitchTierColumn[];
      footnote: string;
      accent: GrowthPitchSlideAccent;
    }
  | {
      id: string;
      kind: 'cta';
      eyebrow: string;
      title: string;
      subtitle: string;
      consumerCta: { label: string; href: string };
      partnerCta: { label: string; href: string };
      accent: GrowthPitchSlideAccent;
    };

function cardForTier(tier: SubscriptionTier) {
  const card = LISTING_LICENSE_PRICING_CARDS.find((c) => c.tier === tier);
  if (!card) throw new Error(`Missing listing card for ${tier}`);
  return card;
}

function buildTierColumns(): GrowthPitchTierColumn[] {
  const order = [SubscriptionTier.BRONZE, SubscriptionTier.GOLD, SubscriptionTier.DIAMOND] as const;
  return order.map((tier) => {
    const card = cardForTier(tier);
    return {
      tier,
      badge: card.badge,
      title: card.title,
      priceLabel: `${TIER_MONTHLY_SAR[tier]} ر.س / ${card.packageUnitLabelAr}`,
      highlights: card.highlights.slice(0, 5),
    };
  });
}

function transparencyBullets(): string[] {
  return END_USER_TRANSPARENCY_CONTENT.replace(/\*\*/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/** شرائح العرض — ترتيب السرد التقديمي */
export const GROWTH_PITCH_SLIDES: readonly GrowthPitchSlide[] = [
  {
    id: 'opening',
    kind: 'hero',
    eyebrow: SOFTWARE_PACKAGE_FOUNDATION_LABEL_AR,
    title: PLATFORM_SMART_TRACKING_SLOGAN,
    subtitle: `${PLATFORM_SMART_TRACKING_SUBTEXT}\n\n${PLATFORM_HERO_TRUST_LINE}`,
    accent: 'teal',
  },
  {
    id: 'problem',
    kind: 'bullets',
    eyebrow: 'المشكلة · Problem',
    title: 'الزبون يبحث في اللحظة — والصالون يريد طلباً حقيقياً لا «وجوداً شكلياً»',
    bullets: [
      'الحلاقة حاجة متكررة — التوقيت والقرب يحددان القرار.',
      'قوائم دائمة تُشبع المساحة الرقمية دون ربط فعلي بالطلب.',
      ON_DEMAND_VISIBILITY_TAGLINE_SHORT_AR,
      PLATFORM_B2B_TECHNICAL_PARTNER_ROLE_AR,
    ],
    accent: 'slate',
  },
  {
    id: 'attract-b2c',
    kind: 'bullets',
    eyebrow: 'جذب الزبائن · B2C',
    title: `كيف تجذب المنصة الزبون — «${FOUNDER_END_USER_ACTION_AR}»`,
    subtitle: 'خدمة مجانية · بدون تسجيل · تواصل مباشر مع الصالون',
    bullets: [
      `الفعل الوحيد للزائر: «${FOUNDER_END_USER_ACTION_AR}» ثم إذن الموقع — لا «بحث بالمدينة».`,
      'معالجة لحظية + فلاتر (مفتوح الآن، نوع الخدمة…) → بطاقة صالون كاملة.',
      'اتصال · واتساب · شات (ذهبي/ماسي) — بدون وساطة ولا عمولة على الحلاقة.',
      ...PLATFORM_HOME_WELCOME_FEATURES.map((f) => `${f.title}: ${f.description}`),
    ],
    accent: 'teal',
  },
  {
    id: 'transparency',
    kind: 'bullets',
    eyebrow: 'الشفافية · لا وعود فارغة',
    title: 'ما لا تفعله المنصة — عمداً',
    bullets: transparencyBullets(),
    accent: 'amber',
  },
  {
    id: 'how-it-works',
    kind: 'steps',
    eyebrow: `رحلة الزبون · ${ON_DEMAND_VISIBILITY_LABEL_EN}`,
    title: 'ثلاث خطوات — من الاستعلام إلى التواصل',
    steps: PLATFORM_HOW_IT_WORKS_STEPS,
    accent: 'violet',
  },
  {
    id: 'trust',
    kind: 'bullets',
    eyebrow: 'لماذا يثق الزبون',
    title: 'إشارات ثقة ترفع التحويل — لا مجرد «اسم على خريطة»',
    bullets: [
      'QR تقييم موثّق · معرض صور · بنر وبطاقة صالون واضحة.',
      'حالة «مفتوح/مغلق» لحظية — أقل اتصالات في وقت الإغلاق.',
      'شهادة تفعيل ورقم رخصة نفاذ — حضور رسمي للشريك.',
      'غرفة مراقبة للمالك (ذهبي/ماسي) — إشراف دون التدخل في خصوصية الزبون.',
    ],
    accent: 'violet',
  },
  {
    id: 'tier-compare',
    kind: 'comparison',
    eyebrow: 'المقارنة النهائية · B2B',
    title: 'حزم رخصة النفاذ — صياغة تسويقية موحّدة',
    subtitle: FOUNDER_PLATFORM_ACTION_DOCTRINE_AR,
    tiers: buildTierColumns(),
    footnote: `الماسي + Add-on المناوب: +${DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س/حزمة · ${cardForTier(SubscriptionTier.DIAMOND).premiumRibbonAr ?? ''}`.trim(),
    accent: 'teal',
  },
  {
    id: 'partner-growth',
    kind: 'bullets',
    eyebrow: 'قيمة الشريك',
    title: 'وصول المنصة للمستخدمين — مسألة وقت',
    bullets: [
      HALAQMAP_GROWTH_INEVITABILITY_AR,
      `للشريك: «${FOUNDER_PARTNER_ACTION_AR}» — رخصة برمجية 30 يوم/حزمة، لا عمولة على القصة.`,
      `${SMART_RESPONSE_SYSTEM_LABEL_AR}: كفاءة استهداف — كل طلب مناسب فرصة ظهور.`,
    ],
    accent: 'amber',
  },
  {
    id: 'cta',
    kind: 'cta',
    eyebrow: 'الخطوة التالية',
    title: 'جاهز للعرض — مساران واضحان',
    subtitle: 'B2C: جرّب الاستعلام · B2B: سجّل طلبك أو افتح مركز الباقات',
    consumerCta: { label: `${FOUNDER_END_USER_ACTION_AR} — الرئيسية`, href: ROUTE_PATHS.HOME },
    partnerCta: { label: `${FOUNDER_PARTNER_ACTION_AR} — مسار المنشآت`, href: ROUTE_PATHS.BARBERS_LANDING },
    accent: 'teal',
  },
];
