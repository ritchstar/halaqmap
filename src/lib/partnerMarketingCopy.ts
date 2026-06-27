/**
 * نصوص مسار الخدمات البرمجية للمنصة — تسويق مباشر للحلاقين في السعودية.
 * يعتمد على مبدأ «الظهور عند الطلب» (نظام الاستجابة الذكية) — راجع
 * `onDemandVisibilityDoctrine.ts` للتعريف الوظيفي والقانوني الموحَّد.
 */
import {
  PLATFORM_PARTNER_SMART_TRACKING_HEADLINE,
  PLATFORM_PARTNER_SMART_TRACKING_LEAD,
  PLATFORM_SMART_TRACKING_SUBTEXT,
} from '@/config/platformSmartTracking';
import { PLATFORM_GROWTH_REGISTER_INTRO_AR } from '@/config/platformGrowthPrograms';
import {
  PARTNER_TECHNICAL_PARTNER_ASSISTANT_WELCOME,
  PARTNER_TECHNICAL_PARTNER_BEFORE_AFTER_SUBTITLE,
  PARTNER_TECHNICAL_PARTNER_COMMITMENT,
  PARTNER_TECHNICAL_PARTNER_FOOTER_LINE,
  PARTNER_TECHNICAL_PARTNER_PLANS_LEAD,
  PARTNER_TECHNICAL_PARTNER_REGISTER_LINE,
  PARTNER_TECHNICAL_PARTNER_STORY_LEAD,
  PARTNER_TECHNICAL_PARTNER_WHY_CLOSING,
} from '@/config/partnerTechnicalPartnerDoctrine';
import {
  PARTNER_MALL_HERO_BADGE_AR,
  PARTNER_MALL_HERO_LEAD_DESKTOP_AR,
  PARTNER_MALL_HERO_TITLE_ACCENT_AR,
  PARTNER_MALL_HERO_TITLE_AR,
  PARTNER_MALL_TAGLINE_AR,
} from '@/config/partnerMallNarrativeCopy';
import {
  PARTNER_FINAL_CTA_BODY_AR,
  PARTNER_HERO_CLOSING_TAGLINE_AR,
  PARTNER_HERO_LEAD_PRIMARY_AR,
  PARTNER_HERO_TAGLINE_REPUTATION_AR,
  PARTNER_HERO_TAGLINE_TRUST_AR,
  PARTNER_LANDING_CTA_LEAD_AR,
  PARTNER_LANDING_FAQ_AR,
  PARTNER_REGISTER_FAQ_AR,
  PARTNER_SECTION_INTROS,
  PARTNER_SOCIAL_VS_PLATFORM_ROWS_AR,
  PARTNER_TIER_MARKETING_HOOKS_AR,
} from '@/config/partnerFieldSalesCopy';

export { PARTNER_EARLY_WAVE_TAGLINE_AR } from '@/config/partnerEarlyWaveCopy';
export {
  PARTNER_HERO_CLOSING_TAGLINE_AR,
  PARTNER_HERO_TAGLINE_REPUTATION_AR,
  PARTNER_LANDING_FAQ_AR,
  PARTNER_REGISTER_FAQ_AR,
  PARTNER_SECTION_INTROS,
  PARTNER_TIER_MARKETING_HOOKS_AR,
} from '@/config/partnerFieldSalesCopy';

/** فقرات مختصرة لصفحة التسجيل — التفاصيل في FAQ */
export const PARTNER_REGISTER_INTRO_PARAGRAPHS = [
  PLATFORM_GROWTH_REGISTER_INTRO_AR.replace(/\*\*/g, ''),
  PARTNER_HERO_LEAD_PRIMARY_AR,
  PARTNER_FINAL_CTA_BODY_AR,
] as const;

