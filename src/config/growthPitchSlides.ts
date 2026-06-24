/**
 * Growth Pitch Deck — عرض تسويقي لأصحاب الصالونات (B2B).
 *
 * ═══ TEXT LOCK ═══
 * النصوص هنا معتمدة — لا يُعدّلها مصمم العرض.
 * نسخة PowerPoint (8 شرائح): `docs/pitch/partner-deck-slides-ar.md`
 * الترتيب البصري والتجميل: `growthPitchTheme.ts` + `GrowthPitchSlideDeck.tsx`.
 *
 * الجمهور: مالك/مدير صالون — لغة فائدة وثقة، لا مصطلحات تقنية.
 */
import { LISTING_LICENSE_PRICING_CARDS } from '@/config/listingLicenseCards';
import {
  DIGITAL_SHIFT_MONTHLY_ADDON_SAR,
  TIER_MONTHLY_SAR,
} from '@/config/subscriptionPricing';
import { SubscriptionTier, ROUTE_PATHS } from '@/lib';

export const GROWTH_PITCH_DECK_TITLE_AR = 'عرض حلاق ماب — لأصحاب الصالونات';
export const GROWTH_PITCH_DECK_SUBTITLE_AR =
  'زبائن أقرب · ظهور عند الطلب · باقات واضحة · بدون عمولة على الحلاقة';

export const GROWTH_PITCH_TIER_COMPARE_SUBTITLE_AR =
  'قارن ما يناسب حجم صالونك اليوم — من حضور أساسي إلى أولوية أعلى وخدمات أوضح للتواصل مع الزبون.';

const GROWTH_PITCH_CUSTOMER_JOURNEY_STEPS = [
  {
    step: '١',
    title: 'الزبون يبدأ الاستعلام',
    description:
      'يفتح المنصة ويسمح بموقعه — مجاناً وبدون حساب — ليرى من قريب يمكنه زيارته الآن.',
  },
  {
    step: '٢',
    title: 'يظهر صالونك بين الخيارات',
    description:
      'إذا كنت مشتركاً ومناسباً للطلب (قرب، مفتوح، نوع الخدمة…)، تُعرض بطاقة صالونك بصورك ووسائل تواصلك.',
  },
  {
    step: '٣',
    title: 'يتصل أو يراسلك مباشرة',
    description:
      'الزبون يكمل معك أنت — اتصال، واتساب، أو شات حسب باقاتك. لا وساطة ولا عمولة على قصّة الزبون.',
  },
] as const;

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
      steps: typeof GROWTH_PITCH_CUSTOMER_JOURNEY_STEPS;
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

