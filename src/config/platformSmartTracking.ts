/**
 * صياغة المنصة الأساسية — نظام الاستجابة الذكية (Smart Response System).
 * المنطق: المزود يُفعَّل برمجياً عند وجود طلب نشط تنطبق عليه بياناته وفلترته — لا حضور دائم.
 * المصدر القانوني والتسويقي الموحّد في `onDemandVisibilityDoctrine.ts`.
 */

import {
  FOUNDER_END_USER_ACTION_AR,
  ON_DEMAND_VISIBILITY_END_USER_NOTE_AR,
  ON_DEMAND_VISIBILITY_TAGLINE_SHORT_AR,
  SMART_RESPONSE_SYSTEM_LABEL_AR,
} from '@/config/onDemandVisibilityDoctrine';

export const PLATFORM_SMART_TRACKING_SLOGAN =
  'حلاق ماب: المنصة الأولى المدعومة بنظام الاستجابة الذكية (الظهور عند الطلب)';

export const PLATFORM_SMART_TRACKING_SUBTEXT =
  'منصة رقمية ذكية تتيح لك الوصول إلى مقدم الخدمة المناسب فور سماحك بالموقع، وتعرض لك الخدمات المتاحة وفق موقعك وفلترتك — لا قائمة ثابتة ولا عرض دائم.';

/** شارة الهيرو — الصفحة الرئيسية */
export const PLATFORM_HERO_BADGE = `${SMART_RESPONSE_SYSTEM_LABEL_AR} · حلاق ماب`;

/** ملاحظة المستخدم النهائي — تظهر تحت نتائج البحث لتفسير الظهور المتغيّر */
export const PLATFORM_END_USER_VISIBILITY_NOTE = ON_DEMAND_VISIBILITY_END_USER_NOTE_AR;

/** سطر هيرو قصير — للهيرو على الجوال */
export const PLATFORM_HERO_SHORT_TAGLINE = ON_DEMAND_VISIBILITY_TAGLINE_SHORT_AR;

/** سطر ثقة قصير تحت الهيرو */
export const PLATFORM_HERO_TRUST_LINE =
  'مستخدم يستعلم · حلاق متوفر · تواصل مباشر';

/** زر ومحفّز تحديد الموقع (بحث المستخدم) — عقيدة المؤسس: اسمح بموقعك */
export const PLATFORM_SEARCH_LOCATION_BUTTON = `${FOUNDER_END_USER_ACTION_AR} — ابدأ الاستجابة الذكية`;
export const PLATFORM_SEARCH_LOCATION_LOADING = 'جارٍ تحديد موقعك وبدء الاستعلام…';
export const PLATFORM_SEARCH_LOCATION_SUCCESS =
  'تم تحديد موقعك — جارٍ عرض الخدمات المتاحة المناسبة';

/** سياق شريط الفلاتر بعد تفعيل الموقع */
export const PLATFORM_SEARCH_RESULTS_CONTEXT =
  'نظام الاستجابة الذكية يعرض الخدمات المتاحة وفق موقعك وفلترتك المختارة — صفِّ النتائج بما يناسب حاجتك.';

export const PLATFORM_SEARCH_EMPTY_LOADING = 'جارٍ تحديد موقعك وعرض الخدمات المتاحة…';
export const PLATFORM_SEARCH_EMPTY_TITLE = 'لا توجد خدمات متاحة ضمن هذا النطاق حالياً';
export const PLATFORM_SEARCH_EMPTY_HINT =
  'وسّع نطاق العرض أو ألغِ بعض الفلاتر لزيادة احتمال ظهور خدمات متاحة — الظهور برمجي عند الطلب وليس قائمة دائمة.';

/** خطوات «كيف تعمل» — الصفحة الرئيسية */
export const PLATFORM_HOW_IT_WORKS_STEPS = [
  {
    step: '١',
    title: FOUNDER_END_USER_ACTION_AR,
    description:
      'تمنح إذن الموقع أثناء الجلسة لبدء الاستعلام وعرض الخدمات المتاحة لك وفق موقعك وفلترتك.',
  },
  {
    step: '٢',
    title: 'معالجة وعرض فوري',
    description:
      'تعالج المنصة طلبك لحظيًا وتقارنه بالبيانات المتاحة، ثم ترتّب النتائج المناسبة فورًا.',
  },
  {
    step: '٣',
    title: 'استعرض وتواصل',
    description:
      'تعرض لك المنصة ملف الصالون المناسب، بما يشمل البنر، الصور، وسائل الاتصال، وحالة العمل الحالية.',
  },
] as const;

/** بطاقات الميزات — قبل تحديد الموقع */
export const PLATFORM_HOME_WELCOME_FEATURES = [
  {
    title: 'استجابة دقيقة وفورية',
    description:
      'تستجيب المنصة لطلبك في اللحظة وتعرض مزودي الخدمة المؤهَّلين المناسبين لك بسرعة ووضوح.',
  },
  {
    title: 'ظهور عند الطلب — لا قائمة دائمة',
    description:
      'يُفعَّل ظهور المزود برمجياً عند وجود طلب نشط تنطبق عليه بياناته وفلترته فقط — كفاءة استهداف، لا إشغال للمساحة الرقمية.',
  },
  {
    title: 'تواصل مباشر',
    description:
      'بعد الاستجابة، تواصل مع الصالون عبر الاتصال أو واتساب أو رابط الموقع.',
  },
] as const;

/** تسجيل الحلاق / لوحة الشركاء */
export const PLATFORM_PARTNER_SMART_TRACKING_HEADLINE = PLATFORM_SMART_TRACKING_SLOGAN;
export const PLATFORM_PARTNER_SMART_TRACKING_LEAD = PLATFORM_SMART_TRACKING_SUBTEXT;

export const PLATFORM_PARTNER_DASHBOARD_TAGLINE =
  'صالونك ضمن نظام الاستجابة الذكية — يُفعَّل ظهوره برمجياً للعملاء الذين يصدر منهم طلب نشط تنطبق عليه بياناته وفلترته فور تفعيل حزمة الرخصة.';

/** ميزة الباقات في التسجيل وسياسة الاشتراك */
export const MAP_FEATURE_PARTNER_SUBTITLE =
  'بعد التفعيل تعرض المنصة صالونك عند وجود طلب فعلي مناسب، بما يضمن كفاءة الربط وسرعة الوصول دون حضور ثابت أو عرض دائم.';