/** رحلة الزبون — مواءمة Pitch Deck (شريحة 3) */
export const PARTNER_REGISTER_CUSTOMER_JOURNEY_AR = [
  {
    step: '١',
    title: 'الزبون يبدأ الاستعلام',
    body: 'يفتح المنصة ويسمح بموقعه — مجاناً وبدون حساب.',
  },
  {
    step: '٢',
    title: 'يظهر صالونك بين الخيارات',
    body: 'إن كنت مفعّلاً ومناسباً للطلب (قرب، مفتوح، نوع الخدمة…).',
  },
  {
    step: '٣',
    title: 'يتصل أو يراسلك مباشرة',
    body: 'لا وساطة ولا عمولة على خدمة الحلاقة — التنسيق معك أنت.',
  },
] as const;

export const PARTNER_LANDING_GROWTH_PROGRAMS_SECTION = {
  id: 'growth-programs',
  titleAr: 'مدار · نبض · محيط',
} as const;

/** نسخة سطر واحد للأماكن التي تتطلب نصاً قصيراً */
export const PARTNER_REGISTER_INTRO = PARTNER_REGISTER_INTRO_PARAGRAPHS.join(' ');

export const PARTNER_LAYOUT_FOOTER_LINE = PARTNER_TECHNICAL_PARTNER_FOOTER_LINE;

/** يُحدَّث من الإدارة ليعكس العدد الفعلي عند الحاجة (عرض تسويقي). */
export const PARTNER_LANDING_SOCIAL_COUNT_LABEL = '+300 صالون شريك';

export const PARTNER_LANDING_HERO = {
  badge: PARTNER_MALL_HERO_BADGE_AR,
  title: PARTNER_MALL_HERO_TITLE_AR,
  titleAccent: PARTNER_MALL_HERO_TITLE_ACCENT_AR,
  lead: `${PARTNER_MALL_HERO_LEAD_DESKTOP_AR} ${PARTNER_HERO_LEAD_PRIMARY_AR}`,
  tagline: PARTNER_MALL_TAGLINE_AR,
} as const;

export const PARTNER_LANDING_HERO_HIGHLIGHTS = [
  {
    title: 'ظهور بشروطك',
    body: 'تظهر عند استعلام يناسبك — لا إشغالاً دائماً لملفك ولا حجزاً بالعمولة.',
  },
  {
    title: 'تواصل بلا وسيط',
    body: 'اتصال أو واتساب مع زبونك مباشرة — المنصة شريك تقني للاكتشاف والاستجابة البرمجية.',
  },
  {
    title: 'خروج بلا قيد',
    body: 'حزمة ٣٠ يوم مسبقة الدفع — لا تجديد تلقائي؛ التجديد قرارك بعد انتهاء الرخصة.',
  },
] as const;

export const PARTNER_LANDING_WHY_SECTION = {
  title: 'لماذا نظام الاستجابة الذكية؟',
  lead: PARTNER_SECTION_INTROS.why.lead,
} as const;

/** قسم «ماذا تستفيد؟» — فوائد صريحة للحلاق */
export const PARTNER_LANDING_BENEFITS_SECTION = {
  title: 'ماذا تستفيد؟',
  lead: PARTNER_SECTION_INTROS.benefits.lead,
  items: [
    {
      title: 'استجابة برمجية عند الطلب',
      body: 'صالونك يستجيب لمن يصدر طلباً فعلياً تنطبق عليه بياناته وفلترته. سرعة الاستجابة ووضوح العرض يرفعان احتمال التواصل ويقللان التردّد.',
    },
    {
      title: 'ملف صالون احترافي',
      body: 'صور، أوقات، عنوان واضح، واتصال وواتساب — الزبون يقرأ عنك في ثواني ويعرف ليش يختارك.',
    },
    {
      title: 'تقييمات حقيقية',
      body: 'الثقة تتبنى بالزيارة والتجربة مو بالادّعاء. التقييم يخدم الصالون اللي يشتغل صح.',
    },
    {
      title: 'زيادة عملاء بدون تكلفة إعلانات طارئة',
      body: 'ما تحتاج ترفع ميزانية يومية على إعلانات عشوائية؛ تظهر حيث يبحث الناس أصلاً عن مقدم الخدمة المناسب.',
    },
    {
      title: 'غرفة المراقبة للمالك',
      body: 'تابع صالونك من جوالك — حالة المحل، النشاط، والتنبيهات — قراءة فقط بلا نصوص زبائن. رابط جاهز في بريد التفعيل (ذهبي وماسي).',
    },
    {
      title: 'تميّز عن المنافسين',
      body: 'من لم تُفعَّل استجابته ضمن النظام يخسر السؤال الأول: من هو الأنسب الذي يستجيب الآن؟ الانضمام المبكر يعني أخذ حصة من الطلب قبل اشتداد المنافسة.',
    },
  ],
} as const;

