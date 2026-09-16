/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بخورنا1 — صفحة محل البخور والعود والعطور في الحي. لا يُستورد من App.
 * 899 ر.س لمئة وثمانين يوماً أو 1799 ر.س لثلاثمئة وستين يوماً، بتجربة مجانية
 * ستين يوماً. الخادم في api/public-store-bakhurna-live.ts والتحقق في
 * api/_lib/storeBakhurnaLive.ts. الرمز bakhurna-lab وحده معاينة محلية بلا خادم.
 * منتج غير مسجّل لدى الهيئة السعودية للملكية الفكرية (SAIP).
 */
import { ROUTE_PATHS } from '@/lib/routePaths';

export const STORE_BAKHURNA_LIVE_PUBLIC_ENABLED = true;

export const STORE_BAKHURNA_LIVE_LAB_TOKEN = 'bakhurna-lab' as const;

export const STORE_BAKHURNA_LIVE_PRODUCT = 'store_bakhurna_live' as const;

export const STORE_BAKHURNA_LIVE_DAYS_6 = 180 as const;
export const STORE_BAKHURNA_LIVE_DAYS_12 = 360 as const;
export const STORE_BAKHURNA_LIVE_PRICE_6_SAR = 899 as const;
export const STORE_BAKHURNA_LIVE_PRICE_12_SAR = 1799 as const;
export const STORE_BAKHURNA_LIVE_PRICE_6_HALALAS = 89900 as const;
export const STORE_BAKHURNA_LIVE_PRICE_12_HALALAS = 179900 as const;
export const STORE_BAKHURNA_TRIAL_DAYS = 60 as const;

