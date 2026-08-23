/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تموينات الحي — متجر حي ولوحة كاشير. لا يُستورد من App.
 * باقتان معتمدتان: 599 ر.س لستة أشهر، و899 ر.س لاثني عشر شهراً.
 */
export const STORE_GROCERS_LIVE_PUBLIC_ENABLED = true;

export const STORE_GROCERS_LIVE_LAB_TOKEN = 'grocers-lab' as const;

export const STORE_GROCERS_LIVE_PRODUCT = 'store_grocers_live' as const;

export const STORE_GROCERS_LIVE_DAYS_6 = 180 as const;
export const STORE_GROCERS_LIVE_DAYS_12 = 365 as const;
export const STORE_GROCERS_LIVE_PRICE_6_SAR = 599 as const;
export const STORE_GROCERS_LIVE_PRICE_12_SAR = 899 as const;
export const STORE_GROCERS_LIVE_PRICE_6_HALALAS = 59900 as const;
export const STORE_GROCERS_LIVE_PRICE_12_HALALAS = 89900 as const;
export const STORE_GROCERS_CHAT_ADDON_6_SAR = 299 as const;
export const STORE_GROCERS_CHAT_ADDON_12_SAR = 499 as const;
export const STORE_GROCERS_CHAT_ADDON_6_HALALAS = 29900 as const;
export const STORE_GROCERS_CHAT_ADDON_12_HALALAS = 49900 as const;

export function grocersChatAddonSar(packId: 'm6' | 'm12'): number {
  return packId === 'm12' ? STORE_GROCERS_CHAT_ADDON_12_SAR : STORE_GROCERS_CHAT_ADDON_6_SAR;
}