export const PARTNER_LANDING_BEFORE_AFTER = {
  title: 'قبل وبعد التسجيل',
  subtitle: PARTNER_TECHNICAL_PARTNER_BEFORE_AFTER_SUBTITLE,
  before: {
    label: 'قبل التسجيل',
    bullets: ['ما يستجيب للطلبات المناسبة له', 'بدون ملف يجمع صورتك وخدماتك', 'بدون تقييمات تدعم جودتك'],
  },
  after: {
    label: 'بعد التسجيل',
    bullets: [
      'يستجيب برمجياً للطلبات المناسبة له',
      'ملف احترافي يشرح صالونك عند الاستجابة',
      'تقييمات وتجارب ترفع ثقة الزبون لحظة ظهورك',
      'طريق أوضح للزبون يوصلك — يعني فرصة أكثر للعمل',
    ],
  },
} as const;

export const PARTNER_LANDING_SOCIAL_PROOF = {
  statHeadline: PARTNER_LANDING_SOCIAL_COUNT_LABEL,
  statDetail: 'صالونات وحلاقون من مختلف مناطق المملكة — والعدد في نمو مع توسع المنصة.',
  note: 'الرقم يُعرض للتوضيح ويُحدَّث من فريق حلاق ماب ليعكس الواقع.',
  /** محفزات زمنية — يُحدَّث النص من الإدارة عند الحاجة */
  momentumTitle: 'حركة زمنية',
  momentumLead: 'نبّه الزبون والحلّاق إن المنصّة حيّة — مو مجرد رقم ثابت:',
} as const;

export const PARTNER_LANDING_SOCIAL_MOMENTUM = [
  {
    label: 'هذا الأسبوع',
    body: 'طلبات جديدة ومراجعات مستمرة على ملفات الصالونات.',
  },
  {
    label: 'آخر 30 يومًا',
    body: 'ظهور أوسع في أحياء مختلفة — والاهتمام يتزايد أسبوعًا بعد أسبوع.',
  },
  {
    label: 'اليوم',
    body: 'زبائن يستخدمون نظام الاستجابة الذكية الآن ويصدرون طلبات مناسبة لبيانات صالونك — خليك ضمن المستجيبين.',
  },
] as const;

/** بلوك QR — ألوان شعبية (أبيض / أحمر / أزرق) لمسار الخدمات البرمجية للمنصة */
export const PARTNER_LANDING_QR_PROMO = {
  kicker: 'حلاق ماب · مسار الخدمات البرمجية للمنصة',
  title: 'امسح الكود — ادخل المسار — وفعّل استجابتك الذكية',
  steps: [
    'امسح رمز QR بكاميرا جوالك.',
    'تفتح معك صفحة مسار الخدمات البرمجية للمنصة مباشرة.',
    'سجّل صالونك وأكمل الدفع؛ تُفعَّل استجابتك ضمن نظام الاستجابة الذكية لحلاق ماب تلقائياً بعد نجاح الدفع.',
  ],
  hint: 'شارك الرمز مع فريقك أو اطبعه للواجهة.',
} as const;

export const PARTNER_LANDING_QUALITY_SEALS = [
  { title: 'حلاق موثوق', body: 'مسار تسجيل وتحقق تقني يحافظ على جودة الشبكة قبل التفعيل.' },
  { title: 'صالون نظيف', body: 'الملف يبرز صورتك الحقيقية — الزبون يشوف قبل ما يزور.' },
  { title: 'سرعة الخدمة', body: 'اتصال وواتساب وروابط موقع في خطوة أو خطوتين.' },
] as const;

