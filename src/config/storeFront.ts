/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * واجهة متجر halaqmap — نصوص العرض فقط.
 * يُحمَّل كسولاً مع صفحات المتجر، لا يُستورد من App.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';
import { PARTNER_ANDROID_PLAY_STORE_URL } from '@/config/partnerAppShell';
import {
  LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR,
  LEGAL_ECOMMERCE_STORE_ENGLISH_LINE,
  LEGAL_ECOMMERCE_STORE_NAME,
  LEGAL_ECOMMERCE_STORE_PUBLIC_NAME_AR,
  LEGAL_FIRST_SOFTWARE_PRODUCT_AR,
  LEGAL_MEDIA_LICENSE_NUMBERS,
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
  hero: '/images/halaqmap-hero.jpg',
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
    alt: 'رادار استعلام برمجي لمنتج حلاق ماب',
    caption: 'حلاق ماب — منتج ضمن الأعمال',
  },
  {
    src: STORE_VISUALS.dashboard,
    alt: 'لوحة تشغيل برمجية لصفحة مستضافة',
    caption: 'لوحة تشغيل للصفحة',
  },
  {
    src: '/images/store/lab/lab-lounge-interior.jpg',
    alt: 'شاشة لاونج تُدار من منتج المتجر',
    caption: 'تشغيل شاشات اللاونج',
  },
] as const;

