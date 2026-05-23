/**
 * صياغة المنصة الأساسية — نظام الاستجابة الذكية (Smart Response System).
 * المنطق: المزود يُفعَّل برمجياً عند وجود طلب نشط في محيطه — لا حضور دائم.
 * المصدر القانوني والتسويقي الموحّد في `onDemandVisibilityDoctrine.ts`.
 */

import {
  ON_DEMAND_VISIBILITY_END_USER_NOTE_AR,
  ON_DEMAND_VISIBILITY_TAGLINE_SHORT_AR,
  SMART_RESPONSE_SYSTEM_LABEL_AR,
} from '@/config/onDemandVisibilityDoctrine';

export const PLATFORM_SMART_TRACKING_SLOGAN =
  'حلاق ماب: المنصة الأولى المدعومة بنظام الاستجابة الذكية (الظهور عند الطلب)';

export const PLATFORM_SMART_TRACKING_SUBTEXT =
  'محرك ربط جغرافي ذكي يستجيب لطلبك في اللحظة — يُظهر المزودين المؤهَّلين المتزامنين مع طلبك في محيطك بدقة متناهية، لا قائمة دائمة.';

/** شارة الهيرو — الصفحة الرئيسية */
export const PLATFORM_HERO_BADGE = `${SMART_RESPONSE_SYSTEM_LABEL_AR} · حلاق ماب`;

/** ملاحظة المستخدم النهائي — تظهر تحت نتائج البحث لتفسير الظهور المتغيّر */
export const PLATFORM_END_USER_VISIBILITY_NOTE = ON_DEMAND_VISIBILITY_END_USER_NOTE_AR;

/** سطر هيرو قصير — للهيرو على الجوال */
export const PLATFORM_HERO_SHORT_TAGLINE = ON_DEMAND_VISIBILITY_TAGLINE_SHORT_AR;

/** سطر ثقة قصير تحت الهيرو */
export const PLATFORM_HERO_TRUST_LINE =
  'استجابة جغرافية دقيقة · ظهور برمجي عند الطلب · تواصل مباشر مع الصالون';

/** زر ومحفّز تحديد الموقع (بحث المستخدم) */
export const PLATFORM_SEARCH_LOCATION_BUTTON = 'ابدأ الاستجابة الذكية — حدّد موقعك';
export const PLATFORM_SEARCH_LOCATION_LOADING = 'جاري معالجة طلبك وتحديد محيطك…';
export const PLATFORM_SEARCH_LOCATION_SUCCESS =
  'تم تسجيل طلبك — جارٍ تنشيط استجابة المزودين المؤهَّلين';

/** سياق شريط الفلاتر بعد تفعيل الموقع */
export const PLATFORM_SEARCH_RESULTS_CONTEXT =
  'نظام الاستجابة الذكية يعرض المزودين المؤهَّلين ضمن النطاق الذي تختاره — صفِّ النتائج بالمسافة والتقييم والباقة.';

export const PLATFORM_SEARCH_EMPTY_LOADING = 'جاري معالجة طلبك وتفعيل استجابة المزودين…';
export const PLATFORM_SEARCH_EMPTY_TITLE = 'لا يوجد مزود مستجيب ضمن نطاق طلبك حالياً';
export const PLATFORM_SEARCH_EMPTY_HINT =
  'وسّع نطاق الطلب من شريط المسافة (حتى 25 كم) أو ألغِ الفلاتر لزيادة احتمال استجابة مزود قريب — الظهور برمجي عند الطلب وليس قائمة دائمة.';

/** خطوات «كيف تعمل» — الصفحة الرئيسية */
export const PLATFORM_HOW_IT_WORKS_STEPS = [
  {
    step: '١',
    title: 'سجّل طلبك واحدّد محيطك',
    description:
      'يحدّد موقعك بدقة ليبدأ نظام الاستجابة الذكية بتنشيط المزودين المؤهَّلين في محيطك.',
  },
  {
    step: '٢',
    title: 'استجابة وفرز فوري',
    description:
      'الخوارزمية تستجيب لطلبك في اللحظة وترتّب الأقرب والأنسب — لا قائمة عشوائية دائمة.',
  },
  {
    step: '٣',
    title: 'تواصل أو احجز',
    description:
      'اتصال، واتساب، ورابط الموقع — حسب ما يوفّره المزوّد المُستجيب لطلبك.',
  },
] as const;

/** بطاقات الميزات — قبل تحديد الموقع */
export const PLATFORM_HOME_WELCOME_FEATURES = [
  {
    title: 'استجابة جغرافية دقيقة',
    description:
      'نظام الاستجابة الذكية يستجيب لطلبك في اللحظة ويُظهر مزودي الخدمة المؤهَّلين في محيطك بدقة متناهية.',
  },
  {
    title: 'ظهور عند الطلب — لا قائمة دائمة',
    description:
      'يُفعَّل ظهور المزود برمجياً عند وجود طلب نشط في محيطه فقط — كفاءة استهداف، لا إشغال للمساحة الرقمية.',
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
  'صالونك ضمن نظام الاستجابة الذكية — يُفعَّل ظهوره برمجياً للعملاء الذين يصدر منهم طلب نشط في محيطه فور تفعيل حزمة الرخصة.';

/** ميزة الباقات في التسجيل وسياسة الاشتراك */
export const MAP_FEATURE_PARTNER_SUBTITLE =
  'بعد التفعيل يستجيب نظام الاستجابة الذكية لطلبات العملاء في محيط صالونك ويُفعّل ظهورك البرمجي بدقة متناهية وفي أجزاء من الثانية — حضور غير ثابت يضمن كفاءة الربط ودقة الاستهداف.';
