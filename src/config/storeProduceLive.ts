/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * خضارنا1 — صفحة محل الخضار والفواكه في الحي. لا يُستورد من App.
 * باقتان: 1350 ر.س لمئة وثمانين يوماً، و2500 ر.س لثلاثمئة وستين يوماً.
 * التحصيل عبر ميسر على www.halaqmap.com بوسم store_produce_live.
 */
import {
  LEGAL_ECOMMERCE_AUTH_NUMBER,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
} from '@/config/partnerLegal';
import { STORE_SHOP_PRESENCE_LABEL_AR } from '@/config/storeShopPresence';

export const STORE_PRODUCE_LIVE_PUBLIC_ENABLED = true;

export const STORE_PRODUCE_LIVE_LAB_TOKEN = 'produce-lab' as const;

export const STORE_PRODUCE_LIVE_PRODUCT = 'store_produce_live' as const;

export const STORE_PRODUCE_LIVE_DAYS_6 = 180 as const;
export const STORE_PRODUCE_LIVE_DAYS_12 = 360 as const;
export const STORE_PRODUCE_LIVE_PRICE_6_SAR = 1350 as const;
export const STORE_PRODUCE_LIVE_PRICE_12_SAR = 2500 as const;
export const STORE_PRODUCE_LIVE_PRICE_6_HALALAS = 135000 as const;
export const STORE_PRODUCE_LIVE_PRICE_12_HALALAS = 250000 as const;
export const STORE_PRODUCE_TRIAL_DAYS = 60 as const;