export const STORE_LANDING_COPY = {
  documentTitle: `خريطة الحل — ${STORE_BRAND_LATIN}`,
  shopNameAr: 'خريطة الحل',
  cardsTitle: `${STORE_PUBLIC_NAME_AR} — بطاقة تهنئة مجانية`,
  kicker: STORE_ENGLISH_LINE,
  publicName: STORE_PUBLIC_NAME_AR,
  latinMark: STORE_BRAND_LATIN,
  heroHeadlineAr: 'شريكك التقني لتطوير وأتمتة أعمالك الرقمية',
  heroLead:
    'سواء كنت تملك نشاطاً تجارياً، وثيقة عمل حر، أو مهنة خاصة؛ نقدّم لك في خريطة الحل منظومة متكاملة من البرمجيات والخدمات السحابية المبتكرة الجاهزة للتنفيذ، والمصممة خصيصاً لرفع كفاءة أعمالك وتنميتها.',
  heroSolutionsTitleAr: 'من أبرز حلولنا البرمجية',
  heroSolutions: [
    'القطاع الخدمي والتجميل: حلاق ماب، وكوافير ماب.',
    'الفعاليات والمناسبات: افراحي1، واجواء1.',
    'إدارة الأعمال والخدمات: كاردي8، ولاونجا1، وتمويناتا1، ومطعمنا1، ومنتجات أخرى تحت الإنشاء.',
  ],
  heroInviteKickerAr: 'لديك فكرة خاصة أو متطلبات مختلفة؟',
  heroInviteBefore: 'اصنع فارقك التجاري اليوم. اشرح تفاصيل فكرتك عبر ',
  heroFormLink: 'نموذج الطلب',
  heroInviteAfter: '، ويقوم فريقنا البرمجي بالدراسة وتقديم العرض المناسب لك خلال 48 ساعة.',
  heroCta: 'قدّم طلبك الآن',
  heroShotAlt: 'واجهة برمجية حية لخريطة الحل',
  heroShotCaption: 'منتجات برمجية حية ضمن خريطة الحل',
  softwareStripTitle: 'طابع برمجي من المنتجات الحالية',
  roleLine: 'متجر إلكتروني للبيع بالتجزئة للبرمجيات.',
  requestTitle: 'طلب خدمات خريطة الحل',
  requestLead:
    'اكتب اسمك وبيانات التواصل، واسم المنشأة إن وُجد أو رقم وثيقة العمل الحر، ثم اشرح طلبك بوضوح مبدئي أو مفصّل. تدرسه الإدارة وترد خلال يومين عمل.',
  requestSuccess: 'وصل الطلب. ستدرسه الإدارة وترد خلال يومين عمل عبر البريد أو الجوال أو واتساب.',
  newestTitleAr: 'أحدث منتجاتنا',
  newestLeadAr:
    'خضارنا1، وتمويناتا1، وطبختنا1، وحلانا1، ومطعمنا1، وكافينا1، وافراحي1، واجواء1، ولاونجا1. كل منتج على صفحته بسعره.',
  pitchHeadlineLine1Ar: 'من انتظار زبائنك…',
  pitchHeadlineLine2Ar: 'إلى جوالاتهم.',
  pitchLeadAr:
    'حلول رقمية متخصصة تعرض ما تقدمه بوضوح، وتستقبل طلبات عملائك، وتنظّم تشغيل نشاطك من مسار واحد يناسب مهنتك.',
  pitchScopeAr: 'للحي، والطعام والضيافة، والمناسبات، والمهن والخدمات.',
  pitchJourneyAr: 'العرض ← الطلب ← التشغيل ← الولاء',
  pitchTaglineAr: 'عمل أوضح. نمو أذكى.',
  pitchExploreCtaAr: 'استكشف الحلول',
  pitchRequestCtaAr: 'اطلب حلاً خاصاً',
  pitchPickLeadAr: 'اختر ما يخص نشاطك. كل منتج بصفحته ورابطه ولوحة تشغيله.',
  browseNeighborhoodAr: 'الحي',
  browseHospitalityAr: 'الطعام والضيافة',
  browseHospitalitySectionAr: 'حلول البيع والضيافة',
  browseHallsAr: 'المناسبات',
  browseHallsSectionAr: 'المناسبات والشاشات',
  browseCardsAr: 'البطاقات',
  browseWorksAr: 'المهن والخدمات',
  browseWorksSectionAr: 'المهن والخدمات',
  browseTrialBadgeAr: 'تجربة 60 يوماً',
  deskChatTitle: 'محادثة مباشرة مع الإدارة',
  deskChatLead: 'من واجهة خريطة الحل. جلسة ستون دقيقة، والرد يصلك هنا.',
  freeCardsTitle: 'خدمات برمجية مجانية الآن',
  freeCardsLead:
    'أصدر بطاقة تهنئة لنفسك: الاسم ورقم الجوال والبريد ورابط صورة شخصية. يوم وطني، تخرج، أو معايدة. نسخة أولى قابلة للتعديل لاحقاً.',
  footerLegal: LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR,
  mediaLicenseLineAr: `تراخيص الهيئة العامة لتنظيم الإعلام ${LEGAL_MEDIA_LICENSE_NUMBERS.join(' - ')}`,
  consentLabel: 'أوافق على دراسة الطلب والرد عبر البريد أو الجوال أو واتساب.',
  aboutNavAr: 'من نحن',
  trustStripTitleAr: 'التوثيق والتحقق',
  trustStripLeadAr: 'اطّلع على بيانات المنشأة وروابط التحقق الرسمية',
  trustStripBodyAr:
    'نتيح روابط التحقق من توثيق المتجر، وبيانات المنشأة، وأمان الاتصال، والمصنفات البرمجية المسجلة ضمن المنظومة؛ لتكون المعلومات النظامية واضحة ويمكن الرجوع إليها مباشرة.',
  trustStripCtaAr: 'عرض بيانات التوثيق والتحقق',
  paidInvitesTitleAr: 'كاردي8',
  paidInvitesLeadAr:
    'معاينة مجانية ثم بطاقة حيّة قابلة للمشاركة. ثلاث طبقات معتمدة: 12 و29 و59 ر.س. الدفع عبر بوابة الدفع الآمنة.',
  paidInvitesCtaAr: 'افتح كاردي8',
  weddingLiveTitleAr: 'افراحي1 رجالي',
  weddingLiveLeadAr: 'حوّل دعوة زفافك إلى قاعة احتفالية حيّة على جوال ضيوفك.',
  weddingLiveCtaAr: 'افتح افراحي1',
  weddingLiveWomenTitleAr: 'افراحي1 نسائي',
  weddingLiveWomenLeadAr: 'حوّلي دعوة زفافك إلى قاعة احتفالية حيّة على جوال ضيوفك.',
  weddingLiveWomenCtaAr: 'افتحي افراحي1',
  eventLiveTitleAr: 'اجواء1',
  eventLiveLeadAr: 'منصة احتفالية لمناسبتك باسمك أنت، على جوال مدعويك.',
  eventLiveCtaAr: 'افتح اجواء1',
  loungeLiveTitleAr: 'لاونجا1',
  loungeLiveLeadAr: 'تجربة ضيافة تبدأ قبل حضور الضيف.',
  loungeLiveCtaAr: 'افتح لاونجا1',
  grocersLiveTitleAr: 'تمويناتا1',
  grocersLiveLeadAr: 'حوّل مكالمات ورسائل الحي إلى طلبات مرتبة.',
  grocersLiveCtaAr: 'افتح تمويناتا1',
  restaurantLiveTitleAr: 'مطعمنا1',
  restaurantLiveLeadAr: 'اعرض أصنافك ونظّم الطلب قبل وصوله.',
  restaurantLiveCtaAr: 'افتح مطعمنا1',
  cafeLiveTitleAr: 'كافينا1',
  cafeLiveLeadAr: 'منيو قهوتك أقرب إلى جوال العميل.',
  cafeLiveCtaAr: 'افتح كافينا1',
  kitchenLiveTitleAr: 'طبختنا1',
  kitchenLiveLeadAr: 'مقر رقمي لطبخك وطلبات عائلاتك.',
  kitchenLiveCtaAr: 'افتح طبختنا1',
  produceLiveTitleAr: 'خضارنا1',
  produceLiveLeadAr: 'اعرض المتوفر واستقبل طلبات الحي بوضوح.',
  produceLiveCtaAr: 'افتح خضارنا1',
  halanaLiveTitleAr: 'حلانا1',
  halanaLiveLeadAr: 'معرض أعمال وطلبات مخصصة لمتخصصة الحلويات.',
  halanaLiveCtaAr: 'افتح حلانا1',
  bereavementTitleAr: 'بلاغات الوفاة والعزاء',
  bereavementLeadAr:
    'خدمة مجتمعية مجانية ومستقلة. إعلان وفاة وترتيبات الصلاة والدفن والعزاء، بلا إعلانات وبلا بيع أثناء الإنشاء.',
  bereavementCtaAr: 'فتح بلاغ عاجل',
  bereavementFootnoteAr: 'بلاغ وفاة وعزاء مجاني — خدمة مجتمعية مستقلة، ليست مناسبة مدفوعة.',
  issuedCardsLegalAr: 'شروط الخدمة والخصوصية',
} as const;

