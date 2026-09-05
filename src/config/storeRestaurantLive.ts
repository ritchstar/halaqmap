/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مطعمنا1 — صفحة مطعم الحي ولوحة المطبخ. لا يُستورد من App.
 * باقتان ثابت: 699/180 يوماً و999/365 يوماً. متحرك: 799/1250. صندوق المحادثة مدرج.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';
import {
  STORE_MOBILE_VENDOR_PRICE_12_SAR,
  STORE_MOBILE_VENDOR_PRICE_6_SAR,
} from '@/config/storeMobileVendor';

export const STORE_RESTAURANT_LIVE_PUBLIC_ENABLED = true;

export const STORE_RESTAURANT_LIVE_LAB_TOKEN = 'restaurant-lab' as const;

export const STORE_RESTAURANT_LIVE_PRODUCT = 'store_restaurant_live' as const;

export const STORE_RESTAURANT_LIVE_DAYS_6 = 180 as const;
export const STORE_RESTAURANT_LIVE_DAYS_12 = 365 as const;
export const STORE_RESTAURANT_LIVE_PRICE_6_SAR = 699 as const;
export const STORE_RESTAURANT_LIVE_PRICE_12_SAR = 999 as const;
export const STORE_RESTAURANT_LIVE_PRICE_6_HALALAS = 69900 as const;
export const STORE_RESTAURANT_LIVE_PRICE_12_HALALAS = 99900 as const;

