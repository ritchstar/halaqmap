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
  kickerAr: 'تشغيل مطعم الحي من الجوال إلى المطبخ',
  titleAr: 'مطعمنا1',
  leadAr:
    'صفحة مستقلة لمطعم الحي: الاسم والبيانات وحقول حرة وصور الأطباق وطبق اليوم. ضيف الحي يطلب توصيلاً أو استلاماً، وتصل تذكرة المطبخ فوراً. صندوق المحادثة مدرج. الباقة 699 ر.س لستة أشهر، أو 999 ر.س لاثني عشر شهراً.',
  featuresTitleAr: 'ما يقدّمه مطعمنا1 لصاحب المطعم',
  priceLineAr: 'باقة ستة أشهر: 699 ر.س — باقة اثني عشر شهراً: 999 ر.س',
  durationLineAr: 'صندوق المحادثة مدرج في الباقة. اشتراك صاحب المطعم عبر ميسر على www.halaqmap.com.',
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
    'مطعمنا1 صفحة لضيف الحي ولوحة للمطبخ. 699 ر.س لستة أشهر، أو 999 ر.س لاثني عشر شهراً، عبر ميسر على www.halaqmap.com بوسم مستقل. صندوق المحادثة مدرج، بلا غرفة عامة. طلب الضيف نقداً أو شبكة عند التسليم. التفاصيل في شروط الخدمة.',
  labKickerAr: 'معاينة حيّة داخل الصفحة',
  labTitleAr: 'هكذا يطلب ضيف الحي وتصل التذكرة للمطبخ',
  labLeadAr: 'فعّل طبقاً، أرسل طلباً تجريبياً، وافتح مذكرة واتساب كما في ساعة الذروة.',
  heroImage: '/images/store/restaurant-hero-marketing.jpg',
  heroAltAr: 'مطعم حي بأطباق جاهزة للطلب من الجوال',
  heroCaptionAr: 'من الجوال إلى تذكرة المطبخ',
  checkoutClosedAr: 'بوابة الدفع غير مفتوحة لهذا المنتج بعد.',
  orderConsentAr:
    'قرأت شروط الخدمة وأوافق على تحصيل باقة مطعمنا1 عبر ميسر بالمبلغ المعروض. لا تحصيل من ضيف الحي غير نقد أو شبكة عند التسليم.',
  orderSubmitAr: 'الانتقال إلى الدفع',
  restaurantNameLabelAr: 'اسم المطعم',
} as const;

export const STORE_RESTAURANT_LIVE_FEATURES = [
  {
    titleAr: 'صفحة مطعم بصورة الأطباق وحقول حرة',
    bodyAr: 'اسم المطعم وتعريفه وخمس خانات يملؤها صاحب المطعم بما يرد: الدوام، الحي، التخصص، أو تنبيه المطبخ.',
  },
  {
    titleAr: 'طبق اليوم وتذكرة المطبخ',
    bodyAr:
      'شريط نابض لطبق اليوم، ورقم تذكرة يصل للمطبخ فور الطلب مع تنبيه صوتي، ثم مذكرة واتساب لعامل التوصيل.',
    pulse: true,
  },
  {
    titleAr: 'توصيل أو استلام من المطعم',
    bodyAr: 'ضيف الحي يختار الخدمة والدفع نقداً أو شبكة عند التسليم. بياناته تُحفظ على جهازه إن وافق.',
  },
  {
    titleAr: 'صندوق المحادثة مدرج',
    bodyAr: 'صندوق في صفحة الضيف وصندوق استقبال في المطبخ لتخصيص الطلب أو السؤال عن الطبق، بلا غرفة عامة.',
  },
  {
    titleAr: 'بنك أطباق وصور عرض',
    bodyAr: 'فعّل الأطباق الجاهزة أو الصق قائمتك، وأرفق صورة لكل طبق يظهر في معرض الصفحة.',
  },
  {
    titleAr: 'ملصق QR للباب أو الطاولة',
    bodyAr: 'رمز جاهز للطباعة يفتح صفحة المطعم من جوال الضيف مباشرة.',
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
