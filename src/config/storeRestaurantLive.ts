/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مطعمنا1 — صفحة مطعم الحي ولوحة المطبخ. لا يُستورد من App.
 * باقتان: 699 ر.س لستة أشهر، و999 ر.س لاثني عشر شهراً. صندوق المحادثة مدرج.
 */
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
    titleAr: 'باقة ستة أشهر',
    priceLineAr: '699 ر.س لستة أشهر',
    lineAr: 'الصفحة ولوحة المطبخ وملصق QR وصندوق المحادثة تُجهَّز فور السداد.',
  },
  {
    id: 'm12',
    months: 12,
    days: STORE_RESTAURANT_LIVE_DAYS_12,
    priceSar: STORE_RESTAURANT_LIVE_PRICE_12_SAR,
    priceHalalas: STORE_RESTAURANT_LIVE_PRICE_12_HALALAS,
    titleAr: 'باقة اثني عشر شهراً',
    priceLineAr: '999 ر.س لاثني عشر شهراً',
    lineAr: 'مدة أطول لنفس الصفحة واللوحة والملصق.',
  },
] as const;

export type StoreRestaurantLivePackId = (typeof STORE_RESTAURANT_LIVE_PACKS)[number]['id'];

export const STORE_RESTAURANT_LIVE = {
  documentTitle: 'مطعمنا1 — خريطة الحل',
  kickerAr: 'من رمز QR إلى المطبخ، ثم إلى عامل التوصيل',
  titleAr: 'مطعمنا1',
  leadAr:
    'منظومة لمطاعم الأحياء: صفحة وجبات عبر رمز QR، ولوحة استقبال للكاشير والمطبخ، وصندوق محادثة مدرج، وإرسال بطاقة الطلب إلى عامل التوصيل عبر واتساب بنقرة واحدة. الباقة 699 ر.س لستة أشهر، أو 999 ر.س لاثني عشر شهراً.',
  howTitleAr: 'كيف يعمل النظام؟',
  howLeadAr:
    'تُطبع الرموز عند المدخل وعلى الطاولات وفي الحي. يدخل ضيف الحي إلى صفحة الوجبات ويختار توصيلاً أو استلاماً. يصل الطلب إلى لوحة الكاشير والمطبخ خلال ثوانٍ مع تنبيه، وتظهر بطاقة الطلب متضمنة:',
  ticketItems: [
    'اسم الضيف ورقم الجوال.',
    'نص موقع التوصيل.',
    'تفاصيل الطلب.',
    'طريقة الدفع: نقداً أو شبكة.',
    'المبلغ الإجمالي.',
  ],
  whatsappLineAr:
    'من جهاز تشغيل المطعم نفسه، يرسل الكاشير بطاقة الطلب إلى عامل التوصيل عبر واتساب بنقرة واحدة.',
  payIndependenceAr:
    'لا تحصيل إلكتروني لضيف الحي، ولا عمولة على قيمة الطلبات. الاشتراك لرسوم النظام فقط، والمحاسبة نقداً أو عبر جهاز الشبكة لدى المطعم.',
  opsTitleAr: 'متطلبات التشغيل',
  opsBodyAr:
    'يحتاج المطعم جهازاً متصلاً بالإنترنت لدى الكاشير، وحساب واتساب على جهاز التشغيل نفسه. الباقة لجهاز تشغيل واحد.',
  featuresTitleAr: 'تشمل الباقة',
  priceLineAr: 'باقة ستة أشهر: 699 ر.س — باقة اثني عشر شهراً: 999 ر.س',
  durationLineAr:
    'صندوق المحادثة مدرج. لا تحصيل من ضيف الحي عبر المنصة، ولا عمولة على قيمة الطلبات.',
  privacyAr:
    'تُستخدم بيانات الضيف لتنفيذ الطلب فقط، وتُحفظ على جهازه إن وافق، ولا دفتر زبائن لدى المنصة.',
  closeAr: 'من رمز QR إلى المطبخ، ثم إلى عامل التوصيل.',
  chatBuyerTitleAr: 'صندوق ملاحظة للمطبخ',
  chatBuyerHintAr: 'اكتب تخصيصاً أو سؤالاً عن الطبق. ليس دردشة عامة.',
  chatBuyerSendAr: 'أرسل للمطبخ',
  chatDeskTitleAr: 'صندوق استقبال ملاحظات ضيف الحي',
  chatDeskReplyAr: 'رد على ضيف الحي',
  shopKickerAr: 'ضيف الحي يطلب من جواله',
  featuredTitleAr: 'صور العرض',
  shelfTitleAr: 'بقية القائمة',
  todayTitleAr: 'طبق اليوم',
  checkoutTitleAr: 'إتمام الطلب',
  buyerNameLabelAr: 'الاسم',
  buyerPhoneLabelAr: 'رقم الجوال',
  buyerPlaceLabelAr: 'موقع التوصيل',
  buyerNoteLabelAr: 'ملاحظة على الطلب',
  serviceDeliveryAr: 'توصيل للبيت',
  servicePickupAr: 'استلام من المطعم',
  payCashAr: 'نقداً عند الاستلام',
  payCardAr: 'شبكة عند التسليم',
  saveBuyerAr: 'حفظ بياناتي لتسهيل الطلب القادم',
  submitOrderAr: 'أرسل الطلب للمطبخ',
  deskTitleAr: 'لوحة المطبخ',
  liveOrdersAr: 'تذاكر المطبخ',
  whatsappReceiptAr: 'مذكرة واتساب للتوصيل',
  archiveCtaAr: 'تحميل الأرشيف',
  ingestTitleAr: 'بنك الأطباق الجاهزة',
  catalogLeadAr: 'فعّل الأطباق الشائعة وحدد سعرها، ثم أرفق صورة العرض إن رغبت.',
  activateAr: 'تفعيل الطبق',
  listIngestTitleAr: 'مراجعة قائمة مكتوبة أو مصوّرة',
  listIngestLeadAr: 'الصق أسماء الأطباق وأسعارها، أو أرفق صورة القائمة وراجع الصفوف قبل الحفظ.',
  flashLabelAr: 'شريط طبق اليوم',
  flashHintAr: 'طبق اليوم: كبسة دجاج حتى نفاذ الكمية',
  qrPhraseAr: 'امسح واطلب من جوالك. التوصيل أو الاستلام من المطعم.',
  qrPrintAr: 'طباعة ملصق QR',
  stockOnAr: 'يُطبخ الآن',
  stockOffAr: 'توقف',
  photoUploadAr: 'صورة العرض',
  orderCtaAr: 'اختر الباقة',
  tryCtaAr: 'شاهد الصفحة ولوحة المطبخ',
  deskLinkAr: 'لوحة المطبخ',
  shopLinkAr: 'رابط ضيف الحي',
  termsFoldTriggerAr: 'اقرأ شروط الخدمة',
  termsFoldTitleAr: 'شروط الخدمة قبل الطلب',
  termsFoldBodyAr:
    'مطعمنا1 صفحة لضيف الحي ولوحة للكاشير والمطبخ. 699 ر.س لستة أشهر، أو 999 ر.س لاثني عشر شهراً، عبر بوابة الدفع الآمنة. صندوق المحادثة مدرج، بلا غرفة عامة. الطلب يصل خلال ثوانٍ مع تنبيه. إرسال بطاقة التوصيل عبر واتساب بنقرة واحدة من جهاز التشغيل. لا تحصيل إلكتروني لضيف الحي ولا عمولة على قيمة الطلبات. بيانات الضيف لتنفيذ الطلب فقط وتُحفظ على جهازه إن وافق. الباقة لجهاز تشغيل واحد. التفاصيل في شروط الخدمة.',
  labKickerAr: 'معاينة حيّة داخل الصفحة',
  labTitleAr: 'هكذا يطلب ضيف الحي وتصل التذكرة للمطبخ',
  labLeadAr: 'فعّل طبقاً، أرسل طلباً تجريبياً، وأرسل مذكرة واتساب بنقرة واحدة كما في ساعة الذروة.',
  heroImage: '/images/store/restaurant-hero-marketing.jpg',
  heroAltAr: 'مطعم حي بأطباق جاهزة للطلب من الجوال',
  heroCaptionAr: 'من رمز QR إلى المطبخ، ثم إلى عامل التوصيل',
  checkoutClosedAr: 'بوابة الدفع غير مفتوحة لهذا المنتج بعد.',
  orderConsentAr:
    'قرأت شروط الخدمة وأوافق على تحصيل باقة مطعمنا1 عبر بوابة الدفع بالمبلغ المعروض. لا تحصيل من ضيف الحي غير نقد أو شبكة عند التسليم.',
  orderSubmitAr: 'الانتقال إلى الدفع',
  restaurantNameLabelAr: 'اسم المطعم',
} as const;