function envEnabled(name: string, fallback: boolean): boolean {
  const raw = String((import.meta as { env?: Record<string, unknown> }).env?.[name] ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  if (raw === 'true' || raw === '1' || raw === 'on') return true;
  return fallback;
}

/** التحصيل عبر ميسر بعد الرفع. المعاينة تعرض السعر المعتمد. */
export const STORE_GROCERS_LIVE_CHECKOUT_ENABLED = envEnabled(
  'VITE_STORE_GROCERS_LIVE_CHECKOUT_ENABLED',
  true,
);

export const STORE_GROCERS_LIVE_ACCENT = '#8fbf7a' as const;

export const STORE_GROCERS_LIVE_PACKS = [
  {
    id: 'm6',
    months: 6,
    days: STORE_GROCERS_LIVE_DAYS_6,
    priceSar: STORE_GROCERS_LIVE_PRICE_6_SAR,
    priceHalalas: STORE_GROCERS_LIVE_PRICE_6_HALALAS,
    titleAr: 'باقة ستة أشهر',
    priceLineAr: '599 ر.س لستة أشهر',
    lineAr: 'الروابط وملصق QR واللوحة تُجهَّز فور السداد.',
  },
  {
    id: 'm12',
    months: 12,
    days: STORE_GROCERS_LIVE_DAYS_12,
    priceSar: STORE_GROCERS_LIVE_PRICE_12_SAR,
    priceHalalas: STORE_GROCERS_LIVE_PRICE_12_HALALAS,
    titleAr: 'باقة اثني عشر شهراً',
    priceLineAr: '899 ر.س لاثني عشر شهراً',
    lineAr: 'توفير أعلى وأرشيف أطول قبل انتهاء المدة.',
  },
] as const;

export type StoreGrocersLivePackId = (typeof STORE_GROCERS_LIVE_PACKS)[number]['id'];

export const STORE_GROCERS_LIVE = {
  documentTitle: 'تمويناتا1 — خريطة الحل',
  kickerAr: 'حل رقمي متكامل يربط التموينات بسكان الحي فورياً وبلا مجهود تشغيلي',
  titleAr: 'تمويناتا1',
  leadAr:
    'منصة تشغيلية جاهزة تمنح التموينات متجراً إلكترونياً مستقلاً ونظام إدارة طلبات لحظي، يعتمد على الأتمتة الكاملة لتسهيل الشراء على جيران الحي وتسريع استلام الطلبات وتنسيقها للكاشير ورجال التوصيل. الباقة 599 ر.س لستة أشهر، أو 899 ر.س لاثني عشر شهراً.',
  featuresTitleAr: 'القيمة التشغيلية والخصائص التي يقدمها المنتج',
  priceLineAr: 'باقة ستة أشهر: 599 ر.س — باقة اثني عشر شهراً: 899 ر.س',
  durationLineAr: 'الباقات متاحة للتفعيل المباشر. اشتراك صاحب التموينات عبر بوابة الدفع الآمنة.',
  chatAddonTitleAr: 'صندوق محادثة جار الحي',
  chatAddonLeadAr: 'إضافة اختيارية: صندوق في صفحة الزبون، وصندوق استقبال في لوحة الكاشير للإضافات والتوصيات ووصف الحاجة.',
  chatAddonPriceAr: '299 ر.س مع باقة ستة أشهر، أو 499 ر.س مع باقة اثني عشر شهراً',
  chatBuyerTitleAr: 'صندوق ملاحظة للكاشير',
  chatBuyerHintAr: 'اكتب إضافة أو توصية أو وصف حاجة. ليس دردشة عامة.',
  chatBuyerSendAr: 'أرسل للكاشير',
  chatDeskTitleAr: 'صندوق استقبال محادثات جار الحي',
  chatDeskReplyAr: 'رد على جار الحي',
  shopKickerAr: 'جار الحي يطلب من جواله',
  shopTitleAr: 'مقاضيك للبيت',
  featuredTitleAr: 'الأكثر طلباً',
  shelfTitleAr: 'بقية الرف',
  checkoutTitleAr: 'إتمام الطلب',
  buyerNameLabelAr: 'الاسم',
  buyerPhoneLabelAr: 'رقم الجوال',
  buyerPlaceLabelAr: 'الموقع',
  buyerFacadeLabelAr: 'صورة واجهة السكن إن رغبت',
  payCashAr: 'نقداً عند الاستلام',
  payCardAr: 'شبكة مع التوصيل',
  saveBuyerAr: 'حفظ بياناتي لتسهيل الطلب القادم بضغطة زر',
  submitOrderAr: 'أرسل الطلب للكاشير',
  deskTitleAr: 'لوحة الكاشير',
  liveOrdersAr: 'الطلبات الحية',
  whatsappReceiptAr: 'مذكرة واتساب للتوصيل',
  archiveCtaAr: 'تحميل الأرشيف',
  ingestTitleAr: 'نظام التعبئة الذكي',
  catalogTitleAr: 'بنك السلع الجاهزة',
  catalogLeadAr: 'أكثر من مئتي سلعة شائعة. فعّل السلعة وحدّد سعرها.',
  activateAr: 'تفعيل السلعة',
  deactivateAr: 'إيقاف',
  listIngestTitleAr: 'مراجعة قائمة مصوّرة أو ملصقة',
  listIngestLeadAr: 'الصق أسماء وأسعاراً، أو أرفق صورة القائمة وراجع الصفوف قبل الحفظ. لا مفاتيح ذكاء اصطناعي في المتصفح.',
  flashLabelAr: 'ساعة العروض',
  flashHintAr: 'عرض اليوم: كرتون مياه بسعر خاص حتى الساعة 10 مساءً',
  qrPhraseAr: 'اطلب مقاضيك من جوالك وتوصلك للبيت برقم طاولة منزلية',
  qrPrintAr: 'طباعة ملصق QR',
  stockOnAr: 'متوفر',
  stockOffAr: 'نفد',
  orderCtaAr: 'اختر الباقة',
  tryCtaAr: 'ابدأ الآن وفعّل متجرك الرقمي فوراً',
  deskLinkAr: 'لوحة الكاشير',
  shopLinkAr: 'رابط الزبون',
  termsFoldTriggerAr: 'اقرأ شروط الخدمة',
  termsFoldTitleAr: 'شروط الخدمة قبل الطلب',
  termsFoldBodyAr:
    'تمويناتا1 صفحة لجار الحي ولوحة للكاشير. 599 ر.س لستة أشهر، أو 899 ر.س لاثني عشر شهراً، عبر بوابة الدفع الآمنة. صندوق المحادثة إضافة اختيارية: 299 ر.س مع باقة ستة أشهر، أو 499 ر.س مع باقة اثني عشر شهراً. صندوق في صفحة الزبون وصندوق استقبال في اللوحة، بلا غرفة دردشة عامة. طلب الزبون نقداً أو شبكة مع التوصيل. التفاصيل في شروط الخدمة.',
  labKickerAr: 'معاينة حيّة داخل الصفحة',
  labTitleAr: 'هكذا يطلب جار الحي وتصل المذكرة للكاشير',
  labLeadAr: 'فعّل سلعة، أرسل طلباً تجريبياً، وافتح مذكرة واتساب كما في ليلة التشغيل.',
  heroImage: '/images/store/grocers-hero-marketing.jpg',
  heroAltAr: 'رف تموينات حي بسلع يومية جاهزة للطلب من الجوال',
  heroCaptionAr: 'من الجوال إلى باب البيت',
  checkoutClosedAr: 'بوابة الدفع غير مفتوحة لهذا المنتج بعد.',
  orderConsentAr: 'قرأت شروط الخدمة وأوافق على تحصيل باقة التموينات عبر بوابة الدفع بالمبلغ المعروض. لا تحصيل من زبون الحي غير نقد أو شبكة عند الباب.',
  orderSubmitAr: 'الانتقال إلى الدفع',
} as const;

export const STORE_GROCERS_LIVE_FEATURES = [
  {
    titleAr: 'بنك سلع جاهز وبدء فوري لأكثر من مئتي سلعة',
    bodyAr:
      'فعّل البضائع اليومية من ألبان وأجبان ومياه ومنظفات بضغطة واحدة بلا إدخال الأسماء يدوياً، مع مراجعة قائمة مصوّرة أو ملصقة قبل الحفظ.',
  },
  {
    titleAr: 'لوحة كاشير حية وتنبيهات لحظية',
    bodyAr:
      'شاشة استلام فورية تعطي تنبيهاً صوتياً فور وصول الطلب، وتتيح إرسال تفاصيل السلع مع موقع السكن على الخريطة إلى مذكرة واتساب جاهزة للتوصيل بنقرة واحدة.',
    pulse: true,
  },
  {
    titleAr: 'واجهة تسوق ميسرة لجار الحي',
    bodyAr:
      'رف سريع يستعرض المنتجات بوضوح، يحسب الإجمالي تلقائياً، ويتذكر بيانات الموقع ورقم الجوال على جهاز الزبون لتسهيل إعادة الطلب.',
  },
  {
    titleAr: 'تنسيق الدفع والطلبات الخاصة',
    bodyAr:
      'اختيار الاستلام نقداً أو شبكة عند الباب، وصندوق ملاحظات جار الحي إضافة اختيارية بـ 299 ر.س لستة أشهر أو 499 ر.س لاثني عشر شهراً للتوصيات ووصف الحاجة.',
  },
  {
    titleAr: 'إدارة توفر المنتجات بنقرة واحدة',
    bodyAr:
      'حوّل حالة أي سلعة إلى غير متوفر فور نفادها لمنع طلبها، وعدّل شريط ساعة العروض والرسائل الترحيبية في أي وقت.',
  },
  {
    titleAr: 'ملصق QR خاص بالتموينات',
    bodyAr:
      'رمز استجابة سريعة جاهز للطباعة والتعليق على الواجهة أو الأكياس ليفتح جار الحي المتجر ويطلب من جواله مباشرة.',
  },
] as const;

export const STORE_GROCERS_LIVE_FIELDS = [
  'سطر ترحيب أعلى الصفحة',
  'موعد التوصيل داخل الحي',
  'تنبيه الدفع عند الباب',
  'ملاحظة عن النفاد السريع',
  'خاتمة بعد إرسال الطلب',
] as const;

export const STORE_GROCERS_LIVE_DEMO = {
  shopName: 'تموينات النخيل',
  hostName: 'الإدارة',
  blurbAr: 'تمويناتا1: ألبان وخبز ومياه تصل لجار الحي.',
  customFields: [
    'حياكم الله، الطلب من الجوال يختصر الوقوف عند الرف.',
    'التوصيل داخل الحي خلال ساعة في أوقات الدوام.',
    'الدفع نقداً أو شبكة عند الباب.',
    'إن نفد صنف نخبّئه فوراً حتى لا يُطلب.',
    'شكراً لثقتكم، والمذكرة تصل للكاشير في لحظتها.',
  ] as string[],
  flashAr: 'عرض اليوم: كرتون مياه بـ 14 ر.س حتى الساعة 10 مساءً',
} as const;