/** أيقونتا التقييم والمشاركة — أسفل يسار واجهة المتجر. */
export const STORE_ENGAGE_COPY = {
  rateAr: 'قيّم خريطة الحل',
  shareAr: 'شارك خريطة الحل',
  rateTitleAr: 'قيّم خريطة الحل',
  rateLeadAr: 'إن أعجبتك خريطة الحل، اختر عدد النجوم.',
  rateSendAr: 'إرسال التقييم',
  rateThanksAr: 'شكراً لتقييمك.',
  shareTitleAr: 'شارك خريطة الحل',
  shareLeadAr: 'أرسل رابط خريطة الحل لمن يحتاجه.',
  shareTextAr: 'خريطة الحل — برمجيات وخدمات سحابية. كاردي8، افراحي1، اجواء1، لاونجا1، وتمويناتا1.',
  copyAr: 'نسخ الرابط',
  copiedAr: 'تم النسخ',
  whatsappAr: 'واتساب',
} as const;

/** صفحة تعريف واجهة المتجر — نصوص الزائر فقط. */
export const STORE_ABOUT_COPY = {
  documentTitle: `عن خريطة الحل — ${STORE_BRAND_LATIN}`,
  kickerAr: 'عن خريطة الحل',
  titleAr: 'نصنع حضوراً رقمياً ينقلك من انتظار عملائك… إلى جوالاتهم.',
  introLeadAr:
    'خريطة الحل منظومة رقمية سعودية تطوّر منتجات برمجية سحابية متخصصة للمنشآت والمهن والأعمال الفردية.',
  introBodyAr:
    'نبدأ من طريقة عمل النشاط، ثم نصنع له مساراً يساعده على عرض ما يقدمه، واستقبال الطلبات، وتنظيم التشغيل، وبناء علاقة مباشرة مع عملائه.',
  journeyAr: 'العرض ← الطلب ← التشغيل ← الولاء',
  taglineAr: 'عمل أوضح. نمو أذكى.',
  howTitleAr: 'كيف تعمل خريطة الحل؟',
  howBodyAr:
    'نصنع منتجات جاهزة لقطاعات محددة، ونطوّر حلولاً خاصة بعد دراسة الاحتياج. هدفنا أن يحصل كل نشاط على أدوات تناسب طريقة عرضه وطلباته وتشغيله، دون تحميله نظاماً أكبر من حاجته.',
  howPillars: [
    {
      titleAr: 'متاجر وحلول رقمية',
      bodyAr: 'صفحات ومتاجر رقمية متخصصة لعرض المنتجات أو الخدمات وتنظيم طلباتها.',
    },
    {
      titleAr: 'صفحات مستضافة سحابياً',
      bodyAr: 'صفحات تعريف وهبوط وطلب، مستضافة على نطاقاتنا بحسب طبيعة المنتج أو الخدمة.',
    },
    {
      titleAr: 'إضافات وتكاملات برمجية',
      bodyAr: 'وظائف برمجية مخصصة يمكن ربطها بالصفحة أو المنتج القائم وفق نطاق العمل.',
    },
    {
      titleAr: 'أدوات التواصل المباشر',
      bodyAr: 'أدوات تربط صاحب النشاط بزوار صفحته وعملائه وفق خصائص كل منتج.',
    },
    {
      titleAr: 'لوحات تحكم تشغيلية',
      bodyAr: 'لوحات لإدارة المحتوى والطلبات وحالة التوفر والوظائف التشغيلية المتاحة.',
    },
    {
      titleAr: 'أنظمة برمجية خاصة',
      bodyAr: 'ندرس احتياج المنشأة ونحدد إمكان التنفيذ والنطاق الفني قبل تقديم العرض.',
    },
    {
      titleAr: 'دراسات واستشارات تقنية',
      bodyAr: 'ندرس الأفكار والفرص الرقمية ونقترح المسار البرمجي الأنسب لطبيعة النشاط.',
    },
  ],
  howCtaAr: 'اطلب دراسة احتياجك',
  samplesTitleAr: 'نماذج من منتجاتنا البرمجية',
  samplesLeadAr:
    'تطوّر خريطة الحل منتجات متخصصة لقطاعات ومهن مختلفة. لكل منتج نطاقه التشغيلي وصفحته ومزاياه وطريقة طلبه، وتتوسع المنظومة مع دراسة احتياجات الأنشطة والأسواق.',
  samplesEcosystemAr:
    'تشمل أعمال المنظومة: حلاق ماب، وكوافير ماب، وكاردي8، وأفراحي1، وأجواء1، ولاونجا1، وتمويناتا1، وخضارنا1، ومطعمنا1، وكافينا1، وطبختنا1، إلى جانب منتجات أخرى قيد الدراسة والتطوير.',
  specializedGroupTitleAr: 'منتجات خريطة الحل المتخصصة',
  cloudKickerAr: 'شرح مبسط قبل الاختيار',
  cloudTitleAr: 'ما المقصود بالمنتجات السحابية؟',
  cloudBodyAr:
    'المنتج السحابي يعمل عبر الإنترنت، ويستطيع المشغّل الوصول إلى صفحته أو لوحة تحكمه من الجوال أو الحاسوب بحسب خصائص المنتج. لا يحتاج إلى قرص تثبيت أو خادم داخل المنشأة، وتتم التحديثات وإدارة الوظائف من خلال البنية الرقمية للمنتج.',
  cloudMoreAr:
    'تختلف خصائص المنتجات وطرق تشغيلها، ويمكن الاطلاع على التفاصيل العملية في صفحة «مزايا المنتجات».',
  modelTitleAr: 'نموذج عملنا بوضوح',
  modelInTitleAr: 'ما نقدمه',
  modelIn: [
    'منتجات برمجية جاهزة ومتخصصة.',
    'صفحات وحلول سحابية مستضافة.',
    'لوحات تحكم وأدوات تشغيل بحسب المنتج.',
    'دراسة الطلبات البرمجية الخاصة.',
    'إيصال إلكتروني عند شراء المنتج من المتجر.',
    'بطاقات رقمية مجانية متاحة من واجهة المتجر.',
  ],
  modelOutTitleAr: 'ما لا نتدخل فيه',
  modelOut: [
    'لا نشغّل منشأة العميل نيابة عنه.',
    'لا نبرم عقوداً مع عملاء المشغّل نيابة عنه.',
    'لا نحدد أسعار خدمات المشغّل.',
    'لا نحصّل قيمة خدمة المشغّل من عملائه.',
    'لا نفرض عمولة على الخدمة التي يقدمها المشغّل لعملائه.',
  ],
  pathKickerAr: 'ثلاثة مسارات واضحة للبدء',
  pathTitleAr: 'طرق البدء',
  pathCards: [
    {
      titleAr: 'منتج جاهز',
      bodyAr: 'اختر منتجاً قائماً واطّلع على مزاياه وسعره وطريقة تفعيله في صفحته.',
      ctaAr: 'استكشف المنتجات',
      to: ROUTE_PATHS.STORE_LANDING,
    },
    {
      titleAr: 'طلب تجربة',
      bodyAr: 'قدّم طلب تجربة لأحد المنتجات المشمولة. تبدأ مدة التجربة بعد مراجعة الطلب واعتماده وتفعيل صفحة المنتج.',
      ctaAr: 'اطلب التجربة',
      to: ROUTE_PATHS.STORE_GENERAL_TRIAL,
    },
    {
      titleAr: 'حل خاص',
      bodyAr: 'اشرح احتياجك ليقوم الفريق بدراسة إمكان التنفيذ وتحديد النطاق قبل تقديم العرض.',
      ctaAr: 'اشرح احتياجك',
      to: ROUTE_PATHS.STORE_REQUEST,
    },
  ],
  trustTitleAr: 'التوثيق والبيانات النظامية',
  trustTeaserTitleAr: 'التوثيق والتحقق',
  trustTeaserLeadAr: 'اطّلع على بيانات المنشأة وروابط التحقق الرسمية',
  trustTeaserBodyAr:
    'نتيح روابط التحقق من توثيق المتجر، وبيانات المنشأة، وأمان الاتصال، والمصنفات البرمجية المسجلة ضمن المنظومة؛ لتكون المعلومات النظامية واضحة ويمكن الرجوع إليها مباشرة.',
  trustTeaserCtaAr: 'عرض بيانات التوثيق والتحقق',
  reliabilityTitleAr: 'الموثوقية والبيانات النظامية',
  reliabilityBodyAr:
    'تعمل خريطة الحل وفق الأنشطة التجارية والتراخيص المسجلة للمنشأة، وتُراجع الطلبات البرمجية الخاصة قبل التنفيذ للتحقق من ملاءمتها للنطاق الفني والأنشطة المقدمة.',
  officialChannelsTitleAr: 'القنوات الرسمية للشراء',
  officialChannelsBodyAr:
    'متجر خريطة الحل ونطاقاته الرسمية هي المرجع المعتمد لعرض المنتجات وطلبها والتحقق من معلوماتها. ننصح بعدم إجراء أي عملية شراء أو تحويل بناءً على روابط أو حسابات غير موضحة في صفحاتنا الرسمية.',
  governanceTitleAr: 'الالتزام والحوكمة',
  governanceBodyAr:
    'نوضح نطاق كل منتج أو خدمة، وطريقة الدفع أو الاشتراك، ومسؤوليات الأطراف قبل التنفيذ، مع المحافظة على الفصل بين دور خريطة الحل ودور مشغّل المنتج في علاقته بعملائه.',
  trustLegalAr:
    'تضم منظومة خريطة الحل مصنفات برمجية مسجلة لدى الهيئة السعودية للملكية الفكرية.',
  activitiesTitleAr: 'الأنشطة التجارية المسجلة للمنشأة',
  activitiesLeadAr:
    'تشمل بيانات المنشأة أنشطة تجارية مسجلة مرتبطة بتطوير البرمجيات وبيعها واستضافتها وتقديم الخدمات التقنية والتسويقية. ويُراجع الطلب الخاص قبل قبوله للتأكد من ملاءمته للأنشطة ونطاق العمل.',
  activitiesFootnoteAr:
    'تعرض أسماء الأنشطة وأرقامها وفق بيانات المنشأة الرسمية، ولا يعني كل نشاط منها وجود منتج مستقل معروض للبيع.',
  activityCodeLabelAr: 'رمز النشاط:',
  customTitleAr: 'حلول برمجية خاصة للمنشآت والأفراد',
  customBodyAr:
    'إذا لم يناسبك أحد المنتجات الجاهزة، يمكنك شرح احتياجك من خلال نموذج الطلب. تدرس الإدارة الفكرة ونطاقها الفني ومدى ملاءمتها لخدمات خريطة الحل، ثم تقدم تصوراً وعرضاً قبل بدء التنفيذ.',
  processTitleAr: 'مسار الطلب الخاص',
  processSteps: [
    {
      titleAr: 'شرح الاحتياج',
      bodyAr:
        'أدخل بيانات التواصل، واسم المنشأة إن وجد، ورقم السجل التجاري أو وثيقة العمل الحر إن وجدت، ثم اشرح احتياجك بصورة مبدئية أو مفصلة.',
    },
    {
      titleAr: 'دراسة الإدارة',
      bodyAr:
        'تراجع الإدارة الاحتياج ونطاقه الفني، وتتحقق من ملاءمته لخدمات خريطة الحل وإمكانات التنفيذ.',
    },
    {
      titleAr: 'تقديم العرض',
      bodyAr:
        'يصلك الرد عبر وسيلة التواصل المعتمدة، متضمناً النطاق المقترح والتكلفة والخطوات المطلوبة قبل بدء التنفيذ.',
    },
  ],
  ctaTitleAr: 'هل تريد نقل نشاطك إلى جوالات عملائك؟',
  ctaLeadAr:
    'اختر منتجاً جاهزاً، اطلب تجربة أحد المنتجات المشمولة، أو اشرح احتياجك ليقوم الفريق بدراسة المسار المناسب.',
  ctaExploreAr: 'استكشف المنتجات',
  ctaRequestAr: 'اطلب دراسة احتياجك',
  trustNavAr: 'التوثيق والتحقق',
} as const;