function envEnabled(name: string, fallback: boolean): boolean {
  const raw = String((import.meta as { env?: Record<string, unknown> }).env?.[name] ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  if (raw === 'true' || raw === '1' || raw === 'on') return true;
  return fallback;
}

/**
 * تحصيل بخورنا1 عبر ميسر — وسم store_bakhurna_live، 899 أو 1799 ر.س.
 * يمكن إيقافه مؤقتاً عبر متغير البيئة عند الحاجة.
 */
export const STORE_BAKHURNA_LIVE_CHECKOUT_ENABLED = envEnabled(
  'VITE_STORE_BAKHURNA_LIVE_CHECKOUT_ENABLED',
  true,
);

export const STORE_BAKHURNA_LIVE_ACCENT = '#6E4A26' as const;

export const STORE_BAKHURNA_LIVE_PACKS = [
  {
    id: 'm6',
    months: 6,
    days: STORE_BAKHURNA_LIVE_DAYS_6,
    priceSar: STORE_BAKHURNA_LIVE_PRICE_6_SAR,
    priceHalalas: STORE_BAKHURNA_LIVE_PRICE_6_HALALAS,
    titleAr: 'تمديد 180 يوماً',
    priceLineAr: '899 ر.س',
    lineAr: 'واجهة العميل، ولوحة التشغيل، ورمز QR، والنشاط الثابت أو المتحرك، وتحديث موقع العربة دون رسوم إضافية.',
  },
  {
    id: 'm12',
    months: 12,
    days: STORE_BAKHURNA_LIVE_DAYS_12,
    priceSar: STORE_BAKHURNA_LIVE_PRICE_12_SAR,
    priceHalalas: STORE_BAKHURNA_LIVE_PRICE_12_HALALAS,
    titleAr: 'تمديد 360 يوماً',
    priceLineAr: '1799 ر.س',
    lineAr: 'نفس التشغيل مع مدة أطول. المسار المتحرك ونافذة الاستفسار مدرجان.',
  },
] as const;

export type StoreBakhurnaLivePackId = (typeof STORE_BAKHURNA_LIVE_PACKS)[number]['id'];

export const STORE_BAKHURNA_LIVE = {
  documentTitle: 'بخورنا1 — منصة خريطة الحل',
  kickerAr: 'من محل البخور إلى جوال الحي',
  titleAr: 'بخورنا1',
  hookAr: 'ينقلك من انتظار زبون الحي… إلى استقبال طلبه من جواله.',
  leadAr:
    'مقر رقمي متخصص لمحلات وبسطات وعربات البخور والعود والعطور. يعرض الأصناف المتوفرة وأسعار اليوم، ويستقبل طلبات التوصيل أو الاستلام، مع لوحة تشغيل لتحديث الأصناف والموقع وحالة النشاط.',
  valueLineAr: 'واجهة للعميل، ولوحة للمشغّل، وطلبات منظمة بلا عمولة على قيمة السلة.',
  tryCtaAr: 'شاهد المعاينة',
  trialCtaAr: 'اطلب تجربة بخورنا1',
  trialTitleAr: 'جرّب بخورنا1 قبل أن تشتري',
  trialLeadAr:
    'قدّم طلب تجربة المنتج لمدة 60 يوماً. تراجع الإدارة الطلب، وعند اعتماده تُرسل روابط المنتج إلى البريد المسجل، وتبدأ مدة التجربة من تاريخ فتح صفحة المنتج.',
  extensionTitleAr: 'باقات التمديد بعد التجربة',
  extensionLeadAr:
    'تشمل الباقتان واجهة العميل، ولوحة التشغيل، ورمز QR، وتشغيل النشاط الثابت أو المتحرك، وتحديث موقع العربة دون رسوم إضافية.',
  orderTitleAr: 'مدّد تشغيل بخورنا1',
  orderLeadAr:
    'بعد انتهاء التجربة، اختر مدة التمديد. عند اكتمال السداد واعتماد العملية، تُرسل بيانات التمديد إلى البريد المسجل.',
  orderDirectAr: 'يمكنك أيضاً شراء الاشتراك مباشرة دون المرور بالتجربة.',
  orderCtaAr: 'مدّد التشغيل',
  problemTitleAr: 'بين صنف عود فاخر وطلب هدية على عجل',
  problemBodyAr:
    'تختلف أنواع البخور والعود وأسعارها بين المصادر (كمبودي، هندي، تايلندي) ودرجات النقاء، بينما تصل الطلبات عبر مكالمات ورسائل متفرقة. يضيع وقت صاحب النشاط في شرح المتوفر وتأكيد السعر والوزن، وقد يطلب العميل صنفاً نفد قبل تحديثه.',
  problemCloseAr: 'بخورنا1 يجمع المتوفر والأسعار والطلب والموقع في صفحة واحدة تصل إلى جوال العميل.',
  solutionTitleAr: 'أصناف اليوم في واجهة حية ولوحة تشغيل',
  solutionBodyAr:
    'يحدّث صاحب النشاط الأصناف والأسعار والأوزان من لوحة التشغيل، ويعرض ما وصل اليوم وما نفد. يدخل العميل عبر الرابط أو رمز QR، يختار طلبه وطريقة الاستلام والدفع، ثم يصل الطلب منظماً إلى اللوحة.',
  howTitleAr: 'كيف يعمل النظام؟',
  howSteps: [
    {
      titleAr: 'حدّث أصناف اليوم',
      bodyAr: 'اختر الأصناف من مكتبة البخور والعود والعطور، وحدد السعر والوحدة وحالة التوفر.',
    },
    {
      titleAr: 'شارك رابط الطلب',
      bodyAr: 'ضع رمز QR على المحل أو البسطة أو العربة، أو شارك الرابط مع سكان الحي.',
    },
    {
      titleAr: 'يختار العميل طلبه',
      bodyAr: 'يتصفح العميل الأصناف من جواله دون تثبيت تطبيق، ويحدد الكميات وطريقة الاستلام.',
    },
    {
      titleAr: 'يصل الطلب منظماً',
      bodyAr: 'يظهر الطلب في لوحة التشغيل متضمناً الأصناف والكميات والإجمالي وبيانات العميل والموقع.',
    },
    {
      titleAr: 'شارك ملخص الطلب',
      bodyAr: 'افتح ملخص الطلب عبر واتساب لإرساله إلى عامل التوصيل أو لتأكيده مع العميل.',
    },
  ],
  ingestLineAr:
    'أضف أصنافك من مكتبة بخور وعود جاهزة، أو أدخل قائمة الأسعار وراجعها قبل الحفظ.',
  hoursLineAr:
    'يتحكم المشغّل في حالة النشاط: مفتوح أو مغلق، ويحدد ساعات العمل وما وصل اليوم. ويمكنه إظهار موقع المحل أو العربة، أو تحديثه، أو إخفاءه من واجهة العملاء.',
  preorderLineAr:
    'عند تفعيل الطلب المسبق، يستطيع العميل إرسال طلبه أثناء إغلاق النشاط ليظهر في لوحة التشغيل عند بداية الدوام.',
  presenceLineAr:
    'مؤشر إجمالي مجهول الهوية لعدد من يفتحون صفحة الطلب في اللحظة نفسها، دون عرض أسمائهم أو أرقام جوالاتهم. يظهر في اللوحة بعنوان «الزوار النشطون الآن».',
  payTitleAr: 'طلبات مباشرة بلا عمولة على قيمة السلة',
  payIndependenceAr:
    'لا تتولى منصة خريطة الحل تحصيل قيمة طلبات العملاء، ولا تفرض عمولة على قيمة السلة. تكون العلاقة المالية مباشرة بين المشغّل وعميله، ويكون الدفع نقداً أو عبر الشبكة عند التسليم أو الاستلام، بحسب الخيارات التي يتيحها صاحب النشاط.',
  payFeeLineAr: 'رسوم بخورنا1 مقابل تشغيل المنتج السحابي وواجهة الطلب ولوحة الإدارة فقط.',
  featuresTitleAr: 'ما يشمله التشغيل',
  legalTitleAr: 'منتج من منظومة منصة خريطة الحل',
  legalBodyAr:
    'بخورنا1 منتج برمجي من متجر منصة خريطة الحل. يمكن الاطلاع على بيانات توثيق المتجر والأنشطة التجارية وروابط التحقق من خلال صفحة «التوثيق والتحقق».',
  legalPrivacyAr:
    'تُعالج بيانات المشغّل والعميل وفق سياسة الخصوصية المنشورة ولأغراض تشغيل الخدمة والطلبات المرتبطة بها.',
  trustLinkAr: 'التوثيق والتحقق',
  trustHref: ROUTE_PATHS.STORE_TRUST,
  chatBuyerTitleAr: 'اسأل صاحب النشاط',
  chatBuyerHintAr:
    'للاستفسار عن صنف وصل اليوم، أو طلب توصية، أو إرسال ملاحظة مرتبطة بالطلب. هذه النافذة ليست غرفة محادثة عامة.',
  chatBuyerNameLabelAr: 'الاسم',
  chatBuyerFieldLabelAr: 'السؤال أو الملاحظة',
  chatBuyerSendAr: 'إرسال الملاحظة',
  chatDeskTitleAr: 'نافذة الاستفسار — لوحة التشغيل',
  chatDeskReplyAr: 'الرد على العميل',
  shopKickerAr: 'واجهة العميل',
  shopTitleAr: 'أصناف اليوم',
  todayTitleAr: 'وصل اليوم',
  featuredTitleAr: 'الأكثر طلباً',
  shelfTitleAr: 'بقية الأصناف',
  checkoutTitleAr: 'إتمام الطلب',
  buyerNameLabelAr: 'الاسم',
  buyerPhoneLabelAr: 'رقم الجوال',
  buyerPlaceLabelAr: 'موقع التسليم',
  buyerNoteLabelAr: 'ملاحظة على الطلب',
  payCashAr: 'نقداً عند الاستلام',
  payCardAr: 'شبكة عند الاستلام',
  serviceDeliveryAr: 'توصيل داخل النطاق',
  servicePickupAr: 'استلام من الموقع',
  serviceComeAr: 'تعال',
  serviceComeLeadAr:
    'تسوق من العربة عند بابك أو عند موقع محدد. أرسل موقعك وفعّل تنبيه المتصفح ليصلك عند اقتراب السيارة.',
  comeNotifyRequiredAr: 'فعّل تنبيه المتصفح قبل إرسال تذكرة تعال.',
  comeNotifyDeniedAr: 'تعذر تفعيل التنبيه. اسمح بالإشعارات من المتصفح ثم أعد الإرسال.',
  comeNeedPlaceAr: 'حدد موقعك بزر تحديد موقعي ثم أكّد الموقع.',
  comeWatchingAr: 'بانتظار اقتراب السيارة. أبقِ الصفحة مفتوحة.',
  comeApproachingAr: 'السيارة اقتربت من موقعك.',
  comeSubmitAr: 'أرسل تذكرة تعال',
  saveBuyerAr: 'حفظ بيانات التسليم على هذا الجهاز لتسهيل الطلب القادم',
  submitOrderAr: 'إرسال الطلب',
  orderSentAr: 'وصل الطلب إلى لوحة التشغيل.',
  priceEstimateNoteAr: 'السعر المعروض تقديري حتى يؤكد صاحب النشاط توفر الأصناف والكمية.',
  locateMeAr: 'تحديد موقعي',
  locatingAr: 'جاري تحديد الموقع…',
  locateFailAr: 'تعذّر تحديد الموقع. أعد المحاولة بعد موافقة المتصفح.',
  locateDeniedAr: 'رُفض إذن الموقع. فعّله من إعدادات المتصفح.',
  locateSavedAr: 'حُفظ الموقع. اضغط «تأكيد الموقع» لرؤية الدبوس.',
  confirmPlaceAr: 'تأكيد الموقع',
  copyPlaceLinkAr: 'نسخ رابط الموقع',
  openPlaceLinkAr: 'فتح الموقع',
  deskPickupTitleAr: 'موقع النشاط',
  deskPickupLeadAr:
    'حدّد الموقع بعد موافقة المتصفح، ثم أبرزه للعميل أو أخفه. المسار المتحرك يحدّث الموقع من لوحة التشغيل بلا إضافة مدفوعة.',
  pickupShowAr: 'إبراز الموقع',
  pickupHideAr: 'إخفاء الموقع',
  pickupPlaceOpenAr: 'افتح الموقع',
  pickupPinAriaAr: 'موقع النشاط على الخريطة',
  deskTitleAr: 'لوحة التشغيل',
  liveOrdersAr: 'الطلبات الحية',
  whatsappReceiptAr: 'ملخص الطلب عبر واتساب',
  archiveCtaAr: 'تحميل الأرشيف',
  ingestTitleAr: 'مكتبة الأصناف',
  catalogTitleAr: 'مكتبة أصناف جاهزة',
  catalogLeadAr: 'فعّل الصنف وحدد سعره ووحدته: قطعة أو جرام أو مل أو علبة أو تولة.',
  activateAr: 'تفعيل الصنف',
  deactivateAr: 'إيقاف',
  photoUploadAr: 'صورة كل صنف',
  listIngestTitleAr: 'مراجعة قائمة مكتوبة أو مصوّرة',
  listIngestLeadAr: 'الصق أسماء وأسعاراً، أو أرفق صورة القائمة وراجع الصفوف قبل الحفظ.',
  listPhotoRefAr: 'مرجع شخصي أثناء الكتابة فقط — لا يُحفظ ولا يظهر للزبائن.',
  flashLabelAr: 'شريط وصل اليوم',
  flashHintAr: 'وصل اليوم: عود كمبودي ودهن فاخر حتى نفاذ الكمية',
  arrivedOnAr: 'وصل اليوم',
  arrivedOffAr: 'لم يصل',
  qrPhraseAr: 'امسح واطلب من جوالك. التوصيل أو الاستلام من الموقع.',
  qrPrintAr: 'طباعة ملصق QR',
  stockOnAr: 'متوفر',
  stockOffAr: 'نفد',
  soldOutAr: 'نفد',
  deskLinkAr: 'لوحة التشغيل',
  shopLinkAr: 'واجهة العميل',
  vendorPathTitleAr: 'نوع التشغيل الأولي',
  vendorPathLeadAr: 'النوعان مشمولان في المنتج، ويحدد هذا الاختيار الإعداد الأولي للصفحة.',
  vendorFixedAr: 'محل أو بسطة ثابتة',
  vendorMobileAr: 'عربة أو نشاط متحرك',
  termsFoldTriggerAr: 'اقرأ شروط الخدمة',
  termsFoldTitleAr: 'شروط الخدمة قبل الطلب',
  termsFoldBodyAr:
    'بخورنا1 واجهة طلب ولوحة تشغيل للمشغّل. طلب العميل نقداً أو شبكة عند التسليم. لا تحصيل سلة عبر ميسر. التفاصيل في شروط الخدمة.',
  labKickerAr: 'معاينة حيّة',
  labTitleAr: 'جرّب رحلة الطلب كما يراها العميل',
  labLeadAr:
    'تصفح أصناف اليوم، اختر الكميات، وحدد طريقة الاستلام والدفع، ثم شاهد كيف يصل الطلب إلى لوحة التشغيل.',
  labPreviewBadgeAr: 'معاينة تجريبية — لا تنشئ طلباً حقيقياً',
  labPreviewEnvAr: 'بيئة تجربة — الطلبات المرسلة هنا تجريبية ولا تُنفذ.',
  labDemoNameAr: 'عميل تجريبي',
  labDemoPhoneAr: '05XXXXXXXX',
  labDemoPlaceAr: 'موقع تجريبي داخل نطاق التوصيل',
  heroImage: '/images/store/bakhurna/gallery/01.jpg',
  heroCaptionAr: 'من محل البخور إلى جوال الحي',
  heroAltAr: 'بخور وعود من رفوف المحل جاهز للطلب من الجوال',
  checkoutClosedAr: 'بوابة الدفع غير مفتوحة لهذا المنتج بعد.',
  orderConsentAr:
    'أوافق على شروط الخدمة وسياسة الخصوصية، وأفهم أن المبلغ خاص باشتراك بخورنا1 ولا يشمل قيمة طلبات عملاء النشاط.',
  orderNoCollectAr: 'لا تتولى منصة خريطة الحل تحصيل قيمة سلة العميل أو تسوية المدفوعات بين المشغّل وعملائه.',
  orderSubmitAr: 'الانتقال إلى الدفع',
  shopNameLabelAr: 'اسم النشاط',
} as const;

export const STORE_BAKHURNA_LIVE_FEATURES = [
  {
    titleAr: 'شريط «وصل اليوم»',
    bodyAr: 'أبرز الأصناف التي وصلت حديثاً، وأخفِ النافد أو علّمه بوضوح حتى لا يطلبه العميل.',
  },
  {
    titleAr: 'وحدات بيع مرنة',
    bodyAr: 'بع الأصناف بالقطعة أو الجرام أو المل أو العلبة أو التولة، وحدّث السعر من لوحة التشغيل.',
    pulse: true,
  },
  {
    titleAr: 'نافذة الاستفسار',
    bodyAr: 'تتيح للعميل السؤال عن صنف أو إرسال ملاحظة مرتبطة بطلبه، دون تحويل الصفحة إلى دردشة عامة.',
  },
  {
    titleAr: 'نشاط ثابت أو متحرك',
    bodyAr: 'استخدم المنتج لمحل أو بسطة أو عربة، وحدّث الموقع أو أخفه من لوحة التشغيل.',
  },
  {
    titleAr: 'ملخص الطلب عبر واتساب',
    bodyAr: 'شارك ملخص الطلب، متضمناً الأصناف والكميات وبيانات التسليم، مع عامل التوصيل أو العميل.',
  },
  {
    titleAr: 'رمز QR',
    bodyAr: 'رمز مباشر يفتح واجهة الطلب من جوال العميل دون تثبيت تطبيق.',
  },
] as const;

export const STORE_BAKHURNA_LIVE_DEMO = {
  shopName: 'بخور الحي',
  hostName: 'المشغّل',
  blurbAr: 'معاينة واجهة الطلب — أصناف اليوم وأسعار محدثة.',
  customFields: [
    'مرحباً بكم. اطلبوا ما وصل اليوم من الجوال.',
    'التوصيل داخل النطاق حسب الاتفاق.',
    'الاستلام من الموقع متاح.',
    'الدفع نقداً أو شبكة عند الاستلام.',
    'الأصناف النافدة تُخفى تلقائياً.',
  ] as string[],
  flashAr: 'وصل اليوم: عود كمبودي ودهن فاخر حتى نفاذ الكمية',
} as const;

export const STORE_BAKHURNA_ITEM_IMAGES = [
  '/images/store/bakhurna/gallery/01.jpg',
  '/images/store/bakhurna/gallery/02.jpg',
  '/images/store/bakhurna/gallery/03.jpg',
  '/images/store/bakhurna/gallery/04.jpg',
  '/images/store/bakhurna/gallery/05.jpg',
  '/images/store/bakhurna/gallery/06.jpg',
  '/images/store/bakhurna/gallery/07.jpg',
  '/images/store/bakhurna/gallery/08.jpg',
  '/images/store/bakhurna/gallery/09.jpg',
  '/images/store/bakhurna/gallery/10.jpg',
  '/images/store/bakhurna/gallery/11.jpg',
  '/images/store/bakhurna/gallery/12.jpg',
  '/images/store/bakhurna/gallery/13.jpg',
  '/images/store/bakhurna/gallery/14.jpg',
  '/images/store/bakhurna/gallery/15.jpg',
  '/images/store/bakhurna/gallery/16.jpg',
  '/images/store/bakhurna/gallery/17.jpg',
  '/images/store/bakhurna/gallery/19.jpg',
  '/images/store/bakhurna/gallery/20.jpg',
  '/images/store/bakhurna/gallery/21.jpg',
  '/images/store/bakhurna/gallery/22.jpg',
  '/images/store/bakhurna/gallery/23.jpg',
  '/images/store/bakhurna/gallery/24.jpg',
] as const;

export function bakhurnaCatalogImage(index: number): string {
  return STORE_BAKHURNA_ITEM_IMAGES[index % STORE_BAKHURNA_ITEM_IMAGES.length] ?? STORE_BAKHURNA_ITEM_IMAGES[0];
}
