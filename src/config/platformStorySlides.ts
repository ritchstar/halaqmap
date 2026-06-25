/**
 * عرض قصة المنصة — للزائر والتسويق العام (B2C-first).
 * مُستخلص من halaqmap7 بعد تنقيحه ليتوافق مع عقيدة: فلاتر + ثقة للزائر، حرية تشغيل للشريك.
 */
import type { GrowthPitchSlide } from '@/config/growthPitchSlides';
import {
  LEGAL_ECOMMERCE_AUTH_NUMBER,
  LEGAL_MEDIA_LICENSE_NUMBERS,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
} from '@/config/partnerLegal';
import { ROUTE_PATHS } from '@/lib';

export const PLATFORM_STORY_DECK_TITLE_AR = 'اكتشف حلاق ماب';
export const PLATFORM_STORY_DECK_SUBTITLE_AR =
  'استعلام لحظي · فلاتر خدمة · تواصل مباشر · مجاني للمستخدم';

export const PLATFORM_STORY_HIGHLIGHTS = [
  {
    id: 'instant',
    title: 'مطابقة فورية',
    body: 'من «هل مفتوح؟» المتكرر إلى نتائج حسب فلترك وموقعك الآن.',
  },
  {
    id: 'filters',
    title: 'فلاتر خدمة',
    body: 'مفتوح الآن، منزلي، عريس، أطفال، كبار السن، ومركز عناية بالرجل.',
  },
  {
    id: 'trust',
    title: 'ثقة موثقة',
    body: 'تقييمات مرتبطة بزيارات حقيقية — اتصال أو واتساب بلا وسيط.',
  },
  {
    id: 'partner',
    title: 'للحلّاق',
    body: 'ظهور عند الطلب · صفر عمولة · تحكم بلحظتك — رخصة نفاذ رقمية.',
  },
] as const;

const PLATFORM_STORY_USER_STEPS = [
  {
    step: '١',
    title: 'اختر نوع الخدمة',
    description: 'حدّد حاجتك من الشريط: مفتوح الآن، منزلي، عريس، أطفال، أو تسهيلات خاصة.',
  },
  {
    step: '٢',
    title: 'حدّد موقعك',
    description: 'اضغط «ابحث الآن» — تُعرض المطابقة قربك بلا حساب ولا تسجيل.',
  },
  {
    step: '٣',
    title: 'تواصل مباشرة',
    description: 'اتصال أو واتساب مع الصالون. المنصة للاكتشاف — العلاقة بينك وبينه.',
  },
] as const;

/** شرائح العرض العام — للمستخدم والتسويق */
export const PLATFORM_STORY_SLIDES: readonly GrowthPitchSlide[] = [
  {
    id: 'cover',
    kind: 'hero',
    eyebrow: 'منصة سعودية موثقة',
    title: 'حلاق ماب — استعلام لحظي بلا تسجيل',
    subtitle:
      'تربطك بمن يناسب فلترك وموقعك الآن.\nمجاني للمستخدم · تواصل مباشر · لا وساطة على الحلاقة.',
    accent: 'teal',
  },
  {
    id: 'shift',
    kind: 'bullets',
    eyebrow: 'لماذا مختلف؟',
    title: 'من البحث العشوائي إلى المطابقة الفورية',
    subtitle: 'نفس الحاجة — طريقة أسرع وأوضح',
    bullets: [
      'بدل الاتصال المتكرر «هل الصالون مفتوح؟» — شريط «مفتوح الآن» وفلاتر خدمة جاهزة.',
      'بدل قوائم ثابتة بلا سياق — نتائج حسب موقعك وفلترك في اللحظة.',
      'بدل حجز معقّد أو وسيط — اتصال أو واتساب مباشرة مع الصالون.',
      'بدل تسجيل وحسابات — ابدأ الاستعلام مجاناً دون إنشاء حساب.',
    ],
    accent: 'slate',
  },
  {
    id: 'journey',
    kind: 'steps',
    eyebrow: 'تجربة المستخدم',
    title: 'ثلاث خطوات للوصول',
    steps: PLATFORM_STORY_USER_STEPS,
    accent: 'teal',
  },
  {
    id: 'filters',
    kind: 'bullets',
    eyebrow: 'فلاتر الخدمة',
    title: 'ماذا تبحث عنه؟ — اختر ثم ابحث',
    bullets: [
      'مفتوح الآن — من يستقبل زبائناً في محيطك هذه اللحظة.',
      'زيارة منزلية — حلاق يأتي إلى موقعك.',
      'كبار السن وذوي الاحتياجات — تسهيلات مناسبة.',
      'متخصص أطفال — تجربة هادئة للعائلات.',
      'تجهيز عريس — باقة تجهيز كاملة.',
      'مركز عناية بالرجل — عناية متكاملة في مكان واحد.',
    ],
    accent: 'violet',
  },
  {
    id: 'free-trust',
    kind: 'bullets',
    eyebrow: 'مجاني + ثقة',
    title: 'قيمة للمستخدم بلا رسوم',
    bullets: [
      'تصفح واستعلام مجاني — لا حساب ولا بيانات إلزامية للبدء.',
      'تقييمات مرتبطة بزيارات حقيقية — لا نجوم وهمية.',
      'مطابقة حسب فلترك وموقعك — لا قائمة عشوائية ثابتة.',
      'رادار جغرافي يغطي مدناً سعودية متعددة — نبض حي للصالونات القريبة.',
    ],
    accent: 'teal',
  },
  {
    id: 'compliance',
    kind: 'bullets',
    eyebrow: 'موثوقية',
    title: 'امتثال وشفافية',
    bullets: [
      `الرقم الوطني الموحد: ${LEGAL_NATIONAL_UNIFIED_NUMBER}`,
      `توثيق التجارة الإلكترونية: ${LEGAL_ECOMMERCE_AUTH_NUMBER}`,
      `تراخيص إعلام: ${LEGAL_MEDIA_LICENSE_NUMBERS.join(' · ')}`,
      'معالجة لحظية وفق حوكمة الخصوصية — لا تخزين غير مشروع للاستعلام.',
      'بطاقة الصالون: مسافة، حالة مفتوح/مغلق، وقنوات تواصل رسمية.',
    ],
    accent: 'slate',
  },
  {
    id: 'partner-teaser',
    kind: 'bullets',
    eyebrow: 'مسار الشركاء',
    title: 'للحلّاق: حرية تشغيل لا خدمة',
    subtitle: 'نفعّل الظهور عند الطلب — أنت تقود الصالون',
    bullets: [
      'صفر عمولة على زيارات الزبون — دور المنصة ربط وظهور.',
      'تواصل مباشر: أنت تملك علاقة الزبون عبر اتصال أو واتساب.',
      'تحكم لحظي: مفتوح/مغلق وبياناتك من جوالك.',
      'رخصة نفاذ رقمية بباقات واضحة — بلا تجديد تلقائي يربطك.',
    ],
    accent: 'amber',
  },
  {
    id: 'cta',
    kind: 'cta',
    eyebrow: 'ابدأ الآن',
    title: 'جاهز للاستعلام أو للانضمام كشريك؟',
    subtitle: 'احفظ الرابط — مجاني للمستخدم، ومسار الشركاء منفصل وواضح.',
    consumerCta: { label: 'ابحث عن حلاق الآن', href: ROUTE_PATHS.HOME },
    partnerCta: { label: 'مسار الشركاء', href: ROUTE_PATHS.BARBERS_LANDING },
    accent: 'teal',
  },
];
