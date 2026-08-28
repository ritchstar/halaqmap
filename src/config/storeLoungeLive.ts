/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لاونجا1 — تشغيل شاشات اللاونج. لا يُستورد من App.
 * باقات: 600 ر.س لثلاثة أشهر، 1200 لستة، و2400 لاثني عشر شهراً.
 */
export const STORE_LOUNGE_LIVE_PUBLIC_ENABLED = true;

export const STORE_LOUNGE_LIVE_LAB_TOKEN = 'lounge-lab' as const;

export const STORE_LOUNGE_LIVE_PRODUCT = 'store_lounge_live' as const;

export const STORE_LOUNGE_LIVE_PRICE_SAR = 600 as const;
export const STORE_LOUNGE_LIVE_PRICE_HALALAS = 60000 as const;
export const STORE_LOUNGE_LIVE_DAYS = 90 as const;

export type StoreLoungeLivePackId = 'm3' | 'm6' | 'm12';

export const STORE_LOUNGE_LIVE_PACKS = [
  {
    id: 'm3' as const,
    months: 3,
    days: 90,
    priceSar: 600,
    priceHalalas: 60000,
    titleAr: 'ثلاثة أشهر',
    priceLineAr: '600 ر.س',
    lineAr: 'تشغيل الشاشة ثلاثة أشهر.',
  },
  {
    id: 'm6' as const,
    months: 6,
    days: 180,
    priceSar: 1200,
    priceHalalas: 120000,
    titleAr: 'ستة أشهر',
    priceLineAr: '1200 ر.س',
    lineAr: 'تشغيل الشاشة ستة أشهر.',
  },
  {
    id: 'm12' as const,
    months: 12,
    days: 365,
    priceSar: 2400,
    priceHalalas: 240000,
    titleAr: 'اثنا عشر شهراً',
    priceLineAr: '2400 ر.س',
    lineAr: 'تشغيل الشاشة سنة كاملة.',
  },
] as const;

export function loungeLivePackById(id: string) {
  return STORE_LOUNGE_LIVE_PACKS.find((item) => item.id === id) || STORE_LOUNGE_LIVE_PACKS[0];
}

export function isLoungeLivePriceHalalas(amount: number): boolean {
  return STORE_LOUNGE_LIVE_PACKS.some((item) => item.priceHalalas === amount);
}