export const PARTNER_LANDING_TESTIMONIALS_SECTION = {
  title: 'آراء الحلاقين',
  lead: 'أمثلة قصيرة لما يتغيّر لما يتحسّن الظهور — الأسماء والأماكن توضيحية:',
  stories: [
    {
      quote: 'قبل كنت أعتمد على السوشال بس؛ الحين الزبون يقول لقيتك عبر نظام الاستجابة الذكية لحظة ما طلب جنب البيت.',
      attribution: 'صالون في الرياض — مثال توضيحي',
      /** حرف للصورة الرمزية عند عدم تحميل الصورة */
      initial: 'ر',
    },
    {
      quote: 'الملف خلّى الواتساب يجي أسئلة أوضح: يبون موعد، مو يترددوا مين أنا.',
      attribution: 'حلاق في المنطقة الشرقية — مثال توضيحي',
      initial: 'ش',
    },
    {
      quote: 'التقييمات خلت الناس اللي ما تعرفني تجرّب مرة، وبعدها صار في تكرار.',
      attribution: 'صالون في جدة — مثال توضيحي',
      initial: 'ج',
    },
  ],
} as const;

export const PARTNER_LANDING_HOW_SECTION = {
  title: 'كيف يعمل؟',
  lead: 'أربع خطوات بسيطة — من طلب الرخصة إلى الاستجابة البرمجية:',
} as const;

export const PARTNER_LANDING_PROCESS_STEPS = [
  {
    title: 'تضغط «ابدأ الآن» وتعبّي الطلب',
    body: 'بيانات الصالون وحزمة رخصة النفاذ + تأشيرات إلزامية (التعهد القانوني، الالتزام المهني، إقرار المنتج، الشروط) — دون رفع وثائق حكومية.',
  },
  {
    title: 'أكمل الدفع',
    body: 'بعد تعبئة الطلب تنتقل لبوابة الدفع؛ عند نجاح المعاملة تُفعَّل استجابة صالونك ضمن نظام الاستجابة الذكية تلقائياً دون انتظار اعتماد يدوي للمسار الاعتيادي.',
  },
  {
    title: 'يستجيب صالونك للطلبات المناسبة',
    body: 'يُفعَّل ظهورك البرمجي حصراً عند وجود طلب نشط تنطبق عليه بياناتك المتاحة — كفاءة استهداف لا قائمة دائمة.',
  },
  {
    title: 'تدير ملفك من لوحتك',
    body: 'صور، أوقات، عروض، وتقييمات حسب حزمة رخصة النفاذ — تطوّر استجابتك مع نمو الطلب.',
  },
] as const;

export const PARTNER_LANDING_PLANS_SECTION = {
  title: 'حزم رخصة النفاذ — اختر ما يخدم مرحلة صالونك',
  lead: PARTNER_SECTION_INTROS.plans.lead,
} as const;

