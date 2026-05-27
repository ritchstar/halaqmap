/**
 * عقيدة «الشريك التقني» — مصدر موحّد لمسار B2B.
 *
 * المنصة لا «تخدم» الحلاق ولا يُطلب منه أن «يخدم» المنصة؛
 * العلاقة: شريك تقني يوفّر رخصة نفاذ ونظام استجابة ذكية — والحلاق يدير صالونه.
 */

export const PARTNER_TECHNICAL_PARTNER_LABEL_AR = 'شريك تقني';

export const PARTNER_TECHNICAL_PARTNER_EN = 'Technical Partner';

export const PARTNER_LEGACY_PLATFORM_MODEL_EN = 'Platform-first';

export const PARTNER_TECHNICAL_PARTNER_HEADLINE =
  'حلاق ماب شريكك التقني — لا منصة تضع نفسها فوق صالونك';

export const PARTNER_TECHNICAL_PARTNER_TAGLINE =
  'رخصة نفاذ ونظام استجابة ذكية يعمل مع صالونك — أنت تقود التشغيل، ونحن نوفّر البنية البرمجية.';

export const PARTNER_TECHNICAL_PARTNER_COMMITMENT =
  'شراكتنا تقنية: أنت تدير صالونك وتمتثل للسياسات، ونحن نوفّر الرخصة والاستجابة البرمجية — بدون عمولة ولا تبعية.';

export const PARTNER_TECHNICAL_PARTNER_FOOTER_LINE =
  'حلاق ماب — شريكك التقني في الظهور والاستجابة: رخصة نفاذ تُفعِّل حضور صالونك عند الطلب، لا منصة تستExtract من وقتك.';

export type PartnerTechnicalPartnerCompareSide = {
  id: 'legacy' | 'halaqmap';
  label: string;
  eyebrow: string;
  title: string;
  bullets: readonly string[];
  tone: 'slate' | 'emerald';
};

export const PARTNER_TECHNICAL_PARTNER_COMPARE = {
  sectionTitle: 'لماذا «شريك تقني»؟',
  sectionLead:
    'الفرق ليس في الشعار — بل في اتجاه العلاقة: من يملك القرار، ومن يوفّر البنية.',
  sides: [
    {
      id: 'legacy',
      label: 'النموذج الشائع',
      eyebrow: PARTNER_LEGACY_PLATFORM_MODEL_EN,
      title: 'المنصة في المركز',
      bullets: [
        'الحلاق يغذّي المنصة ببيانات وحضور ووقت',
        'العمولة أو الاشتراك يخدم نمو المنصة أولاً',
        'أنت «حساب» داخل نظام — لا شريك في القرار',
      ],
      tone: 'slate',
    },
    {
      id: 'halaqmap',
      label: 'حلاق ماب',
      eyebrow: PARTNER_TECHNICAL_PARTNER_EN,
      title: PARTNER_TECHNICAL_PARTNER_LABEL_AR,
      bullets: [
        'رخصة نفاذ + استجابة ذكية مع صالونك — لا فوقه',
        'لا عمولة على القص — العلاقة مع الزبون مباشرة',
        'أنت تدير الصالون؛ نحن نوفّر الأدوات البرمجية',
      ],
      tone: 'emerald',
    },
  ],
} as const satisfies {
  sectionTitle: string;
  sectionLead: string;
  sides: readonly PartnerTechnicalPartnerCompareSide[];
};

export const PARTNER_TECHNICAL_PARTNER_HERO_CHIPS = [
  'شريك تقني — لا وسيط',
  'لا عمولة على الخدمة',
  'أنت تقود الصالون',
] as const;

export const PARTNER_TECHNICAL_PARTNER_REGISTER_LINE =
  'انضمامك كشريك تقني يعني رخصة نفاذ واضحة ونظام استجابة ذكية — تسجيل، دفع، ثم تفعيل برمجي بعد نجاح المعاملة. الباقات (برونزي · ذهبي · ماسي) صلاحيات تقنية متدرّجة، لا «خدمة» تُدار لك من فوق.';

export const PARTNER_TECHNICAL_PARTNER_WHY_CLOSING =
  'حلاق ماب شريكك التقني — مزوّد حلول برمجية لرخصة النفاذ ضمن نظام الاستجابة الذكية. لا عمولة، لا حجز نيابة، لا إشغال دائم للمساحة الرقمية.';

export const PARTNER_TECHNICAL_PARTNER_STORY_LEAD =
  'نبني منصة عربية ترى الحلاق شريكاً تقنياً — لا حساباً يغذّي نظاماً. نظام الاستجابة الذكية هو المسرح؛ حزم الرخصة هي الصلاحيات؛ إتمام الدفع هو بوابة التفعيل البرمجي عند الطلب.';

export const PARTNER_TECHNICAL_PARTNER_ASSISTANT_WELCOME =
  'أنا هنا لأرحّب بك في مسار الشركاء التقنيين — حلاق ماب لا تطلب منك أن «تخدم المنصة»؛ نوفّر لك رخصة نفاذ واستجابة ذكية مع صالونك، وأنت تقود التشغيل.';

export const PARTNER_TECHNICAL_PARTNER_BEFORE_AFTER_SUBTITLE =
  'الفرق باختصار — من غياب برمجي إلى شريك تقني يفعّل حضورك عند الطلب:';

export const PARTNER_TECHNICAL_PARTNER_PLANS_LEAD =
  'كل باقة صلاحيات تقنية واضحة لشريك المنصة — زبون قريب يراك، يثق بك، ويتواصل معك مباشرة.';
