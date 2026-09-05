/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تموينات الحي — متجر حي ولوحة كاشير. لا يُستورد من App.
 * باقتان ثابت: 599/180 يوماً و899/365 يوماً. متحرك: 799/1250.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';

export const STORE_GROCERS_LIVE_PUBLIC_ENABLED = true;

export const STORE_GROCERS_LIVE_LAB_TOKEN = 'grocers-lab' as const;

export const STORE_GROCERS_LIVE_PRODUCT = 'store_grocers_live' as const;

export const STORE_GROCERS_LIVE_DAYS_6 = 180 as const;
export const STORE_GROCERS_LIVE_DAYS_12 = 365 as const;
export const STORE_GROCERS_TRIAL_DAYS = 60 as const;
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
    titleAr: 'تمديد 180 يوماً',
    priceLineAr: '599 ر.س',
    lineAr: 'واجهة العميل ولوحة الكاشير وملصق QR على المسار الثابت.',
  },
  {
    id: 'm12',
    months: 12,
    days: STORE_GROCERS_LIVE_DAYS_12,
    priceSar: STORE_GROCERS_LIVE_PRICE_12_SAR,
    priceHalalas: STORE_GROCERS_LIVE_PRICE_12_HALALAS,
    titleAr: 'تمديد 365 يوماً',
    priceLineAr: '899 ر.س',
    lineAr: 'نفس التشغيل مع مدة أطول على المسار الثابت.',
  },
] as const;

export type StoreGrocersLivePackId = (typeof STORE_GROCERS_LIVE_PACKS)[number]['id'];

export const STORE_GROCERS_EXTENSION_PRICING = [
  {
    modeAr: 'محل ثابت',
    days6Ar: '180 يوماً',
    price6Sar: STORE_GROCERS_LIVE_PRICE_6_SAR,
    days12Ar: '365 يوماً',
    price12Sar: STORE_GROCERS_LIVE_PRICE_12_SAR,
  },
  {
    modeAr: 'عربة متحركة',
    days6Ar: '180 يوماً',
    price6Sar: 799,
    days12Ar: '365 يوماً',
    price12Sar: 1250,
  },
] as const;