export const STORE_ABOUT_HERO_COLLAGE = [
  { reel: 'produce' as const, alt: 'واجهة خضارنا1' },
  { reel: 'kitchen' as const, alt: 'واجهة طبختنا1' },
  { reel: 'wedding' as const, alt: 'واجهة افراحي1' },
  { reel: 'halaq' as const, alt: 'واجهة حلاق ماب' },
] as const;

export const STORE_ABOUT_FEATURED_PRODUCTS = [
  {
    id: 'halaq-map',
    nameAr: 'منصة حلاق ماب',
    blurbAr:
      'منصة قطاعية تساعد العميل على اكتشاف الصالون والوصول إليه، وتمنح الصالون حضوراً رقمياً وأدوات تشغيل بحسب الخدمة المشترك بها.',
    href: 'https://www.halaqmap.com',
    reel: 'halaq' as const,
    imageAlt: 'رادار حلاق ماب على الخريطة',
  },
  {
    id: 'coiffeur-map',
    nameAr: 'كوافير ماب',
    blurbAr:
      'منصة مستقلة موجهة لخدمات التجميل النسائية، تساعد النشاط على بناء حضوره الرقمي وتنظيم تواصله مع العميلات.',
    href: 'https://coiffeur.halaqmap.com',
    reel: 'coiffeur' as const,
    imageAlt: 'أتيليه كوافير ماب',
  },
  {
    id: 'occasion-card',
    nameAr: 'كاردي8',
    blurbAr: 'بطاقة رقمية تفاعلية قابلة للمشاركة، تقدم بثلاث فئات تختلف في التصميم والخصائص.',
    href: `${STORE_ORIGIN}/#${ROUTE_PATHS.STORE_INVITES}`,
    reel: 'occasion' as const,
    imageAlt: 'معاينة كاردي8',
  },
  {
    id: 'halls-screens',
    nameAr: 'حلول المناسبات وشاشات العرض',
    blurbAr:
      'أفراحي1 وأجواء1 لتجارب المناسبات، ولاونجا1 لإدارة محتوى شاشات العرض في أماكن الضيافة. لكل منتج نطاقه وسعره وصفحته المستقلة.',
    href: `${STORE_ORIGIN}/#store-browse-halls`,
    reel: 'wedding' as const,
    imageAlt: 'قاعة مناسبة من منتجات خريطة الحل',
  },
] as const;

