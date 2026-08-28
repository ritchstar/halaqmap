/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * طبختنا1 — صفحة الأسرة المنتجة ولوحة النشاط. لا يُستورد من App.
 * باقتان: 300 ر.س لمئة وثمانين يوماً، و600 ر.س لثلاثمئة وستين يوماً.
 * التحصيل عبر ميسر على www.halaqmap.com بوسم store_kitchen_live.
 */
import {
  LEGAL_ECOMMERCE_AUTH_NUMBER,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
} from '@/config/partnerLegal';

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
  problemTitleAr: 'من فوضى واتساب... إلى متجر منظّم',
  problemBodyAr:
    'طلب يسأل عن الصنف، وآخر عن السعر، وثالث يكتب العنوان بسرعة وقت الذروة فيصعب قراءته... كل هذا يختلط مع محادثات صاحب النشاط الشخصية على واتساب. النتيجة المعتادة: طلب يضيع بين الرسائل، وسؤال يتكرر مع كل زبون جديد عن نفس التفاصيل، ووقت وجهد يُصرف في الكتابة بدل الطبخ والتحضير. وفي النهاية، يبقى العمل بلا واجهة منظمة توحي للزبون بالثقة والاحترافية التي يستحقها.',
  solutionTitleAr: 'طبختنا1: حل مباشر لهذه المشكلة تحديداً',
  leadAr:
    'طبختنا1 منظومة جاهزة للأسر المنتجة: صفحة أصناف عبر رمز QR، ولوحة استقبال للطلبات، وإرسال بطاقة الطلب عبر واتساب من جهاز النشاط بنقرة واحدة. الطلبات تصل منظمة وجاهزة من أول لحظة، بدل أن تُكتب يدوياً في كل مرة.',
  howTitleAr: 'كيف يعمل النظام؟',
  howLeadAr: 'بخطوات بسيطة، بلا تعقيد.',
  howSteps: [
    'يُطبع رمز المتجر على العبوة أو عند باب الاستلام.',
    'يمسح الزبون الرمز، فتفتح صفحة الأصناف مباشرة من متصفح جواله، بلا تحميل أي تطبيق.',
    'يدخل الزبون إلى صفحة الأصناف ويختار توصيلاً أو استلاماً.',
  ],
  howTicketLeadAr: 'يصل الطلب إلى اللوحة خلال ثوانٍ مع تنبيه، وتظهر بطاقة الطلب متضمنة:',
  ticketItems: [
    'اسم الزبون ورقم الجوال.',
    'نص موقع التسليم، ورابط يفتح على تطبيق الخرائط، إن اختار التوصيل.',
    'تفاصيل الطلب.',
    'طريقة الدفع: نقداً أو شبكة.',
    'المبلغ الإجمالي.',
  ],
  whatsappLineAr:
    'من جهاز تشغيل النشاط نفسه، تُفتح أو تُشارك بطاقة الطلب عبر واتساب بنقرة واحدة لتمريرها لعامل التوصيل. القرار والإرسال دائماً بيد صاحب النشاط، وليس إرسالاً آلياً من الخادم.',
  webLineAr:
    'النظام ويب بالكامل، بلا أي تطبيق يُثبَّت: صفحة الزبون وصفحة إدارة النشاط تفتحان من أي متصفح. الاستضافة سحابية غير مرتبطة بجهاز معيّن، وبعد نجاح الدفع تصل الروابط ورمز المتجر مباشرة على البريد الإلكتروني، جاهزة للاستخدام فوراً. ولتسريع الطلبات القادمة، يمكن للزبون حفظ بياناته بإذنه فلا يعيد كتابتها في كل مرة.',
  payTitleAr: 'بدون عمولة، وبدون تعقيد في المحاسبة',
  payIndependenceAr:
    'لا تحصيل إلكتروني للزبون عبر المنصة، ولا عمولة على قيمة الوجبات مهما زاد عدد الطلبات. المحاسبة نقداً أو عبر جهاز الشبكة عند التسليم، تماماً كما هو معتاد اليوم، والفرق أن الطلب يصل منظماً وواضحاً منذ اللحظة الأولى. الاشتراك في طبختنا1 هو فقط رسوم تشغيل النظام.',
  opsTitleAr: 'متطلبات التشغيل',
  opsBodyAr:
    'يحتاج النشاط جهازاً متصلاً بالإنترنت، وحساب واتساب واحد على جهاز التشغيل نفسه. النسخة الأولى لمالك واحد.',
  featuresTitleAr: 'تشمل الصفحة',
  priceTitleAr: 'الأسعار',
  priceLineAr: 'باقة مئة وثمانين يوماً: 300 ر.س – باقة ثلاثمئة وستين يوماً: 600 ر.س',
  supportLineAr: 'أسعار مخصصة للأسر المنتجة دعماً من متجر خريطة الحل.',
  durationLineAr:
    'لا تحصيل من الزبون عبر المنصة، ولا عمولة على قيمة الوجبات.',
  legalTitleAr: 'منتج من منشأة موثّقة نظامياً',
  legalLeadBeforeAr: 'طبختنا1 من متجر خريطة الحل ',
  legalLeadAfterAr: `، وهو مؤسسة موثّقة نظامياً في المملكة العربية السعودية. الرقم الوطني الموحد ${LEGAL_NATIONAL_UNIFIED_NUMBER}، ورقم توثيق التجارة الإلكترونية ${LEGAL_ECOMMERCE_AUTH_NUMBER}. تعمل ضمن الأنظمة السعودية ومبادئ حماية البيانات الشخصية. بيانات صاحب النشاط وبيانات زبائنه تُستخدم فقط لتشغيل الطلبات، ولا تُستخدم لأي غرض إعلاني. تعامل مطمئن مع جهة موثقة، وأداة يملكها صاحب النشاط بالكامل من أول يوم.`,
  privacyAr:
    'تُستخدم بيانات الزبون لتنفيذ الطلب فقط، وتُحفظ على جهازه إن وافق، ولا دفتر زبائن لدى المنصة.',
  startTitleAr: 'ابدأ اليوم بخطوة واحدة',
  closeAr:
    'لا حاجة لخبرة تقنية ولا لتطبيقات معقدة: رمز واحد، وصفحة واحدة، ولوحة تصل إليها الطلبات جاهزة بكل تفاصيلها. أداة بسيطة تُنهي فوضى الطلبات المتفرقة، وتمنح كل أسرة منتجة واجهة منظمة يثق بها الزبون، وتجعل استقبال الطلبات وتسليمها سهلاً وشبه آلي، بلا تعقيد. اختر باقتك الآن وابدأ أول يوم بلا فوضى.',
  shopKickerAr: 'الزبون يطلب من جواله',
  featuredTitleAr: 'صور العرض',
  shelfTitleAr: 'بقية الأصناف',
  todayTitleAr: 'طبق اليوم',
  checkoutTitleAr: 'إتمام الطلب',
  buyerNameLabelAr: 'الاسم',
  buyerPhoneLabelAr: 'رقم الجوال',
  buyerPlaceLabelAr: 'موقع التسليم',
  buyerPlaceHintAr: 'الصق رابط الخريطة أو حدّد موقعك بعد موافقة المتصفح.',
  locateMeAr: 'حدد موقعي',
  locatingAr: 'جاري تحديد الموقع…',
  locateFailAr: 'تعذّر تحديد الموقع. الصق رابط الخريطة يدوياً.',
  locateDeniedAr: 'رُفض إذن الموقع. فعّله من إعدادات المتصفح أو الصق الرابط.',
  locateSavedAr: 'لُصق رابط موقعك في الحقل.',
  buyerNoteLabelAr: 'ملاحظة على الطلب',
  buyerPhotoLabelAr: 'صورة موقع التسليم إن رغبت',
  buyerScheduleLabelAr: 'موعد التسليم إن رغبت',
  serviceDeliveryAr: 'توصيل',
  servicePickupAr: 'استلام من النشاط',
  pickupPlaceTitleAr: 'موقع الاستلام من الباب',
  pickupPlaceOpenAr: 'افتح موقع الاستلام',
  pickupPlacePendingAr: 'يُرسل موقع الاستلام مع رد الجاهزية على تذكرتك.',
  pickupPlaceHiddenAr: 'موقع الاستلام غير ظاهر الآن. سيصلك مع رد «طلبك جاهز».',
  deskPickupTitleAr: 'موقع الاستلام من الباب',
  deskPickupLeadAr:
    'حدّد موقع النشاط بعد موافقة المتصفح، ثم أبرزه للزبون أو أخفه. عند اختيار الاستلام من الباب يُرد على التذكرة داخل النظام، ويُرسل «طلبك جاهز» مع رابط الموقع من جهازك.',
  pickupShowAr: 'إبراز الموقع للزبون',
  pickupHideAr: 'إخفاء الموقع',
  pickupMappedAr: 'حُفظ موقع النشاط.',
  markReadyAr: 'طلبك جاهز — أرسل موقع الاستلام',
  readyMarkedAr: 'أُبلغت الجاهزية على التذكرة',
  orderReadyBannerAr: 'طلبك جاهز. الاستلام من باب النشاط.',
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
  orderCtaAr: 'اختر باقتك الآن',
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
  heroImage: '/images/store/kitchen-hero-marketing.jpg',
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