export const STORE_RESTAURANT_LIVE_FEATURES = [
  {
    titleAr: 'صفحة الوجبات ورمز QR',
    bodyAr: 'عرض الأطباق وطبق اليوم. تُطبع الرموز للمدخل والطاولة والحي، ويطلب ضيف الحي توصيلاً أو استلاماً.',
  },
  {
    titleAr: 'لوحة الكاشير والمطبخ',
    bodyAr: 'تصل التذكرة خلال ثوانٍ مع تنبيه. تظهر تفاصيل الطلب والكميات ونوع التسليم.',
    pulse: true,
  },
  {
    titleAr: 'بطاقة واتساب بنقرة واحدة',
    bodyAr: 'من جهاز التشغيل نفسه تُرسل الاسم والجوال ونص موقع التوصيل وتفاصيل الطلب والدفع نقداً أو شبكة والمبلغ.',
  },
  {
    titleAr: 'بدون عمولة على قيمة الطلبات',
    bodyAr: 'لا تحصيل إلكتروني لضيف الحي. المحاسبة نقداً أو عبر جهاز الشبكة لدى المطعم، والاشتراك لرسوم النظام فقط.',
  },
  {
    titleAr: 'صندوق المحادثة مدرج',
    bodyAr: 'صندوق في صفحة الضيف وصندوق استقبال في المطبخ لتخصيص الطلب أو السؤال عن الطبق، بلا غرفة عامة.',
  },
  {
    titleAr: 'جهاز تشغيل واحد',
    bodyAr: 'الباقة لجهاز كاشير متصل بالإنترنت، مع حساب واتساب على الجهاز نفسه.',
  },
] as const;

export const STORE_RESTAURANT_LIVE_DEMO = {
  shopName: 'مطعم السدرة',
  hostName: 'الإدارة',
  blurbAr: 'مطعمنا1: أطباق الحي من الجوال إلى المطبخ.',
  customFields: [
    'الدوام من العصر حتى منتصف الليل.',
    'التوصيل داخل الحي في نصف ساعة تقريباً.',
    'الاستلام من الباب الجانبي إن رغبت.',
    'الدفع نقداً أو شبكة عند التسليم.',
    'إن توقف طبق نخفيه فوراً حتى لا يُطلب.',
  ] as string[],
  flashAr: 'طبق اليوم: كبسة دجاج حتى نفاذ الكمية',
} as const;