export const STORE_ABOUT_SPECIALIZED_PRODUCTS = [
  { nameAr: 'تمويناتا1', href: `${STORE_ORIGIN}/#${ROUTE_PATHS.STORE_GROCERS}` },
  { nameAr: 'خضارنا1', href: `${STORE_ORIGIN}/#${ROUTE_PATHS.STORE_PRODUCE}` },
  { nameAr: 'طبختنا1', href: `${STORE_ORIGIN}/#${ROUTE_PATHS.STORE_KITCHEN}` },
  { nameAr: 'كافينا1', href: `${STORE_ORIGIN}/#${ROUTE_PATHS.STORE_CAFE}` },
  { nameAr: 'مطعمنا1', href: `${STORE_ORIGIN}/#${ROUTE_PATHS.STORE_RESTAURANT}` },
  { nameAr: 'لاونجا1', href: `${STORE_ORIGIN}/#${ROUTE_PATHS.STORE_LOUNGE}` },
  { nameAr: 'أفراحي1', href: `${STORE_ORIGIN}/#${ROUTE_PATHS.STORE_WEDDING}` },
  { nameAr: 'أجواء1', href: `${STORE_ORIGIN}/#${ROUTE_PATHS.STORE_EVENT}` },
  { nameAr: 'كاردي8', href: `${STORE_ORIGIN}/#${ROUTE_PATHS.STORE_INVITES}` },
  { nameAr: 'حلانا1', href: `${STORE_ORIGIN}/#${ROUTE_PATHS.STORE_HALANA}` },
] as const;

