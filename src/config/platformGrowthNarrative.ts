/**
 * نصوص موحّدة للمنصّة — تُستورد من الصفحة الرئيسية، من نحن، التسجيل، التذييل، والوصف لـ SEO.
 */
import {
  PLATFORM_HERO_TRUST_LINE,
  PLATFORM_HOME_WELCOME_FEATURES,
  PLATFORM_SMART_TRACKING_SLOGAN,
  PLATFORM_SMART_TRACKING_SUBTEXT,
} from '@/config/platformSmartTracking';
import { LEGAL_TRADE_NAME_AR } from '@/config/partnerLegal';

export const PLATFORM_META_DESCRIPTION =
  'حلاق ماب — المنصة الأولى المدعومة بنظام الرصد الذكي. محرك بحث جغرافي فائق السرعة يرصد ويحدد أقرب صالونات الحلاقة بدقة متناهية في أجزاء من الثانية — المملكة العربية السعودية.';

export const PLATFORM_OG_TITLE = 'حلاق ماب | نظام الرصد الذكي لصالونات الحلاقة';

export const PLATFORM_TWITTER_DESCRIPTION = PLATFORM_SMART_TRACKING_SUBTEXT;

/** ترويسة الهيرو — سطران */
export const PLATFORM_HERO_H1 = {
  line1: 'حلاق ماب: المنصة الأولى',
  line2: 'المدعومة بنظام الرصد الذكي',
} as const;

export const PLATFORM_HERO_LEAD = PLATFORM_SMART_TRACKING_SUBTEXT;

export { PLATFORM_HERO_TRUST_LINE };

/** تذييل Layout */
export const PLATFORM_FOOTER_TAGLINE = PLATFORM_SMART_TRACKING_SUBTEXT;

/** السطر القانوني الرسمي للمؤسسة — يُعرض في تذييل الواجهات العامة */
export const PLATFORM_OFFICIAL_FOOTER_LEGAL_LINE =
  'جميع الحقوق محفوظة © ٢٠٢٦ | حلاق ماب هي إحدى مشاريع مؤسسة أحمد بن عبدالله بن سراء التجارية';

/** رابط التذييل إلى صفحة «من نحن» (محتوى تعريفي بالمؤسسة) */
export const PLATFORM_OFFICIAL_ENTITY_ABOUT_LINK_LABEL = 'عن المؤسسة';

/** تسجيل الحلاق — تحت العنوان */
export const PLATFORM_REGISTER_INTRO =
  'انضم إلى شبكة الرصد الذكي: بعد تفعيل الترخيص يُرصد صالونك للعملاء الباحثين في محيطك عبر محرك بحث جغرافي فائق السرعة — اختر الباقة المناسبة وابدأ الظهور بدقة.';

/** من نحن — تحت عنوان الصفحة */
export const PLATFORM_ABOUT_HERO_SUBTITLE = PLATFORM_SMART_TRACKING_SUBTEXT;

/** صندوق الرؤية في «من نحن» */
export const PLATFORM_VISION_BODY =
  'أن نكون المنصة العربية المرجعية المدعومة بنظام رصد ذكي يربط الحلّاقين بالعملاء عبر دقة جغرافية وسرعة استجابة — دون مبالغة في الوعود.';

export const PLATFORM_MISSION_BODY =
  'توفير محرك بحث جغرافي يُرصد أقرب صالونات الحلاقة للزائر في أجزاء من الثانية، مع تمكين الشركاء من إدارة ظهورهم والتفاعل مع الزبائن باحترافية.';

/** مقدمة قسم «لماذا حلاق ماب؟» */
export const PLATFORM_WHY_FEATURES_INTRO =
  'نظام الرصد الذكي يجمع بين السرعة والدقة والقرب — مميزات عملية للباحث وللشريك.';

export { PLATFORM_HOME_WELCOME_FEATURES };

/** أهدافنا — أربع فقرات (نفس المضمون في «من نحن» والرئيسية) */
export const PLATFORM_GOAL_ITEMS = [
  {
    title: 'رصد جغرافي للسوق',
    body:
      'نبني قاعدة شركاء مُرصَدين عبر نظام الرصد الذكي قبل توسيع الوصول — حتى يكون كل بحث في محيط جاهز ذا معنى.',
  },
  {
    title: 'سرعة استجابة فائقة',
    body:
      'محرك بحث يُحدد الأقرب في أجزاء من الثانية — تجربة تقنية بمستوى متميز للمستخدم والشريك.',
  },
  {
    title: 'وصول المستخدمين في أوانه',
    body:
      'عندما يكتمل الرصد في منطقة جغرافية، يصبح الاختيار فورياً وواضحاً للزائر.',
  },
  {
    title: 'منهجية محبّبة للطرفين',
    body:
      'رؤيتنا تعتمد على دقة الرصد وشفافية الظهور — ثقة تدريجية دون وعود فارغة.',
  },
] as const;

export const PLATFORM_GOALS_SECTION_TITLE = 'أهدافنا';
export const PLATFORM_GOALS_SECTION_LEDE =
  'نشر المنصة المدعومة بنظام الرصد الذكي: نُرصد الشركاء عبر نظام الرصد الذكي ثم نصل بالباحثين بدقة وسرعة على مستوى المملكة.';

/** عنصر «لماذا حلاق ماب» — بدل «جودة مضمونة» */
export const PLATFORM_ABOUT_FEATURE_QUALITY = {
  title: 'رصد ودقة',
  description:
    'الشركاء المعتمدون يظهرون ضمن نتائج الرصد الذكي؛ التقييمات والشفافية تعزز الثقة مع كل بحث.',
} as const;

export { PLATFORM_SMART_TRACKING_SLOGAN, PLATFORM_SMART_TRACKING_SUBTEXT };

/** القسم التعريفي بالمنتج الرقمي — الصفحة الرئيسية (Landing) */
export const PLATFORM_DIGITAL_PRODUCT_INTRO_TITLE = 'التعريف بالمنتج الرقمي';

export const PLATFORM_DIGITAL_PRODUCT_INTRO_BADGE = 'منتج وطني · ممتثل للأنظمة التجارية';

export const PLATFORM_DIGITAL_PRODUCT_INTRO_PARAGRAPHS = [
  `منصة حلاق ماب (Halaq Map) هي منتج برمجي تقني (SaaS) حصري تم تطويره وإنتاجه وإدارته بالكامل كملكّية فكرية وتجارية تابعة لـ (${LEGAL_TRADE_NAME_AR}).`,
  'تعتمد المنصة في نموذجها التشغيلي على تقديم خدمة بحث جغرافية متطورة تخدم قطاع الأفراد (B2C) بشكل مجاني بالكامل لتسهيل رصد واكتشاف الخدمات، بينما توفر حلولاً رقمية متكاملة وأنظمة رصد ذكية مخصصة لقطاع الأعمال ومزودي الخدمة (B2B) بمميزات متطورة وأسعار محددة وواضحة، وهو المبرر القانوني والتجاري لحلول البيع والاشتراكات الرقمية الحصرية للمنشآت في المنصة، تماشياً وتدعيماً للرؤية المباركة للمملكة العربية السعودية (2030) نحو مستقبل مشرق بأيدٍ وطنية.',
] as const;

