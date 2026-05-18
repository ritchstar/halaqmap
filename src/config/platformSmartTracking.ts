/**
 * صياغة المنصة الأساسية — نظام الرصد الذكي (مصدر موحّد للهيرو، البحث، والتسجيل).
 */

export const PLATFORM_SMART_TRACKING_SLOGAN =
  'حلاق ماب: المنصة الأولى المدعومة بنظام الرصد الذكي';

export const PLATFORM_SMART_TRACKING_SUBTEXT =
  'محرك بحث جغرافي فائق السرعة، يرصد ويحدد أقرب صالونات الحلاقة إليك بدقة متناهية وفي أجزاء من الثانية.';

/** شارة الهيرو — الصفحة الرئيسية */
export const PLATFORM_HERO_BADGE = 'نظام الرصد الذكي · حلاق ماب';

/** سطر ثقة قصير تحت الهيرو */
export const PLATFORM_HERO_TRUST_LINE =
  'رصد جغرافي دقيق · نتائج فورية · تواصل مباشر مع الصالون';

/** زر ومحفّز تحديد الموقع (بحث المستخدم) */
export const PLATFORM_SEARCH_LOCATION_BUTTON = 'ابدأ الرصد الجغرافي — حدّد موقعك';
export const PLATFORM_SEARCH_LOCATION_HINT = PLATFORM_SMART_TRACKING_SUBTEXT;
export const PLATFORM_SEARCH_LOCATION_LOADING = 'جاري الرصد الجغرافي لموقعك…';
export const PLATFORM_SEARCH_LOCATION_SUCCESS = 'تم رصد موقعك — جارٍ تحديد أقرب الصالونات';

/** سياق شريط الفلاتر بعد تفعيل الموقع */
export const PLATFORM_SEARCH_RESULTS_CONTEXT =
  'محرك الرصد الذكي يعرض أقرب الصالونات ضمن النطاق الذي تختاره — صفِّ النتائج بالمسافة والتقييم والباقة.';

export const PLATFORM_SEARCH_EMPTY_LOADING = 'جاري الرصد الجغرافي وتحديث أقرب النتائج…';
export const PLATFORM_SEARCH_EMPTY_TITLE = 'لا توجد صالونات ضمن نطاق الرصد الحالي';
export const PLATFORM_SEARCH_EMPTY_HINT =
  'وسّع نطاق الرصد من شريط المسافة (حتى 25 كم) أو ألغِ الفلاتر لإظهار المزيد من الصالونات المُرصَدة.';

/** خطوات «كيف تعمل» — الصفحة الرئيسية */
export const PLATFORM_HOW_IT_WORKS_STEPS = [
  {
    step: '١',
    title: 'فعّل الرصد الجغرافي',
    description: 'يحدد موقعك بدقة ليبدأ محرك البحث برصد الصالونات في محيطك.',
  },
  {
    step: '٢',
    title: 'رصد وفرز فوري',
    description: 'محرك بحث جغرافي فائق السرعة يرتّب الأقرب والأنسب حسب معاييرك.',
  },
  {
    step: '٣',
    title: 'تواصل أو احجز',
    description: 'اتصال، واتساب، ورابط الموقع — حسب ما يوفّره الصالون المُرصَد.',
  },
] as const;

/** بطاقات الميزات — قبل تحديد الموقع */
export const PLATFORM_HOME_WELCOME_FEATURES = [
  {
    title: 'رصد جغرافي دقيق',
    description:
      'نظام الرصد الذكي يحدد موقعك ويرصد أقرب صالونات الحلاقة في محيطك بدقة متناهية.',
  },
  {
    title: 'محرك بحث فائق السرعة',
    description: 'نتائج فورية في أجزاء من الثانية — مع فلترة بالمسافة والتقييم والباقة.',
  },
  {
    title: 'تواصل مباشر',
    description: 'بعد الرصد، تواصل مع الصالون عبر الاتصال أو واتساب أو رابط الموقع.',
  },
] as const;

/** تسجيل الحلاق / لوحة الشركاء */
export const PLATFORM_PARTNER_SMART_TRACKING_HEADLINE = PLATFORM_SMART_TRACKING_SLOGAN;
export const PLATFORM_PARTNER_SMART_TRACKING_LEAD = PLATFORM_SMART_TRACKING_SUBTEXT;

export const PLATFORM_PARTNER_DASHBOARD_TAGLINE =
  'صالونك ضمن نظام الرصد الذكي — يُرصد للعملاء الباحثين في محيطك فور تفعيل الترخيص.';

/** ميزة الباقات في التسجيل وسياسة الاشتراك */
export const MAP_FEATURE_PARTNER_SUBTITLE =
  'بعد التفعيل يُرصد صالونك ضمن محرك البحث الجغرافي فائق السرعة، ويصلك بالعملاء الباحثين في محيطك بدقة متناهية وفي أجزاء من الثانية.';