export const STORE_ABOUT_PLATFORM_LINKS = [
  {
    nameAr: LEGAL_FIRST_SOFTWARE_PRODUCT_AR,
    blurbAr: 'منصة مستقلة للصالونات الرجالية: استعلام، رخصة نفاذ، وتشغيل يومي.',
    href: 'https://www.halaqmap.com',
    reel: 'halaq' as const,
  },
  {
    nameAr: COIFFEUR_PRODUCT_AR,
    blurbAr: 'منصة مستقلة لقطاع المشاغل وخدمات التجميل النسائية.',
    href: 'https://coiffeur.halaqmap.com',
    reel: 'coiffeur' as const,
  },
] as const;

/** صفحة تجميع التوثيق والفحوص المستقلة — واجهة المتجر فقط. */
export const STORE_TRUST_COPY = {
  documentTitle: `${STORE_PUBLIC_NAME_AR} | التوثيق والتحقق`,
  metaDescriptionAr:
    'بيانات توثيق متجر خريطة الحل، والأنشطة التجارية المسجلة، والمصنفات البرمجية المسجلة، وروابط فحوص الاتصال وسمعة النطاق.',
  navAr: 'التوثيق والتحقق',
  titleAr: 'التوثيق والتحقق',
  leadAr:
    'تجمع هذه الصفحة بيانات توثيق متجر خريطة الحل، والأنشطة التجارية المسجلة، وشهادات تسجيل المصنفات البرمجية، وفحوص الاتصال وسمعة النطاق. ويمكن فتح المصادر الخارجية للاطلاع على البيانات والنتائج المتاحة مباشرة.',
  scansTimingNoteAr:
    'تُعرض نتائج الفحوص التقنية بحسب تاريخ إجرائها، وقد تتغير عند فتح التقرير الحالي لدى الجهة الخارجية.',
  sslKickerAr: 'فحص خارجي',
  sslTitleAr: 'فحص تشفير الاتصال',
  sslBodyAr:
    'أظهر تقرير Qualys SSL Labs المسجل بتاريخ 20 أغسطس 2026 حصول النطاق الأم `halaqmap.com` على درجة A+. تعكس النتيجة إعدادات تشفير الاتصال وقت الفحص، ولا تعد اعتماداً للمنتج البرمجي أو ضماناً دائماً لحالة النطاق.',
  sslDomainLabelAr: 'النطاق المفحوص',
  sslGradeLabelAr: 'النتيجة المسجلة',
  sslDateLabelAr: 'تاريخ الفحص',
  sslScopeNoteAr:
    'واجهة المتجر على `store.halaqmap.com` تابعة للنطاق الأم. افتح التقرير الحالي للاطلاع على أحدث نتيجة للنطاق المفحوص.',
  sslCaptionAr:
    'صورة محفوظة لنتيجة الفحص بتاريخ 20 أغسطس 2026. افتح التقرير الحالي للاطلاع على أحدث نتيجة.',
  sslAltAr: 'معاينة محفوظة لتقرير Qualys SSL Labs لنطاق halaqmap.com',
  sslImage: '/images/store/ssl-labs-aplus.png',
  sslVerifyAr: 'فتح التقرير الحالي',
  ecomTitleAr: 'توثيق التجارة الإلكترونية',
  ecomBodyAr:
    'متجر خريطة الحل موثّق لدى المركز السعودي للأعمال، ويمكن التحقق من بيانات التوثيق باستخدام الرقم الظاهر أدناه من خلال بوابة الاستعلام الرسمية.',
  ecomVerifyAr: 'فتح بوابة التحقق الرسمية',
  activityTitleAr: 'الأنشطة التجارية المسجلة',
  activityBodyAr:
    'تشمل أنشطة المنشأة المسجلة البيع بالتجزئة للبرمجيات، وتكامل الأنظمة، وتصميم البرمجيات وتطوير التطبيقات والاستضافة، إلى جانب الأنشطة المساندة الموضحة في صفحة «من نحن».',
  activityCtaAr: 'عرض الأنشطة وأرقامها',
  saipTitleAr: 'المصنفات البرمجية المسجلة',
  scansTitleAr: 'فحوص سمعة النطاق',
  scansLeadAr:
    'نتائج تكميلية من خدمات فحص خارجية، وتعكس حالة الرابط وقت إجراء الفحص. لا تمثل شهادة أمان للمنتج، ولا تغني عن التوثيق الرسمي أو المراجعة الأمنية المستمرة.',
  scanSavedPrefixAr: 'نتيجة محفوظة',
  scanOpenAr: 'فتح الفحص الحالي',
  disclaimerAr:
    'هذه نتائج صادرة عن خدمات خارجية وتتغير بمرور الوقت. يعتمد الحكم على النتيجة الحالية الظاهرة عند فتح رابط الفحص، ولا ترتبط هذه الفحوص بترتيب الموقع في محركات البحث.',
} as const;

