/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * طبختنا1 — صفحة الأسرة المنتجة ولوحة النشاط. لا يُستورد من App.
 * باقتان: 300 ر.س لمئة وثمانين يوماً، و600 ر.س لثلاثمئة وستين يوماً.
 * التحصيل عبر ميسر على www.halaqmap.com بوسم store_kitchen_live.
 */
export const STORE_KITCHEN_LIVE_PUBLIC_ENABLED = true;

export const STORE_KITCHEN_LIVE_LAB_TOKEN = 'kitchen-lab' as const;

export const STORE_KITCHEN_LIVE_PRODUCT = 'store_kitchen_live' as const;

export const STORE_KITCHEN_LIVE_PRODUCT_TYPE = 'home_food' as const;

export const STORE_KITCHEN_LIVE_LAB_ITEM_CAP = 40 as const;

export const STORE_KITCHEN_LIVE_DAYS_6 = 180 as const;
export const STORE_KITCHEN_LIVE_DAYS_12 = 360 as const;
export const STORE_KITCHEN_LIVE_PRICE_6_SAR = 300 as const;
export const STORE_KITCHEN_LIVE_PRICE_12_SAR = 600 as const;
export const STORE_KITCHEN_LIVE_PRICE_6_HALALAS = 30000 as const;
export const STORE_KITCHEN_LIVE_PRICE_12_HALALAS = 60000 as const;

