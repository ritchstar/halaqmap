/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * واجهة متجر halaqmap — نصوص العرض فقط.
 * يُحمَّل كسولاً مع صفحات المتجر، لا يُستورد من App.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';
import {
  LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR,
  LEGAL_ECOMMERCE_STORE_ENGLISH_LINE,
  LEGAL_ECOMMERCE_STORE_NAME,
  LEGAL_ECOMMERCE_STORE_PUBLIC_NAME_AR,
  LEGAL_FIRST_SOFTWARE_PRODUCT_AR,
  PARTNER_SUPPORT_EMAIL,
  PARTNER_SUPPORT_PHONE_E164,
  PARTNER_SUPPORT_WHATSAPP_URL,
} from '@/config/partnerLegal';

/** يطابق storeHostRedirect — لا تستورد ذلك الملف من هنا حتى لا تُسحب الحزمة إلى App. */
export const STORE_SATELLITE_HOST = 'store.halaqmap.com' as const;
export const STORE_ORIGIN = `https://${STORE_SATELLITE_HOST}` as const;
export const STORE_BRAND_LATIN = LEGAL_ECOMMERCE_STORE_NAME;
export const STORE_PUBLIC_NAME_AR = LEGAL_ECOMMERCE_STORE_PUBLIC_NAME_AR;
export const STORE_ENGLISH_LINE = LEGAL_ECOMMERCE_STORE_ENGLISH_LINE;
export const STORE_CONTACT_EMAIL = PARTNER_SUPPORT_EMAIL;
export const STORE_CONTACT_PHONE_E164 = PARTNER_SUPPORT_PHONE_E164;
export const STORE_CONTACT_PHONE_DISPLAY = '0559602685';
export const STORE_CONTACT_WHATSAPP_URL = PARTNER_SUPPORT_WHATSAPP_URL;
export const STORE_CONTACT_X_URL = 'https://x.com/halaqmap';
export const STORE_CONTACT_X_HANDLE = '@halaqmap';

export const STORE_FOOTER_CONTACT = {
  emailLabelAr: 'البريد',
  phoneLabelAr: 'الجوال',
  whatsappLabelAr: 'واتساب',
  xLabelAr: 'منصة X',
} as const;

export const COIFFEUR_PRODUCT_AR = 'كوافير ماب' as const;

/** صور برمجية معتمدة من منتجات المتجر — لا صور مخزون عامة */
export const STORE_VISUALS = {
  logo: '/images/halaqmap-store-mark-radar-square-1200x1200.png',
  hero: '/images/halaqmap-hero.jpg.png',
  radar: '/images/partners/feature_radar_2.webp',
  ops: '/images/platform-radar-night-map.jpg',
  dashboard: '/images/partners/feature_autonomy_2.webp',
  coiffeurHero: '/images/coiffeur/hero-atelier.webp',
  coiffeurSeal: '/images/coiffeur-map-logo-seal-512.webp',
  cardStudio: '/images/coiffeur/card-intro.webp',
  cardMark: '/images/coiffeur/card-og.png',
} as const;

export const STORE_SOFTWARE_SHOTS = [
  {
    src: STORE_VISUALS.radar,
    alt: 'رادار استعلام برمجي لمنصة حلاق ماب',
    caption: 'استعلام مكاني حي',
  },
  {
    src: STORE_VISUALS.dashboard,
    alt: 'لوحة تشغيل برمجية لصالون شريك',
    caption: 'تشغيل برمجي للصالون',
  },
  {
    src: STORE_VISUALS.coiffeurHero,
    alt: 'واجهة كوافير ماب القطاعية',
    caption: 'منتج كوافير ماب',
  },
] as const;

