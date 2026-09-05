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
  pitchHeadlineAr: 'خريطة الحل: تنقلك من انتظار زبائنك.. إلى التواجد في جوالاتهم',
  pitchLeadAr:
    'منتجاتنا تنقلك من انتظارهم إلى متصفحات جوالاتهم. يتسوقون من منتجاتك على جوالاتهم، وترد عليهم في ثوانٍ.',
  pitchPickLeadAr: 'اختر ما يخص نشاطك. كل منتج بصفحته ورابطه ولوحة تشغيله.',
  browseNeighborhoodAr: 'الحي',
  browseHallsAr: 'المناسبات والشاشات',
  browseCardsAr: 'البطاقات',
  browseWorksAr: 'أعمال أخرى',
  deskChatTitle: 'محادثة مباشرة مع الإدارة',
  deskChatLead: 'من واجهة خريطة الحل. جلسة ستون دقيقة، والرد يصلك هنا.',
  freeCardsTitle: 'خدمات برمجية مجانية الآن',
  freeCardsLead:
    'أصدر بطاقة تهنئة لنفسك: الاسم ورقم الجوال والبريد ورابط صورة شخصية. يوم وطني، تخرج، أو معايدة. نسخة أولى قابلة للتعديل لاحقاً.',
  footerLegal: LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR,
  mediaLicenseLineAr: `تراخيص الهيئة العامة لتنظيم الإعلام ${LEGAL_MEDIA_LICENSE_NUMBERS.join(' - ')}`,
  consentLabel: 'أوافق على دراسة الطلب والرد عبر البريد أو الجوال أو واتساب.',
  aboutNavAr: 'من نحن',
  trustStripTitleAr: 'التصنيفات والتحقق',
  trustStripLeadAr: 'اطّلع على بيانات التوثيق والتشفير الرسمية للنشاط',
  trustStripBodyAr:
    'نوثّق أعمالنا بأعلى معايير الأمان والتراخيص الرسمية. يمكنك التحقق المباشر من تقييم التشفير، توثيق التجارة الإلكترونية، ونشاط السجل التجاري، وشهادات تسجيل خمسة مصنفات برمجية لدى الهيئة السعودية للملكية الفكرية، من خلال روابط علنية ومباشرة في صفحة واحدة.',
  trustStripCtaAr: 'فتح التصنيفات والتحقق',
  paidInvitesTitleAr: 'كاردي8',
  paidInvitesLeadAr:
    'معاينة مجانية ثم بطاقة حيّة قابلة للمشاركة. ثلاث طبقات معتمدة: 12 و29 و59 ر.س. الدفع عبر بوابة الدفع الآمنة.',
  paidInvitesCtaAr: 'افتح كاردي8',
  weddingLiveTitleAr: 'افراحي1 رجالي',
  weddingLiveLeadAr:
    'حوّل دعوة زفافك التقليدية إلى منصة احتفالية رقمية. السعر الافتتاحي 899 ر.س.',
  weddingLiveCtaAr: 'افتح افراحي1',
  weddingLiveWomenTitleAr: 'افراحي1 نسائي',
  weddingLiveWomenLeadAr:
    'حوّلي دعوة زفافك التقليدية إلى منصة احتفالية رقمية. السعر الافتتاحي 899 ر.س.',
  weddingLiveWomenCtaAr: 'افتحي افراحي1',
  eventLiveTitleAr: 'اجواء1',
  eventLiveLeadAr:
    'حوّل دعوة مناسبتك التقليدية إلى منصة احتفالية رقمية. السعر الافتتاحي 899 ر.س.',
  eventLiveCtaAr: 'افتح اجواء1',
  loungeLiveTitleAr: 'لاونجا1',
  loungeLiveLeadAr:
    'ابتكار رقمي يمنح لاونجك طابعاً فاخراً وتفاعلياً. الباقة التشغيلية 600 ر.س لثلاثة أشهر، شراء مرة واحدة. لا عمولة على التهاني؛ تُدفع قيمة الباقة فقط.',
  loungeLiveCtaAr: 'افتح لاونجا1',
  grocersLiveTitleAr: 'تمويناتا1',
  grocersLiveLeadAr:
    'حل رقمي يربط التموينات بجار الحي: متجر مستقل ولوحة كاشير حية. مسار ثابت: 599 ر.س لستة أشهر، أو 899 ر.س لاثني عشر شهراً. مسار متحرك من نموذج الطلب.',
  grocersLiveCtaAr: 'افتح تمويناتا1',
  restaurantLiveTitleAr: 'مطعمنا1',
  restaurantLiveLeadAr:
    'صفحة وجبات عبر رمز QR ولوحة كاشير ومطبخ وصندوق محادثة مدرج. مسار ثابت: 699 ر.س لستة أشهر، أو 999 ر.س لاثني عشر شهراً. مسار متحرك من نموذج الطلب. لا عمولة على قيمة الطلبات.',
  restaurantLiveCtaAr: 'افتح مطعمنا1',
  cafeLiveTitleAr: 'كافينا1',
  cafeLiveLeadAr:
    'صفحة مشروبات عبر رمز QR وشاشات داخل المقهى ولوحة كاشير وصندوق محادثة مدرج. مسار ثابت: 1199 ر.س لستة أشهر، أو 2099 ر.س لاثني عشر شهراً. مسار متحرك من نموذج الطلب. لا عمولة على قيمة الطلبات.',
  cafeLiveCtaAr: 'افتح كافينا1',
  kitchenLiveTitleAr: 'طبختنا1',
  kitchenLiveLeadAr:
    'صفحة أصناف منزلية عبر رمز QR ولوحة نشاط وواتساب من جهاز الأسرة. 300 ر.س لمئة وثمانين يوماً، أو 600 ر.س لثلاثمئة وستين يوماً. أسعار مخصصة للأسر المنتجة دعماً من متجر خريطة الحل. لا تحصيل من الزبون عبر المنصة.',
  kitchenLiveCtaAr: 'افتح طبختنا1',
  produceLiveTitleAr: 'خضارنا1',
  produceLiveLeadAr:
    'صفحة صندوق خضار وفواكه عبر رمز QR ولوحة صندوق وشريط وصل اليوم وصندوق ملاحظة مدرج. 1350 ر.س لمئة وثمانين يوماً، أو 2500 ر.س لثلاثمئة وستين يوماً. المسار الثابت والمتحرك مدرجان. لا تحصيل من جار الحي عبر المنصة.',
  produceLiveCtaAr: 'افتح خضارنا1',
  halanaLiveTitleAr: 'حلانا1',
  halanaLiveLeadAr:
    'معرض أعمال لمتخصصة الحلويات وصفحة طلب مخصص ولوحة تعتمد منها العربون يدوياً. 894 ر.س لمئة وثمانين يوماً، أو 1788 ر.س لثلاثمئة وستين يوماً. لا تحصيل من العميلة عبر المنصة.',
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
  documentTitle: `${STORE_BRAND_LATIN} — من نحن`,
  kicker: STORE_ENGLISH_LINE,
  titleAr: 'من نحن',
  introTaglineAr: 'متجر إلكتروني موثّق متخصص في بيع البرمجيات والحلول السحابية',
  introBeforeMark:
    'نحن متجر إلكتروني موثّق لتزويد المنشآت والأفراد بأحدث البرمجيات والخدمات السحابية المبتكرة. نعمل تحت العلامة التجارية الرسمية ',
  introAfterMark:
    ' والاسم الظاهر خريطة الحل، حيث نقدّم باقة متنوعة من الحلول البرمجية الجاهزة للتفعيل المباشر، إلى جانب تطوير الحلول المخصصة، مع توفير أساليب دفع واشتراك سحابية آمنة ومباشرة عبر النطاق الرسمي.',
  natureTitle: 'طبيعة عمل المتجر',
  natureBody:
    'نتميّز بنموذج عمل برمجي يعتمد على البيع المباشر للحلول والمنتجات البرمجية وتطوير الطلبات الخاصة، دون عمولة على الخدمات الحِرَفية التي يقدّمها العملاء.',
  natureServicesTitleAr: 'خدماتنا وبرمجياتنا تشمل',
  naturePoints: [
    {
      titleAr: 'متاجر وحلول رقمية',
      bodyAr: 'تصميم موقع إلكتروني مخصص لبيع منتجاتك أو خدماتك.',
    },
    {
      titleAr: 'صفحات استضافة سحابية',
      bodyAr: 'صفحات هبوط والتقاط بيانات مستضافة على نطاقاتنا لتسويق سلعك وخدماتك.',
    },
    {
      titleAr: 'إضافات وتكاملات برمجية',
      bodyAr: 'إضافات سريعة ومخصصة تُدمج مباشرة في موقعك.',
    },
    {
      titleAr: 'أدوات التواصل المباشر',
      bodyAr: 'صناديق محادثة تفاعلية تربطك بزوار صفحتك وعملائك.',
    },
    {
      titleAr: 'لوحات تحكم تشغيلية',
      bodyAr: 'لوحة إدارة شاملة لمتابعة تشغيل عملياتك.',
    },
    {
      titleAr: 'أنظمة برمجية خاصة',
      bodyAr: 'بناء نظام متكامل يُدرس خصيصاً حسب احتياج منشأتك.',
    },
    {
      titleAr: 'ابتكارات واستشارات تقنية',
      bodyAr: 'دراسة الاتجاهات والأفكار البرمجية الجديدة بما يناسب نشاطك التجاري.',
    },
  ],
  natureCta: 'اطلب الآن',
  trustTeaserTitleAr: 'التصنيفات والتحقق',
  trustTeaserLeadAr: 'اطّلع على بيانات التوثيق والتشفير الرسمية للنشاط',
  trustTeaserBodyAr:
    'نوثّق أعمالنا بأعلى معايير الأمان والتراخيص الرسمية. يمكنك التحقق المباشر من تقييم التشفير، توثيق التجارة الإلكترونية، ونشاط السجل التجاري من خلال روابط علنية ومباشرة في صفحة واحدة.',
  trustTeaserCtaAr: 'فتح التصنيفات والتحقق',
  licenseTitleAr: 'الموثوقية والتراخيص النظامية',
  licenseAfterMarkAr:
    ' · خريطة الحل وفق أنشطة تجارية وتراخيص إعلامية رسمية تخوّلنا تصميم وإنتاج وتطوير البرمجيات والبيع بالتجزئة.',
  licenseFraudTitleAr: 'حماية من الاحتيال',
  licenseFraudBodyAr:
    'جميع برمجياتنا المبتكرة وحلولنا السحابية تُباع حصرياً عبر متجرنا الرسمي، لحمايتك من أي عمليات احتيال أو التعامل مع جهات غير معتمدة.',
  licenseGovernanceTitleAr: 'الالتزام والحوكمة',
  licenseGovernanceBodyAr:
    'نلتزم بكافة الشروط والتعهدات النظامية المعتمدة لدى الجهات المختصة لضمان تقديم خدمة آمنة ومستقرة.',
  activitiesTitle: 'الأنشطة التجارية للمنشأة',
  activitiesLead:
    'تمتلك المنشأة سجلات تجارية مرخّصة لتقديم المنتجات والخدمات البرمجية، ويُراجع أي طلب برمجي خاص قبل بدء التنفيذ لضمان توافقه مع الأنشطة المصرّح بها.',
  productsTitle: 'المنتجات البرمجية الحالية',
  productsLead:
    'من أعمال المتجر الحالية: حلاق ماب وكوافير ماب كمنتجين قطاعيين، وكاردي8، وافراحي1، واجواء1، ولاونجا1، وتمويناتا1، ومطعمنا1، وكافينا1، وطبختنا1. القائمة تتوسع مع الطلبات والابتكارات.',
  detailsTitle: 'ما يندرج في تفاصيل الخدمة',
  detailsIn: [
    'تجارة وعرض برمجيات جاهزة وخدمات سحابية متنوعة.',
    'منتجات قطاعية مثل حلاق ماب، ومنتجات مناسبات وشاشات.',
    'إيصال إلكتروني لشراء المنتج البرمجي.',
    'بطاقات تهنئة مجانية يصدرها العميل لنفسه من واجهة المتجر.',
  ],
  detailsOut: [
    'لا عمولة على خدمة حِرَفية يقدمها العميل لزواره.',
    'لا تعاقد نيابة عن المنشأة.',
    'لا تحصيل أو تسعير نيابة عن منشأة العميل.',
  ],
  customTitle: 'خدمات برمجية خاصة للمنشآت والأفراد',
  customBody:
    'نبرمج ما يناسب أنشطة المنشأة والمنتجات الحالية: موقع لبيع منتجاتك أو خدماتك، صفحة مستضافة على نطاقاتنا، إضافات برمجية، صندوق محادثة مع زوار الصفحة، ولوحة تحكم لإدارة الصفحة وتشغيلها. يعتمد النطاق على ما تشرحه في الطلب. لا أسعار ثابتة لهذه الطلبات على الواجهة.',
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
  saipTitleAr: 'تسجيل المصنفات البرمجية',
  saipLeadAr:
    'ستة منتجات من متجر خريطة الحل مسجّلة مصنفات برمجية لدى الهيئة السعودية للملكية الفكرية. الأرقام أدناه لشهادات التسجيل الصادرة. ليست علامة تجارية ولا براءة اختراع.',
  saipOpenAr: 'افتح صفحة المنتج',
  scansTitleAr: 'فحوص سمعة النطاق',
  scansLeadAr:
    'فحوص تكميلية لسمعة الرابط وقت الفحص. ليست شهادة أمان للتطبيق ولا تغني عن التوثيق النظامي.',
  scanOpenAr: 'افتح الفحص',
  disclaimerAr:
    'الفحوص الخارجية تعكس حالة النطاق وقت الفحص. تأكد من التقرير الحي عبر الرابط، ولا تخلط هذا بالظهور في نتائج البحث.',
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
  titleAr: 'بوابات التسويق بالعمولة — مستقلة',
  leadAr:
    'ثلاث مجموعات منفصلة. سفراء حلاق ماب، مسوّقات كوافير ماب، ومسوّقو منتجات المتجر. كل بوابة على صفحتها. كاردي8 خارج هذا المسار.',
  halaqLabelAr: 'مسوّقو حلاق ماب',
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
    blurb: 'منتج قطاعي ضمن أعمال المتجر. استعلام للمستعلم، ورخصة نفاذ للصالون.',
    href: 'https://www.halaqmap.com',
    image: STORE_VISUALS.radar,
    imageAlt: 'رادار حلاق ماب على الخريطة',
    mark: STORE_VISUALS.logo,
  },
  {
    id: 'coiffeur-map',
    nameAr: COIFFEUR_PRODUCT_AR,
    blurb: 'منتج قطاعي نسائي ضمن أعمال المتجر. بوابة الدفع واحدة على النطاق الأم.',
    href: 'https://coiffeur.halaqmap.com',
    image: STORE_VISUALS.coiffeurHero,
    imageAlt: 'أتيليه كوافير ماب',
    mark: STORE_VISUALS.coiffeurSeal,
  },
  {
    id: 'occasion-card',
    nameAr: 'كاردي8',
    blurb: 'بطاقة حيّة قابلة للمشاركة. ثلاث طبقات: 12 و29 و59 ر.س. الدفع عبر بوابة الدفع الآمنة.',
    href: `${STORE_ORIGIN}/#${ROUTE_PATHS.STORE_INVITES}`,
    image: STORE_VISUALS.cardStudio,
    imageAlt: 'معاينة كاردي8 من المتجر',
    mark: STORE_VISUALS.logo,
  },
  {
    id: 'live-halls',
    nameAr: 'قاعات وشاشات حيّة',
    blurb: 'افراحي1، اجواء1، ولاونجا1 لتشغيل شاشات اللاونج. كل منتج بسعره على صفحته.',
    href: `${STORE_ORIGIN}/#${ROUTE_PATHS.STORE_LOUNGE}`,
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