function envEnabled(name: string, fallback: boolean): boolean {
  const raw = String((import.meta as { env?: Record<string, unknown> }).env?.[name] ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  if (raw === 'true' || raw === '1' || raw === 'on') return true;
  return fallback;
}

export const STORE_LOUNGE_LIVE_CHECKOUT_ENABLED = envEnabled('VITE_STORE_LOUNGE_LIVE_CHECKOUT_ENABLED', true);

export const STORE_LOUNGE_LIVE_ACCENT = '#d4a574' as const;

export const STORE_LOUNGE_LIVE = {
  documentTitle: 'لاونجا1 — تشغيل شاشات اللاونج — خريطة الحل',
  kickerAr: 'شاشة اللاونج تعمل حسب المدة التي تختارونها',
  titleAr: 'لاونجا1',
  leadAr:
    'ابتكار رقمي يمنح لاونجك طابعاً فاخراً وتفاعلياً. حزمة فعاليات شاشة متكاملة تتيح لزوارك مشاركة الإهداءات والترحيب باسمهم مباشرة، مع لوحة تحكم سريعة لإدارة المحتوى.',
  priceLineAr: 'الباقات: 600 ر.س لثلاثة أشهر، 1200 لستة أشهر، و2400 لاثني عشر شهراً',
  durationLineAr:
    'شراء لمرة واحدة حسب المدة. بعد انتهاء المدة يبقى الرابط لديكم، وإعادة الشراء من نفس الرابط تمدّد الشاشة ذاتها.',
  featurePoints: [
    {
      titleAr: 'فعاليات جاهزة',
      bodyAr: 'ترحيب، عيد ميلاد، إهداء خاص، وافتتاحية الليلة.',
    },
    {
      titleAr: 'تفاعل الزوار',
      bodyAr: 'رابط أو رمز يوزّعه اللاونج لإرسال ترحيبات وتبريكات تظهر على الشاشة.',
    },
    {
      titleAr: 'تحكم كامل',
      bodyAr: 'إيقاف الاستقبال، إخفاء فوري، واعتماد اختياري قبل الظهور.',
    },
    {
      titleAr: 'بلا رسوم على الترحيب',
      bodyAr: 'لا عمولة على التهاني أو تفاعل الزوار. تُدفع قيمة الباقة فقط.',
    },
  ],
  hallStampAr: 'halaqmap · خريطة الحل',
  guestFormTitleAr: 'أرسل ترحيباً يظهر على شاشة اللاونج',
  guestNameLabelAr: 'اسمك إن رغبت',
  guestMessageLabelAr: 'الترحيب على الشاشة',
  guestWriteChipAr: 'اكتب عبارتك',
  guestPickHintAr: 'اختَر جملة جاهزة فتُملأ في الحقل، أو اكتب عبارتك ثم أرسل.',
  guestExtraLabelAr: 'سطر إضافي منك',
  guestSubmitAr: 'أظهر ترحيبي على الشاشة',
  guestOnlyHintAr: 'هكذا يرسل الزبون ترحيبه من جواله.',
  guestPausedAr: 'الاستقبال متوقف مؤقتاً. اطلب من المضيف إعادة فتحه.',
  guestPendingAr: 'أُرسل ترحيبك، ويظهر بعد مراجعة المضيف.',
  guestSentAr: 'ظهر ترحيبك على الشاشة.',
  guestRateAr: 'انتظر قليلاً قبل إرسال ترحيب آخر.',
  guestDupAr: 'هذه العبارة أُرسلت للتو.',
  guestBlockedAr: 'تعذر إرسال هذه العبارة.',
  screenIdleCtaAr: 'أرسل ترحيبك لتظهر على الشاشة',
  screenQrHintAr: 'امسح الرمز من جوالك',
  screenLiveAr: 'الشاشة متصلة',
  screenStaleAr: 'تعذر تحديث الشاشة',
  hostContentAr: 'المحتوى',
  hostInteractAr: 'التفاعل',
  hostScreenAr: 'الشاشة',
  hostPauseAr: 'إيقاف استقبال الترحيبات',
  hostReviewAr: 'اعتماد الترحيب قبل ظهوره على الشاشة',
  hostApproveAr: 'اعتمد',
  hostHideAr: 'إخفاء',
  locateMeAr: 'حدد موقعي',
  locatingAr: 'جاري تحديد الموقع…',
  locateFailAr: 'تعذّر تحديد الموقع. أعد المحاولة بعد موافقة المتصفح.',
  locateDeniedAr: 'رُفض إذن الموقع. فعّله من إعدادات المتصفح.',
  locateSavedAr: 'حُفظ الموقع.',
  deskPickupTitleAr: 'موقع اللاونج',
  deskPickupLeadAr:
    'حدّد الموقع من الإعداد الأول بعد موافقة المتصفح، ثم أبرزه على الشاشة أو أخفه. المخفي لا يظهر للزائر.',
  pickupShowAr: 'إبراز الموقع',
  pickupHideAr: 'إخفاء الموقع',
  pickupPlaceOpenAr: 'افتح الموقع',
  pickupPinAriaAr: 'موقع اللاونج على الخريطة',
  hostPanelTitleAr: 'لوحة تحكم اللاونج',
  hostAnnouncementLabelAr: 'تنويه على الشاشة',
  hostYoutubeLabelAr: 'رابط يوتيوب',
  hostYoutubeHideAr: 'حجب الفيديو وإظهار صورة الشاشة',
  hostYoutubeShowAr: 'إعادة عرض يوتيوب',
  hostWelcomeLabelAr: 'نص الترحيب على الشاشة',
  hostUploadPhotoAr: 'رفع صورة للشاشة',
  hostNameLabelAr: 'اسم المسؤول',
  loungeNameLabelAr: 'اسم اللاونج',
  eventPackTitleAr: 'فعاليات الشاشة',
  customEventLabelAr: 'اسم فعالية تضيفونها',
  customEventCtaAr: 'اعرض هذه الفعالية',
  orderCtaAr: 'اختَر المدة ثم ادفع',
  renewCtaAr: 'أعد الشراء على نفس الصفحة',
  orderEmailLabelAr: 'البريد لاستلام روابط الشاشة والضيف والمضيف',
  orderConsentAr: 'قرأت شروط الخدمة وأوافق على بدء التحصيل عبر بوابة الدفع. لا تحصيل من الزائر غير سعر هذا المنتج.',
  orderSubmitAr: 'الانتقال إلى الدفع',
  tryCtaAr: 'عاين الشاشة الآن',
  displayLinkAr: 'شاشة اللاونج',
  guestLinkAr: 'رابط الزبون',
  hostLinkAr: 'لوحة المضيف',
  hallKickerAr: 'اللاونج على الشاشة',
  termsFoldTitleAr: 'شروط الخدمة قبل الطلب',
  termsFoldTriggerAr: 'اقرأ شروط الخدمة',
  termsFoldBodyAr:
    'شغّل شاشة اللاونج حسب المدة: فعاليات جاهزة، لوحة تحكم، ورابط ترحيب باسم الزائر. الأسعار 600 أو 1200 أو 2400 ر.س عبر بوابة الدفع الآمنة. لا تحصيل من الزائر غير سعر الباقة. عند إعادة الشراء تبقى الروابط وتمتد المدة على الشاشة ذاتها. التفاصيل في شروط الخدمة.',
  labKickerAr: 'معاينة حيّة داخل الصفحة',
  labTitleAr: 'هكذا تظهر الشاشة لزبائن اللاونج',
  labLeadAr: 'اختَر فعالية، امسح الرمز أو أرسل ترحيباً باسم الزبون، واكتب تنويهاً كما في ليلة التشغيل.',
  expiredTitleAr: 'انتهت مدة التشغيل',
  expiredLeadAr: 'الرابط ما زال لديكم. اختاروا المدة وأتمّوا الشراء لتمديد نفس الشاشة.',
  heroImage: '/images/store/lounge-hero-marketing.jpg',
  heroAltAr: 'لاونج ليلي بشاشة حائط مضيئة ومقاعد فاخرة',
  heroCaptionAr: 'هكذا تبدو ليلة التشغيل على شاشة اللاونج',
} as const;

export const STORE_LOUNGE_LIVE_EVENTS = [
  {
    id: 'welcome',
    titleAr: 'ترحيب اللاونج',
    welcomeAr: 'حياكم الله في اللاونج. اكتبوا أسماءكم لتظهر الترحيبات على الشاشة.',
  },
  {
    id: 'birthday',
    titleAr: 'عيد ميلاد',
    welcomeAr: 'الليلة عيد ميلاد على الشاشة. باركوا لصاحب المناسبة باسمه ليظهر أمام الجميع.',
  },
  {
    id: 'cheers',
    titleAr: 'إهداء خاص',
    welcomeAr: 'أرسلوا ترحيباً باسمكم أو باسم من تودّون تكريمه. يظهر على الشاشة بلا أي دفع إضافي.',
  },
  {
    id: 'tonight',
    titleAr: 'افتتاحية الليلة',
    welcomeAr: 'افتتاحية هذه الليلة على الشاشة. شاركوا ترحيبكم ليُقرأ أمام الجميع.',
  },
  {
    id: 'custom',
    titleAr: 'فعالية من اللاونج',
    welcomeAr: 'فعالية يسمّيها اللاونج من لوحته وتعرض على الشاشة مع ترحيبات الزبائن.',
  },
] as const;

export type StoreLoungeLiveEventId = (typeof STORE_LOUNGE_LIVE_EVENTS)[number]['id'];

export function loungeLiveEventById(id: string) {
  return STORE_LOUNGE_LIVE_EVENTS.find((item) => item.id === id) || STORE_LOUNGE_LIVE_EVENTS[0];
}

export const STORE_LOUNGE_LIVE_CANNED = [
  { id: 'welcome', textAr: 'حياك الله، والشاشة ترحب بك.' },
  { id: 'birthday', textAr: 'عيد ميلاد سعيد، والليلة أجمل بوجودك.' },
  { id: 'mubarak', textAr: 'ألف مبارك، ليلة سعيدة.' },
  { id: 'noor', textAr: 'نورت اللاونج، تسعد أوقاتك.' },
  { id: 'ahlain', textAr: 'أهلاً وسهلاً، تفضل بالراحة.' },
  { id: 'hania', textAr: 'ليلة هادئة وهنيّة، حياك الله.' },
  { id: 'zeen', textAr: 'وجودك يزيّن المكان.' },
] as const;

export const STORE_LOUNGE_LIVE_DEMO = {
  loungeName: 'لاونج النخيل',
  hostName: 'الإدارة',
  activeEventId: 'welcome' as StoreLoungeLiveEventId,
  customEventTitle: '',
  welcomeAr: STORE_LOUNGE_LIVE_EVENTS[0].welcomeAr,
  youtubeUrl: '',
  youtubeHidden: true,
  announcement: '',
  photoSrc: '/images/store/lab/lab-lounge-interior.jpg',
  panoramaSrc: '/images/store/lab/lab-lounge-interior.jpg',
  guestPaused: false,
  reviewBeforeShow: false,
} as const;
