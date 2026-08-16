/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * سردية «المول الرقمي» — مسار الشركاء فقط.
 * طبقة تسويقية فوق منهجية التفعيل والحرية — لا تُستبدل بهما.
 * المنطق الحالي: جماهيرية وسيو قائمان، والمزيد في الطريق — خذ موضعك لتظهر عند الاستعلام.
 * يُحدَّث بالتزامن مع api/_lib/partnerMallNarrativeCopy.ts
 */

export const PARTNER_MALL_TAGLINE_AR = 'خذ موضعك في المول الرقمي للحلاقين';

export const PARTNER_MALL_HERO_BADGE_AR = 'مسار الشركاء · جماهيرية قائمة · والمزيد في الطريق';

export const PARTNER_MALL_HERO_TITLE_AR = 'خذ موضعك في المول الرقمي';

export const PARTNER_MALL_HERO_TITLE_ACCENT_AR = 'للحلاقين — والجماهيرية قائمة';

export const PARTNER_MALL_HERO_LEAD_DESKTOP_AR =
  'حلاق ماب تملك استعلاماً حياً وسيوًا واسعاً — والمزيد من الباحثين في الطريق. رخصة الظهور تضع صالونك أمام المستعلم المناسب في حيّه، عند الطلب.';

export const PARTNER_MALL_HERO_LEAD_MOBILE_AR =
  'جماهيرية وسيو قائمان — والمزيد في الطريق. ثبّت صالونك ليظهر عند الاستعلام · لا عمولة.';

/** صور مسار الشركاء — من تصميم الهبوط B2B */
export const PARTNER_B2B_VISUAL_ASSETS = {
  hero: '/images/partners/hero_mall_2.webp',
  commission: '/images/partners/feature_commission_2.webp',
  autonomy: '/images/partners/feature_autonomy_2.webp',
  radar: '/images/partners/feature_radar_2.webp',
} as const;

export const PARTNER_B2B_FEATURES_SECTION_AR = {
  kicker: 'قيمنا الأساسية',
  title: 'لماذا يختار الشركاء',
  titleAccent: 'حلاق ماب؟',
} as const;

export const PARTNER_B2B_FEATURE_CARDS = [
  {
    id: 'commission',
    asset: 'commission' as const,
    badge: '0% عمولات',
    icon: '💰',
    title: 'اربح بالكامل من عملك',
    description:
      'لا نقتطع عمولة على خدمة الصالون. كل ريال من عملك يبقى لك، والعلاقة مع المستعلم مباشرة بعد الظهور.',
    highlight: 'أرباحك لك — بلا عمولة',
  },
  {
    id: 'autonomy',
    asset: 'autonomy' as const,
    badge: 'سيادة كاملة',
    icon: '🔑',
    title: 'رخصة تشغيل حرة — لا وصاية',
    description:
      'نمنحك رخصة تشغيل حرة: حدّد أسعارك وأوقاتك وخدماتك، وتواصل مع المستعلم مباشرة بلا تجديد تلقائي يربطك.',
    highlight: 'أنت القائد دائماً',
  },
  {
    id: 'radar',
    asset: 'radar' as const,
    badge: 'رادار حي',
    icon: '📡',
    title: 'الظهور عند الاستعلام المناسب',
    description:
      'نوفر البنية والموقع الحيوي. المستهلك يستعلم بلا تسجيل — ويرى من يطابق فلتره قريباً عند توافر الظهور.',
    highlight: 'ظهور عند الطلب — بلا وسيط',
  },
] as const;

export const PARTNER_B2B_FEATURE_EXTRAS = [
  {
    icon: '🔒',
    title: 'اتصال مشفّر — `SSL` موثّق',
    description: 'بيانات صالونك وبيانات عملائك عبر اتصال آمن وفق معايير المنصة.',
  },
  {
    icon: '⚡',
    title: 'تفعيل واضح — دون تعقيد',
    description: 'مسار ذاتي: تسجيل → باقة → دفع → تفعيل. لا عقود ملزمة ولا انتظار غامض.',
  },
] as const;

export const PARTNER_MALL_HERO_CHIPS_AR = [
  'جماهيرية بحث قائمة',
  'ظهور عند الطلب فقط',
  'لا عمولة · لا تجديد تلقائي',
] as const;

export const PARTNER_MALL_SECTION_KICKER_AR = 'منطق المول الرقمي';

