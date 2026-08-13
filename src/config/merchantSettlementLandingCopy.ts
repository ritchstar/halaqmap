/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * صفحة تسكين التجار — موقف المنصة الحالي بعد انفجار زيارات المستخدمين
 * أثناء حملات موجّهة أصلاً لأصحاب الصالونات.
 */
export const MERCHANT_SETTLEMENT_PATH = '/partners/merchant-settlement' as const;

/** تجربة المستخدم — Shorts (بحث أقرب حلاق) */
export const MERCHANT_SETTLEMENT_USER_EXPERIENCE_YOUTUBE_ID = 'buRFUPrN9ko' as const;

export const MERCHANT_SETTLEMENT_META = {
  titleAr: 'تسكين الصالونات الآن | حلاق ماب',
  descriptionAr:
    'أوقفنا حملات الترويج العامة لنركّز على تسكين أصحاب الصالونات. الطلب من المستخدمين ثبت فعلياً — الفرصة الآن لمقدّمي الخدمة.',
} as const;

/** مقاييس معلنة على صفحة التسكين — حدّثها عند صدور أرقام أدق */
export const MERCHANT_SETTLEMENT_PROOF_STATS = [
  {
    valueAr: '+8 ملايين',
    labelAr: 'زيارة في أسبوع واحد',
    noteAr: 'دون استهداف المستخدم بالإعلان المباشر',
  },
  {
    valueAr: '+918 ألف',
    labelAr: 'مشاهدة يوتيوب / 28 يوماً',
    noteAr: 'مقطع تجربة المستخدم أثبت الجاذبية',
  },
  {
    valueAr: '47 مدينة',
    labelAr: 'تغطية جغرافية للفهرسة',
    noteAr: 'صفحات «أقرب حلاق» حسب المدينة',
  },
  {
    valueAr: 'موقف واضح',
    labelAr: 'مرحلة تسكين التجار',
    noteAr: 'لم نبدأ بعد برامج نشر المستخدم الاستراتيجية',
  },
] as const;

export const MERCHANT_SETTLEMENT_HERO = {
  eyebrowAr: 'رسالة مباشرة لأصحاب الصالونات',
  brandAr: 'حلاق ماب',
  headlineAr: 'الطلب من المستخدم ثبت. الفرصة الآن لتسكين صالونك.',
  leadAr:
    'أطلقنا حملات لتسكين التجار على المول الرقمي (Google · X · YouTube · Facebook · Snapchat). ظهرت زيارات واسعة — واتضح أن كثيراً منها مستخدمون ينتظرون صالونات حيّة تبرز لهم ضمن نطاقهم، لا تجّار. أوقفنا الحملات العامة لنركّز على إقفال اشتراكات الصالونات وشرح ما تحقق على الأرض.',
} as const;

export const MERCHANT_SETTLEMENT_INVESTOR_QA = {
  questionAr: 'لو سألت كمستثمر صارم: كيف تخطّطون لنشر المنصة؟',
  answerAr:
    'الإجابة اليوم بصراحة: لم نبدأ بعد استهداف المستخدمين ببرامج استراتيجية واسعة. ما زلنا في مرحلة تسكين التجار — أن تشترك أعداد كافية من الصالونات أولاً. بعد ذلك تنطلق برامج النشر على السوشال وعلى الأرض (ستاندات أكريليك بـ QR، فنادق، شقق مخدومة، تطبيقات إيجار، مجمعات، أندية، مقاهي، لوحات طرق…). القبول من المستخدم لم يعد فرضية: التجربة أثبتت أن المستعلم ينتظر صالونات حيّة تبرز له عند الطلب.',
} as const;

export const MERCHANT_SETTLEMENT_WHY_PAUSE = [
  'الحملات كانت موجّهة للتاجر، فوصلت إلى مستخدم ينتظر صالونات حيّة تبرز له ضمن نطاقه — وهذا دليل قوة لا ضعف.',
  'الأولوية الآن لاكتمال تسكين الصالونات الجاهزة قبل توسيع قنوات الدعوة — حتى يجد المنتظر خيارات حيّة لا فراغاً.',
  'المنصة أثبتت قدرتها على استقبال زخم واسع؛ التركيز الآن على إقفال طلبات الاشتراك.',
  'كل صالون يُسكَّن اليوم يستفيد لاحقاً من جاهزية المنصة للظهور كمقدّم خدمة حيّ أمام المستعلم.',
] as const;

export const MERCHANT_SETTLEMENT_GROUND_TACTICS = [
  'ستاندات أكريليك بـ QR للمنصة في غرف النزلاء والمنشآت الفندقية',
  'الشقق المخدومة ومؤجّرو الدور الخاصة عبر تطبيقات الإيجار القصير',
  'المجمعات السكنية والأندية الرياضية والمقاهي الكبرى والمتخصصة',
  'لوحات الطرق وقنوات ميدانية أخرى مُعدّة خصيصاً لانتشار المملكة',
] as const;

export type MerchantSettlementVideo = {
  videoId: string;
  titleAr: string;
  blurbAr: string;
};

/**
 * مقطع تجربة المستخدم (Shorts). يمكن تجاوزه بـ `VITE_MERCHANT_SETTLEMENT_RADAR_YOUTUBE_ID`.
 */
export const MERCHANT_SETTLEMENT_RADAR_VIDEO_ID =
  String(import.meta.env.VITE_MERCHANT_SETTLEMENT_RADAR_YOUTUBE_ID || '').trim() ||
  MERCHANT_SETTLEMENT_USER_EXPERIENCE_YOUTUBE_ID;

export const MERCHANT_SETTLEMENT_VIDEOS: readonly MerchantSettlementVideo[] = [
  {
    videoId: MERCHANT_SETTLEMENT_RADAR_VIDEO_ID,
    titleAr: 'تجربة المستخدم للبحث عن أقرب حلاق عبر حلاق ماب',
    blurbAr: 'المقطع الذي أثبت أن نشر المنصة ممكن: استعلام، رادار، ومتابعة الطلب — دون خطوات تسجيل الصالون.',
  },
] as const;

export const MERCHANT_SETTLEMENT_CTA = {
  primaryAr: 'سجّل طلب اشتراك صالونك الآن',
  secondaryAr: 'مسار الشركاء',
  salesOfficeAr: 'مكتب المبيعات — ناقش معنا',
  supportAr: 'دعم الشركاء',
  nearAr: 'معاينة صفحات «أقرب حلاق» حسب المدينة',
  homeDemoAr: 'شاهد تجربة الاستعلام (كعميل)',
} as const;