export const PARTNER_LANDING_PLAN_CARDS = [
  {
    /** يُمرَّر كـ `?tier=` في `/partners/payment` */
    tier: 'bronze',
    title: 'برونزية',
    subtitle: PARTNER_TIER_MARKETING_HOOKS_AR.bronze,
    points: [
      'ظهور عند الطلب حتى لا تخسر زبوناً يبحث الآن عن مقدم خدمة مناسب.',
      'بطاقة صالون مختصرة تجمع الموقع، الاتصال، الواتساب، والصور الأساسية في مكان واحد.',
      'صور واجهة وداخل وبنر أساسي تساعد الزبون يفهم شكل المحل قبل الزيارة.',
      'أوقات عمل أسبوعية وحالة «مفتوح/مغلق» لتقليل الاتصالات في الوقت الخطأ.',
      'تفعيل بعد الدفع مع رقم رخصة نفاذ وشهادة رقمية تثبت حضورك الرسمي.',
      'مناسبة للحلاق الذي يريد اختبار طلب الحي بدون تعقيد أو تكلفة عالية.',
    ],
  },
  {
    tier: 'gold',
    title: 'ذهبية',
    subtitle: PARTNER_TIER_MARKETING_HOOKS_AR.gold,
    points: [
      'كل مزايا البرونزي مع أولوية ذهبية تزيد فرصة اختيارك عند تنشّط الطلب المناسب.',
      'معرض حتى 20 صورة يعرض القصات، الديكور، النظافة، والتفاصيل التي تقنع قبل الاتصال.',
      'QR تقييم رسمي تجمع به آراء العملاء بعد الزيارة وتبرز أفضل التجارب.',
      'واتساب وشات مباشر بجلسة خاصة تنتهي تلقائياً بعد 60 دقيقة لخصوصية أعلى.',
      'لوحة تحكم لتحديث الصور، البنر، المنيو، الأسعار، وأوقات العمل بنفسك.',
      'خدمات كبار السن والمرضى وذوي الاحتياجات: إظهار/إخفاء، سعر، أيام، وملاحظة للعميل.',
      'مناسبة للصالونات التي تريد رفع الثقة وتحويل كل ظهور إلى تواصل حقيقي.',
    ],
  },
  {
    tier: 'diamond',
    title: 'ماسية',
    subtitle: PARTNER_TIER_MARKETING_HOOKS_AR.diamond,
    points: [
      'كل مزايا الذهبي مع أعلى أولوية ماسية للطلبات المناسبة في منطقتك.',
      'معرض حتى 40 صورة وبنر فاخر وشارة ماسية تعطي انطباع صالون نخبة.',
      'شات خاص مع ترجمة فورية يساعدك تخدم السياح والمقيمين والعملاء متعددي اللغات.',
      'إدارة المواعيد والحجوزات من اللوحة لتقليل الفوضى وتنظيم ضغط العمل.',
      'لوحة كاملة لإدارة الصور، البنر، المنيو، الأسعار، أوقات العمل، وحالة التوفر.',
      'دعم فني مخصص 24/7 للصالونات التي تعتمد على المنصة كقناة تشغيل أساسية.',
      'Add-on اختياري: المناوب الرقمي الذكي يرد عند الإغلاق أو تأخر الرد ويعزز الاستجابة.',
      'مناسبة لمن يريد صدارة المنطقة وتجربة أوضح وأكثر تميزاً بدون تشغيل يدوي زائد.',
    ],
  },
] as const;

export const PARTNER_LANDING_CTA_SECTION = {
  title: PARTNER_HERO_CLOSING_TAGLINE_AR,
  lead: PARTNER_LANDING_CTA_LEAD_AR,
  chips: ['بدون لف تقني', 'مسار واضح', 'دعم فريق المنصة'],
  primaryCta: 'شراء رخصة نفاذ',
  secondaryCta: 'تفعيل الآن',
} as const;

export const PARTNER_LANDING_COMPARISON_SECTION = {
  title: PARTNER_SECTION_INTROS.comparison.title,
  lead: PARTNER_SECTION_INTROS.comparison.lead,
  rows: PARTNER_SOCIAL_VS_PLATFORM_ROWS_AR,
} as const;

export const PARTNER_LANDING_FAQ_SECTION = {
  kicker: PARTNER_SECTION_INTROS.faq.kicker,
  lead: PARTNER_SECTION_INTROS.faq.lead,
  items: PARTNER_LANDING_FAQ_AR,
} as const;

export const PARTNER_REGISTER_FAQ_SECTION = {
  kicker: 'أسئلة قبل إرسال الطلب',
  lead: 'إجابات سريعة — لتكمل التسجيل بثقة وبدون مفاجآت.',
  items: PARTNER_REGISTER_FAQ_AR,
} as const;

