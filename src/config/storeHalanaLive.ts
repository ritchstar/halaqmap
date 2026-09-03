/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حلانا1 — مقر رقمي لمتخصصة الحلويات. لا تُستورد من App.
 * باقتان: 894 ر.س لمئة وثمانين يوماً، و1788 ر.س لثلاثمئة وستين يوماً.
 * اشتراك المتخصصة عبر ميسر على www.halaqmap.com بوسم store_halana_live.
 * لا تحصيل من العميلة عبر ميسر.
 */
import {
  LEGAL_ECOMMERCE_AUTH_NUMBER,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
} from '@/config/partnerLegal';

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
    titleAr: 'باقة مئة وثمانين يوماً',
    priceLineAr: '894 ر.س لمئة وثمانين يوماً',
    lineAr: 'المعرض وصفحة الطلب ولوحة المتخصصة تُجهَّز بعد السداد.',
  },
  {
    id: 'm12',
    months: 12,
    days: STORE_HALANA_LIVE_DAYS_12,
    priceSar: STORE_HALANA_LIVE_PRICE_12_SAR,
    priceHalalas: STORE_HALANA_LIVE_PRICE_12_HALALAS,
    titleAr: 'باقة ثلاثمئة وستين يوماً',
    priceLineAr: '1788 ر.س لثلاثمئة وستين يوماً',
    lineAr: 'مدة أطول لنفس المعرض واللوحة وصفحة الطلب.',
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
  kickerAr: 'من معرض الأعمال إلى طلب مخصص، ثم إلى تأكيد العربون',
  titleAr: 'حلانا1',
  problemTitleAr: 'من رسائل متفرقة إلى مقر رقمي للمتخصصة',
  problemBodyAr:
    'طلب يسأل عن النكهة، وآخر يرسل صورة تغليف، وثالث يغيّر الموعد بعد بدء التجهيز. كل هذا يختلط مع محادثات المتخصصة الشخصية. حلانا1 يفتح معرض أعمال وصفحة طلب منفصلة ولوحة تشغيل: الوقت والعدد والنوع والحشوات تصل مكتوبة، والموعد لا يُقفل إلا بعد عربون تعتمده المتخصصة بنفسها.',
  solutionTitleAr: 'حلانا1: مقر رقمي لمتخصصة الحلويات الخاصة',
  leadAr:
    'معرض أعمال توجّهين إليه العميلات، وصفحة طلب مخصص، ولوحة لعرض السعر ثم تأكيد العربون يدوياً. التحويل إلى وسيلة تملكينها. خريطة الحل لا تستلم مبلغ العميلة ولا تقفل الموعد نيابة عنك.',
  howTitleAr: 'كيف يعمل النظام؟',
  howLeadAr: 'بخطوات واضحة، بلا تطبيق يُثبَّت.',
  howSteps: [
    'تُطبع ملصق QR أو يُرسل رابط المعرض من جهاز المتخصصة.',
    'تفتح العميلة المعرض من متصفح جوالها، ثم تطلب من أيقونة أسفل الصفحة.',
    'تكتب وقت الوصول والعدد والنوع والحشوات ووصف التغليف أو الصينية.',
  ],
  howTicketLeadAr: 'يصل طلب التسعير إلى اللوحة، ثم تعرض المتخصصة السعر. بعد التحويل:',
  ticketItems: [
    'ترفع العميلة إثبات العملية المرتبطة بهذا الطلب.',
    'تعتمد المتخصصة العربون من اللوحة فُيقفل الموعد.',
    'النقد أو الشبكة للمتبقي عند الاستلام إن فعّلتهما المتخصصة.',
  ],
  whatsappLineAr:
    'المذكرة تُفتح من واتساب جهاز المتخصصة. القرار والإرسال بيدها، وليس إرسالاً آلياً من الخادم.',
  webLineAr:
    'النظام ويب بالكامل. بعد نجاح سداد الاشتراك تصل روابط المعرض واللوحة إلى البريد. لا تحصيل من العميلة عبر المنصة.',
  subscribePayTitleAr: 'بدون عمولة على طلب العميلة',
  payIndependenceAr:
    'اشتراك حلانا1 رسوم تشغيل الصفحة. لا عمولة على قيمة الطلب، ولا ميسر على سلة العميلة، ولا عربون آلي.',
  featuresTitleAr: 'تشمل الصفحة',
  priceTitleAr: 'الأسعار',
  priceLineAr: 'باقة مئة وثمانين يوماً: 894 ر.س – باقة ثلاثمئة وستين يوماً: 1788 ر.س',
  durationLineAr: 'لا تحصيل من العميلة عبر المنصة، ولا عمولة على قيمة الطلب.',
  legalTitleAr: 'منتج من منشأة موثّقة نظامياً',
  legalLeadBeforeAr: 'حلانا1 من متجر خريطة الحل ',
  legalLeadAfterAr: `، وهو مؤسسة موثّقة نظامياً في المملكة العربية السعودية. الرقم الوطني الموحد ${LEGAL_NATIONAL_UNIFIED_NUMBER}، ورقم توثيق التجارة الإلكترونية ${LEGAL_ECOMMERCE_AUTH_NUMBER}. تعمل ضمن الأنظمة السعودية ومبادئ حماية البيانات الشخصية.`,
  privacyAr:
    'بيانات العميلة لتنفيذ الطلب فقط، وتُحفظ على جهازها إن وافقت، ولا دفتر زبائن لدى المنصة.',
  startTitleAr: 'ابدئي بخطوة واحدة',
  closeAr:
    'معرض، وطلب مخصص، ولوحة تعتمدين منها العربون. اختاري باقتك الآن. لا تُذكر التجربة في هذه الصفحة.',
  orderCtaLandingAr: 'اختاري باقتك الآن',
  tryCtaAr: 'شاهدِ المعرض ولوحة التشغيل',
  termsFoldTriggerAr: 'اقرأ شروط الخدمة',
  termsFoldTitleAr: 'شروط الخدمة',
  termsFoldBodyAr:
    'حلانا1 معرض وطلب مخصص ولوحة للمتخصصة. 894 ر.س لمئة وثمانين يوماً، أو 1788 ر.س لثلاثمئة وستين يوماً. لا تحصيل من العميلة عبر المنصة. العربون صورة تحويل ثم تأكيد يدوي. التفاصيل في شروط الخدمة.',
  heroAltAr: 'معرض حلويات خاصة وطلب مخصص من الجوال',
  heroCaptionAr: 'من معرض الأعمال إلى طلب مخصص، ثم إلى تأكيد العربون',
  checkoutClosedAr: 'بوابة الاشتراك غير مفتوحة لهذا المنتج بعد.',
  orderConsentAr:
    'قرأت شروط الخدمة وأوافق على تحصيل باقة حلانا1 عبر بوابة الدفع بالمبلغ المعروض. لا تحصيل من العميلة غير تحويل تعتمده المتخصصة أو نقد وشبكة عند الاستلام.',
  orderSubmitAr: 'الانتقال إلى الدفع',
  specialistNameLabelAr: 'اسم المتخصصة أو النشاط',
  showcaseKickerAr: 'أعمال المتخصصة',
  shopLeadAr:
    'اختاري من المعرض ثم اطلبِ حلوى خاصة: وقت الوصول والعدد والنوع والحشوات. الموعد يُثبَّت بعد عربون الجدية.',
  showcaseLeadAr: 'معرض أعمال المتخصصة: صور ووصف مكتوب ولقطات. الطلب من الأيقونة أسفل الصفحة.',
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
    'الصورة المرجعية توضح التغليف أو الصينية أو الترتيب. التنفيذ يتبع أسلوب المتخصصة وخاماتها، وليس نسخاً حرفياً.',
  depositWarnAr:
    'لا يُحجز اليوم إلا بعد تحويل عربون الجدية وتأكيد المتخصصة من اللوحة. أرسلي إثبات العملية المرتبطة بهذا الطلب من صفحة الطلب، أو على واتساب إن تعذّر الرفع.',
  payTitleAr: 'تعليمات التحويل',
  payLeadAr: 'التحويل إلى وسيلة المتخصصة مباشرة. خريطة الحل لا تستلم المبلغ ولا تؤكد وصوله نيابة عنها.',
  payWaitAr: 'بعد قبول عرض السعر تظهر هنا تعليمات التحويل لهذا الطلب فقط.',
  payBankAr: 'البنك',
  payBeneficiaryAr: 'اسم المستفيد',
  payIbanAr: 'الآيبان',
  payCopyIbanAr: 'نسخ بيانات التحويل',
  payProofAr: 'إثبات العملية المرتبطة بهذا الطلب',
  payProofCtaAr: 'رفع الإثبات',
  payProofSavedAr: 'وُفع الإثبات. الموعد لا يُقفل حتى تعتمد المتخصصة العربون.',
  payProofHintAr: 'لا ترفعي كشف حساب كاملاً ولا رمز تحقق ولا بيانات دخول.',
  payCashAr: 'نقد عند الاستلام للمتبقي',
  payNetworkAr: 'شبكة عند الاستلام للمتبقي',
  payDeskTitleAr: 'وسائل التحويل',
  payDeskLeadAr: 'الآيبان لا يظهر في المعرض. يظهر بعد عرض السعر داخل الطلب. النقد والشبكة للمتبقي عند الاستلام.',
  paySaveAr: 'حفظ وسائل التحويل',
  paySavedAr: 'حُفظت وسائل التحويل.',
  payPublicBankAr: 'تحويل بنكي',
  payPublicCashAr: 'نقد عند الاستلام',
  payPublicNetworkAr: 'شبكة عند الاستلام',
  pickupWarnAr:
    'إن تأخّر الاستلام أو التوصيل بعد جهوز الطلب فقد تتأثر الجودة، وذلك خارج عهدة المتخصصة إن كان الطلب جاهزاً في موعده.',
  changeWarnAr: 'يُقبل تعديل النكهة أو الشكل أو اللون قبل بدء التجهيز بوقت كافٍ فقط.',
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
  deskLeadAr: 'طلبات التسعير، عرض السعر، ثم تأكيد العربون لقفل الموعد.',
  quoteCtaAr: 'إرسال عرض السعر',
  depositCtaAr: 'تأكيد العربون وقفل الموعد',
  whatsappCtaAr: 'واتساب من الجهاز',
  issueTitleAr: 'إصدار حلانا1',
  issueLeadAr:
    'إصدار تشغيلي بالاسم والبريد. اشتراك المتخصصة عبر ميسر على نفس الصفحة. لا ميسر على طلب العميلة.',
  issueNameAr: 'اسم المتخصصة',
  issueEmailAr: 'البريد',
  issueCtaAr: 'إصدار النسخة وإرسال الروابط',
  issuedAr: 'أُرسلت روابط الصفحة واللوحة إلى البريد.',
  statusAr: {
    new: 'جديد',
    quoted: 'عُرض السعر',
    awaiting_deposit: 'بانتظار العربون',
    confirmed: 'مؤكد والموعد مقفول',
    preparing: 'قيد التجهيز',
    ready: 'جاهز',
    completed: 'مكتمل',
    declined: 'اعتذار',
  } as const,
} as const;