export const STORE_LANDING_COPY = {
  documentTitle: `${STORE_BRAND_LATIN} — ${STORE_PUBLIC_NAME_AR}`,
  cardsTitle: `${STORE_PUBLIC_NAME_AR} — بطاقة تهنئة مجانية`,
  kicker: STORE_ENGLISH_LINE,
  publicName: STORE_PUBLIC_NAME_AR,
  latinMark: STORE_BRAND_LATIN,
  heroLead:
    'عندك نشاط تجاري، أو وثيقة عمل حر، أو مهنة؟ نقدّم برمجيات جاهزة، وندرس طلبك الخاص إن كان مختلفاً.',
  heroReadyExample:
    'من أمثلة المنتجات الجاهزة الآن: منصة حلاق ماب — استعلام يُظهر الصالون المفعّل للقريب، برخصة نفاذ بلا عمولة على الخدمة.',
  heroInviteBefore: 'فكرة مختلفة؟ اشرح طلبك في ',
  heroFormLink: 'نموذج الطلب',
  heroInviteAfter: '، ونرد عليك بعرض مناسب خلال يومين عمل.',
  heroCta: 'قدّم طلبك الآن',
  heroShotAlt: 'واجهة برمجية حية لمتجر halaqmap',
  heroShotCaption: 'منتجات برمجية حية ضمن المتجر',
  softwareStripTitle: 'طابع برمجي من المنتجات الحالية',
  roleLine: 'متجر إلكتروني للبيع بالتجزئة للبرمجيات.',
  requestTitle: 'طلب خدمات المتجر',
  requestLead:
    'اكتب اسمك وبيانات التواصل، واسم المنشأة إن وُجد أو رقم وثيقة العمل الحر، ثم اشرح طلبك بوضوح مبدئي أو مفصّل. تدرسه الإدارة وترد خلال يومين عمل.',
  requestSuccess: 'وصل الطلب. ستدرسه الإدارة وترد خلال يومين عمل عبر البريد أو الجوال أو واتساب.',
  deskChatTitle: 'محادثة مباشرة مع الإدارة',
  deskChatLead: 'من واجهة المتجر. جلسة ستون دقيقة، والرد يصلك هنا.',
  freeCardsTitle: 'خدمات برمجية مجانية الآن',
  freeCardsLead:
    'أصدر بطاقة تهنئة لنفسك: الاسم ورقم الجوال والبريد ورابط صورة شخصية. يوم وطني، تخرج، أو معايدة. نسخة أولى قابلة للتعديل لاحقاً.',
  footerLegal: LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR,
  consentLabel: 'أوافق على دراسة الطلب والرد عبر البريد أو الجوال أو واتساب.',
  aboutNavAr: 'من نحن',
  trustStripTitleAr: 'التصنيفات والتحقق',
  trustStripBodyAr:
    'تقييم تشفير النطاق، توثيق التجارة الإلكترونية، ونشاط السجل. مجموعة في صفحة واحدة، والروابط علنية للتأكد.',
  trustStripCtaAr: 'فتح التصنيفات والتحقق',
  paidInvitesTitleAr: 'بطاقة مناسبة مدفوعة',
  paidInvitesLeadAr:
    'معاينة مجانية ثم 12 أو 29 أو 59 ر.س عند النشر عبر ميسر. المنصة لا ترسل الدعوة نيابة عنك.',
  paidInvitesCtaAr: 'فتح إصدار البطاقة',
  bereavementTitleAr: 'بلاغات الوفاة والعزاء',
  bereavementLeadAr:
    'خدمة مجتمعية مجانية ومستقلة. إعلان وفاة وترتيبات الصلاة والدفن والعزاء، بلا إعلانات وبلا بيع أثناء الإنشاء.',
  bereavementCtaAr: 'فتح بلاغ عاجل',
  issuedCardsLegalAr: 'شروط وخصوصية إصدار البطاقات',
} as const;

