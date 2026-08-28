/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تموينات الحي — متجر حي ولوحة كاشير. لا يُستورد من App.
 * باقتان معتمدتان: 599 ر.س لستة أشهر، و899 ر.س لاثني عشر شهراً.
 */
import {
  LEGAL_ECOMMERCE_AUTH_NUMBER,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
} from '@/config/partnerLegal';
import { STORE_SHOP_PRESENCE_LABEL_AR } from '@/config/storeShopPresence';

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
  kickerAr: 'من الجوال إلى باب البيت',
  titleAr: 'تمويناتا1',
  problemTitleAr: 'بين دفتر الأسعار وذاكرة الطلبات',
  problemBodyAr:
    'يتصل جار الحي أو يراسل على واتساب ليسأل: «عندك حليب؟ بكم كرتون المياه؟»، وصاحب التموينات يجاوب من ذاكرته أو يبحث في دفتر مكتوب بخط اليد وسط الزحمة. طلب يضيع، وسعر يُذكر خطأً، وزبون ينتظر الرد بينما زبائن آخرون يتزاحمون في المحل. ولا توجد قائمة أصناف واضحة يطّلع عليها الجار قبل أن يطلب، ولا واجهة تمنح المحل نفس الاحترافية التي اعتادها الزبون من تطبيقات التوصيل الجاهزة.',
  solutionTitleAr: 'تمويناتا1: تموينات الحي بواجهة منظمة ولوحة كاشير حيّة',
  leadAr:
    'تمويناتا1 صفحة لجار الحي ولوحة كاشير: بنك سلع جاهز بالصور والأسعار، وطلب مباشر من جوال الزبون، ومذكرة واتساب فورية للتوصيل. الطلب يصل جاهزاً ومكتوباً من نفسه، بدل أن يُملى هاتفياً وسط الزحمة.',
  howTitleAr: 'كيف يعمل النظام؟',
  howLeadAr: 'بخطوات بسيطة، بلا تعقيد.',
  howSteps: [
    'يُطبع رمز QR على واجهة المحل أو يُشارك رابط الصفحة مباشرة مع جيران الحي.',
    'يفتح الزبون صفحة الأصناف من متصفح جواله، بلا تحميل أي تطبيق، ويتصفح الأصناف بصورها وأسعارها الحقيقية.',
    'يختار الزبون طلبه، ويكتب اسمه ورقم جواله وموقعه، ثم يرسل الطلب.',
    'يصل الطلب إلى لوحة الكاشير خلال ثوانٍ مع تنبيه، ويظهر متضمناً: الأصناف والكميات، الإجمالي، اسم الزبون وجواله، ورابط موقعه على الخريطة.',
    'من جهاز الكاشير نفسه يمكن تأكيد الطلب وإرسال مذكرة توصيل عبر واتساب بنقرة واحدة لتمريرها لعامل التوصيل.',
  ],
  ingestLineAr:
    'تعبئة بنك السلع لا تحتاج كتابة يدوية طويلة: أصناف جاهزة مصنّفة حسب الفئة، ألبان وأجبان ومياه ومشروبات ومنظفات وخضار وفواكه وأدوات منزلية، تُضاف بالبحث والتحديد، أو بلصق قائمة أسعار جاهزة أو رفع صورة لها ومراجعة الصفوف قبل الحفظ.',
  hoursLineAr:
    'ويمكن لصاحب التموينات ضبط حالة مفتوح الآن أو مغلق الآن وساعات العمل، وتحديد عرض اليوم، بما يواكب واقع محله لحظة بلحظة. وحتى في وضع مغلق، لا يفقد المحل طلب زبونه: يستطيع الزبون فتح مذكرة طلب مسبقة ويدوّن فيها طلبه وملاحظاته، فيجدها صاحب التموينات جاهزة في لوحته عند بداية الدوام.',
  presenceLineAr: `كما يتحكم صاحب التموينات بإبراز موقع محله في صفحة الزبون أو إخفائه حسب ما يناسبه، وتظهر له في لوحته قراءة لحظية بعنوان ${STORE_SHOP_PRESENCE_LABEL_AR} لمن يفتح صفحة الطلب في تلك اللحظة. الرقم مجهول تماماً بلا اسم أو رقم جوال، يختفي بمجرد إغلاق الصفحة، وليس تتبعاً للحضور ولا دفتر زيارات.`,
  payTitleAr: 'بدون عمولة، وبدون تعقيد في المحاسبة',
  payIndependenceAr:
    'لا تحصيل إلكتروني من الزبون عبر المنصة، ولا عمولة على قيمة السلة مهما زاد عدد الطلبات. المحاسبة نقداً أو عبر جهاز الشبكة عند التسليم، تماماً كما هو معتاد اليوم، والفرق أن الطلب يصل منظماً وواضحاً منذ اللحظة الأولى. الاشتراك في تمويناتا1 هو فقط رسوم تشغيل النظام.',
  featuresTitleAr: 'القيمة التشغيلية والخصائص التي يقدمها المنتج',
  priceTitleAr: 'الأسعار',
  priceLineAr: 'باقة ستة أشهر: 599 ر.س – باقة اثني عشر شهراً: 899 ر.س',
  durationLineAr: 'الباقات متاحة للتفعيل المباشر. اشتراك صاحب التموينات عبر بوابة الدفع الآمنة.',
  legalTitleAr: 'منتج من منشأة موثّقة نظامياً',
  legalLeadBeforeAr: 'تمويناتا1 من متجر خريطة الحل ',
  legalLeadAfterAr: `، وهو مؤسسة موثّقة نظامياً في المملكة العربية السعودية. الرقم الوطني الموحد ${LEGAL_NATIONAL_UNIFIED_NUMBER}، ورقم توثيق التجارة الإلكترونية ${LEGAL_ECOMMERCE_AUTH_NUMBER}. تعمل ضمن الأنظمة السعودية ومبادئ حماية البيانات الشخصية. والمنصة نفسها خدمة سحابية مرخصة وموثقة، ومحمية بحقوق الملكية الفكرية. بيانات صاحب التموينات وبيانات زبائنه تُستخدم فقط لتشغيل الطلبات، ولا تُستخدم لأي غرض إعلاني.`,
  startTitleAr: 'ابدأ اليوم بخطوة واحدة',
  closeAr:
    'لا حاجة لخبرة تقنية ولا لتطبيقات معقدة: رمز واحد، وصفحة واحدة تعرض بضاعتك بصورها الحقيقية، ولوحة تصل إليها الطلبات جاهزة بكل تفاصيلها. أداة بسيطة تُنهي فوضى الطلبات الهاتفية، وتمنح تموينات الحي واجهة يثق بها الزبون، وتجعل استقبال الطلبات وتسليمها سهلاً وشبه آلي. اختر باقتك الآن.',
  chatAddonTitleAr: 'إضافة اختيارية: صندوق محادثة جار الحي',
  chatAddonLeadAr:
    'لمن يريد قناة تواصل مباشرة مع زبائنه، تتوفر إضافة برمجية اختيارية: صندوق محادثة في صفحة الزبون، وصندوق استقبال مقابل له في لوحة الكاشير، قناة مباشرة بين الطرفين وليست غرفة دردشة عامة.',
  chatAddonPriceAr: 'تُضاف بـ299 ر.س مع باقة ستة أشهر، أو 499 ر.س مع باقة اثني عشر شهراً',
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
  locateMeAr: 'حدد موقعي',
  locatingAr: 'جاري تحديد الموقع…',
  locateFailAr: 'تعذّر تحديد الموقع. أعد المحاولة بعد موافقة المتصفح.',
  locateDeniedAr: 'رُفض إذن الموقع. فعّله من إعدادات المتصفح.',
  locateSavedAr: 'حُفظ الموقع.',
  deskPickupTitleAr: 'موقع التموينات',
  deskPickupLeadAr:
    'حدّد الموقع من الإعداد الأول بعد موافقة المتصفح، ثم أبرزه لجار الحي أو أخفه. المخفي لا يظهر في صفحة الطلب.',
  pickupShowAr: 'إبراز الموقع',
  pickupHideAr: 'إخفاء الموقع',
  pickupPlaceOpenAr: 'افتح الموقع',
  pickupPinAriaAr: 'موقع التموينات على الخريطة',
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
  tryCtaAr: 'شاهد الصفحة ولوحة الكاشير',
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