/** بنر منتج حلاق ماب — أحد أعمال المتجر، تحت الهيرو فقط. يوجّه إلى تطبيق الشركاء على متجر Play. */
export const STORE_HALAQMAP_OPS_BANNER = {
  badgeAr: 'منتج',
  ariaAr: 'بنر منتج حلاق ماب ضمن أعمال المتجر',
  headingAr: 'لطلبات المنشآت والمراسلات وما يتصل بها',
  titleAr: 'حلاق ماب منتج ضمن أعمال المتجر — حمل تطبيق حلاق ماب بارتنر.',
  ctaAr: 'حمل تطبيق حلاق ماب بارتنر',
  appHref: PARTNER_ANDROID_PLAY_STORE_URL,
} as const;

/** أبواب الخدمات البرمجية اللاحقة — بلا أسعار على واجهة المتجر. */
export const STORE_LATER_SERVICES_COPY = {
  titleAr: 'خدمات برمجية لاحقة',
  leadAr:
    'ثلاثة أبواب فقط. الإنتاج متنوع ومنفتح على الابتكار. أسعار المنتجات الجاهزة على صفحاتها، والطلب الخاص بلا سعر ثابت هنا.',
  packagesHref: `${STORE_ORIGIN}/#/store`,
  outNoteAr:
    'لا حجز مواعيد ولا تسعير ولا تحصيل أجرة الخدمة نيابة عن المنشأة. لا عمولة على الحرفة.',
  doors: [
    {
      id: 'ready',
      kickerAr: 'جاهز الآن',
      titleAr: 'منتجات جاهزة',
      bodyAr:
        'من الأعمال الحالية: حلاق ماب برخصة النفاذ، وكوافير ماب، وكاردي8، وافراحي1، واجواء1، ولاونجا1، وتمويناتا1. كل منتج بسعره على صفحته.',
      ctaAr: 'عرض أعمال المتجر',
      action: 'packages',
    },
    {
      id: 'ops',
      kickerAr: 'بعد الدراسة',
      titleAr: 'حلول تشغيل للمنشآت',
      bodyAr:
        'صفحة تعريف مستضافة، أو لوحة تشغيل، أو مقاعد لفروع مستقلة. يُحدَّد النطاق حسب المنشأة قبل أي عرض.',
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

/** فرصة مشاركة هادئة — ليست باب برمجة رابعاً. */
export const STORE_COMMISSION_COPY = {
  kickerAr: 'تسويق بالعمولة',
  titleAr: 'برامج تسويق مستقلة بحسب المنصة',
  leadAr:
    'تدير المنظومة برامج تسويق منفصلة لحلاق ماب، وكوافير ماب، ومنتجات متجر خريطة الحل. لكل برنامج شروطه وبوابته وآلية احتساب العمولة الخاصة به.',
  halaqLabelAr: 'سفراء حلاق ماب',
  coiffeurLabelAr: 'مسوّقات كوافير ماب',
  storeLabelAr: 'مسوّقو منتجات المتجر',
  halaqHref: `https://www.halaqmap.com/#${ROUTE_PATHS.AMBASSADOR_ENTER}`,
  coiffeurHref: `https://coiffeur.halaqmap.com/#${ROUTE_PATHS.COIFFEUR_AMBASSADORS}`,
  storeHref: `https://store.halaqmap.com/#${ROUTE_PATHS.STORE_AFFILIATES}`,
} as const;

export const STORE_SECTOR_SPLIT_COPY = {
  titleAr: 'منتجات ضمن أعمال المتجر',
  leadAr:
    'حلاق ماب وكوافير ماب منتجان قطاعيان ضمن أعمال المتجر المتنوعة. لكل منهما سطحه، والدفع عبر بوابة الدفع الآمنة.',
  halaqNameAr: LEGAL_FIRST_SOFTWARE_PRODUCT_AR,
  halaqBodyAr: 'للرجال. منتج جاهز برخصة النفاذ، وله بنره الخاص ضمن الأعمال.',
  halaqHost: 'www.halaqmap.com',
  halaqHref: 'https://www.halaqmap.com',
  coiffeurNameAr: COIFFEUR_PRODUCT_AR,
  coiffeurBodyAr:
    'للنساء. منتج قطاعي ضمن المتجر نفسه. الاستعلام ومسار الشريكات يتوسعان بالتغطية.',
  coiffeurHost: 'coiffeur.halaqmap.com',
  coiffeurHref: 'https://coiffeur.halaqmap.com',
} as const;

export const STORE_LIVE_PRODUCTS = [
  {
    id: 'halaq-map',
    nameAr: LEGAL_FIRST_SOFTWARE_PRODUCT_AR,
    blurb: 'منصة قطاعية تساعد العميل على اكتشاف الصالون والوصول إليه، وتمنح الصالون حضوراً رقمياً وأدوات تشغيل بحسب الخدمة المشترك بها.',
    href: 'https://www.halaqmap.com',
    image: STORE_VISUALS.radar,
    imageAlt: 'رادار حلاق ماب على الخريطة',
    mark: STORE_VISUALS.logo,
  },
  {
    id: 'coiffeur-map',
    nameAr: COIFFEUR_PRODUCT_AR,
    blurb: 'منصة مستقلة موجهة لخدمات التجميل النسائية، تساعد النشاط على بناء حضوره الرقمي وتنظيم تواصله مع العميلات.',
    href: 'https://coiffeur.halaqmap.com',
    image: STORE_VISUALS.coiffeurHero,
    imageAlt: 'أتيليه كوافير ماب',
    mark: STORE_VISUALS.coiffeurSeal,
  },
  {
    id: 'occasion-card',
    nameAr: 'كاردي8',
    blurb: 'بطاقة رقمية تفاعلية قابلة للمشاركة، تقدم بثلاث فئات تختلف في التصميم والخصائص.',
    href: `${STORE_ORIGIN}/#${ROUTE_PATHS.STORE_INVITES}`,
    image: STORE_VISUALS.cardStudio,
    imageAlt: 'معاينة كاردي8 من المتجر',
    mark: STORE_VISUALS.logo,
  },
  {
    id: 'live-halls',
    nameAr: 'حلول المناسبات وشاشات العرض',
    blurb: 'أفراحي1 وأجواء1 لتجارب المناسبات، ولاونجا1 لإدارة محتوى شاشات العرض في أماكن الضيافة. لكل منتج نطاقه وسعره وصفحته المستقلة.',
    href: `${STORE_ORIGIN}/#store-browse-halls`,
    image: '/images/store/lab/lab-lounge-interior.jpg',
    imageAlt: 'شاشة لاونج من منتجات المتجر',
    mark: STORE_VISUALS.logo,
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