/** صفحة تعريف واجهة المتجر — نصوص الزائر فقط. */
export const STORE_ABOUT_COPY = {
  documentTitle: `${STORE_BRAND_LATIN} — من نحن`,
  kicker: STORE_ENGLISH_LINE,
  titleAr: 'من نحن',
  intro:
    'متجر إلكتروني للبيع بالتجزئة للبرمجيات. العلامة الرسمية لاتينية كما في توثيق التجارة الإلكترونية، والاسم الظاهر للجمهور على الواجهة: خريطة الحل. المنتجات الحالية معروضة هنا للتعريف، والدفع للمنتجات السحابية الجاهزة يبقى على النطاق الأم.',
  natureTitle: 'طبيعة عمل المتجر',
  natureBody:
    'نعرض برمجيات جاهزة كمنتجات سحابية، وندرس طلبات برمجية خاصة للمنشآت والأفراد. الاستعلام للمستعلم مجاني. إيراد المنتجات الجاهزة من رخص النفاذ الرقمية للصالون، لا من عمولة على الخدمة الحرفية.',
  activitiesTitle: 'الأنشطة التجارية للمنشأة',
  activitiesLead:
    'تعمل المنشأة بأنشطة مرخّصة في السجل التجاري. المتجر يعرض المنتجات والخدمات وفق هذه الأنشطة، وأي طلب خاص يُدرس قبل تقديم عرض.',
  productsTitle: 'المنتجات البرمجية الحالية',
  productsLead:
    'منصة حلاق ماب المنتج البرمجي الأول. كوافير ماب منتج قطاعي نسائي ضمن المتجر نفسه، وبوابة الدفع واحدة.',
  cloudTitle: 'طريقة عرض الخدمات السحابية',
  cloudLead:
    'منصة حلاق ماب وكوافير ماب تُعرضان كمنتجات برمجية سحابية: طبقة استعلام لحظي للمستعلم، ونفاذ برمجي للصالون عبر رخصة رقمية على نظام الاستجابة الذكية. ليست حلاقة وليست وساطة حجز.',
  cloudPoints: [
    'استعلام مكاني للمستعلم دون إنشاء حساب.',
    'رخصة نفاذ رقمية للصالون تُفعَّل بعد نجاح الدفع على النطاق الأم.',
    'كوافير ماب سطح قطاعي نسائي مستقل في الاستعلام، وتحت مظلة المتجر نفسه.',
    'التسجيل والدفع عبر ميسر على النطاق الأم فقط.',
  ],
  detailsTitle: 'ما يندرج في تفاصيل الخدمة',
  detailsIn: [
    'تجارة وعرض برمجيات جاهزة: رخصة نفاذ رقمية وإضافات برمجية.',
    'تشغيل نظام استجابة وعرض رقمي مرفق بالرخصة.',
    'إصدار شهادة تفعيل وإيصال إلكتروني لشراء المنتج البرمجي.',
    'بطاقات تهنئة مجانية يصدرها العميل لنفسه من واجهة المتجر.',
  ],
  detailsOut: [
    'لا عمولة على الحلاقة بين العميل والصالون.',
    'لا تعاقد نيابة عن المنشأة أو المستعلم.',
    'لا تحصيل أو تسعير نيابة عن الصالون.',
  ],
  customTitle: 'خدمات برمجية خاصة للمنشآت والأفراد',
  customBody:
    'نبرمج ما يناسب أنشطة المنشأة والمنتجات الحالية: برمجيات خاصة، تطوير تطبيقات، واستضافة مواقع أو صفحات تعريف. يعتمد النطاق على ما تشرحه في الطلب. لا أسعار ثابتة لهذه الطلبات على الواجهة.',
  processTitle: 'مسار الطلب الخاص',
  processSteps: [
    {
      title: 'شرح المتطلب',
      body: 'تكتب طلبك في نموذج الخدمة: بيانات التواصل، واسم المنشأة أو وثيقة العمل الحر إن وُجدت، ووصف مبدئي أو مفصّل لما تريد تصميمه.',
    },
    {
      title: 'دراسة الإدارة',
      body: 'تدرس الإدارة المتطلب ونطاقه التقني، وهل يناسب أنشطة المنشأة والمنتجات الحالية.',
    },
    {
      title: 'تقديم العرض',
      body: 'يصلك الرد عبر البريد أو الجوال أو واتساب بعرض يناسب ما شُرح، قبل أي تنفيذ.',
    },
  ],
  ctaTitle: 'اطلب خدمة',
  ctaLead: 'افتح نموذج الطلب واشرح متطلبك. الدراسة والعرض لاحقان عبر الإدارة.',
  ctaLabel: 'فتح نموذج الطلب',
  trustNavAr: 'التصنيفات والتحقق',
  trustTeaserTitleAr: 'التصنيفات والتحقق',
  trustTeaserBodyAr:
    'تقييم التشفير، توثيق التجارة الإلكترونية، ونشاط السجل. مجموعة في صفحة واحدة، والروابط علنية للتأكد.',
  trustTeaserCtaAr: 'فتح التصنيفات والتحقق',
} as const;

