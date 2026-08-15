/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * صفحة تفعيل الصالونات — الجماهيرية والسيو قائمان، والمزيد في الطريق.
 */
export const MERCHANT_SETTLEMENT_PATH = '/partners/merchant-settlement' as const;

/** تجربة المستخدم — Shorts (بحث أقرب حلاق) */
export const MERCHANT_SETTLEMENT_USER_EXPERIENCE_YOUTUBE_ID = 'buRFUPrN9ko' as const;

export const MERCHANT_SETTLEMENT_META = {
  titleAr: 'فعّل صالونك الآن | حلاق ماب',
  descriptionAr:
    'جماهيرية بحث وسيو واسع يعملان الآن — والمزيد من المستعلمين في الطريق. خذ موضعك لتظهر عند الاستعلام في حيّك.',
} as const;

/** مقاييس معلنة على الصفحة — حدّثها عند صدور أرقام أدق */
export const MERCHANT_SETTLEMENT_PROOF_STATS = [
  {
    valueAr: '+8 ملايين',
    labelAr: 'زيارة في أسبوع واحد',
    noteAr: 'زخم حقيقي على صفحات الاستعلام',
  },
  {
    valueAr: '+918 ألف',
    labelAr: 'مشاهدة يوتيوب / 28 يوماً',
    noteAr: 'مقطع تجربة الاستعلام أمام الجمهور',
  },
  {
    valueAr: '47 مدينة',
    labelAr: 'تغطية جغرافية للفهرسة',
    noteAr: 'صفحات «أقرب حلاق» حسب المدينة',
  },
  {
    valueAr: 'والمزيد قادم',
    labelAr: 'قنوات وصول إضافية',
    noteAr: 'الاستعلام يعمل — والتوسع مستمر',
  },
] as const;

export const MERCHANT_SETTLEMENT_HERO = {
  eyebrowAr: 'رسالة مباشرة لأصحاب الصالونات',
  brandAr: 'حلاق ماب',
  headlineAr: 'الجماهيرية قائمة. خذ موضعك لتظهر عند الاستعلام.',
  leadAr:
    'حلاق ماب تملك استعلاماً حياً وسيوًا واسعاً — والزيارات أثبتت أن الباحث يصل ويسأل عن صالون مناسب في محيطه. المزيد من قنوات الوصول في الطريق. رخصتك هي ما يضع صالونك في الاستجابة عند تطابق الموقع والفلتر.',
} as const;

export const MERCHANT_SETTLEMENT_INVESTOR_QA = {
  questionAr: 'لو سألت كمستثمر صارم: كيف تخطّطون لنشر المنصة؟',
  answerAr:
    'الاستعلام والسيو يعملان الآن على نطاق واسع. المزيد من قنوات الوصول يُجهَّز تباعاً: ستاندات أكريليك بـ `QR`، فنادق، شقق مخدومة، مجمعات، أندية، مقاهي، ولوحات طرق. فرصة الصالون أن يكون حاضراً حين يحدث الاستعلام في حيّه. لا نعد بعدد زبائن مضمون.',
} as const;

export const MERCHANT_SETTLEMENT_WHY_PAUSE = [
  'الجماهيرية والسيو قائمان — الباحث يسأل عن حلاق مناسب في محيطه الآن.',
  'المزيد من قنوات الوصول في الطريق — من فعّل رخصته يكون جاهزاً للظهور عند كل موجة جديدة.',
  'الرخصة تضع صالونك في الاستجابة عند تطابق الموقع والفلتر — الغائب لا يُرى في تلك اللحظة.',
  'لا وعد بعدد زبائن — القيمة حضور مهني أمام استعلام حي، وتواصل مباشر بعد الظهور.',
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
    blurbAr: 'هكذا يعمل الاستعلام: رادار، نطاق، ومتابعة الطلب — ثم يظهر الصالون المناسب عند التطابق.',
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