function envEnabled(name: string, fallback: boolean): boolean {
  const raw = String((import.meta as { env?: Record<string, unknown> }).env?.[name] ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  if (raw === 'true' || raw === '1' || raw === 'on') return true;
  return fallback;
}

export const STORE_RESTAURANT_LIVE_CHECKOUT_ENABLED = envEnabled(
  'VITE_STORE_RESTAURANT_LIVE_CHECKOUT_ENABLED',
  true,
);

export const STORE_RESTAURANT_LIVE_ACCENT = '#e08a3c' as const;

export const STORE_RESTAURANT_LIVE_PACKS = [
  {
    id: 'm6',
    months: 6,
    days: STORE_RESTAURANT_LIVE_DAYS_6,
    priceSar: STORE_RESTAURANT_LIVE_PRICE_6_SAR,
    priceHalalas: STORE_RESTAURANT_LIVE_PRICE_6_HALALAS,
    titleAr: '180 يوماً',
    priceLineAr: '699 ر.س',
    lineAr: 'صفحة الضيف ولوحة المطبخ وملصق QR وصندوق المحادثة تُجهَّز فور السداد.',
    savingsAr: '',
  },
  {
    id: 'm12',
    months: 12,
    days: STORE_RESTAURANT_LIVE_DAYS_12,
    priceSar: STORE_RESTAURANT_LIVE_PRICE_12_SAR,
    priceHalalas: STORE_RESTAURANT_LIVE_PRICE_12_HALALAS,
    titleAr: '365 يوماً',
    priceLineAr: '999 ر.س',
    lineAr: 'مدة أطول لنفس الصفحة واللوحة والملصق. توفير 399 ر.س مقارنة بشراء 180 يوماً مرتين.',
    savingsAr: 'توفير 399 ر.س',
  },
] as const;

export type StoreRestaurantLivePackId = (typeof STORE_RESTAURANT_LIVE_PACKS)[number]['id'];

export const STORE_RESTAURANT_EXTENSION_PRICING = [
  {
    modeAr: 'مطعم ثابت',
    days6Ar: '180 يوماً',
    price6Sar: STORE_RESTAURANT_LIVE_PRICE_6_SAR,
    days12Ar: '365 يوماً',
    price12Sar: STORE_RESTAURANT_LIVE_PRICE_12_SAR,
    savings12Ar: '399 ر.س',
  },
  {
    modeAr: 'عربة متحركة',
    days6Ar: '180 يوماً',
    price6Sar: STORE_MOBILE_VENDOR_PRICE_6_SAR,
    days12Ar: '365 يوماً',
    price12Sar: STORE_MOBILE_VENDOR_PRICE_12_SAR,
    savings12Ar: '348 ر.س',
  },
] as const;

export const STORE_RESTAURANT_LAB_DISH_PHOTOS = [
  '/images/store/restaurant/restaurant-01.jpg',
  '/images/store/restaurant/restaurant-02.jpg',
] as const;

export const STORE_RESTAURANT_CUSTOM_FIELD_LABELS = [
  'نبذة عن المطعم',
  'ساعات العمل',
  'نطاق ومدة التوصيل',
  'تعليمات الاستلام',
  'طرق الدفع',
  'تنبيه التوفر',
] as const;

export const STORE_RESTAURANT_LIVE = {
  documentTitle: 'مطعمنا1 — خريطة الحل',
  kickerAr: 'من انتظار ضيف الحي… إلى طلبه من جواله',
  titleAr: 'مطعمنا1',
  leadAr:
    'مقر رقمي لمطاعم الأحياء والعربات المتنقلة؛ اعرض قائمة الطعام وطبق اليوم، واستقبل طلبات التوصيل والاستلام في لوحة الكاشير والمطبخ، ثم شارك بطاقة التوصيل مع العامل عبر واتساب بنقرة واحدة.',
  opsLineAr: 'رابط مباشر أو رمز QR ← طلب من الجوال ← تذكرة للمطبخ ← بطاقة لعامل التوصيل',
  financialLineAr:
    'تتم مدفوعات الطلب مباشرةً بين المطعم والضيف. خريطة الحل لا تستلم قيمة الطلب ولا تقتطع عمولة منها.',
  howTitleAr: 'كيف يعمل النظام؟',
  howSteps: [
    {
      titleAr: 'شارك صفحة مطعمك',
      bodyAr: 'أرسل الرابط المباشر أو ضع رمز QR عند المدخل والطاولات وفي نطاق الحي.',
    },
    {
      titleAr: 'يختار الضيف طلبه',
      bodyAr: 'يتصفح قائمة الطعام من جواله ويختار التوصيل أو الاستلام من المطعم.',
    },
    {
      titleAr: 'تصل التذكرة إلى المطبخ',
      bodyAr: 'تظهر الأصناف والكميات وبيانات الضيف ورابط موقع التوصيل ووصف العنوان وطريقة الدفع في لوحة التشغيل.',
    },
    {
      titleAr: 'شارك الطلب مع عامل التوصيل',
      bodyAr: 'يرسل الكاشير بطاقة التوصيل من جهاز المطعم إلى العامل عبر واتساب بنقرة واحدة.',
    },
  ],
  whatsappLineAr:
    'من جهاز تشغيل المطعم نفسه، يرسل الكاشير بطاقة الطلب إلى عامل التوصيل عبر واتساب بنقرة واحدة.',
  payTitleAr: 'وسائل الدفع المباشر',
  payLeadAr:
    'خريطة الحل مزود تقني لصفحة الطلب، ولا تستلم قيمة الطلب ولا تتحقق من وصولها ولا تقتطع عمولة منها. يحدد المطعم وسائل الدفع التي يتيحها لضيفه، ويتولى مسؤولية بياناتها وتأكيد المدفوعات الواردة إليه.',
  payMethodsAr:
    'يمكن للمطعم إظهار بيانات التحويل البنكي، أو STC Bank، أو معرّف سريع، أو رابط خارجي يضيفه المطعم، كما يمكنه إتاحة الدفع نقداً أو عبر الشبكة عند الاستلام.',
  payIndependenceAr:
    'لا تحصيل لقيمة الطلب عبر خريطة الحل. يحدد المطعم وسائل الدفع المباشر المتاحة لضيفه، وتتم العلاقة المالية مباشرةً بينهما دون اقتطاع عمولة من قيمة الطلب.',
  payNoCommissionAr: 'لا تقتطع عمولة من قيمة الطلب.',
  payFeeLineAr: 'رسوم مطعمنا1 هي مقابل تشغيل الصفحة ولوحة المطبخ وملصق QR فقط.',
  opsTitleAr: 'متطلبات التشغيل',
  opsBodyAr:
    'يحتاج المطعم جهازاً متصلاً بالإنترنت لدى الكاشير، وحساب واتساب على جهاز التشغيل نفسه. الباقة لجهاز تشغيل واحد.',
  featuresTitleAr: 'أهم المزايا',
  vendorPathTitleAr: 'المسار الثابت والمسار المتحرك',
  vendorPathLeadAr:
    'المسار الثابت لمطعم في مكانه. المسار المتحرك للعربة المتنقلة مع تحديث الموقع من اللوحة مشمول في سعر الباقة.',
  extensionTableHeadModeAr: 'نوع التشغيل',
  extensionTableHeadTerm1Ar: '180 يوماً',
  extensionTableHeadTerm2Ar: '365 يوماً',
  pricingTitleAr: 'الأسعار وما تشمله الباقة',
  pricingLeadAr:
    'اختر نوع التشغيل والمدة. صندوق المحادثة مدرج في جميع الباقات. المبالغ بالريال السعودي.',
  pack6LineAr: '180 يوماً — 699 ر.س (ثابت) · 799 ر.س (متحرك)',
  pack12LineAr: '365 يوماً — 999 ر.س (ثابت) · 1,250 ر.س (متحرك)',
  privacyTitleAr: 'الخصوصية والأرشيف',
  privacyAr:
    'تُستخدم بيانات الضيف لتنفيذ الطلب وإدارته داخل لوحة المطعم. وعند موافقته يمكن حفظ بياناته الأساسية على جهازه لتسهيل طلبه القادم. تحفظ تذاكر الطلبات في لوحة المشغّل وفق سياسة الخصوصية ومدة الاحتفاظ المعتمدة، ولا تستخدم خريطة الحل بيانات الضيوف لإنشاء قوائم تسويقية خاصة بها.',
  privacyArchiveAr:
    'يُحفظ أصل التذكرة المنفّذة على الخادم حتى ألف نسخة لتمكين المشغّل من المراجعة والتحميل. يمكنك تنزيل الأرشيف أو حذفه من لوحة المطبخ. تُحذف البيانات وفق سياسة الخصوصية عند انتهاء الاشتراك أو بطلب المشغّل.',
  legalTitleAr: 'منتج من منظومة خريطة الحل',
  legalBodyAr:
    'مطعمنا1 منتج من منظومة خريطة الحل. متجر خريطة الحل موثّق لدى المركز السعودي للأعمال، ويمكن الاطلاع على بيانات المنشأة من صفحة «التوثيق والتحقق».',
  trustLinkAr: 'التوثيق والتحقق',
  trustHref: ROUTE_PATHS.STORE_TRUST,
  closeAr: 'رابط مباشر أو رمز QR ← تذكرة للمطبخ ← بطاقة لعامل التوصيل',
  chatBuyerTitleAr: 'اسأل المطعم قبل الطلب',
  chatBuyerHintAr: 'أرسل استفساراً عن الأطباق أو التوفر أو تجهيز الطلب.',
  chatBuyerReplyHintAr: 'يظهر رد المطبخ في هذه الصفحة خلال جلسة التصفح الحالية.',
  chatBuyerSendAr: 'إرسال الاستفسار',
  chatDeskTitleAr: 'استفسارات ضيوف الحي',
  chatDeskReplyAr: 'الرد على ضيف الحي',
  shopKickerAr: 'ضيف الحي يطلب من جواله',
  featuredTitleAr: 'الأكثر طلباً',
  shelfTitleAr: 'قائمة الطعام',
  todayTitleAr: 'طبق اليوم',
  checkoutTitleAr: 'إتمام الطلب',
  buyerNameLabelAr: 'الاسم',
  buyerPhoneLabelAr: 'رقم الجوال',
  buyerPlaceLabelAr: 'وصف العنوان',
  buyerPlaceCoordsLabelAr: 'الموقع الدقيق',
  buyerPlaceCoordsHintAr: 'رابط الإحداثيات من «استخدم موقعي الحالي»',
  buyerNoteLabelAr: 'ملاحظات الطلب',
  serviceDeliveryAr: 'توصيل',
  servicePickupAr: 'استلام من المطعم',
  payCashAr: 'نقداً عند الاستلام',
  payCardAr: 'عبر الشبكة عند الاستلام',
  saveBuyerAr: 'حفظ بياناتي لتسهيل الطلب القادم',
  saveBuyerHintAr: 'يُحفظ على هذا الجهاز فقط، بعد موافقتك.',
  submitOrderAr: 'إرسال الطلب',
  orderSentAr: 'تم إرسال طلبك إلى المطعم. احتفظ برقم الطلب لمتابعته.',
  locateMeAr: 'استخدم موقعي الحالي',
  locatingAr: 'جاري تحديد الموقع…',
  locateFailAr: 'تعذّر تحديد الموقع. أعد المحاولة بعد موافقة المتصفح.',
  locateDeniedAr: 'رُفض إذن الموقع. فعّله من إعدادات المتصفح.',
  locateSavedAr: 'تم التقاط الإحداثيات. افتح الموقع للتحقق ثم اعتمده.',
  confirmPlaceAr: 'فتح الموقع للتحقق',
  adoptPlaceAr: 'اعتماد الموقع',
  deskPickupTitleAr: 'موقع المطعم',
  deskPickupLeadAr:
    'حدّد الموقع من الإعداد الأول بعد موافقة المتصفح، ثم أبرزه لضيف الحي أو أخفه. المخفي لا يظهر في صفحة الطلب.',
  pickupShowAr: 'إبراز الموقع',
  pickupHideAr: 'إخفاء الموقع',
  pickupPlaceOpenAr: 'افتح الموقع',
  pickupPinAriaAr: 'موقع المطعم على الخريطة',
  deskTitleAr: 'لوحة المطبخ',
  deskPanelTitleAr: 'لوحة الكاشير والمطبخ لإدارة القائمة والطلبات',
  liveOrdersAr: 'تذاكر المطبخ',
  whatsappReceiptAr: 'مذكرة واتساب للتوصيل',
  archiveCtaAr: 'تحميل الأرشيف',
  archiveDeleteAr: 'حذف الأرشيف',
  archiveDeleteConfirmAr: 'هل تريد حذف جميع التذاكر المؤرشفة من هذه اللوحة؟ لا يمكن التراجع.',
  ingestTitleAr: 'مكتبة الأطباق الجاهزة للإضافة',
  catalogLeadAr: 'فعّل الأصناف المناسبة لمطعمك، ثم عدّل الاسم والسعر وأرفق صورة العرض.',
  suggestedPriceAr: 'سعر تجريبي قابل للتعديل',
  activateAr: 'تفعيل الطبق',
  listIngestTitleAr: 'مراجعة قائمة مكتوبة أو مصوّرة',
  listIngestLeadAr: 'الصق أسماء الأطباق وأسعارها، أو أرفق صورة القائمة وراجع الصفوف قبل الحفظ.',
  flashLabelAr: 'شريط طبق اليوم',
  flashHintAr: 'طبق اليوم: كبسة دجاج حتى نفاذ الكمية',
  qrPhraseAr: 'امسح واطلب من جوالك. التوصيل أو الاستلام من المطعم.',
  qrPrintAr: 'طباعة ملصق QR',
  stockAvailableAr: 'متاح',
  stockOutAr: 'غير متاح',
  stockLimitedAr: 'كمية محدودة',
  stockPausedAr: 'متوقف مؤقتاً',
  photoUploadAr: 'صورة العرض',
  orderCtaAr: 'اختر الباقة',
  orderCtaLandingAr: 'اشترِ مطعمنا1',
  orderNewLeadAr: 'بعد السداد يصلك رابط ضيف الحي ورابط لوحة المطبخ وملصق QR. صندوق المحادثة مدرج.',
  orderRenewLeadAr: 'نفس روابط الصفحة ولوحة المطبخ تُمدَّد بعد السداد.',
  tryCtaAr: 'شاهد المعاينة',
  deskLinkAr: 'لوحة المطبخ',
  shopLinkAr: 'صفحة ضيف الحي',
  deskPreviewHintAr: 'معاينة لوحة الكاشير (سطح المكتب)',
  shopPreviewHintAr: 'معاينة صفحة ضيف الحي (جوال)',
  termsFoldTriggerAr: 'اقرأ شروط الخدمة',
  termsFoldTitleAr: 'شروط الخدمة قبل الطلب',
  termsFoldBodyAr:
    'مطعمنا1 صفحة لضيف الحي ولوحة للكاشير والمطبخ. المسار الثابت: 699 ر.س لـ180 يوماً، أو 999 ر.س لـ365 يوماً. المسار المتحرك: 799 ر.س لـ180 يوماً، أو 1250 ر.س لـ365 يوماً، مشمول في سعره بلا إضافة مدفوعة. صندوق المحادثة مدرج. الطلب يصل خلال ثوانٍ مع تنبيه. إرسال بطاقة التوصيل عبر واتساب بنقرة واحدة. لا تحصيل لقيمة الطلب عبر خريطة الحل ولا اقتطاع عمولة منها. مدفوعات الضيف مباشرة للمطعم. الباقة لجهاز تشغيل واحد.',
  labKickerAr: 'معاينة حيّة',
  labTitleAr: 'هكذا يطلب ضيف الحي وتصل التذكرة للمطبخ',
  labLeadAr: 'فعّل طبقاً، أرسل طلباً تجريبياً، وأرسل مذكرة واتساب بنقرة واحدة كما في ساعة الذروة.',
  labPreviewBadgeAr: 'معاينة تجريبية — البيانات المدخلة هنا لا تنشئ طلباً حقيقياً',
  labPreviewEnvAr: 'لا تحفظ موقعاً حقيقياً ولا بيانات دفع فعلية داخل هذه المعاينة.',
  labDemoNameAr: 'ضيف تجريبي',
  labDemoPhoneAr: '05XXXXXXXX',
  labDemoPlaceAr: 'حي تجريبي — شارع المعاينة',
  labDemoCoordsAr: 'https://maps.google.com/?q=24.713600,46.675300',
  labDeskMaskedNameAr: 'ضيف تجريبي',
  labDeskMaskedPhoneAr: '05XXXXXXXX',
  labDeskMaskedPlaceAr: 'موقع تجريبي',
  heroImage: '/images/store/restaurant-hero-marketing.jpg',
  heroAltAr: 'مطعم حي بأطباق جاهزة للطلب من الجوال',
  heroCaptionAr: 'من انتظار ضيف الحي إلى طلبه من جواله',
  checkoutClosedAr: 'بوابة الدفع غير مفتوحة لهذا المنتج بعد.',
  orderConsentAr:
    'أقرّ بقراءة شروط الخدمة والخصوصية، وأوافق على سداد قيمة اشتراكي في مطعمنا1 عبر بوابة الدفع التابعة لخريطة الحل. أما مدفوعات طلبات ضيوف المطعم فتتم مباشرةً بين المطعم والضيف وفق الوسائل التي يفعّلها المطعم، ولا تستلم خريطة الحل قيمتها ولا تقتطع عمولة منها.',
  orderSubmitAr: 'متابعة الدفع',
  orderNoCollectAr: 'لا تستلم خريطة الحل مدفوعات طلبات ضيوف المطعم.',
  summaryProductAr: 'المنتج',
  summaryVendorAr: 'نوع التشغيل',
  summaryTermAr: 'مدة الاشتراك',
  summaryTotalAr: 'الإجمالي',
  restaurantNameLabelAr: 'اسم المطعم',
  presenceDeskLabelAr: 'الزوار المتصلون الآن',
} as const;

/** @deprecated استخدم howSteps */
export const STORE_RESTAURANT_LIVE_TICKET_ITEMS = [
  'اسم الضيف ورقم الجوال.',
  'رابط موقع التوصيل ووصف العنوان.',
  'تفاصيل الطلب.',
  'طريقة الدفع.',
  'المبلغ الإجمالي.',
] as const;

export const STORE_RESTAURANT_LIVE_FEATURES = [
  {
    titleAr: 'صفحة الطعام ورمز QR',
    bodyAr: 'اعرض الأطباق وطبق اليوم. شارك الرابط أو رمز QR للمدخل والطاولة والحي.',
  },
  {
    titleAr: 'لوحة الكاشير والمطبخ',
    bodyAr: 'تصل التذكرة خلال ثوانٍ مع تنبيه. تظهر تفاصيل الطلب والكميات ونوع التسليم.',
    pulse: true,
  },
  {
    titleAr: 'بطاقة واتساب بنقرة واحدة',
    bodyAr: 'من جهاز التشغيل نفسه تُرسل الاسم والجوال ورابط موقع التوصيل وتفاصيل الطلب وطريقة الدفع والمبلغ.',
  },
  {
    titleAr: 'بدون عمولة على قيمة الطلب',
    bodyAr: 'لا تحصيل لقيمة الطلب عبر خريطة الحل. المحاسبة مباشرة بين المطعم والضيف.',
  },
  {
    titleAr: 'صندوق المحادثة مدرج',
    bodyAr: 'استفسار قبل الطلب من صفحة الضيف، ورد من المطبخ — بلا غرفة عامة.',
  },
  {
    titleAr: 'جهاز تشغيل واحد',
    bodyAr: 'الباقة لجهاز كاشير متصل بالإنترنت، مع حساب واتساب على الجهاز نفسه.',
  },
] as const;

export const STORE_RESTAURANT_LIVE_DEMO = {
  shopName: 'مطعم السدرة — معاينة',
  hostName: 'الإدارة',
  blurbAr: 'معاينة تجريبية لطلب أطباق الحي من الجوال.',
  customFields: [
    'مطعم أطباق الحي — طلبك من جوالك.',
    'الدوام من العصر حتى منتصف الليل.',
    'التوصيل داخل الحي في نصف ساعة تقريباً.',
    'الاستلام من الباب الجانبي إن رغبت.',
    'الدفع نقداً أو عبر الشبكة عند الاستلام.',
    'إن توقف طبق نخفيه فوراً حتى لا يُطلب.',
  ] as string[],
  flashAr: 'طبق اليوم: كبسة دجاج حتى نفاذ الكمية',
} as const;

export type StoreRestaurantAvailability = 'available' | 'out' | 'limited' | 'paused';

export const STORE_RESTAURANT_AVAILABILITY_ORDER: StoreRestaurantAvailability[] = [
  'available',
  'limited',
  'paused',
  'out',
];

export function restaurantAvailabilityLabel(status: StoreRestaurantAvailability | undefined): string {
  switch (status) {
    case 'limited':
      return STORE_RESTAURANT_LIVE.stockLimitedAr;
    case 'paused':
      return STORE_RESTAURANT_LIVE.stockPausedAr;
    case 'out':
      return STORE_RESTAURANT_LIVE.stockOutAr;
    default:
      return STORE_RESTAURANT_LIVE.stockAvailableAr;
  }
}

export function restaurantShelfVisible(status: StoreRestaurantAvailability | undefined, inStock?: boolean): boolean {
  if (status) return status === 'available' || status === 'limited';
  return inStock !== false;
}

export function normalizeRestaurantAvailability(
  raw: unknown,
  inStock?: unknown,
): StoreRestaurantAvailability {
  const status = String(raw || '').trim();
  if (status === 'available' || status === 'limited' || status === 'paused' || status === 'out') {
    return status;
  }
  return storeLiveInStockCompat(inStock) ? 'available' : 'out';
}

function storeLiveInStockCompat(raw: unknown): boolean {
  if (raw === false || raw === 0 || raw === '0' || raw === 'false') return false;
  return true;
}