export const PARTNER_REGISTER_PAGE = {
  title: 'سجّل صالونك في منصة حلاق ماب',
  introParagraphs: PARTNER_REGISTER_INTRO_PARAGRAPHS,
  customerJourneyTitle: 'ماذا يحدث لصالونك بعد التفعيل؟',
  customerJourneyLead: 'مسار بسيط — من الاستعلام إلى اتصالك أنت.',
  customerJourney: PARTNER_REGISTER_CUSTOMER_JOURNEY_AR,
  faq: PARTNER_REGISTER_FAQ_SECTION,
  assuranceChips: [
    'لا عمولات',
    'لا وساطة حجز',
    'لا تجديد تلقائي',
    'حزمة رقمية مسبقة الدفع',
    'وفق سياسة رخصة النفاذ',
  ],
  steps: ['اختر الحزمة', 'أكمل البيانات', 'ادفع الآن', 'إتمام التفعيل'],
} as const;

/** صفحة «لماذا تنضم» — أقسام طويلة */
export const PARTNER_WHY_PAGE = {
  heroBadge: 'اقرأ قبل أن تقرر',
  heroTitle: 'لماذا حلاق ماب يبيع حرية — لا خدمة تُقيّدك؟',
  heroLead: `${PARTNER_HERO_TAGLINE_REPUTATION_AR}. ${PARTNER_SECTION_INTROS.why.lead}`,

  sections: [
    {
      title: 'حرية الظهور — لا إعلان دائم',
      body:
        'تظهر عند استعلام يناسب موقعك وفلترك — لا إشغالاً دائماً لملفك. كل ظهور = مستعلم بنية أعلى من إعلان الترفيه؛ والقرار متى تكون «مفتوحاً» بيدك لحظياً.',
    },
    {
      title: 'الشراكة الموثوقة تحمي اسمك قبل أن تُبنى الشهرة',
      body:
        'عندما تُعرض بجانب أسماء خضعت لنفس مسار التحقق والتفعيل، يرتفع وزن ظهورك. العميل يشعر أنه داخل منصة تختار شركاءها — وليس داخل قائمة مفتوحة على أي مدخل.',
    },
    {
      title: 'الباقة ليست ترفاً — هي لغة بينك وبين المنصة',
      body:
        'البرونزي لبداية رسمية بأقل تعقيد، الذهبي لتحويل الظهور إلى ثقة عبر الصور والتقييم والQR، والماسي لمن يريد صدارة الطلب وتنظيم المواعيد وتجربة تواصل أقوى. عندما تكون اللغة واضحة، يصبح قرارك الاستثماري أسهل — ويصبح شرح قيمتك لزبائنك أسهل أيضاً.',
    },
    {
      title: 'لا تؤجل إلى ما بعد ازدحام الاستجابة في منطقتك',
      body:
        'كل شريك جديد يضيف منافسة على نفس الطلبات المتاحة. التوقيت ليس زينة — هو جزء من العائد: من تُفعَّل استجابته مبكراً يزرع في ذاكرة المستخدم أنه «من الخيارات الطبيعية» عند طلب الخدمة.',
    },
    {
      title: PARTNER_LANDING_COMPARISON_SECTION.title,
      body:
        'الفرق ليس في «الظهور» — الفرق في نية الشراء لحظة الوصول. إعلان سناب أو إنستغرام يقطع متصفّحاً بنية ضعيفة وتكلفة مرتفعة؛ حلاق ماب يصلك لمستعلم بعد إذن الموقع — زبون واحد إضافي شهرياً يغطي الذهبي في أغلب الحالات، بدون وعد بعدد زبائن.',
    },
  ],

  faq: PARTNER_LANDING_FAQ_SECTION,
  comparison: PARTNER_LANDING_COMPARISON_SECTION,

  closingQuote: PARTNER_TECHNICAL_PARTNER_WHY_CLOSING,
  ctaPrimary: 'ابدأ طلب الشراكة',
  ctaSecondary: 'العودة للصفحة التسويقية',
} as const;