function envEnabled(name: string, fallback: boolean): boolean {
  const raw = String((import.meta as { env?: Record<string, unknown> }).env?.[name] ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  if (raw === 'true' || raw === '1' || raw === 'on') return true;
  return fallback;
}

export const STORE_KITCHEN_LIVE_CHECKOUT_ENABLED = envEnabled(
  'VITE_STORE_KITCHEN_LIVE_CHECKOUT_ENABLED',
  true,
);

export const STORE_KITCHEN_LIVE_ACCENT = '#b45a3c' as const;

export const STORE_KITCHEN_LIVE_PACKS = [
  {
    id: 'm6',
    months: 6,
    days: STORE_KITCHEN_LIVE_DAYS_6,
    priceSar: STORE_KITCHEN_LIVE_PRICE_6_SAR,
    priceHalalas: STORE_KITCHEN_LIVE_PRICE_6_HALALAS,
    titleAr: 'باقة مئة وثمانين يوماً',
    priceLineAr: '300 ر.س لمئة وثمانين يوماً',
    lineAr: 'الصفحة ولوحة النشاط وملصق QR تُجهَّز بعد السداد.',
  },
  {
    id: 'm12',
    months: 12,
    days: STORE_KITCHEN_LIVE_DAYS_12,
    priceSar: STORE_KITCHEN_LIVE_PRICE_12_SAR,
    priceHalalas: STORE_KITCHEN_LIVE_PRICE_12_HALALAS,
    titleAr: 'باقة ثلاثمئة وستين يوماً',
    priceLineAr: '600 ر.س لثلاثمئة وستين يوماً',
    lineAr: 'مدة أطول لنفس الصفحة واللوحة والملصق.',
  },
] as const;

export type StoreKitchenLivePackId = (typeof STORE_KITCHEN_LIVE_PACKS)[number]['id'];

export const STORE_KITCHEN_LIVE = {
  documentTitle: 'طبختنا1 — خريطة الحل',
  kickerAr: 'من رمز QR إلى نشاط الأسرة، ثم إلى التسليم',
  titleAr: 'طبختنا1',
  leadAr:
    'منظومة للأسر المنتجة: صفحة أصناف عبر رمز QR، ولوحة استقبال للطلبات، وإرسال بطاقة الطلب عبر واتساب من جهاز النشاط بنقرة واحدة. الباقة 300 ر.س لمئة وثمانين يوماً، أو 600 ر.س لثلاثمئة وستين يوماً.',
  howTitleAr: 'كيف يعمل النظام؟',
  howLeadAr:
    'يُطبع رمز المتجر على العبوة أو عند باب الاستلام. يدخل الزبون إلى صفحة الأصناف ويختار توصيلاً أو استلاماً. يصل الطلب إلى اللوحة خلال ثوانٍ مع تنبيه، وتظهر بطاقة الطلب متضمنة:',
  ticketItems: [
    'اسم الزبون ورقم الجوال.',
    'نص موقع التسليم إن اختار التوصيل.',
    'تفاصيل الطلب.',
    'طريقة الدفع: نقداً أو شبكة.',
    'المبلغ الإجمالي.',
  ],
  whatsappLineAr:
    'من جهاز تشغيل النشاط نفسه، تُفتح أو تُشارَك بطاقة الطلب عبر واتساب بنقرة واحدة. ليس إرسالاً آلياً من الخادم.',
  payIndependenceAr:
    'لا تحصيل إلكتروني للزبون، ولا عمولة على قيمة الوجبات. المحاسبة نقداً أو عبر جهاز الشبكة عند التسليم، والاشتراك لرسوم النظام فقط.',
  opsTitleAr: 'متطلبات التشغيل',
  opsBodyAr:
    'يحتاج النشاط جهازاً متصلاً بالإنترنت، وحساب واتساب واحد على جهاز التشغيل نفسه. النسخة الأولى لمالك واحد.',
  featuresTitleAr: 'تشمل الصفحة',
  priceLineAr: 'باقة مئة وثمانين يوماً: 300 ر.س — باقة ثلاثمئة وستين يوماً: 600 ر.س',
  supportLineAr: 'أسعار مخصصة للأسر المنتجة دعماً من متجر خريطة الحل.',
  durationLineAr:
    'لا تحصيل من الزبون عبر المنصة، ولا عمولة على قيمة الوجبات.',
  privacyAr:
    'تُستخدم بيانات الزبون لتنفيذ الطلب فقط، وتُحفظ على جهازه إن وافق، ولا دفتر زبائن لدى المنصة.',
  closeAr: 'من رمز QR إلى نشاط الأسرة، ثم إلى التسليم.',
  shopKickerAr: 'الزبون يطلب من جواله',
  featuredTitleAr: 'صور العرض',
  shelfTitleAr: 'بقية الأصناف',
  todayTitleAr: 'طبق اليوم',
  checkoutTitleAr: 'إتمام الطلب',
  buyerNameLabelAr: 'الاسم',
  buyerPhoneLabelAr: 'رقم الجوال',
  buyerPlaceLabelAr: 'موقع التسليم',
  buyerNoteLabelAr: 'ملاحظة على الطلب',
  buyerPhotoLabelAr: 'صورة موقع التسليم إن رغبت',
  buyerScheduleLabelAr: 'موعد التسليم إن رغبت',
  serviceDeliveryAr: 'توصيل',
  servicePickupAr: 'استلام من النشاط',
  payCashAr: 'نقداً عند التسليم',
  payCardAr: 'شبكة عند التسليم',
  saveBuyerAr: 'حفظ بياناتي لتسهيل الطلب القادم',
  submitOrderAr: 'أرسل الطلب للنشاط',
  deskTitleAr: 'لوحة النشاط',
  liveOrdersAr: 'تذاكر الطلب',
  whatsappReceiptAr: 'مذكرة واتساب للتسليم',
  archiveCtaAr: 'تحميل الأرشيف',
  ingestTitleAr: 'بنك الأصناف المنزلية',
  catalogLeadAr: 'فعّل الأصناف الشائعة وحدد سعرها، ثم أرفق صورة العرض إن رغبت.',
  activateAr: 'تفعيل الصنف',
  listIngestTitleAr: 'مراجعة قائمة مكتوبة أو مصوّرة',
  listIngestLeadAr: 'الصق أسماء الأصناف وأسعارها، أو أرفق صورة القائمة وراجع الصفوف قبل الحفظ.',
  flashLabelAr: 'شريط طبق اليوم',
  flashHintAr: 'طبق اليوم: كبسة البيت حتى نفاذ الكمية',
  qrPhraseAr: 'امسح واطلب من جوالك. التوصيل أو الاستلام من النشاط.',
  qrPrintAr: 'طباعة ملصق QR',
  qrRevokeAr: 'أبطل الرمز الحالي',
  qrRenewAr: 'ولّد رمزاً جديداً',
  qrRevokedAr: 'أُبطل رمز المتجر. اطلب رمزاً جديداً من النشاط.',
  stockOnAr: 'يُطبخ الآن',
  stockOffAr: 'نفد',
  soldOutAr: 'نفد',
  photoUploadAr: 'صورة العرض',
  pausedAr: 'الاستقبال متوقف مؤقتاً.',
  pauseOnAr: 'إيقاف استقبال الطلبات',
  pauseOffAr: 'فتح استقبال الطلبات',
  showSoldOutAr: 'إظهار أصناف نفدت للزبون بلا طلب',
  scheduleOnAr: 'إتاحة موعد تسليم اختياري',
  deliveryFeeLabelAr: 'رسوم التوصيل إن رغبت',
  opsPhoneLabelAr: 'رقم واتساب التشغيلي',
  orderCtaAr: 'اختر الباقة',
  tryCtaAr: 'شاهد الصفحة ولوحة النشاط',
  deskLinkAr: 'لوحة النشاط',
  shopLinkAr: 'رابط الزبون',
  termsFoldTriggerAr: 'اقرأ شروط الخدمة',
  termsFoldTitleAr: 'شروط الخدمة',
  termsFoldBodyAr:
    'طبختنا1 صفحة للزبون ولوحة لصاحب النشاط. 300 ر.س لمئة وثمانين يوماً، أو 600 ر.س لثلاثمئة وستين يوماً، أسعار مخصصة للأسر المنتجة دعماً من متجر خريطة الحل. الطلب يصل خلال ثوانٍ مع تنبيه. إرسال بطاقة التسليم عبر واتساب بنقرة واحدة من جهاز التشغيل. لا تحصيل إلكتروني للزبون ولا عمولة على قيمة الوجبات. بيانات الزبون لتنفيذ الطلب فقط وتُحفظ على جهازه إن وافق. النسخة الأولى لمالك واحد. التفاصيل في شروط الخدمة.',
  labKickerAr: 'معاينة حيّة داخل الصفحة',
  labTitleAr: 'هكذا يطلب الزبون وتصل التذكرة للنشاط',
  labLeadAr: 'فعّل صنفاً، أرسل طلباً تجريبياً، وأرسل مذكرة واتساب بنقرة واحدة كما في ساعة الذروة.',
  heroAltAr: 'أصناف منزلية جاهزة للطلب من الجوال',
  heroCaptionAr: 'من رمز QR إلى نشاط الأسرة، ثم إلى التسليم',
  checkoutClosedAr: 'بوابة الاشتراك غير مفتوحة لهذا المنتج بعد.',
  orderConsentAr:
    'قرأت شروط الخدمة وأوافق على تحصيل باقة طبختنا1 عبر بوابة الدفع بالمبلغ المعروض. لا تحصيل من الزبون غير نقد أو شبكة عند التسليم.',
  orderSubmitAr: 'الانتقال إلى الدفع',
  kitchenNameLabelAr: 'اسم النشاط',
} as const;

export const STORE_KITCHEN_LIVE_FEATURES = [
  {
    titleAr: 'صفحة الأصناف ورمز QR',
    bodyAr: 'عرض الأصناف وطبق اليوم. يُطبع رمز المتجر العام، ويطلب الزبون توصيلاً أو استلاماً.',
  },
  {
    titleAr: 'لوحة النشاط',
    bodyAr: 'تصل التذكرة خلال ثوانٍ مع تنبيه. تظهر تفاصيل الطلب والكميات ونوع التسليم.',
    pulse: true,
  },
  {
    titleAr: 'بطاقة واتساب من الجهاز',
    bodyAr: 'من جهاز التشغيل نفسه تُفتح أو تُشارَك الاسم والجوال ونص موقع التسليم وتفاصيل الطلب والدفع نقداً أو شبكة والمبلغ.',
  },
  {
    titleAr: 'بدون عمولة على قيمة الوجبات',
    bodyAr: 'لا تحصيل إلكتروني للزبون. المحاسبة نقداً أو عبر جهاز الشبكة عند التسليم.',
  },
  {
    titleAr: 'رمز متجر قابل للإبطال',
    bodyAr: 'رمز عام واحد للمتجر. يُبطَل ويُولَّد من جديد من اللوحة، وليس رمزاً إدارياً.',
  },
  {
    titleAr: 'جهاز تشغيل واحد',
    bodyAr: 'النسخة الأولى لمالك واحد، مع حساب واتساب واحد على الجهاز نفسه.',
  },
] as const;

export const STORE_KITCHEN_LIVE_DEMO = {
  shopName: 'مطبخ الدار',
  hostName: 'الإدارة',
  blurbAr: 'طبختنا1: أصناف البيت من الجوال إلى النشاط.',
  customFields: [
    'الطلب من العصر حتى صلاة العشاء.',
    'التوصيل داخل الحي حسب الاتفاق.',
    'الاستلام من باب المنزل إن رغبت.',
    'الدفع نقداً أو شبكة عند التسليم.',
    'إن نفد صنف نخفيه حتى لا يُطلب.',
  ] as string[],
  flashAr: 'طبق اليوم: كبسة البيت حتى نفاذ الكمية',
} as const;