/** صفحة تجميع التصنيفات والفحوص المستقلة — واجهة المتجر فقط. */
export const STORE_TRUST_COPY = {
  documentTitle: `${STORE_BRAND_LATIN} — التصنيفات والتحقق`,
  navAr: 'التصنيفات والتحقق',
  kicker: STORE_ENGLISH_LINE,
  titleAr: 'التصنيفات والتحقق',
  leadAr:
    'تجمع هذه الصفحة التصنيفات والفحوص المستقلة لمتجر البرمجيات، مع توثيق التجارة الإلكترونية ونشاط السجل. ليست ترتيب بحث، وليست وعداً بعدد زبائن. الروابط علنية، فتأكد بنفسك.',
  sslKickerAr: 'تقييم اتصال',
  sslTitleAr: 'تصنيف التشفير على النطاق',
  sslBodyAr:
    'اتصال التصفح والدفع على النطاق مشفّر. التصنيف الأعلى على كل نقاط الخادم المفحوصة في التقرير. هذا تقييم لإعدادات التشفير وقت الفحص، لا اعتماداً على المنتج البرمجي.',
  sslCaptionAr: 'تقرير علني. كل نقطة خادم ظهرت بالتصنيف الأعلى.',
  sslAltAr: 'تقرير تقييم التشفير لنطاق halaqmap.com يظهر التصنيف الأعلى على نقاط الخادم',
  sslImage: '/images/store/ssl-labs-aplus.png',
  sslVerifyAr: 'افتح تقرير التشفير الآن',
  ecomTitleAr: 'توثيق التجارة الإلكترونية',
  ecomBodyAr:
    'المتجر موثّق لدى المركز السعودي للتنافسية والأعمال. رقم التوثيق ظاهر أدناه، وبوابة الاستعلام علنية.',
  ecomVerifyAr: 'افتح بوابة الاستعلام',
  activityTitleAr: 'النشاط المرخّص',
  activityBodyAr:
    'المتجر يعرض البرمجيات وفق نشاط البيع بالتجزئة للبرمجيات، مع أنشطة مساندة للبرمجة والتطبيقات والاستضافة.',
  activityCtaAr: 'تفاصيل الأنشطة في من نحن',
  scansTitleAr: 'فحوص سمعة النطاق',
  scansLeadAr:
    'فحوص تكميلية لسمعة الرابط وقت الفحص. ليست شهادة أمان للتطبيق ولا تغني عن التوثيق النظامي.',
  scanOpenAr: 'افتح الفحص',
  disclaimerAr:
    'الفحوص الخارجية تعكس حالة النطاق وقت الفحص. تأكد من التقرير الحي عبر الرابط، ولا تخلط هذا بالظهور في نتائج البحث.',
} as const;

/** شريط تشغيل منصة حلاق ماب — ثابت تحت الهيرو على واجهة المتجر فقط. */
export const STORE_HALAQMAP_OPS_BANNER = {
  badgeAr: 'تشغيل',
  ariaAr: 'إعلان بدء تشغيل منصة حلاق ماب واستقبال طلبات الاشتراك',
  titleAr: 'حلاق ماب بدأ التشغيل — رخصة النفاذ متاحة للاشتراك عبر ميسر.',
  ctaAr: 'عرض حزم الرخصة',
  packagesHref: 'https://www.halaqmap.com/#/partners',
} as const;

/** أبواب الخدمات البرمجية اللاحقة — بلا أسعار على واجهة المتجر. */
export const STORE_LATER_SERVICES_COPY = {
  titleAr: 'خدمات برمجية لاحقة',
  leadAr:
    'ثلاثة أبواب فقط. نبرمج ما يناسب أنشطة المنشأة والمنتجات الحالية. لا أسعار على هذه الواجهة لغير حزم رخصة النفاذ على النطاق الأم.',
  packagesHref: STORE_HALAQMAP_OPS_BANNER.packagesHref,
  outNoteAr:
    'لا حجز مواعيد ولا تسعير ولا تحصيل أجرة الخدمة نيابة عن الصالون. لا عمولة على الحرفة.',
  doors: [
    {
      id: 'ready',
      kickerAr: 'جاهز الآن',
      titleAr: 'منتجات جاهزة',
      bodyAr:
        'رخصة النفاذ لمنصة حلاق ماب، مع البنرات ولوحة التشغيل والإضافات. كوافير ماب سطح قطاعي للاستعلام، والاشتراك يُفتح عند الجاهزية.',
      ctaAr: 'عرض حزم الرخصة',
      action: 'packages',
    },
    {
      id: 'ops',
      kickerAr: 'بعد الدراسة',
      titleAr: 'حلول تشغيل للمنشآت',
      bodyAr:
        'حزمة تشغيل رقمية للصالون، أو صفحة تعريف مستضافة، أو مقاعد لفروع مستقلة. يُحدَّد النطاق حسب المنشأة قبل أي عرض.',
      ctaAr: 'اشرح متطلب المنشأة',
      action: 'form',
    },
    {
      id: 'custom',
      kickerAr: 'بعد الدراسة',
      titleAr: 'طلب خاص يُدرس',
      bodyAr:
        'برمجية أو تطبيق أو استضافة فوق المنتجات الحالية، لا بدلاً منها. نرد خلال يومين عمل، والتنفيذ بعد موافقة العرض.',
      ctaAr: 'فتح نموذج الطلب',
      action: 'form',
    },
  ],
} as const;

