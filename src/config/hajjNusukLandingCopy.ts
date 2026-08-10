/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مركز نسك الحج — فزعة من حلاق ماب للحلق والتقصير.
 * المنصة أداة استعلام؛ ليست جهة إفتاء وليست صالوناً.
 */
export const HAJJ_NUSUK_PATH = '/nusuk' as const;
export const HAJJ_NUSUK_SITE_ORIGIN = 'https://www.halaqmap.com' as const;

export const HAJJ_NUSUK_META = {
  titleAr: 'نسك الحج — الحلق والتقصير | حلاق ماب',
  descriptionAr:
    'مركز نسك الحج من حلاق ماب: افهم الحلق والتقصير، ثم ابدأ استعلام أقرب حلاق شريك في مكة أو المدينة — منصة استعلام وليست صالوناً ولا جهة إفتاء.',
} as const;

export const HAJJ_NUSUK_HERO = {
  badgeAr: 'مركز نسك الحج',
  h1Ar: 'النُّسُك: الحلق والتقصير',
  leadAr:
    'بعد أداء المناسك يحتاج كثير من الحجاج إلى حلق شعر الرأس أو تقصيره. حلاق ماب منصة استعلام رقمية تساعدك على بدء البحث عن حلاق قريب ضمن الشركاء المفعّلين — دون أن تكون صالوناً أو وسيط حجز أو جهة فتوى.',
} as const;

export const HAJJ_NUSUK_TERMS = [
  {
    termAr: 'النُّسُك',
    bodyAr:
      'العمل العبادي المرتبط بالتحلل في الحج أو العمرة. ومنه ما يتعلق بشعر الرأس: الحلق أو التقصير — وفق ما يعتمده الحاج مع مرجعه الشرعي.',
  },
  {
    termAr: 'الحلق',
    bodyAr:
      'إزالة شعر الرأس بالكامل (حلق الرأس). كثير من الباحثين يكتبون: حلق، حلاقة الحاج، حلق الرأس بعد الحج.',
  },
  {
    termAr: 'التقصير',
    bodyAr:
      'أخذ جزء من شعر الرأس دون حلقه كاملاً. يبحث عنه الحاج بكلمات مثل: تقصير، تقصير الشعر، تقصير بعد العمرة.',
  },
] as const;

export const HAJJ_NUSUK_PLATFORM_NOTE =
  'حلاق ماب لا تقدّم خدمة الحلاقة بنفسها، ولا تُفتي في أحكام النسك، ولا تضمن توفر صالون في كل لحظة. دورها برمجي: استعلام وعرض رقمي لشركاء مفعّلين داخل المنصة، والعلاقة في تنفيذ الخدمة مباشرة بينك وبين الصالون.';

export const HAJJ_NUSUK_CTAS = [
  {
    id: 'makkah',
    labelAr: 'ابدأ الاستعلام — مكة المكرمة',
    blurbAr: 'لنطاق مكة وما حول الحرم ضمن البيانات المتاحة.',
    appNearKey: 'makkah',
    nearPath: '/near/makkah',
  },
  {
    id: 'madinah',
    labelAr: 'ابدأ الاستعلام — المدينة المنورة',
    blurbAr: 'لنطاق المدينة وما حولها ضمن البيانات المتاحة.',
    appNearKey: 'madinah',
    nearPath: '/near/madinah',
  },
] as const;

export const HAJJ_NUSUK_GEO_LINKS = [
  { href: '/near/makkah', labelAr: 'أقرب حلاق في مكة' },
  { href: '/near/makkah/aziziyah', labelAr: 'أقرب حلاق في العزيزية (مكة)' },
  { href: '/near/madinah', labelAr: 'أقرب حلاق في المدينة' },
  { href: '/near/madinah/quba', labelAr: 'أقرب حلاق في قباء' },
  { href: '/near', labelAr: 'كل مدن وأحياء التغطية' },
] as const;

/** إشارات لغات للحجاج — ليست صفحات مستقلة بعد؛ كلمات مساعدة للفهرسة والوضوح */
export const HAJJ_NUSUK_LANG_HINTS = [
  {
    langAr: 'الإنجليزية',
    line: 'Hajj / Umrah haircut · Halq (full shave) · Taqsir (shortening) · nearest barber Makkah / Madinah',
  },
  {
    langAr: 'الأوردو',
    line: 'حج حلق · تقصیر · مکّہ / مدینہ قریب حجام',
  },
  {
    langAr: 'الإندونيسية / الملايوية',
    line: 'Cukur haji · Halq · Taqsir · tukang cukur terdekat Mekah / Madinah',
  },
  {
    langAr: 'التركية',
    line: 'Hac tıraşı · Halq · Takṣīr · Mekke / Medine berber',
  },
] as const;

export const HAJJ_NUSUK_FAQS = [
  {
    q: 'ما الفرق بين الحلق والتقصير؟',
    a: 'الحلق إزالة شعر الرأس بالكامل، والتقصير أخذ جزء منه. اختيار أحدهما نسكٌ عبادي يُرجع فيه الحاج إلى ما يعتمده شرعاً — والمنصة لا تُفتي في ذلك.',
  },
  {
    q: 'هل حلاق ماب صالون للحجاج في مكة؟',
    a: 'لا. حلاق ماب منصة برمجية للاستعلام والعرض الرقمي. الصالونات الظاهرة — إن وُجدت — شركاء مفعّلون داخل المنصة، والتنسيق معهم مباشرة.',
  },
  {
    q: 'كيف أبدأ البحث عن حلاق للحلق أو التقصير؟',
    a: 'اختر مكة أو المدينة أدناه لبدء الاستعلام داخل التطبيق حول ذلك النطاق، أو افتح صفحات «أقرب حلاق» حسب الحي ثم اضغط ابدأ الاستعلام.',
  },
  {
    q: 'هل الصفحة تغطي لغات الحجاج المختلفة؟',
    a: 'المركز عربي أولاً لأن أغلب استعلامات المنطقة كذلك. أضفنا إشارات بكلمات شائعة بلغات أخرى (Halq، Taqsir، cukur haji…) لنفس مسار الاستعلام — وصفحات لغات كاملة قد تُضاف لاحقاً دون إضعاف جودة المحتوى.',
  },
] as const;

export function hajjNusukAppCtaUrl(nearKey: string, origin = HAJJ_NUSUK_SITE_ORIGIN): string {
  const base = origin.replace(/\/+$/, '');
  return `${base}/#/?near=${encodeURIComponent(nearKey)}`;
}
