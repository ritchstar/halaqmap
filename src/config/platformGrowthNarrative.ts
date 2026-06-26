/**
 * نصوص موحّدة للمنصّة — تُستورد من الصفحة الرئيسية، من نحن، التسجيل، التذييل، والوصف لـ SEO.
 */
import {
  PLATFORM_HERO_TRUST_LINE,
  PLATFORM_HOME_WELCOME_FEATURES,
  PLATFORM_SMART_TRACKING_SLOGAN,
  PLATFORM_SMART_TRACKING_SUBTEXT,
} from '@/config/platformSmartTracking';
import { PLATFORM_GROWTH_REGISTER_INTRO_AR } from '@/config/platformGrowthPrograms';
import { LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR, LEGAL_MEDIA_LICENSE_FOOTER_LINE_AR } from '@/config/partnerLegal';

export const PLATFORM_META_DESCRIPTION =
  'حلاق ماب — منصة رقمية ذكية تساعد المستخدم على الوصول إلى مقدم الخدمة المناسب والتواصل معه مباشرة، عبر استجابة سريعة وعرض عملي واضح — المملكة العربية السعودية.';

export const PLATFORM_OG_TITLE = 'حلاق ماب | استجابة ذكية للوصول إلى مقدم الخدمة المناسب';

export const PLATFORM_TWITTER_DESCRIPTION = PLATFORM_SMART_TRACKING_SUBTEXT;

/** ترويسة الهيرو — سطران */
export const PLATFORM_HERO_H1 = {
  line1: 'حلاق ماب: المنصة الأولى',
  line2: 'المدعومة بنظام الاستجابة الذكية',
} as const;

export const PLATFORM_HERO_LEAD = PLATFORM_SMART_TRACKING_SUBTEXT;

export { PLATFORM_HERO_TRUST_LINE };

/** تذييل Layout */
export const PLATFORM_FOOTER_TAGLINE = PLATFORM_SMART_TRACKING_SUBTEXT;

/** السطر القانوني الرسمي للمؤسسة — يُعرض في تذييل الواجهات العامة */
export const PLATFORM_OFFICIAL_FOOTER_LEGAL_LINE =
  'جميع الحقوق محفوظة © ٢٠٢٦ | حلاق ماب — منصة رقمية سعودية';

/** سطر الترخيص الإعلامي الرسمي في التذييل */
export const PLATFORM_MEDIA_LICENSE_FOOTER_LINE = LEGAL_MEDIA_LICENSE_FOOTER_LINE_AR;

/** سطر توثيق التجارة الإلكترونية في التذييل */
export const PLATFORM_ECOMMERCE_AUTH_FOOTER_LINE = LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR;

/** رابط التذييل إلى صفحة «من نحن» (محتوى تعريفي بالمؤسسة) */
export const PLATFORM_OFFICIAL_ENTITY_ABOUT_LINK_LABEL = 'عن المؤسسة';

/** تسجيل الحلاق — تحت العنوان — مبدأ المؤسس: سجّل طلبك */
export const PLATFORM_REGISTER_INTRO = PLATFORM_GROWTH_REGISTER_INTRO_AR.replace(/\*\*/g, '');

/** من نحن — تحت عنوان الصفحة */
export const PLATFORM_ABOUT_HERO_SUBTITLE = PLATFORM_SMART_TRACKING_SUBTEXT;

/** صندوق الرؤية في «من نحن» */
export const PLATFORM_VISION_BODY =
  'أن نكون المنصة العربية المرجعية في الربط الذكي بين طالب الخدمة ومقدمها، عبر استجابة سريعة وتجربة استخدام واضحة وعملية — دون مبالغة في الوعود.';

export const PLATFORM_MISSION_BODY =
  'توفير تجربة رقمية سريعة تساعد المستخدم على الوصول إلى مقدم الخدمة المناسب والتواصل معه مباشرة، مع تمكين الشركاء من إدارة ظهورهم والتفاعل مع الزبائن باحترافية.';

/** مقدمة قسم «لماذا حلاق ماب؟» */
export const PLATFORM_SPECIALIZATION_THESIS_AR =
  'في أسواق الخدمات المحلية، التخصص يسبق الحجم. لا أحد يبحث عن «أي حلاق» — الجميع يبحث عن «الحلاق الصح».';

export const PLATFORM_SPECIALIZATION_FILTER_LEDE_AR =
  'في منصة حلاق ماب، فلاتر الخدمة تساعد الباحث على إيجاد الحلاق المناسب قدر الإمكان — وفق بيانات الشركاء المتاحة واستعلامه.';