export const PARTNER_MALL_SECTION_TITLE_AR = 'ثلاث حقائق — لا ثلاث وعود';

export const PARTNER_MALL_SECTION_LEAD_AR =
  'الاستعلام يعمل، والسيو يجلب الباحثين، والمزيد قادم. موضعك في الشبكة هو ما يقرر إن ظهر صالونك في تلك اللحظة.';

export const PARTNER_MALL_PHASES = [
  {
    id: 'audience',
    title: 'جماهيرية قائمة',
    description:
      'استعلام حي وسيو واسع يعملان الآن — الباحث يصل ويسأل عن حلاق مناسب في محيطه.',
  },
  {
    id: 'place',
    title: 'موضعك في الشبكة',
    description:
      'صالونك يثبّت موقعه: صور، بطاقة، حالة مفتوح/مغلق، و`QR` التقييمات — لتظهر عند تطابق الاستعلام.',
  },
  {
    id: 'more',
    title: 'المزيد في الطريق',
    description:
      'قنوات وصول إضافية للمستعلمين تُجهَّز تباعاً. من فعّل رخصته يكون جاهزاً للظهور — بلا وعد بعدد زبائن مضمون.',
  },
] as const;

export const PARTNER_MALL_WHY_NOW = [
  {
    id: 'position',
    title: 'خذ موضعك الآن',
    body: 'الجماهيرية قائمة. من يفعّل رخصته في حيّه يظهر عند الاستعلام المناسب — الغائب لا يُرى في تلك اللحظة.',
  },
  {
    id: 'ready',
    title: 'جاهزية المحل',
    body: 'ارفع صورك، اضبط خدماتك، وتعرّف على أدوات محلك — حتى يرى المستعلم صالوناً مكتملاً لا ملفاً فارغاً.',
  },
  {
    id: 'on-demand',
    title: 'ظهور عند الطلب',
    body: 'المحل مُجهَّز — والظهور يحدث عند استعلام يناسبك. لا واجهة دائمة لكل زائر ولا وعد بعدد زيارات.',
  },
] as const;

export const PARTNER_MALL_CLOSING_LINE_AR =
  'سمعتك منك — موضعك معنا — والظهور عند الطلب لا إشغالاً دائماً لملفك.';

/** نسخة واتساب / ميدان — إيموجي مسموح هنا فقط */
export const PARTNER_MALL_WHATSAPP_PITCH_AR =
  'خذ موضعك في المول الرقمي للحلاقين 🏢💈\n\nالجماهيرية والسيو قائمان — والمزيد من الباحثين في الطريق.\nثبّت موقعك، ارفع صورك، وجهّز QR التقييمات.\n\nمن يفعّل رخصته يظهر عند الاستعلام المناسب.\nظهور عند الطلب · لا عمولة · أنت تقود الصالون.';

/** ملخص مرجعي — للشات والمبيعات */
export const PARTNER_MALL_DOCTRINE_SIMPLE_AR =
  'المول الرقمي للحلاقين مساحة استعلام حيّة: جماهيرية وسيو قائمان، والمزيد من الباحثين في الطريق. من يفعّل رخصته يظهر عند تطابق الموقع والفلتر — بلا وعد بعدد زبائن مضمون.' as const;

export const PARTNER_B2B_URGENCY_AR = {
  kicker: 'المرحلة الحالية',
  title: 'الجماهيرية قائمة — والمزيد في الطريق',
  lead: PARTNER_MALL_DOCTRINE_SIMPLE_AR,
  points: [
    'افتح بحث قوقل واكتب «أقرب حلاق» أو «حلاق قريب» وتأكد بنفسك أين تتموضع حلاق ماب؟',
    'الاستعلام والسيو يعملان الآن — الباحث يسأل عن حلاق مناسب في محيطه',
    'الظهور يحدث عند الطلب المناسب — لا وعد بعدد زبائن مضمون',
    'لا تترك ملفك فارغاً حين يستعلم الباحث في حيّك',
  ],
} as const;

export const PARTNER_MALL_FAQ_AR = {
  q: 'ما معنى «المول الرقمي» في حلاق ماب؟',
  a: 'مساحة رقمية للاستعلام عن صالونات حيّك. الجماهيرية والسيو يعملان الآن، والمزيد قادم. أنت تثبّت موضعك (صور، بطاقة، `QR`) — والظهور يحدث عند استعلام يناسب موقعك وفلترك، لا كقائمة دائمة لكل زائر.',
} as const;