export const STORE_GROCERS_LIVE = {
  documentTitle: 'تمويناتا1 — خريطة الحل',
  kickerAr: 'من جوال العميل إلى باب البيت',
  titleAr: 'تمويناتا1',
  hookAr: 'ينقلك من انتظار طلبات الحي… إلى استقبالها من جوالاتهم.',
  leadAr:
    'مقر رقمي متخصص للبقالات والتموينات المحلية؛ يعرض السلع والأسعار وحالة التوفر، ويستقبل طلبات التوصيل أو الاستلام من جوال العميل، مع لوحة كاشير لتنظيم الطلبات وتجهيزها.',
  valueLineAr:
    'ينشئ العميل طلبه بنفسه، ويصل مكتوباً ومنظماً إلى لوحة الكاشير بدلاً من إملائه عبر مكالمة أو رسالة صوتية.',
  tryCtaAr: 'شاهد المعاينة',
  trialCtaAr: 'اطلب تجربة تمويناتا1',
  trialTitleAr: 'جرّب تمويناتا1 قبل أن تشتري',
  trialLeadAr:
    'قدّم طلب تجربة المنتج لمدة 60 يوماً. تراجع الإدارة الطلب، وعند اعتماده تُرسل روابط المنتج إلى البريد المسجل، وتبدأ مدة التجربة من تاريخ فتح الصفحة.',
  extensionTitleAr: 'باقات التمديد بعد التجربة',
  extensionLeadAr:
    'اختر نوع التشغيل والمدة. يشمل المسار المتحرك تحديث موقع العربة من لوحة الكاشير بلا إضافة مدفوعة. إضافة قناة الاستفسار متاحة على المسار الثابت فقط.',
  extensionTableHeadModeAr: 'نوع التشغيل',
  extensionTableHeadTerm1Ar: 'المدة الأولى',
  extensionTableHeadTerm2Ar: 'المدة الثانية',
  orderTitleAr: 'مدّد اشتراك تمويناتا1',
  orderLeadAr:
    'بعد انتهاء التجربة، اختر نوع التشغيل ومدة التمديد. عند اكتمال السداد واعتماد العملية، تُرسل الروابط إلى البريد المسجل.',
  orderDirectAr: 'يمكنك أيضاً شراء الاشتراك مباشرة دون المرور بالتجربة.',
  orderCtaAr: 'باقات التمديد',
  problemTitleAr: 'بين دفتر الأسعار ورسائل الطلبات',
  problemBodyAr:
    'يسأل العميل عن توفر السلعة وسعرها، ثم يرسل بقية طلبه في رسائل متفرقة. وسط زحام المحل قد يُنسى صنف، أو يُذكر سعر قديم، أو يتأخر الرد، بينما ينتظر العميل معرفة ما هو متوفر قبل أن يطلب.',
  problemCloseAr:
    'تمويناتا1 يمنح المحل واجهة رقمية تعرض السلع والأسعار، وتحوّل اختيار العميل إلى طلب واضح يصل مباشرة إلى لوحة الكاشير.',
  problemNoCommissionAr: 'يمنح تموينات الحي تجربة طلب رقمية واضحة دون وسيط أو عمولة على قيمة السلة.',
  solutionTitleAr: 'واجهة للعميل ولوحة تشغيل للكاشير',
  solutionBodyAr:
    'يحدّث صاحب التموينات السلع والأسعار وحالة التوفر من لوحة الكاشير، ويشارك رابط المتجر أو رمز QR مع عملائه. يختار العميل مقاضيه وطريقة الاستلام والدفع، ثم يصل الطلب منظماً إلى اللوحة.',
  howTitleAr: 'كيف يعمل النظام؟',
  howSteps: [
    {
      titleAr: 'جهّز سلع المتجر',
      bodyAr: 'اختر السلع من المكتبة الجاهزة، أو أضف قائمتك، ثم راجع الأسعار والتوفر قبل النشر.',
    },
    {
      titleAr: 'شارك رابط الطلب',
      bodyAr: 'ضع رمز QR على واجهة المحل أو الأكياس، أو شارك الرابط مباشرة مع سكان الحي.',
    },
    {
      titleAr: 'يختار العميل مقاضيه',
      bodyAr: 'يتصفح العميل السلع من جواله دون تثبيت تطبيق، ويحدد الأصناف والكميات.',
    },
    {
      titleAr: 'يحدد طريقة الاستلام',
      bodyAr: 'يختار التوصيل أو الاستلام من المحل، ويضيف موقعه وطريقة الدفع عند الاستلام.',
    },
    {
      titleAr: 'يصل الطلب إلى الكاشير',
      bodyAr: 'يظهر الطلب في لوحة الكاشير متضمناً الأصناف والكميات والإجمالي وبيانات التسليم، ويمكن مشاركة ملخصه مع عامل التوصيل عبر واتساب.',
    },
  ],
  ingestLineAr:
    'تضم مكتبة السلع أصنافاً شائعة في التموينات، ويمكن تفعيلها والبحث فيها وتحديث أسعارها وتوفرها. كما يمكن إدخال قائمة أسعار ومراجعتها قبل الحفظ.',
  catalogCountLineAr: 'مكتبة تضم أكثر من 200 سلعة جاهزة للتفعيل.',
  hoursLineAr:
    'يتحكم صاحب التموينات في حالة المحل وساعات العمل والعروض الظاهرة. ويمكنه إخفاء السلعة عند نفادها، أو تفعيل الطلب المسبق أثناء الإغلاق إذا كان يرغب في استقبال طلبات الدوام التالي.',
  presenceLineAr:
    'مؤشر إجمالي مجهول الهوية يوضح عدد من يفتحون واجهة الطلب في اللحظة نفسها، دون عرض أسمائهم أو أرقام جوالاتهم. يظهر في اللوحة بعنوان «الزوار النشطون الآن».',
  payTitleAr: 'طلبات مباشرة دون عمولة على قيمة السلة',
  payIndependenceAr:
    'لا تتولى خريطة الحل تحصيل قيمة طلبات عملاء التموينات، ولا تفرض عمولة على السلة. تكون العلاقة المالية مباشرة بين صاحب التموينات وعميله، ويكون الدفع نقداً أو عبر الشبكة عند التسليم أو الاستلام، بحسب الخيارات التي يتيحها المحل.',
  payFeeLineAr: 'رسوم تمويناتا1 هي مقابل تشغيل المنتج السحابي وواجهة العميل ولوحة الكاشير فقط.',
  featuresTitleAr: 'ما الذي يقدمه تمويناتا1؟',
  chatAddonTitleAr: 'إضافة اختيارية: قناة استفسار مباشرة',
  chatAddonLeadAr:
    'تتيح للعميل إرسال سؤال أو استفسار خاص إلى لوحة الكاشير، ويستطيع صاحب التموينات الرد عليه من اللوحة. المحادثة خاصة بين الطرفين وليست غرفة عامة.',
  chatAddonPrice6Ar: '299 ر.س مع اشتراك 180 يوماً.',
  chatAddonPrice12Ar: '499 ر.س مع اشتراك 365 يوماً.',
  chatAddonCheckboxAr: 'إضافة قناة الاستفسار المباشر',
  chatAddonDetailsAr: 'عرض التفاصيل',
  chatBuyerTitleAr: 'قناة الاستفسار',
  chatBuyerHintAr: 'اكتب سؤالاً أو استفساراً خاصاً. ليست غرفة عامة.',
  chatBuyerSendAr: 'إرسال الاستفسار',
  chatDeskTitleAr: 'قناة الاستفسار — لوحة الكاشير',
  chatDeskReplyAr: 'الرد على العميل',
  legalTitleAr: 'منتج من منظومة خريطة الحل',
  legalBodyAr:
    'تمويناتا1 منتج من منظومة خريطة الحل. متجر خريطة الحل موثّق لدى المركز السعودي للأعمال، ويمكن الاطلاع على بيانات المنشأة وروابط التحقق من صفحة «التوثيق والتحقق».',
  legalCertAr:
    'تمويناتا1 مصنف برمجي مسجل لدى الهيئة السعودية للملكية الفكرية، برقم شهادة 26-12-103276933.',
  legalPrivacyAr:
    'تُعالج بيانات المشغّل والعميل وفق سياسة الخصوصية المنشورة ولأغراض تشغيل الخدمة والطلبات المرتبطة بها.',
  trustLinkAr: 'التوثيق والتحقق',
  trustHref: ROUTE_PATHS.STORE_TRUST,
  shopKickerAr: 'واجهة العميل',
  shopTitleAr: 'مقاضيك للبيت',
  featuredTitleAr: 'الأكثر طلباً',
  shelfTitleAr: 'بقية الرف',
  checkoutTitleAr: 'إتمام الطلب',
  buyerNameLabelAr: 'الاسم',
  buyerPhoneLabelAr: 'رقم الجوال',
  buyerPlaceLabelAr: 'موقع التسليم',
  buyerFacadeLabelAr: 'صورة اختيارية لموضع التسليم أو معلم قريب',
  buyerFacadeHintAr: 'تُرفق بموافقتك لتسهيل الوصول في هذا الطلب.',
  serviceDeliveryAr: 'توصيل داخل النطاق',
  servicePickupAr: 'استلام من المحل',
  payCashAr: 'نقداً عند الاستلام',
  payCardAr: 'شبكة عند الاستلام',
  saveBuyerAr: 'حفظ بيانات التسليم على هذا الجهاز لتسهيل الطلب القادم',
  submitOrderAr: 'إرسال الطلب',
  orderSentAr: 'يظهر الطلب في لوحة الكاشير بعد إرساله.',
  locateMeAr: 'تحديد موقعي',
  locatingAr: 'جاري تحديد الموقع…',
  locateFailAr: 'تعذّر تحديد الموقع. أعد المحاولة بعد موافقة المتصفح.',
  locateDeniedAr: 'رُفض إذن الموقع. فعّله من إعدادات المتصفح.',
  locateSavedAr: 'تم تحديد الموقع بنجاح.',
  confirmPlaceAr: 'تأكيد الموقع',
  copyPlaceLinkAr: 'نسخ رابط الموقع',
  openPlaceLinkAr: 'فتح الموقع',
  deskPickupTitleAr: 'موقع التموينات',
  deskPickupLeadAr:
    'حدّد الموقع من الإعداد الأول بعد موافقة المتصفح، ثم أبرزه لجار الحي أو أخفه. المخفي لا يظهر في صفحة الطلب.',
  pickupShowAr: 'إبراز الموقع',
  pickupHideAr: 'إخفاء الموقع',
  pickupPlaceOpenAr: 'فتح الموقع',
  pickupPinAriaAr: 'موقع التموينات على الخريطة',
  deskTitleAr: 'لوحة الكاشير',
  liveOrdersAr: 'الطلبات الحية',
  whatsappReceiptAr: 'ملخص الطلب عبر واتساب',
  archiveCtaAr: 'تحميل الأرشيف',
  ingestTitleAr: 'مكتبة السلع',
  catalogTitleAr: 'مكتبة سلع جاهزة',
  catalogLeadAr: 'فعّل السلعة وحدّد سعرها. ابحث بالاسم أو الفئة.',
  activateAr: 'تفعيل السلعة',
  deactivateAr: 'إيقاف',
  listIngestTitleAr: 'مراجعة قائمة مكتوبة',
  listIngestLeadAr: 'الصق أسماء وأسعاراً، وراجع الصفوف قبل الحفظ.',
  flashLabelAr: 'ساعة العروض',
  flashHintAr: 'عرض اليوم: كرتون مياه بسعر خاص حتى الساعة 10 مساءً',
  qrPhraseAr: 'اطلب مقاضيك من جوالك، وحدد موقع التسليم أو اختر الاستلام من المحل.',
  qrPrintAr: 'طباعة ملصق QR',
  stockOnAr: 'متوفر',
  stockOffAr: 'نفد',
  deskLinkAr: 'لوحة الكاشير',
  shopLinkAr: 'واجهة العميل',
  vendorPathTitleAr: 'نوع التشغيل',
  vendorPathLeadAr: 'يحدد هذا الاختيار سعر التمديد وإعداد الصفحة الأولي.',
  vendorFixedAr: 'محل ثابت',
  vendorMobileAr: 'عربة متنقلة',
  vendorMobilePriceNoteAr:
    'تحديث موقع العربة من لوحة الكاشير مشمول ضمن سعر باقة التشغيل المتحرك.',
  termsFoldTriggerAr: 'اقرأ شروط الخدمة',
  termsFoldTitleAr: 'شروط الخدمة قبل الطلب',
  termsFoldBodyAr:
    'تمويناتا1 واجهة طلب ولوحة كاشير. المسار الثابت: 599 ر.س لـ180 يوماً، أو 899 ر.س لـ365 يوماً. المسار المتحرك: 799 ر.س لـ180 يوماً، أو 1250 ر.س لـ365 يوماً. قناة الاستفسار إضافة على المسار الثابت: 299 أو 499 ر.س. طلب العميل نقداً أو شبكة عند التسليم. لا تحصيل سلة عبر ميسر.',
  labKickerAr: 'معاينة حيّة',
  labTitleAr: 'جرّب رحلة الطلب كما يراها العميل',
  labLeadAr:
    'تصفح السلع، اختر الكميات وطريقة الاستلام، ثم شاهد كيف يظهر الطلب في لوحة الكاشير.',
  labPreviewBadgeAr: 'بيئة تجريبية — البيانات والطلبات المعروضة ليست حقيقية',
  labPreviewEnvAr: 'معاينة تجريبية — لا تنشئ طلباً حقيقياً.',
  labDemoNameAr: 'عميل تجريبي',
  labDemoPhoneAr: '05XXXXXXXX',
  labDemoPlaceAr: 'موقع تجريبي داخل نطاق التوصيل',
  labDeskMaskedNameAr: 'عميل تجريبي',
  labDeskMaskedPhoneAr: '05XXXXXXXX',
  labDeskMaskedPlaceAr: 'موقع تجريبي',
  heroImage: '/images/store/grocers-hero-marketing.jpg',
  heroAltAr: 'رف تموينات حي بسلع يومية جاهزة للطلب من الجوال',
  heroCaptionAr: 'من جوال العميل إلى باب البيت',
  checkoutClosedAr: 'بوابة الدفع غير مفتوحة لهذا المنتج بعد.',
  orderConsentAr:
    'أوافق على شروط الخدمة وسياسة الخصوصية، وأفهم أن المبلغ خاص باشتراك تمويناتا1 ولا يشمل قيمة طلبات عملاء المحل.',
  orderNoCollectAr:
    'لا تتولى خريطة الحل تحصيل قيمة طلبات العملاء أو التسوية المالية بين صاحب النشاط وعملائه.',
  orderScopeAr: 'هذا الاشتراك خاص بتمويناتا1 ولا يشمل منتجات أو خدمات أخرى من خريطة الحل.',
  orderSubmitAr: 'الانتقال إلى الدفع',
  shopNameLabelAr: 'اسم المحل أو النشاط',
  summaryProductAr: 'المنتج',
  summaryVendorAr: 'نوع التشغيل',
  summaryTermAr: 'مدة الاشتراك',
  summaryChatAr: 'إضافة الاستفسار',
  summaryTotalAr: 'الإجمالي',
  summaryChatOnAr: 'مشمولة',
  summaryChatOffAr: 'غير مشمولة',
  presenceDeskLabelAr: 'الزوار النشطون الآن',
} as const;