/** مبدأ التخصص — فقرة موحّدة (B2B · B2C · من نحن) */
export const PLATFORM_SPECIALIZATION_POSITIONING_AR = `${PLATFORM_SPECIALIZATION_THESIS_AR} ${PLATFORM_SPECIALIZATION_FILTER_LEDE_AR}`;

export const PLATFORM_WHY_FEATURES_INTRO = PLATFORM_SPECIALIZATION_POSITIONING_AR;

export { PLATFORM_HOME_WELCOME_FEATURES };

/** أهدافنا — أربع فقرات (نفس المضمون في «من نحن» والرئيسية) */
export const PLATFORM_GOAL_ITEMS = [
  {
    title: 'تغطية فعالة للسوق',
    body:
      'نبني قاعدة شركاء جاهزة للاستجابة قبل توسيع الوصول — حتى يكون كل طلب فعلي قادرًا على الوصول إلى مزود خدمة حاضر وواضح.',
  },
  {
    title: 'سرعة استجابة فائقة',
    body:
      'تجربة رقمية سريعة تساعد المستخدم على الوصول إلى الأنسب في لحظته — بكفاءة عملية للمستخدم والشريك.',
  },
  {
    title: 'وصول المستخدمين في أوانه',
    body:
      'عندما تكتمل قاعدة الشركاء في المنطقة، يصبح الوصول إلى مقدم الخدمة المناسب فورياً وواضحاً للزائر.',
  },
  {
    title: 'منهجية محبّبة للطرفين',
    body:
      'رؤيتنا تعتمد على وضوح العرض وسرعة الوصول وشفافية الظهور — ثقة تدريجية دون وعود فارغة.',
  },
] as const;

export const PLATFORM_GOALS_SECTION_TITLE = 'أهدافنا';
export const PLATFORM_GOALS_SECTION_LEDE =
  'نشر المنصة المدعومة بنظام الاستجابة الذكية: نُفعّل ظهور الشركاء عند الطلب ثم نصل بالباحثين إلى مقدم الخدمة المناسب بسرعة ووضوح على مستوى المملكة.';

/** عنصر «لماذا حلاق ماب» — بدل «جودة مضمونة» */
export const PLATFORM_ABOUT_FEATURE_QUALITY = {
  title: 'وضوح وثقة',
  description:
    'الشركاء المعتمدون يظهرون ضمن نتائج الاستجابة الذكية؛ التقييمات والشفافية تعزز الثقة مع كل بحث.',
} as const;

export { PLATFORM_SMART_TRACKING_SLOGAN, PLATFORM_SMART_TRACKING_SUBTEXT };

/** الملكية الفكرية والحلول الرقمية — الصفحة الرئيسية (Landing) */
export const PLATFORM_DIGITAL_PRODUCT_INTRO_TITLE = 'الملكية الفكرية والحلول الرقمية 🇸🇦';

export const PLATFORM_DIGITAL_PRODUCT_INTRO_BADGE =
  'مزوّد حلول تقنية · ملكية فكرية حصرية · منتجات B2B';

export const PLATFORM_DIGITAL_PRODUCT_INTRO_PARAGRAPHS = [
  'إن كود البرمجة المصدري والملكية الفكرية لمنصة حلاق ماب (`Halaq Map`) مملوكة بالكامل وحصرياً لمالك المنصة المرخّص كأصل تقني.',
  'تعمل المنصة بصفتها **مزوّد حلول تقنية (Technical Solutions Provider)** متخصّصاً في تطوير وبيع منتجات رقمية للإدراج والعرض الذكي عند الطلب — **وليست وسيطاً تجارياً** بين الصالون والعميل، ولا تتقاضى عمولة على خدمة الحلاقة، ولا تتعاقد ولا تحجز نيابة عن أي طرف.',
  'وتقدم المنصة من خلال بنيتها الذكية حلولاً ومنتجات رقمية مخصصة لقطاع الأعمال ومزودي الخدمة (B2B) بمميزات متطورة وأسعار محددة وواضحة، وهو المبرر القانوني والتجاري لعمليات بيع وشراء المنتجات الرقمية والحلول الحصرية للمنشآت عبر المنصة، في حين تظل خدمة الاكتشاف والوصول المباشر مجانية بالكامل لقطاع الأفراد (B2C) لتسهيل العثور على مقدم الخدمة المناسب، تماشياً وتدعيماً للرؤية المباركة للمملكة العربية السعودية (2030).',
] as const;