/** شرائح العرض — سرد موجّه لصاحب الصالون */
export const GROWTH_PITCH_SLIDES: readonly GrowthPitchSlide[] = [
  {
    id: 'opening',
    kind: 'hero',
    eyebrow: 'عرض لأصحاب الصالونات',
    title: 'حلاق ماب — زبائن قريبون يصلون إليك عندما يحتاجون حلاقة',
    subtitle:
      'منصة تربطك بزبون قريب في اللحظة المناسبة — حضور رسمي لصالونك، تواصل مباشر، ولا عمولة على خدمة الحلاقة.\n\nتدفع مقابل حزمة ظهور رقمية — لا وساطة ولا حجز نيابة عنك.',
    accent: 'teal',
  },
  {
    id: 'problem',
    kind: 'bullets',
    eyebrow: 'لماذا يهمك هذا؟',
    title: 'الكرسي الفارغ والمكالمة الضائعة — مشكلة يومية لكل صالون',
    bullets: [
      'الزبون يقرر في اللحظة: قريب، مفتوح، ويظهر جدّي — وليس «اسم في قائمة طويلة».',
      'الإعلان العشوائي يكلف ولا يضمن طلباً حقيقياً في وقت فراغك.',
      'اتصالات أثناء الإغلاق أو بعيدة عن موقعك تستهلك وقت فريقك بلا فائدة.',
      'حلاق ماب يوجّه الطلب المناسب إلى صالونك — لا يعدك بزحمة دائمة.',
    ],
    accent: 'slate',
  },
  {
    id: 'attract-b2c',
    kind: 'bullets',
    eyebrow: 'كيف يصل الزبون إليك؟',
    title: 'مسار بسيط — من الاستعلام إلى اتصالك أنت',
    subtitle: 'افهم رحلة الزبون حتى تعرف ماذا يحدث لصالونك بعد تفعيل الرخصة',
    bullets: [
      'الزبون يبدأ الاستعلام ويسمح بموقعه — الخدمة مجانية له ولا يحتاج حساباً.',
      'المنصة تعرض الصالونات القريبة والمناسبة: مفتوح الآن، نوع الخدمة، ومسافة معقولة.',
      'يرى بطاقة صالونك: صور، بنر، اتصال، واتساب، وحالة مفتوح/مغلق.',
      'يتواصل معك مباشرة — أنت من يحدد الموعد والسعر والخدمة، دون وسيط.',
      'لا عمولة على الحلاقة — دور المنصة ربط وظهور، لا فرض حجز.',
    ],
    accent: 'teal',
  },
  {
    id: 'transparency',
    kind: 'bullets',
    eyebrow: 'وضوح قبل تفعيل الرخصة',
    title: 'ما الذي تتوقعه — وما الذي لا نعد به',
    bullets: [
      'لا «قائمة دائمة» تملأ الشاشة — صالونك يظهر عندما يوجد طلب مناسب لبياناتك.',
      'لا بحث بالمدينة بدل الموقع — الزبون يبدأ بالاستعلام وموقعه.',
      'بدون موافقة الزبون على الموقع لا تُعرض نتائج — شفافية مع الجميع.',
      'إذا لم يكن هناك طلب مناسب، لا نعدّ بزبائن وهميين.',
      'لا نحجز عنك ولا نأخذ نسبة من قصّة الزبون — التنسيق مباشرة معك.',
    ],
    accent: 'amber',
  },
  {
    id: 'how-it-works',
    kind: 'steps',
    eyebrow: 'ثلاث خطوات للزبون',
    title: 'من الاستعلام إلى تواصلك — باختصار',
    steps: GROWTH_PITCH_CUSTOMER_JOURNEY_STEPS,
    accent: 'violet',
  },
  {
    id: 'trust',
    kind: 'bullets',
    eyebrow: 'ما الذي يرفع ثقة الزبون؟',
    title: 'كلما بدا صالونك جاداً — زادت احتمالية الاتصال',
    bullets: [
      'معرض صور حقيقي وبنر واضح — انطباع قبل أول زيارة.',
      'تقييمات `QR` موثّقة — خصوصاً في الباقة الذهبية.',
      'حالة «مفتوح/مغلق» — أقل مكالمات أثناء الإغلاق.',
      'شهادة تفعيل ورقم رخصة نفاذ — حضورك رسمي على المنصة.',
      'غرفة مراقبة للمالك (ذهبي/ماسي) — متابعة فريقك دون إزعاج خصوصية الزبون.',
    ],
    accent: 'violet',
  },
  {
    id: 'tier-compare',
    kind: 'comparison',
    eyebrow: 'الباقات — اختر ما يناسب صالونك',
    title: 'حزم رخصة النفاذ — ماذا تحصل في كل باقة؟',
    subtitle: GROWTH_PITCH_TIER_COMPARE_SUBTITLE_AR,
    tiers: buildTierColumns(),
    footnote: `الماسي + إضافة المناوب: +${DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س/حزمة · ${cardForTier(SubscriptionTier.DIAMOND).premiumRibbonAr ?? ''}`.trim(),
    accent: 'teal',
  },
  {
    id: 'partner-growth',
    kind: 'bullets',
    eyebrow: 'لماذا الانضمام الآن؟',
    title: 'الطلب على الحلاقة لا يتوقف — مكانك في المنصة يُحجز مبكراً',
    bullets: [
      'كلما اكتملت شبكة الصالونات في منطقتك، صار الوصول للزبون أسهل — والمنافسة على الظهور أعلى.',
      'من يسجّل الآن يبني حضوراً رسمياً قبل موجة التوسع القادمة.',
      'حزمة رقمية 30 يوماً — تفعيل واضح، بدون عمولة على خدمة الحلاقة.',
      'مسار ذاتي على المنصة: تسجيل، اختيار الباقة، الدفع — ثم التفعيل بعد إتمام الدفع.',
    ],
    accent: 'amber',
  },
  {
    id: 'cta',
    kind: 'cta',
    eyebrow: 'الخطوة التالية',
    title: 'جاهز لتسجيل صالونك؟',
    subtitle:
      'سجّل طلبك من المنصة — اختر الباقة، أكمل الدفع، ويُفعَّل حضور صالونك. يمكنك أيضاً مشاهدة تجربة الزبون من الرئيسية.',
    consumerCta: { label: 'شاهد تجربة الزبون — الرئيسية', href: ROUTE_PATHS.HOME },
    partnerCta: { label: 'سجّل طلبك — مسار المنشآت', href: ROUTE_PATHS.BARBERS_LANDING },
    accent: 'teal',
  },
];
