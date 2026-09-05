/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حلانا1 — مقر رقمي لمتخصصة الحلويات. لا تُستورد من App.
 * باقتان: 894 ر.س لـ180 يوماً، و1,788 ر.س لـ360 يوماً.
 * اشتراك المتخصصة عبر بوابة الدفع على www.halaqmap.com بوسم store_halana_live.
 * لا تحصيل من العميلة عبر المنصة.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';

export const STORE_HALANA_LIVE_PUBLIC_CATALOG = true as const;
export const STORE_HALANA_LIVE_PUBLIC_ENABLED = true as const;
export const STORE_HALANA_LIVE_PRODUCT = 'store_halana_live' as const;
export const STORE_HALANA_LIVE_DAYS_6 = 180 as const;
export const STORE_HALANA_LIVE_DAYS_12 = 360 as const;
export const STORE_HALANA_LIVE_PRICE_6_SAR = 894 as const;
export const STORE_HALANA_LIVE_PRICE_12_SAR = 1788 as const;
export const STORE_HALANA_LIVE_PRICE_6_HALALAS = 89400 as const;
export const STORE_HALANA_LIVE_PRICE_12_HALALAS = 178800 as const;

function envEnabled(name: string, fallback: boolean): boolean {
  const raw = String((import.meta as { env?: Record<string, unknown> }).env?.[name] ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  if (raw === 'true' || raw === '1' || raw === 'on') return true;
  return fallback;
}

export const STORE_HALANA_LIVE_CHECKOUT_ENABLED = envEnabled(
  'VITE_STORE_HALANA_LIVE_CHECKOUT_ENABLED',
  true,
);

export const STORE_HALANA_LIVE_ACCENT = '#c45c7a' as const;

export const STORE_HALANA_LIVE_PACKS = [
  {
    id: 'm6',
    months: 6,
    days: STORE_HALANA_LIVE_DAYS_6,
    priceSar: STORE_HALANA_LIVE_PRICE_6_SAR,
    priceHalalas: STORE_HALANA_LIVE_PRICE_6_HALALAS,
    titleAr: '180 يوماً',
    priceLineAr: '894 ر.س',
    lineAr: 'معرض الأعمال، وصفحة الطلب المخصص، ولوحة التشغيل، وملصق QR.',
  },
  {
    id: 'm12',
    months: 12,
    days: STORE_HALANA_LIVE_DAYS_12,
    priceSar: STORE_HALANA_LIVE_PRICE_12_SAR,
    priceHalalas: STORE_HALANA_LIVE_PRICE_12_HALALAS,
    titleAr: '360 يوماً',
    priceLineAr: '1,788 ر.س',
    lineAr: 'نفس التشغيل مع مدة أطول. خيار مدة فقط دون ميزة سعرية إضافية.',
  },
] as const;

export type StoreHalanaLivePackId = (typeof STORE_HALANA_LIVE_PACKS)[number]['id'];

export function parseHalanaPackId(raw: unknown): StoreHalanaLivePackId {
  return String(raw || '').trim() === 'm12' ? 'm12' : 'm6';
}

export function isHalanaPriceHalalas(raw: unknown): boolean {
  const amount = Math.trunc(Number(raw) || 0);
  return amount === STORE_HALANA_LIVE_PRICE_6_HALALAS || amount === STORE_HALANA_LIVE_PRICE_12_HALALAS;
}

export function halanaChargeHalalas(packId: StoreHalanaLivePackId): number {
  return packId === 'm12' ? STORE_HALANA_LIVE_PRICE_12_HALALAS : STORE_HALANA_LIVE_PRICE_6_HALALAS;
}

export function halanaDaysForPack(packId: StoreHalanaLivePackId): number {
  return packId === 'm12' ? STORE_HALANA_LIVE_DAYS_12 : STORE_HALANA_LIVE_DAYS_6;
}

export function halanaAffiliateCommissionSar(packId: StoreHalanaLivePackId): number {
  return packId === 'm12' ? 288 : 194;
}
export const STORE_HALANA_GALLERY_MAX = 12;
export const STORE_HALANA_YOUTUBE_MAX = 6;
export const STORE_HALANA_IMAGE_MAX_CHARS = 180_000;
export const STORE_HALANA_CAPTION_MAX = 180;
export const STORE_HALANA_ATMOSPHERE = {
  hero: '/images/store/halana/halana-hero-table.jpg',
  atelier: '/images/store/halana/halana-atelier-clear.jpg',
  fieldGlow: '/images/store/halana/halana-field-glow.jpg',
  goldDust: '/images/store/halana/halana-gold-dust.jpg',
  frame: '/images/store/halana/halana-ornate-frame.jpg',
  cake: '/images/store/halana/halana-cake-light.jpg',
} as const;

export const STORE_HALANA_REQUEST_STATUSES = [
  'new',
  'quoted',
  'awaiting_deposit',
  'confirmed',
  'preparing',
  'ready',
  'completed',
  'declined',
] as const;

export type StoreHalanaRequestStatus = (typeof STORE_HALANA_REQUEST_STATUSES)[number];

export const STORE_HALANA_LIVE_COPY = {
  documentTitle: 'حلانا1 — خريطة الحل',
  kickerAr: 'من معرض أعمالك إلى طلب مخصص وموعد مؤكّد',
  titleAr: 'حلانا1',
  leadAr:
    'مقر رقمي لمتخصصة الحلويات الخاصة؛ اعرضي أعمالك، واستقبلي تفاصيل المناسبة، وقدّمي عرض السعر، ثم ثبّتي الموعد بعد تأكيد العربون يدوياً. تحوّل العميلة العربون مباشرةً إلى وسيلة الدفع التي تحددينها، ولا تستلم خريطة الحل مبالغ عميلاتك.',
  problemTitleAr: 'من رسائل متفرقة إلى مقر رقمي للمتخصصة',
  problemBodyAr:
    'عميلة تسأل عن النكهة، وأخرى ترسل صورة للتغليف، وثالثة تطلب تعديل موعد التسليم. وعندما تختلط هذه التفاصيل بالمحادثات الشخصية، يصبح تتبع الطلب أكثر صعوبة.',
  problemCloseAr:
    'يجمع حلانا1 تفاصيل الطلب في مسار واحد: موعد التسليم، والعدد، والنوع، والنكهات والحشوات، ووصف التغليف، والصورة المرجعية. يصل الطلب منظماً إلى لوحتك، وتحددين السعر، ولا يصبح الموعد مؤكداً إلا بعد اعتمادك وصول العربون.',
  howTitleAr: 'كيف يعمل النظام؟',
  howSteps: [
    {
      titleAr: 'شاركي معرضك',
      bodyAr: 'أرسلي رابط المعرض أو اطبعي رمز QR وشاركيه مع عميلاتك.',
    },
    {
      titleAr: 'تتصفح العميلة الأعمال',
      bodyAr: 'تفتح العميلة المعرض من متصفح جوالها دون الحاجة إلى تثبيت تطبيق.',
    },
    {
      titleAr: 'ترسل طلبها المخصص',
      bodyAr: 'تحدد موعد التسليم، والعدد، والنوع، والنكهات والحشوات، وطريقة التغليف، وترفق صورة مرجعية عند الحاجة.',
    },
    {
      titleAr: 'تقدمين عرض السعر',
      bodyAr: 'تراجعين التفاصيل وتحددين السعر والمدة المطلوبة للتنفيذ.',
    },
    {
      titleAr: 'تحوّل العميلة العربون مباشرةً',
      bodyAr: 'تستخدم العميلة وسيلة الدفع التي تعرضينها، ثم ترفع إثبات التحويل المرتبط بالطلب.',
    },
    {
      titleAr: 'تعتمدين العربون وتثبتين الموعد',
      bodyAr: 'تتحققين من وصول العربون، وتعتمدينه من اللوحة، ثم يصبح الموعد مؤكداً.',
    },
  ],
  refDisclaimerAr:
    'الصورة المرجعية مخصصة للاسترشاد وتوضيح رغبة العميلة، ولا تعني الالتزام بنسخ التصميم حرفياً.',
  payTitleAr: 'دفع مباشر بين المتخصصة وعميلتها',
  payLeadAr:
    'اشتراك حلانا1 هو مقابل استخدام المعرض وصفحة الطلب ولوحة التشغيل. أما قيمة طلب الحلوى والعربون فتُدفع مباشرةً إلى المتخصصة باستخدام الوسائل التي تحددها، مثل التحويل البنكي أو الوسائل المباشرة المتاحة لديها.',
  payIndependenceAr:
    'لا تستلم خريطة الحل مبالغ عميلات المتخصصة، ولا تحتفظ بالعربون، ولا تؤكد حجز الموعد نيابةً عنها. تتولى المتخصصة التحقق من وصول المبلغ واعتماد الموعد من لوحة التشغيل.',
  payNoPlatformGateAr: 'لا توجد بوابة دفع تابعة لخريطة الحل داخل طلب العميلة.',
  payNoCommissionAr: 'لا عمولة على قيمة طلب العميلة.',
  featuresTitleAr: 'ما الذي يشمله حلانا1؟',
  pricingTitleAr: 'أسعار الاشتراك',
  pricingLeadAr: 'باقة 180 يوماً أو 360 يوماً. الباقة الأطول خيار مدة فقط دون ميزة سعرية إضافية.',
  pack6LineAr: '894 ر.س · 180 يوماً',
  pack12LineAr: '1,788 ر.س · 360 يوماً',
  scopeLineAr:
    'النسخة الحالية تركّز على الطلبات المخصصة. يمكن للمتخصصة إبراز أعمال جاهزة أو موسمية في المعرض عند توفرها.',
  statusOverviewAr:
    'حالات الطلب في اللوحة: طلب جديد، قيد التسعير، بانتظار العربون، الموعد مؤكّد، قيد التجهيز، جاهز للتسليم، مكتمل.',
  allergensLineAr:
    'يمكن للمتخصصة إظهار النكهات والمكونات ومسببات الحساسية التي تفصح عنها في المعرض أو سياسة الطلب.',
  changePolicyAr:
    'يمكن طلب تعديل النكهة أو اللون أو الشكل قبل بدء التجهيز وبحسب الوقت المتاح وموافقة المتخصصة.',
  privacyTitleAr: 'الخصوصية وإثباتات التحويل',
  privacyAr:
    'تُستخدم بيانات العميلة وإثبات التحويل لمعالجة الطلب ومتابعته فقط، وتظهر للمتخصصة المخولة بإدارة الطلب وفق سياسة الخصوصية. يُفترض الاحتفاظ بإثباتات التحويل للمدة اللازمة لمتابعة الطلب ثم حذفها أو أرشفتها وفق سياسة الخصوصية والتنفيذ الفعلي.',
  legalTitleAr: 'منتج من منظومة خريطة الحل',
  legalBodyAr:
    'حلانا1 منتج برمجي من متجر خريطة الحل. يمكن الاطلاع على بيانات توثيق المنشأة وروابط التحقق من صفحة «التوثيق والتحقق».',
  trustLinkAr: 'التوثيق والتحقق',
  trustHref: ROUTE_PATHS.STORE_TRUST,
  orderCtaLandingAr: 'اختاري باقة الاشتراك',
  tryCtaAr: 'شاهدي المعرض ولوحة التشغيل',
  termsFoldTriggerAr: 'اقرأ شروط الخدمة',
  termsFoldTitleAr: 'شروط الخدمة',
  termsFoldBodyAr:
    'حلانا1 معرض وطلب مخصص ولوحة للمتخصصة. 894 ر.س لـ180 يوماً، أو 1,788 ر.س لـ360 يوماً. لا تحصيل من العميلة عبر المنصة. العربون تحويل مباشر ثم اعتماد يدوي. التفاصيل في شروط الخدمة.',
  heroAltAr: 'معرض حلويات وطلب مخصص من الجوال',
  heroCaptionAr: 'من معرض أعمالك إلى طلب مخصص وموعد مؤكّد',
  checkoutClosedAr: 'بوابة الاشتراك غير مفتوحة لهذا المنتج بعد.',
  orderConsentAr:
    'أقرّ بقراءة شروط الخدمة والخصوصية، وأوافق على سداد قيمة اشتراكي في حلانا1 عبر بوابة الدفع التابعة لخريطة الحل. مدفوعات عميلاتي لا تستلمها خريطة الحل، وتتم مباشرةً بيني وبين العميلة وفق وسائل الدفع التي أحددها.',
  orderNoCollectAr: 'لا عمولة على قيمة طلب العميلة.',
  orderEmailLabelAr: 'البريد الإلكتروني المعتمد لاستلام روابط المعرض ولوحة التشغيل',
  orderSubmitAr: 'متابعة الدفع',
  orderRenewLeadAr: 'نفس روابط المعرض ولوحة التشغيل تُمدَّد بعد السداد.',
  orderNewLeadAr: 'بعد السداد واعتماد العملية، تُرسل الروابط إلى البريد المعتمد.',
  specialistNameLabelAr: 'اسم المتخصصة أو النشاط',
  showcaseKickerAr: 'أعمال المتخصصة',
  shopLeadAr:
    'اختاري من المعرض ثم اطلبي حلوى خاصة: موعد التسليم والعدد والنوع والحشوات. لا يصبح الموعد مؤكداً إلا بعد اعتماد العربون.',
  showcaseLeadAr: 'معرض أعمال المتخصصة: صور ووصف مكتوب ولقطات. ابدئي الطلب من الزر الظاهر أسفل الصفحة.',
  promoSectionAr: 'من المتخصصة',
  worksLeadAr: 'كل صورة عمل مكتمل، بوصف تكتبه المتخصصة من لوحتها.',
  promoTitleLabelAr: 'عنوان دعائي ظاهر في المعرض',
  promoBodyLabelAr: 'نص دعائي أو إعلاني، فقرات قصيرة',
  youtubeLabelAr: 'روابط يوتيوب: قناة أو لقطة، سطراً لكل رابط',
  youtubeTitleAr: 'لقطات من الأعمال',
  youtubeChannelAr: 'قناة المتخصصة',
  shareTitleAr: 'الرمز والقنوات',
  shareLeadAr: 'اطبعي الملصق أو افتحي كرت الجوال أو انشري رابط المعرض. الإرسال من جهازك.',
  qrPhraseAr: 'امسحي لمعرض الأعمال ثم اطلبي مسبقاً.',
  qrPrintAr: 'طباعة الملصق',
  passWhatsappAr: 'أرسل كرت الرمز على واتساب',
  instagramHintAr: 'لإنستغرام: انسخي النص ثم الصقيه في المنشور أو البايو مع صورة عمل.',
  shareCopyAr: 'انسخ النص الجاهز',
  shareCopiedAr: 'نُسخ النص.',
  shareCopyFailAr: 'تعذر النسخ. انسخي النص يدوياً.',
  shareWhatsappAr: 'واتساب',
  shareInstagramAr: 'إنستغرام',
  shareSnapAr: 'سناب',
  shareTiktokAr: 'تيك توك',
  shareTelegramAr: 'تلجرام',
  shareXAr: 'إكس',
  galleryCaptionSaveAr: 'حفظ الوصف',
  orderCtaAr: 'اطلبي حلوى خاصة',
  orderBackAr: 'العودة إلى المعرض',
  orderKickerAr: 'طلب تسعير',
  refWarnAr:
    'الصورة المرجعية للاسترشاد وتوضيح رغبة العميلة، ولا تعني الالتزام بنسخ التصميم حرفياً.',
  depositWarnAr:
    'لا يُثبَّت الموعد إلا بعد تحويل عربون الجدية واعتماد المتخصصة من اللوحة. أرسلي إثبات العملية المرتبط بهذا الطلب من صفحة الطلب، أو على واتساب إن تعذّر الرفع.',
  payInstructionsTitleAr: 'تعليمات التحويل',
  payInstructionsLeadAr:
    'التحويل إلى وسيلة المتخصصة مباشرة. خريطة الحل لا تستلم المبلغ ولا تؤكد وصوله نيابة عنها.',
  payWaitAr: 'بعد قبول عرض السعر تظهر هنا تعليمات التحويل لهذا الطلب فقط.',
  payBankAr: 'البنك',
  payBeneficiaryAr: 'اسم المستفيد',
  payIbanAr: 'الآيبان',
  payCopyIbanAr: 'نسخ بيانات التحويل',
  payProofAr: 'إثبات العملية المرتبط بهذا الطلب',
  payProofCtaAr: 'رفع الإثبات',
  payProofSavedAr: 'وُفع الإثبات. يصبح الموعد مؤكداً بعد اعتماد المتخصصة للعربون من اللوحة.',
  payProofHintAr: 'لا ترفعي كشف حساب كاملاً ولا رمز تحقق ولا بيانات دخول.',
  payCashAr: 'نقداً عند الاستلام للمتبقي',
  payNetworkAr: 'شبكة عند الاستلام للمتبقي',
  payDeskTitleAr: 'وسائل التحويل',
  payDeskLeadAr:
    'الآيبان لا يظهر في المعرض. يظهر بعد عرض السعر داخل الطلب. النقد والشبكة للمتبقي عند الاستلام.',
  paySaveAr: 'حفظ وسائل التحويل',
  paySavedAr: 'حُفظت وسائل التحويل.',
  payPublicBankAr: 'تحويل بنكي',
  payPublicCashAr: 'نقداً عند الاستلام',
  payPublicNetworkAr: 'شبكة عند الاستلام',
  pickupWarnAr:
    'إن تأخّر الاستلام أو التوصيل بعد جهوز الطلب فقد تتأثر الجودة، وذلك خارج عهدة المتخصصة إن كان الطلب جاهزاً في موعده.',
  changeWarnAr:
    'يمكن طلب تعديل النكهة أو اللون أو الشكل قبل بدء التجهيز وبحسب الوقت المتاح وموافقة المتخصصة.',
  formTitleAr: 'طلب حلوى خاصة',
  deliverAtAr: 'وقت الوصول المطلوب',
  quantityAr: 'العدد',
  sweetTypeAr: 'النوع',
  fillingsAr: 'الحشوات المفضلة',
  refNoteAr: 'وصف التغليف أو الصينية أو الترتيب',
  guestNameAr: 'الاسم',
  guestWhatsappAr: 'واتساب للتواصل',
  submitAr: 'إرسال طلب التسعير',
  sentAr: 'وصل الطلب. المتخصصة تراجعه ثم ترسل عرض السعر.',
  flavorsTitleAr: 'النكهات المتوفرة',
  policyTitleAr: 'سياسة الطلب المسبق',
  readyTitleAr: 'جاهز لتاريخ معيّن',
  quotesTitleAr: 'آراء تختارها المتخصصة',
  galleryTitleAr: 'أعمال المتخصصة',
  galleryEmptyAr: 'ستظهر أعمال المتخصصة هنا بعد رفع الصور من اللوحة.',
  galleryDeskTitleAr: 'صور المنتجات المعروضة للعميلات',
  galleryDeskLeadAr: 'ارفعي صور أعمالك واكتبي وصف كل عمل. تظهر في الصفحة الرئيسية التي توجّهين إليها العميلات، بلا وصفات.',
  galleryUploadAr: 'رفع صورة منتج',
  galleryCaptionAr: 'وصف مختصر اختياري',
  galleryRemoveAr: 'إخفاء',
  galleryFullAr: 'بلغت الصور الحد الأعلى.',
  deskTitleAr: 'لوحة حلانا1',
  deskLeadAr: 'طلبات التسعير، عرض السعر، ثم اعتماد العربون وتثبيت الموعد.',
  quoteCtaAr: 'إرسال عرض السعر',
  depositCtaAr: 'اعتماد العربون وتثبيت الموعد',
  whatsappCtaAr: 'واتساب من الجهاز',
  whatsappLineAr:
    'تُفتح رسالة المتابعة الجاهزة في واتساب المتخصصة، ولا تُرسل إلا بعد اعتمادها.',
  webLineAr:
    'بعد نجاح سداد الاشتراك تصل روابط المعرض واللوحة إلى البريد المعتمد.',
  issueTitleAr: 'إصدار حلانا1',
  issueLeadAr: 'إصدار تشغيلي بالاسم والبريد. اشتراك المتخصصة على نفس الصفحة. لا تحصيل من العميلة عبر المنصة.',
  issueNameAr: 'اسم المتخصصة',
  issueEmailAr: 'البريد',
  issueCtaAr: 'إصدار النسخة وإرسال الروابط',
  issuedAr: 'أُرسلت روابط الصفحة واللوحة إلى البريد.',
  statusAr: {
    new: 'طلب جديد',
    quoted: 'قيد التسعير',
    awaiting_deposit: 'بانتظار العربون',
    confirmed: 'الموعد مؤكّد',
    preparing: 'قيد التجهيز',
    ready: 'جاهز للتسليم',
    completed: 'مكتمل',
    declined: 'اعتذار',
  } as const,
} as const;

export const STORE_HALANA_DEFAULT_POLICY_AR =
  'يُطلب الطلب مسبقاً. يُثبَّت الموعد بعد عربون جدية بصورة تحويل بنكي واعتماد يدوي. التعديل في النكهة أو الشكل أو اللون قبل التجهيز فقط. الجودة بعد تأخر الاستلام أو المندوب خارج العهدة إن جهز الطلب في موعده.';

export const STORE_HALANA_DEFAULT_FLAVORS_AR = 'فانيليا\nشوكولاتة\nفستق\nتمر';

export const STORE_HALANA_LIVE = STORE_HALANA_LIVE_COPY;

export const STORE_HALANA_LIVE_FEATURES = [
  {
    titleAr: 'معرض أعمال',
    bodyAr: 'صور ترفعها المتخصصة من اللوحة، ونصوص دعائية، ولقطات يوتيوب تظهر في صفحة المعرض.',
  },
  {
    titleAr: 'طلب مخصص منفصل',
    bodyAr: 'موعد التسليم والعدد والنوع والحشوات ووصف التغليف. لا يُثبَّت الموعد عند الإرسال.',
    pulse: true,
  },
  {
    titleAr: 'عربون باعتماد يدوي',
    bodyAr: 'تعليمات تحويل تحددها المتخصصة. إثبات التحويل لا يؤكد الموعد حتى تعتمديه من اللوحة.',
  },
  {
    titleAr: 'حالات طلب واضحة',
    bodyAr: 'من طلب جديد إلى مكتمل، بما فيها بانتظار العربون والموعد المؤكّد وقيد التجهيز.',
  },
  {
    titleAr: 'ملصق ومشاركة من الجهاز',
    bodyAr: 'رمز QR للطباعة، وكرت للجوال، ونص جاهز للقنوات. الإرسال من جهاز المتخصصة.',
  },
] as const;