/** صفحة «القصة والمسار» */
export const PARTNER_STORY_PAGE = {
  heroBadge: 'منطق السوق',
  heroTitle: 'قصة مسار الخدمات البرمجية — من الفكرة إلى الاستجابة الذكية عند الطلب',
  heroLead: `${PARTNER_HERO_TAGLINE_REPUTATION_AR}. ${PARTNER_TECHNICAL_PARTNER_STORY_LEAD}`,

  chapters: [
    {
      title: 'لماذا نظام الاستجابة الذكية؟',
      body:
        'لأنه يجعل المنافسة صادقة: النية قابلة للتحويل، والاستجابة تتم في نفس لحظة الطلب. عندما يفهم العميل أنك متاح الآن وتظهر له ضمن البيانات المناسبة، يقلّ حاجز التجربة. وهذا ما لا يمنحه إعلان صورة ثابتة دائمة بنفس القوة.',
    },
    {
      title: 'الرفض يؤلم — الغياب أخطر',
      body:
        'الصالون غير المفعّل لم يُرفض — لم يُرَ في الاستجابة أصلاً. من يستعلم عن حلاق قريب في منطقتك يرى المفعّلين؛ الغائب يفقد فرصاً لا تظهر في أي سجل. السؤال: هل ستبقى غائباً عن اللحظة التي يبحث فيها الزبون؟',
    },
    {
      title: 'لماذا «الظهور عند الطلب»؟',
      body:
        'لأن الإشغال الدائم للمساحة الرقمية مكلف وغير عادل. الرخصة عندنا حضور غير ثابت يُفعَّل برمجياً عند تنشّط الطلب المناسب — كفاءة استهداف للحلاق، ودقة عرض للعميل، وحماية قانونية للمنصة من شكاوى عدم الظهور الدائم.',
    },
    {
      title: 'لماذا الباقات؟',
      body:
        `لأن الحلاق يستحق أن يعرف ماذا يشتري: ${PARTNER_TIER_MARKETING_HOOKS_AR.bronze} · ${PARTNER_TIER_MARKETING_HOOKS_AR.gold} · ${PARTNER_TIER_MARKETING_HOOKS_AR.diamond}`,
    },
    {
      title: 'لماذا التحقق ثم الدفع؟',
      body:
        'لأن الثقة جماعية: صالون واحد سيء التمثيل يضر بانطباع المنصة كاملة. نطبّق تحققاً تقنياً على الطلب، ثم تُفعَّل استجابتك ضمن نظام الاستجابة الذكية بعد نجاح الدفع — بسرعة ووضوح، مع إمكان معالجة حالات استثنائية وفق السياسة عند الحاجة.',
    },
    {
      title: 'ماذا بعد التفعيل؟',
      body:
        'لوحة تحكم الحلاق تكمّل القصة: تحديث الصور والبنر وأوقات العمل حسب حزمتك، وربط التقييمات بالزيارة في الأعلى. الهدف أن تبقى استجابتك للطلب متسقة مع واقع الصالون — فالثقة المستدامة تُبنى من التطابق بين الوعد والتجربة.',
    },
  ],

  comparison: PARTNER_LANDING_COMPARISON_SECTION,
  faq: PARTNER_LANDING_FAQ_SECTION,
  signature: `${PARTNER_HERO_CLOSING_TAGLINE_AR} — استجابة عند الطلب، وضوح، شراكة موثوقة.`,
  ctaPrimary: 'انتقل إلى التسجيل',
  ctaSecondary: 'اقرأ سياسة رخصة النفاذ الرقمية',
} as const;

export const PARTNER_TUTORIALS_PAGE = {
  badge: 'شرح حزم رخصة النفاذ الرقمية',
  title: 'فيديوهات تعليم حزم رخصة النفاذ الرقمية في حلاق ماب',
  lead: `${PARTNER_HERO_TAGLINE_TRUST_AR} — تابع الخطوات من التسجيل حتى التفعيل والدفع بشكل واضح.`,
  cardNote: 'ابدأ بالفيديو الأول ثم انتقل لبقية الخطوات — الأسئلة الشائعة قبل الإرسال في الأسفل.',
  faq: PARTNER_REGISTER_FAQ_SECTION,
  tierHooks: PARTNER_TIER_MARKETING_HOOKS_AR,
} as const;

/** عنوان صفحة/أزرار الدعم عبر واتساب في مسار الخدمات البرمجية */
export const PARTNER_TECHNICAL_SUPPORT_LABEL = 'الدعم الفني (واتساب)';