export const STORE_GROCERS_LIVE_FEATURES = [
  {
    titleAr: 'مكتبة سلع جاهزة',
    bodyAr: 'فعّل السلع الشائعة وحدّث صورها وأسعارها وحالة توفرها من لوحة الكاشير.',
  },
  {
    titleAr: 'لوحة كاشير وتنبيهات الطلبات',
    bodyAr: 'استقبل الطلبات منظمة، وراجع الأصناف والكميات وبيانات التسليم، ثم شارك ملخص التوصيل عند الحاجة.',
    pulse: true,
  },
  {
    titleAr: 'واجهة تسوق ميسرة',
    bodyAr: 'يتصفح العميل السلع، ويحدد الكميات، ويشاهد الإجمالي، ثم يختار التوصيل أو الاستلام.',
  },
  {
    titleAr: 'طرق الاستلام والدفع',
    bodyAr: 'يحدد المحل التوصيل أو الاستلام، ويختار العميل الدفع نقداً أو عبر الشبكة عند التسليم.',
  },
  {
    titleAr: 'إدارة التوفر والعروض',
    bodyAr: 'أخفِ السلعة عند نفادها، وحدّث عرض اليوم والرسائل الظاهرة في واجهة العملاء.',
  },
  {
    titleAr: 'رمز QR للمحل',
    bodyAr: 'رمز جاهز للطباعة يفتح واجهة الطلب من جوال العميل دون تثبيت تطبيق.',
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
  shopName: 'تموينات النخيل — متجر تجريبي',
  hostName: 'الإدارة',
  blurbAr: 'معاينة تجريبية لطلب مقاضي الحي من الجوال.',
  customFields: [
    'حياكم الله، الطلب من الجوال يختصر الوقوف عند الرف.',
    'التوصيل داخل الحي خلال ساعة في أوقات الدوام.',
    'الدفع نقداً أو شبكة عند الاستلام.',
    'إن نفد صنف نخبّئه فوراً حتى لا يُطلب.',
    'شكراً لثقتكم.',
  ] as string[],
  flashAr: 'عرض اليوم: كرتون مياه بـ 14 ر.س حتى الساعة 10 مساءً',
} as const;

/** أسماء عامة للمعاينة — بلا علامات تجارية */
export const STORE_GROCERS_LAB_SHELF_NAMES: Record<string, string> = {
  'dairy-1': 'حليب طازج 2 لتر',
  'dairy-6': 'حليب طويل الأجل 1 لتر',
  'bread-1': 'خبز توست أبيض',
  'water-7': 'كرتون مياه',
  'cheese-1': 'جبنة فيتا',
  'rice-1': 'أرز بسمتي',
  'clean-1': 'مسحوق غسيل',
  'egg-1': 'مناديل ورقية',
  'juice-1': 'عصير برتقال',
  'tea-1': 'شاي أحمر',
  'oil-1': 'زيت ذرة',
  'can-7': 'تونة معلبة',
  'snack-3': 'شيبس',
  'fresh-2': 'طماطم',
  'fresh-9': 'موز',
};

export const STORE_GROCERS_ITEM_IMAGES = [
  '/images/store/grocers/grocers-01.jpg',
  '/images/store/grocers/grocers-02.jpg',
  '/images/store/grocers/grocers-03.jpg',
  '/images/store/grocers/grocers-04.jpg',
  '/images/store/grocers/grocers-05.jpg',
  '/images/store/grocers/grocers-06.jpg',
  '/images/store/grocers/grocers-07.jpg',
  '/images/store/grocers/grocers-08.jpg',
] as const;

export function grocersCatalogImage(index: number): string {
  return STORE_GROCERS_ITEM_IMAGES[index % STORE_GROCERS_ITEM_IMAGES.length] ?? STORE_GROCERS_ITEM_IMAGES[0];
}