/** فرصة مشاركة هادئة — ليست باب برمجة رابعاً، وتندرج تحت التسويق بالعمولة. */
export const STORE_COMMISSION_COPY = {
  kickerAr: 'مشاركة',
  titleAr: 'التسويق بالعمولة',
  leadAr:
    'فرصة مستقلة عن أبواب البرمجة. عمولة على بيع رخصة النفاذ للمنشأة، لا على الخدمة الحرفية. كل نسخة مرتبطة بسطحها القطاعي.',
  halaqLabelAr: 'مسوّقون لحلاق ماب',
  coiffeurLabelAr: 'مسوّقات لكوافير ماب',
  halaqHref: `https://www.halaqmap.com/#${ROUTE_PATHS.AMBASSADOR_ENTER}`,
  coiffeurHref: `https://coiffeur.halaqmap.com/#${ROUTE_PATHS.COIFFEUR_AMBASSADORS}`,
} as const;

export const STORE_SECTOR_SPLIT_COPY = {
  titleAr: 'منشأة واحدة، منتجان قطاعيان',
  leadAr:
    'حلاق ماب وكوافير ماب منتجان داخل المتجر نفسه. الاستعلام منفصل حسب القطاع، والدفع والتوثيق عبر ميسر على النطاق الأم.',
  halaqNameAr: LEGAL_FIRST_SOFTWARE_PRODUCT_AR,
  halaqBodyAr: 'للرجال. متاح للاشتراك الآن برخصة النفاذ.',
  halaqHost: 'www.halaqmap.com',
  halaqHref: 'https://www.halaqmap.com',
  coiffeurNameAr: COIFFEUR_PRODUCT_AR,
  coiffeurBodyAr:
    'للنساء. ظهور مبكر قبل الإطلاق الأوسع: الاستعلام ومسار الشريكات متاحان، والتوسّع مستمر بالتغطية.',
  coiffeurHost: 'coiffeur.halaqmap.com',
  coiffeurHref: 'https://coiffeur.halaqmap.com',
} as const;

export const STORE_LIVE_PRODUCTS = [
  {
    id: 'halaq-map',
    nameAr: LEGAL_FIRST_SOFTWARE_PRODUCT_AR,
    blurb: 'المنتج البرمجي الأول للمتجر. استعلام مجاني للمستعلم، وحزم نفاذ برمجية للصالون.',
    href: 'https://www.halaqmap.com',
    image: STORE_VISUALS.radar,
    imageAlt: 'رادار حلاق ماب على الخريطة',
    mark: STORE_VISUALS.logo,
  },
  {
    id: 'coiffeur-map',
    nameAr: COIFFEUR_PRODUCT_AR,
    blurb: 'منتج قطاعي نسائي ضمن المتجر نفسه. بوابة الدفع واحدة على النطاق الأم.',
    href: 'https://coiffeur.halaqmap.com',
    image: STORE_VISUALS.coiffeurHero,
    imageAlt: 'أتيليه كوافير ماب',
    mark: STORE_VISUALS.coiffeurSeal,
  },
] as const;

export type StoreGreetingOccasion = 'national_day' | 'graduation' | 'greeting';

export const STORE_GREETING_OCCASIONS: ReadonlyArray<{
  id: StoreGreetingOccasion;
  titleAr: string;
  subtitleAr: string;
  image: string;
  imageAlt: string;
}> = [
  {
    id: 'national_day',
    titleAr: 'تهنئة باليوم الوطني',
    subtitleAr: 'بطاقة خضراء باسمك وبياناتك.',
    image: STORE_VISUALS.radar,
    imageAlt: 'معاينة برمجية لبطاقة اليوم الوطني',
  },
  {
    id: 'graduation',
    titleAr: 'تهنئة بالتخرج',
    subtitleAr: 'بطاقة تخرج باسمك وبياناتك.',
    image: STORE_VISUALS.ops,
    imageAlt: 'معاينة برمجية لبطاقة التخرج',
  },
  {
    id: 'greeting',
    titleAr: 'بطاقة معايدة',
    subtitleAr: 'بطاقة معايدة تصدرها لنفسك.',
    image: STORE_VISUALS.cardMark,
    imageAlt: 'معاينة برمجية لبطاقة المعايدة',
  },
];

export function storeCardsPath(occasion?: StoreGreetingOccasion): string {
  if (!occasion) return ROUTE_PATHS.STORE_CARDS;
  return `${ROUTE_PATHS.STORE_CARDS}?kind=${occasion}`;
}
