/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * كوافير ماب — سطح قطاعي تحت مظلة حلاق ماب.
 * الدومين واجهة فقط. الكيان التجاري، ميسر، وصفحات الدفع تبقى على www.halaqmap.com.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';
import {
  LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR,
  LEGAL_ECOMMERCE_STORE_MARK_AR,
  LEGAL_FIRST_SOFTWARE_PRODUCT_AR,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
  LEGAL_UNIFIED_NUMBER_LABEL_AR,
} from '@/config/partnerLegal';

export { COIFFEUR_LISTING_SECTOR } from '@/config/coiffeurPartnerSector';

/** أصل الدفع الإلزامي — لا يُستبدل بأصل الدومين القمر الصناعي */
export const COIFFEUR_HALAQMAP_ORIGIN = 'https://www.halaqmap.com' as const;

export const COIFFEUR_HALAQMAP_PAYMENT_URL =
  `${COIFFEUR_HALAQMAP_ORIGIN}/#${ROUTE_PATHS.PAYMENT}` as const;

export const COIFFEUR_HALAQMAP_PAYMENT_SUCCESS_URL =
  `${COIFFEUR_HALAQMAP_ORIGIN}/#${ROUTE_PATHS.PAYMENT_SUCCESS}` as const;

export const COIFFEUR_SATELLITE_HOST = 'coiffeur.halaqmap.com' as const;

export const COIFFEUR_BRAND_AR = 'كوافير ماب' as const;
export const COIFFEUR_BRAND_EN = 'Coiffeur Map' as const;

/** ختم كوافير ماب الدائري — مقترح معتمد للتقييم، بلا كتابة على الرسم */
export const COIFFEUR_BRAND_LOGO_PATH = '/images/coiffeur-map-logo-seal-512.webp' as const;
export const COIFFEUR_BRAND_LOGO_SRCSET =
  '/images/coiffeur-map-logo-seal-128.webp 128w, /images/coiffeur-map-logo-seal-256.webp 256w, /images/coiffeur-map-logo-seal-512.webp 512w' as const;

export const COIFFEUR_CORE_PROJECT_AR = 'حلاق ماب' as const;

export const COIFFEUR_UMBRELLA_LINE_AR =
  `كوافير ماب منتج قطاعي ضمن متجر ${LEGAL_ECOMMERCE_STORE_MARK_AR} الإلكتروني. المنتج الأول للمتجر هو ${LEGAL_FIRST_SOFTWARE_PRODUCT_AR}. التوثيق وبوابة الدفع واحدة للمتجر.` as const;

export const COIFFEUR_FOOTER_LEGAL_AR =
  `متجر ${LEGAL_ECOMMERCE_STORE_MARK_AR} · ${LEGAL_UNIFIED_NUMBER_LABEL_AR}: ${LEGAL_NATIONAL_UNIFIED_NUMBER}` as const;

export const COIFFEUR_FOOTER_ECOMMERCE_AR = LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR;

export const COIFFEUR_LANDING_META = {
  documentTitle: 'كوافير ماب — منتج ضمن متجر halaqmap',
  partnersTitle: 'انضمام صالون كوافير — ضمن متجر halaqmap',
} as const;

/** شريط كوافير ماب فقط — لا يخلط تشغيل اشتراك حلاق ماب. */
export const COIFFEUR_STATUS_TICKER = {
  badgeAr: 'كوافير ماب',
  ariaAr: 'شريط كوافير ماب للمستعلمة والمنشآت',
  ctaAr: 'سجّلي اهتمامك',
  segments: [
    'كوافير ماب — استعلام للمستعلمة حسب حاجتك',
    'سجّلي اهتمام المنشأة لتصلك التحديثات',
    'منتج قطاعي نسائي ضمن متجر halaqmap',
    'الدفع عند الجاهزية على النطاق الأم فقط',
  ],
} as const;

export type CoiffeurInquiryIntentId =
  | 'near_open'
  | 'coiffeur'
  | 'beauty_salon'
  | 'spa'
  | 'makeup'
  | 'nails'
  | 'skin'
  | 'independents';

export const COIFFEUR_INQUIRY_INTENTS: ReadonlyArray<{
  id: CoiffeurInquiryIntentId;
  label: string;
}> = [
  { id: 'near_open', label: 'مفتوح الآن قريباً' },
  { id: 'coiffeur', label: 'كوافير نسائي' },
  { id: 'beauty_salon', label: 'مشغل تجميل' },
  { id: 'spa', label: 'سبا ومساج' },
  { id: 'makeup', label: 'مكياج وسهرات' },
  { id: 'nails', label: 'عناية أظافر' },
  { id: 'skin', label: 'عناية بشرة' },
  { id: 'independents', label: 'مستقلات' },
];

/**
 * كوافيرة مستقلة بوثيقة عمل حر، أو متعهّدة: التأشير على التعهد القانوني كافٍ لإدراجها في تصنيف مستقلات.
 */
export const COIFFEUR_INDEPENDENT_LISTING_RULE_AR =
  'المستقلة بوثيقة عمل حر أو المتعهّدة تُدرَج في تصنيف مستقلات بعد التأشير على التعهد القانوني.';