function envEnabled(name: string, fallback: boolean): boolean {
  const raw = String((import.meta as { env?: Record<string, unknown> }).env?.[name] ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  if (raw === 'true' || raw === '1' || raw === 'on') return true;
  return fallback;
}

export const STORE_PRODUCE_LIVE_CHECKOUT_ENABLED = envEnabled(
  'VITE_STORE_PRODUCE_LIVE_CHECKOUT_ENABLED',
  true,
);

export const STORE_PRODUCE_LIVE_ACCENT = '#3d8b4a' as const;

export const STORE_PRODUCE_LIVE_PACKS = [
  {
    id: 'm6',
    months: 6,
    days: STORE_PRODUCE_LIVE_DAYS_6,
    priceSar: STORE_PRODUCE_LIVE_PRICE_6_SAR,
    priceHalalas: STORE_PRODUCE_LIVE_PRICE_6_HALALAS,
    titleAr: 'باقة مئة وثمانين يوماً',
    priceLineAr: '1350 ر.س لمئة وثمانين يوماً',
    lineAr: 'الصفحة ولوحة الصندوق وملصق QR تُجهَّز بعد السداد. المسار المتحرك وصندوق الملاحظة مدرجان.',
  },
  {
    id: 'm12',
    months: 12,
    days: STORE_PRODUCE_LIVE_DAYS_12,
    priceSar: STORE_PRODUCE_LIVE_PRICE_12_SAR,
    priceHalalas: STORE_PRODUCE_LIVE_PRICE_12_HALALAS,
    titleAr: 'باقة ثلاثمئة وستين يوماً',
    priceLineAr: '2500 ر.س لثلاثمئة وستين يوماً',
    lineAr: 'مدة أطول لنفس الصفحة واللوحة والملصق، والمسار المتحرك مدرج.',
  },
] as const;

export type StoreProduceLivePackId = (typeof STORE_PRODUCE_LIVE_PACKS)[number]['id'];

export const STORE_PRODUCE_LIVE = {
  documentTitle: 'خضارنا1 — خريطة الحل',
  kickerAr: 'من الصندوق إلى جار الحي',
  titleAr: 'خضارنا1',
  problemTitleAr: 'بين سعر اليوم وما نفد قبل الظهر',
  problemBodyAr:
    'يسأل جار الحي عن صنف وصل هذا الصباح وعن سعر الكيلو. صاحب الصندوق يجيب من ذاكرته أو من لوحة بخط اليد تتغيّر كل يوم. صنف يصل، وآخر ينفد، وسعر يتبدّل قبل العصر، وطلب يضيع بين المكالمات. لا صفحة تعرض صندوق اليوم بوضوح، ولا لوحة تصل إليها الطلبات مكتوبة بدل أن تُملى وسط الزحمة.',
  solutionTitleAr: 'خضارنا1: صندوق اليوم بواجهة حية ولوحة تشغيل',
  leadAr:
    'خضارنا1 صفحة لجار الحي ولوحة لصاحب الصندوق: بنك خضار وفواكه بالحبة أو الكيلو أو الحزمة أو الصندوق، وشريط ما وصل هذا الصباح، وطلب من الجوال بتوصيل أو استلام، ومذكرة واتساب من جهاز المحل. الصندوق والعربة مسار واحد مشمول في السعر.',
  howTitleAr: 'كيف يعمل النظام؟',
  howLeadAr: 'بخطوات بسيطة، بلا تعقيد.',
  howSteps: [
    'يُطبع رمز QR على الصندوق أو العربة أو يُشارك رابط الصفحة مع جيران الحي.',
    'يفتح الزبون صفحة الأصناف من متصفح جواله، بلا تطبيق، ويرى ما وصل اليوم وما نفذ.',
    'يختار حبة أو كيلو، ويكتب اسمه وجواله، ثم يختار توصيلاً في الحي أو استلاماً من الصندوق.',
    'يصل الطلب إلى اللوحة خلال ثوانٍ مع تنبيه: الأصناف والكميات والإجمالي والاسم والجوال.',
    'من جهاز صاحب المحل تُفتح مذكرة واتساب بنقرة واحدة لتمريرها لعامل التوصيل أو لتأكيد الاستلام.',
  ],
  ingestLineAr:
    'تعبئة الرف من بنك خضار وفواكه جاهز: ورقية وجذرية وثمرية وفواكه وأعشاب وصناديق اليوم. تُفعَّل بالبحث، أو بلصق قائمة أسعار ومراجعة الصفوف قبل الحفظ.',
  hoursLineAr:
    'ويضبط صاحب المحل حالة مفتوح أو مغلق وساعات العمل وشريط صندوق اليوم. وحتى في وضع مغلق يستطيع الجار إرسال طلب مسبق فيجدّه صاحب الصندوق في لوحته عند بداية الدوام.',
  presenceLineAr: `كما يتحكم بإبراز موقع الصندوق أو إخفائه، وتظهر له في اللوحة قراءة لحظية بعنوان ${STORE_SHOP_PRESENCE_LABEL_AR} لمن يفتح صفحة الطلب في تلك اللحظة. الرقم مجهول بلا اسم ولا جوال، يختفي بإغلاق الصفحة.`,
  payTitleAr: 'بدون عمولة على قيمة الصندوق',
  payIndependenceAr:
    'لا تحصيل إلكتروني من جار الحي عبر المنصة، ولا عمولة على قيمة السلة. المحاسبة نقداً أو شبكة عند التسليم أو الاستلام من الصندوق. الاشتراك في خضارنا1 رسوم تشغيل الصفحة واللوحة فقط.',
  featuresTitleAr: 'ما يشمله التشغيل',
  priceTitleAr: 'الأسعار',
  priceLineAr: 'باقة مئة وثمانين يوماً: 1350 ر.س – باقة ثلاثمئة وستين يوماً: 2500 ر.س',
  durationLineAr:
    'المسار الثابت والمتحرك وصندوق الملاحظة مدرجة في الباقتين. تحديث موقع العربة مشمول بلا إضافة مدفوعة.',
  legalTitleAr: 'منتج من منشأة موثّقة نظامياً',
  legalLeadBeforeAr: 'خضارنا1 من متجر خريطة الحل ',
  legalLeadAfterAr: `، وهو مؤسسة موثّقة نظامياً في المملكة العربية السعودية. الرقم الوطني الموحد ${LEGAL_NATIONAL_UNIFIED_NUMBER}، ورقم توثيق التجارة الإلكترونية ${LEGAL_ECOMMERCE_AUTH_NUMBER}. تعمل ضمن الأنظمة السعودية ومبادئ حماية البيانات الشخصية. بيانات صاحب المحل وبيانات جار الحي تُستخدم فقط لتشغيل الطلبات، ولا تُستخدم لأي غرض إعلاني.`,
  startTitleAr: 'ابدأ اليوم بخطوة واحدة',
  closeAr:
    'رمز واحد، وصفحة تعرض صندوق اليوم، ولوحة تصل إليها الطلبات جاهزة. اختر باقتك الآن.',
  chatBuyerTitleAr: 'صندوق ملاحظة لصاحب الصندوق',
  chatBuyerHintAr: 'اسأل عن صنف وصل اليوم أو اطلب توصية. ليس دردشة عامة.',
  chatBuyerSendAr: 'أرسل لصاحب الصندوق',
  chatDeskTitleAr: 'صندوق استقبال ملاحظات جار الحي',
  chatDeskReplyAr: 'رد على جار الحي',
  shopKickerAr: 'جار الحي يطلب من جواله',
  shopTitleAr: 'صندوق اليوم',
  todayTitleAr: 'وصل اليوم',
  featuredTitleAr: 'الأكثر طلباً',
  shelfTitleAr: 'بقية الرف',
  checkoutTitleAr: 'إتمام الطلب',
  buyerNameLabelAr: 'الاسم',
  buyerPhoneLabelAr: 'رقم الجوال',
  buyerPlaceLabelAr: 'موقع التسليم',
  buyerNoteLabelAr: 'ملاحظة على الطلب',
  payCashAr: 'نقداً عند التسليم',
  payCardAr: 'شبكة عند التسليم',
  serviceDeliveryAr: 'توصيل في الحي',
  servicePickupAr: 'استلام من الصندوق',
  saveBuyerAr: 'حفظ بياناتي لتسهيل الطلب القادم',
  submitOrderAr: 'أرسل الطلب للصندوق',
  locateMeAr: 'حدد موقعي',
  locatingAr: 'جاري تحديد الموقع…',
  locateFailAr: 'تعذّر تحديد الموقع. أعد المحاولة بعد موافقة المتصفح.',
  locateDeniedAr: 'رُفض إذن الموقع. فعّله من إعدادات المتصفح.',
  locateSavedAr: 'حُفظ الموقع. اضغط «تأكد من موقعي» لرؤية الدبوس.',
  confirmPlaceAr: 'تأكد من موقعي',
  deskPickupTitleAr: 'موقع الصندوق أو العربة',
  deskPickupLeadAr:
    'حدّد الموقع بعد موافقة المتصفح، ثم أبرزه لجار الحي أو أخفه. المسار المتحرك يحدّث الموقع من اللوحة بلا إضافة مدفوعة.',
  pickupShowAr: 'إبراز الموقع',
  pickupHideAr: 'إخفاء الموقع',
  pickupPlaceOpenAr: 'افتح الموقع',
  pickupPinAriaAr: 'موقع الصندوق على الخريطة',
  deskTitleAr: 'لوحة الصندوق',
  liveOrdersAr: 'الطلبات الحية',
  whatsappReceiptAr: 'مذكرة واتساب للتسليم',
  archiveCtaAr: 'تحميل الأرشيف',
  ingestTitleAr: 'بنك الخضار والفواكه',
  catalogTitleAr: 'بنك الأصناف الجاهزة',
  catalogLeadAr: 'فعّل الصنف وحدد سعره ووحدته: حبة أو كيلو أو حزمة أو صندوق.',
  activateAr: 'تفعيل الصنف',
  deactivateAr: 'إيقاف',
  listIngestTitleAr: 'مراجعة قائمة مكتوبة أو مصوّرة',
  listIngestLeadAr: 'الصق أسماء وأسعاراً، أو أرفق صورة القائمة وراجع الصفوف قبل الحفظ. لا مفاتيح ذكاء اصطناعي في المتصفح.',
  flashLabelAr: 'شريط صندوق اليوم',
  flashHintAr: 'وصل اليوم: رمان وبطيخ حتى نفاذ الكمية',
  arrivedOnAr: 'وصل اليوم',
  arrivedOffAr: 'لم يصل',
  qrPhraseAr: 'امسح واطلب من جوالك. التوصيل في الحي أو الاستلام من الصندوق.',
  qrPrintAr: 'طباعة ملصق QR',
  stockOnAr: 'متوفر',
  stockOffAr: 'نفد',
  soldOutAr: 'نفد',
  orderCtaAr: 'اختر الباقة',
  tryCtaAr: 'شاهد الصفحة ولوحة الصندوق',
  deskLinkAr: 'لوحة الصندوق',
  shopLinkAr: 'رابط جار الحي',
  termsFoldTriggerAr: 'اقرأ شروط الخدمة',
  termsFoldTitleAr: 'شروط الخدمة قبل الطلب',
  termsFoldBodyAr:
    'خضارنا1 صفحة لجار الحي ولوحة لصاحب الصندوق. 1350 ر.س لمئة وثمانين يوماً، أو 2500 ر.س لثلاثمئة وستين يوماً. المسار الثابت والمتحرك وصندوق الملاحظة مدرجة. طلب الجار نقداً أو شبكة عند التسليم. لا تحصيل سلة عبر ميسر. التفاصيل في شروط الخدمة.',
  labKickerAr: 'معاينة حيّة داخل الصفحة',
  labTitleAr: 'هكذا يطلب جار الحي وتصل المذكرة للصندوق',
  labLeadAr: 'فعّل صنفاً، أرسل طلباً تجريبياً، وافتح مذكرة واتساب كما في ساعة السوق.',
  heroImage: '/images/store/produce-hero-marketing.jpg',
  heroCaptionAr: 'من الصندوق إلى جار الحي',
  heroAltAr: 'صندوق خضار وفواكه جاهز للطلب من الجوال',
  checkoutClosedAr: 'بوابة الدفع غير مفتوحة لهذا المنتج بعد.',
  orderConsentAr:
    'قرأت شروط الخدمة وأوافق على تحصيل باقة خضارنا1 عبر بوابة الدفع بالمبلغ المعروض. لا تحصيل من جار الحي غير نقد أو شبكة عند التسليم.',
  orderSubmitAr: 'الانتقال إلى الدفع',
  shopNameLabelAr: 'اسم المحل',
} as const;

export const STORE_PRODUCE_LIVE_FEATURES = [
  {
    titleAr: 'شريط صندوق اليوم',
    bodyAr: 'ما وصل هذا الصباح يظهر أولاً. ما نفذ يُخفى أو يُعلَّم نفد حتى لا يُطلب.',
  },
  {
    titleAr: 'حبة أو كيلو',
    bodyAr: 'كل صنف بوحدته: حبة أو كيلو أو حزمة أو صندوق. السعر يتغيّر في نفس اليوم من اللوحة.',
    pulse: true,
  },
  {
    titleAr: 'صندوق ملاحظة مدرج',
    bodyAr: 'جار الحي يسأل عن صنف اليوم. الرد من اللوحة. ليست غرفة عامة وليست إضافة مدفوعة.',
  },
  {
    titleAr: 'مسار ثابت أو عربة',
    bodyAr: 'محل أو بسطة أو عربة. تحديث الموقع مشمول في السعر، بلا إضافة مدفوعة.',
  },
  {
    titleAr: 'مذكرة واتساب من الجهاز',
    bodyAr: 'من جهاز صاحب المحل تُفتح الاسم والجوال والأصناف والدفع نقداً أو شبكة.',
  },
  {
    titleAr: 'ملصق QR على الصندوق',
    bodyAr: 'رمز يفتح صفحة جار الحي من الجوال مباشرة.',
  },
] as const;

export const STORE_PRODUCE_LIVE_DEMO = {
  shopName: 'صندوق الحي',
  hostName: 'الإدارة',
  blurbAr: 'خضارنا1: صندوق اليوم من الجوال إلى الباب.',
  customFields: [
    'حياكم الله، اطلبوا ما وصل اليوم من الجوال.',
    'التوصيل داخل الحي حسب الاتفاق.',
    'الاستلام من الصندوق أو العربة إن رغبتم.',
    'الدفع نقداً أو شبكة عند التسليم.',
    'إن نفد صنف نخفيه حتى لا يُطلب.',
  ] as string[],
  flashAr: 'وصل اليوم: رمان وبطيخ حتى نفاذ الكمية',
} as const;