/** مساعد الشركاء — ترحيب ونصائح قصيرة */
export const PARTNER_DIGITAL_ASSISTANT = {
  name: 'مساعد الشركاء الرقمي',
  role: 'حلاق رقمي',
  greeting: 'أهلًا بك في مسار الخدمات البرمجية للمنصة',
  welcome: PARTNER_TECHNICAL_PARTNER_ASSISTANT_WELCOME,
  tips: [
    'اسألني عن «ما الجديد؟» أو عن المناوب الرقمي في الباقة الماسية — أنا مُحدَّث بآخر إطلاقات المنصة.',
    'اقرأ صفحة «لماذا تنضم؟» و«القصة والمسار» إن أردت الإقناع العميق قبل تعبئة الطلب.',
    `افتح «${PARTNER_TECHNICAL_SUPPORT_LABEL}» لمحادثة خاصة بجلسة ساعة — رابط فريد يفصل استفسارك عن غيره على نفس الجهاز.`,
    'اقرأ سياسة رخصة النفاذ الرقمية قبل الإرسال؛ الوضوح يحمي استثمارك ويُسرّع إتمام الطلب والدفع.',
    'جهّز صوراً نظيفة للبنر؛ الصورة الجيدة ترفع ثقة النقرة لحظة استجابة صالونك للطلب.',
    'اختر حزمة الرخصة التي تعكس طموحك الحالي؛ الترقية متاحة عندما ينمو الطلب على استجابتك.',
  ],
} as const;

export function partnerAssistantHintForPath(pathname: string): string {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p.includes('/partners/why')) {
    return 'هنا «لماذا تنضم؟»: ركّز على فكرة القرار عبر نظام الاستجابة الذكية والظهور عند الطلب؛ إن وضحت لك، انتقل للتسجيل بثقة أكبر.';
  }
  if (p.includes('/partners/story')) {
    return 'صفحة القصة تشرح منطق المسار؛ بعدها راجع سياسة رخصة النفاذ الرقمية ثم أرسل الطلب.';
  }
  if (p.includes('/partners/support')) {
    return `هنا «${PARTNER_TECHNICAL_SUPPORT_LABEL}»: رابطك الخاص يفصل محادثتك عن غيرك لمدة ساعة — انسخ الرابط إن أردت العودة لاحقاً من نفس الجهاز.`;
  }
  if (p.includes('/register/success')) {
    return 'تم إرسال طلبك؛ أكمل خطوة الدفع عندما يصلك الرابط أو من صفحة الدفع — بعد نجاح الدفع تُفعَّل استجابتك ضمن نظام الاستجابة الذكية تلقائياً. راقب بريدك للتنبيهات.';
  }
  if (p.includes('/register') && !p.includes('/register/success')) {
    return 'في التسجيل: راجع حزم رخصة النفاذ وثبّت بياناتك بدقة، ثم أكمل الدفع — بعد نجاح الدفع تُفعَّل استجابتك تلقائياً عند الطلب.';
  }
  if (p.includes('subscription-policy')) {
    return 'هنا تفاصيل رخصة النفاذ الرقمية ومنطق الظهور عند الطلب؛ اقرأها بهدوء فهي أساس علاقة رصينة بينك وبين المنصّة.';
  }
  if (p.includes('privacy')) {
    return 'خصوصية الشركاء توضح كيف نتعامل مع بياناتك — الشفافية جزء من الثقة التسويقية.';
  }
  if (p.includes('login')) {
    return 'بعد التفعيل، لوحة الحلاق تكمّل ما بدأته هنا — حضورك يصبح قابلاً للإدارة.';
  }
  if (p.endsWith('/partners') || p.endsWith('/partners/')) {
    return 'ابدأ من «ابدأ الآن» أو «فعّل استجابة صالونك»؛ نظام الاستجابة الذكية والملف والتقييمات هي عرضك للطلبات النشطة المناسبة لك.';
  }
  return 'تجوّل في الروابط أعلاه؛ كل صفحة تكمّل صورة المنصّة الاستثمارية أمام عملائك.';
}