export const COIFFEUR_INQUIRY_COPY = {
  documentTitle: 'كوافير ماب — قطاع نسائي',
  sectorBadge: 'قطاع نسائي',
  freeBadge: 'مجاني بلا تسجيل',
  title: 'أقرب مشغل',
  titleAccent: 'قريب منك',
  lead: 'اضغطي البحث واسمحي بالموقع. تظهر المشاغل المفعّلة بنرات بالاسم والصور ورقم التواصل، وزر يفتح الخرائط للوصول إليها. بلا تطبيق وبلا حساب.',
  kicker: 'استعلامك',
  searchHeader: 'استعلمي',
  searchHeaderLong: 'استعلمي الآن',
  searchHero: 'ابحثي عن الصالونات',
  searchRadarIdle: 'ابدئي الآن',
  searchBusy: 'يجري التحديد…',
  locateDenied: 'لم يُسمح بالموقع. اختاري نوع الخدمة ثم أعيدي المحاولة.',
  located: 'تم تحديد موقعك. نعرض المشاغل المفعّلة في محيطك.',
  emptyTitle: 'جاهزات للظهور عند أول تسكين',
  emptyBody:
    'عند تفعيل مشغل أو كوافير أو مستقلة في نطاقك تظهر هنا بنرات بالاسم والصور ورقم التواصل، مع زر يفتح الخرائط للوصول إلى المشغل.',
} as const;

/** شرح المستعلمة — كيف تعمل كوافير ماب من غير تطبيق ولا حساب */
export const COIFFEUR_VISITOR_HOW_IT_WORKS = {
  kicker: 'كيف تعمل كوافير ماب',
  title: 'من موقعك',
  titleAccent: 'إلى المشغل المناسب',
  lead:
    'تبحثين عن كوافير أو مشغل أو مصففة شعر قريبة منك. تدخلين كوافير ماب من المتصفح، تضغطين البحث، وتسمحين بموقعك مرة واحدة. لا تطبيق يُحمَّل، ولا حساب يُطلب، ولا يُدرج رقمك أو بريدك.',
  steps: [
    {
      title: 'ادخلي كوافير ماب',
      body: 'من المتصفح على جوالك. الاستعلام مجاني بلا تسجيل وبلا تحميل تطبيق.',
    },
    {
      title: 'اضغطي البحث واسمحي بالموقع',
      body: 'الموقع يُستخدم لتحديد محيطك فقط. بعدها تظهر النتائج المفعّلة لدى شريكات المنصة في نطاقك.',
    },
    {
      title: 'تظهر بنرات الشريكات',
      body: 'كل مشغل مفعّل يظهر بالاسم والصور ورقم التواصل الذي اختارت صاحبته إظهاره على البطاقة.',
    },
    {
      title: 'اتجهي عبر الخرائط',
      body: 'زر الاتجاهات يفتح تطبيق الخرائط في جهازك إلى إحداثيات المشغل المقصود.',
    },
  ],
  freeTitle: 'مجاني للمستعلمة',
  freeBody:
    'البحث للباحثة عن مشغل نسائي مجاني وبلا حساب. التحصيل من صاحبات المشاغل فقط: اشتراك شهري بحسب الباقة.',
  honesty:
    'نعرض النتائج المفعّلة في المنصة داخل محيطك. إن لم يُسكَّن مشغل بعد في نطاقك، تبقين جاهزة للظهور عند أول تسكين.',
} as const;

export const COIFFEUR_LANDING_COPY = {
  badge: 'مجاني للمستعلمة · بلا حساب',
  title: 'أقرب صالون كوافير يناسب حاجتك',
  lead:
    'ادخلي كوافير ماب، اضغطي البحث، واسمحي بموقعك. تظهر المشاغل النسائية المفعّلة بنرات بالاسم والصور ورقم التواصل، وزر يفتح الخرائط للوصول إلى المشغل. بلا تطبيق، بلا حساب، وبلا إدراج رقمك أو بريدك.',
  searchCta: 'ابحثي عن الصالونات',
  searchHint: 'مشغل، كوافير، سبا، تجميل، ومستقلات.',
  partnerCta: 'سجّلي صالونك الآن — دقيقتين',
  partnerSecondary: 'صاحبة صالون؟ مسار الانضمام هنا',
  trust: [
    {
      title: 'ظهور عند الطلب',
      body: 'الحضور الرقمي يُفعَّل برمجياً عند استعلام مناسب — لا قائمة دائمة عشوائية.',
    },
    {
      title: 'بلا عمولة على الخدمة',
      body: 'المنشأة تشتري رخصة برمجية مسبقة الدفع. ريال الخدمة يبقى للصالون.',
    },
    {
      title: 'الدفع لدى حلاق ماب',
      body: 'بوابة ميسر وصفحة النجاح على www.halaqmap.com فقط — لا حساب تاجر لكوافير ماب.',
    },
  ],
} as const;

export const COIFFEUR_PARTNERS_COPY = {
  badge: 'سطح قطاعي تحت مظلة حلاق ماب',
  title: 'رخصة برمجية كوافير ماب',
  lead:
    'رخصة برمجية كوافير ماب على نماذج الاشتراك. التعريف القانوني في السياسات هو رخصة نفاذ حلاق ماب الرقمية (نظام الاستجابة الذكية). نفس التعهدات، نفس الفورم، ثم الدفع على نطاق حلاق ماب بعد اكتمال الطلب.',
  stepsTitle: 'ثلاث خطوات — لا تُختصر',
  steps: [
    'أكمل طلب الانضمام والتعهدات في مسار الشركاء المعتمد.',
    'ادفعي الرخصة البرمجية عبر ميسر على www.halaqmap.com بعد اكتمال الطلب فقط.',
    'بعد نجاح الدفع يُفعَّل ظهور صالونك عند الطلب المناسب.',
  ],
  registerCta: 'ابدئي طلب الانضمام',
  paymentNote: 'الدفع يتم على النطاق الأم عبر ميسر بعد اكتمال الطلب. لا بوابة دفع منفصلة لكوافير ماب.',
} as const;
