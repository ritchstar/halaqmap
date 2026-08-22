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
  documentTitle: 'تموينات الحي — خريطة الحل',
  kickerAr: 'متجر الحي على الجوال',
  titleAr: 'تموينات الحي',
  leadAr:
    'صفحة لصاحب التموينات: يفعّل السلع من بنك جاهز أو يراجع قائمة مصوّرة، والزبون يطلب من جواله وتصل المذكرة للكاشير. 599 ر.س لستة أشهر، أو 899 ر.س لاثني عشر شهراً. لا تحصيل من الزبون غير نقد أو شبكة مع التوصيل.',
  priceLineAr: '599 ر.س لستة أشهر — 899 ر.س لاثني عشر شهراً',
  durationLineAr: 'اشتراك صاحب التموينات عبر ميسر على www.halaqmap.com. لا خلط برخصة النفاذ ولا بقاعات المناسبة.',
  shopKickerAr: 'اطلب من جوالك',
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
  tryCtaAr: 'عاين المتجر الآن',
  deskLinkAr: 'لوحة الكاشير',
  shopLinkAr: 'رابط الزبون',
  termsFoldTriggerAr: 'اقرأ شروط الخدمة',
  termsFoldTitleAr: 'شروط الخدمة قبل الطلب',
  termsFoldBodyAr:
    'تموينات الحي صفحة للحي ولوحة للكاشير. 599 ر.س لستة أشهر، أو 899 ر.س لاثني عشر شهراً، عبر ميسر على www.halaqmap.com بوسم مستقل. طلب الزبون نقداً أو شبكة مع التوصيل، بلا تحصيل سلّته عبر ميسر. التفاصيل في شروط الخدمة.',
  labKickerAr: 'معاينة حيّة داخل الصفحة',
  labTitleAr: 'هكذا يطلب الجار وتصل المذكرة للكاشير',
  labLeadAr: 'فعّل سلعة، أرسل طلباً تجريبياً، وافتح مذكرة واتساب كما في ليلة التشغيل.',
  heroImage: '/images/store/grocers-hero-marketing.jpg',
  heroAltAr: 'رف تموينات حي بسلع يومية جاهزة للطلب من الجوال',
  heroCaptionAr: 'من الجوال إلى باب البيت',
  checkoutClosedAr: 'بوابة الدفع غير مفتوحة لهذا المنتج بعد.',
  orderConsentAr: 'قرأت شروط الخدمة وأوافق على تحصيل باقة التموينات عبر ميسر بالمبلغ المعروض. لا تحصيل من زبون الحي غير نقد أو شبكة عند الباب.',
  orderSubmitAr: 'الانتقال إلى الدفع',
} as const;

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
  blurbAr: 'تموينات الحي: ألبان وخبز ومياه تصل للبيت.',
  customFields: [
    'حياكم الله، الطلب من الجوال يختصر الوقوف عند الرف.',
    'التوصيل داخل الحي خلال ساعة في أوقات الدوام.',
    'الدفع نقداً أو شبكة عند الباب.',
    'إن نفد صنف نخبّئه فوراً حتى لا يُطلب.',
    'شكراً لثقتكم، والمذكرة تصل للكاشير في لحظتها.',
  ] as string[],
  flashAr: 'عرض اليوم: كرتون مياه بـ 14 ر.س حتى الساعة 10 مساءً',
} as const;