export const STORE_HALANA_DEFAULT_POLICY_AR =
  'يُطلب الطلب مسبقاً. يُثبَّت اليوم بعد عربون جدية بصورة تحويل بنكي. التعديل في النكهة أو الشكل أو اللون قبل التجهيز فقط. الجودة بعد تأخر الاستلام أو المندوب خارج العهدة إن جهز الطلب في موعده.';

export const STORE_HALANA_DEFAULT_FLAVORS_AR = 'فانيليا\nشوكولاتة\nفستق\nتمر';

export const STORE_HALANA_LIVE = STORE_HALANA_LIVE_COPY;

export const STORE_HALANA_LIVE_FEATURES = [
  {
    titleAr: 'معرض أعمال',
    bodyAr: 'صور ترفعها المتخصصة من اللوحة، ونصوص دعائية، ولقطات يوتيوب تظهر في الصفحة الرئيسية.',
  },
  {
    titleAr: 'طلب مخصص منفصل',
    bodyAr: 'وقت الوصول والعدد والنوع والحشوات ووصف التغليف أو الصينية. لا قفل موعد عند الإرسال.',
    pulse: true,
  },
  {
    titleAr: 'عربون يدوي',
    bodyAr: 'تعليمات تحويل تملكها المتخصصة. صورة الإثبات لا تقفل الموعد حتى تعتمدها من اللوحة.',
  },
  {
    titleAr: 'بدون عمولة على قيمة الطلب',
    bodyAr: 'اشتراك الصفحة فقط. لا ميسر على سلة العميلة، ولا سوق يجمع المتخصصات.',
  },
  {
    titleAr: 'ملصق ومشاركة من الجهاز',
    bodyAr: 'QR للطباعة، وكرت رمز من الجوال، ونص جاهز للقنوات. الإرسال من جهاز المتخصصة.',
  },
] as const;
