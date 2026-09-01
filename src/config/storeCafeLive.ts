/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * كافينا1 — شاشات المقهى وصفحة الحي. لا يُستورد من App.
 * باقتان: 1199 ر.س لستة أشهر، و2099 ر.س لاثني عشر شهراً. صندوق المحادثة مدرج.
 */
import {
  LEGAL_ECOMMERCE_AUTH_NUMBER,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
} from '@/config/partnerLegal';
import { STORE_SHOP_PRESENCE_LABEL_AR } from '@/config/storeShopPresence';

export const STORE_CAFE_LIVE_PUBLIC_ENABLED = true;

export const STORE_CAFE_LIVE_LAB_TOKEN = 'cafe-lab' as const;

export const STORE_CAFE_LIVE_PRODUCT = 'store_cafe_live' as const;

export const STORE_CAFE_LIVE_DAYS_6 = 180 as const;
export const STORE_CAFE_LIVE_DAYS_12 = 365 as const;
export const STORE_CAFE_LIVE_PRICE_6_SAR = 1199 as const;
export const STORE_CAFE_LIVE_PRICE_12_SAR = 2099 as const;
export const STORE_CAFE_LIVE_PRICE_6_HALALAS = 119900 as const;
export const STORE_CAFE_LIVE_PRICE_12_HALALAS = 209900 as const;

function envEnabled(name: string, fallback: boolean): boolean {
  const raw = String((import.meta as { env?: Record<string, unknown> }).env?.[name] ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  if (raw === 'true' || raw === '1' || raw === 'on') return true;
  return fallback;
}

export const STORE_CAFE_LIVE_CHECKOUT_ENABLED = envEnabled(
  'VITE_STORE_CAFE_LIVE_CHECKOUT_ENABLED',
  true,
);

export const STORE_CAFE_LIVE_ACCENT = '#c48a4a' as const;

export const STORE_CAFE_LIVE_PACKS = [
  {
    id: 'm6',
    months: 6,
    days: STORE_CAFE_LIVE_DAYS_6,
    priceSar: STORE_CAFE_LIVE_PRICE_6_SAR,
    priceHalalas: STORE_CAFE_LIVE_PRICE_6_HALALAS,
    titleAr: 'باقة ستة أشهر',
    priceLineAr: '1199 ر.س لستة أشهر',
    lineAr: 'الصفحة والشاشات ولوحة الكاشير وملصق QR وصندوق المحادثة تُجهَّز فور السداد.',
  },
  {
    id: 'm12',
    months: 12,
    days: STORE_CAFE_LIVE_DAYS_12,
    priceSar: STORE_CAFE_LIVE_PRICE_12_SAR,
    priceHalalas: STORE_CAFE_LIVE_PRICE_12_HALALAS,
    titleAr: 'باقة اثني عشر شهراً',
    priceLineAr: '2099 ر.س لاثني عشر شهراً',
    lineAr: 'مدة أطول لنفس الصفحة والشاشات واللوحة والملصق.',
  },
] as const;

export type StoreCafeLivePackId = (typeof STORE_CAFE_LIVE_PACKS)[number]['id'];

export const STORE_CAFE_LIVE = {
  documentTitle: 'كافينا1 — خريطة الحل',
  kickerAr: 'صفحة لجار الحي، ولوحة كاشير، وشاشات داخل المقهى',
  titleAr: 'كافينا1',
  problemTitleAr: 'بين الطاولة والهاتف والشاشة المطفأة',
  problemBodyAr:
    'طلب على الطاولة، وهاتف يرن بطلب توصيل، وزبون واقف على الكاونتر يسأل: «عندكم سبانش لاتيه الحين؟» والباريستا يحاول يمسك كل هذا في رأسه وسط الزحمة. زبون يطلب صنفاً نفد قبل دقائق فيُفاجأ عند الاستلام، وزبون آخر يطلب توصيلاً فيُملي طلبه هاتفياً بدل أن يصل مكتوباً من نفسه. والشاشة المعلّقة فوق الكاونتر، إما مطفأة أو تعرض نفس الصورة منذ أسابيع، بلا أي حضور يليق بأجواء مقهى حديث.',
  solutionTitleAr: 'كافينا1: صفحة لجار الحي، ولوحة كاشير، وشاشات داخل المقهى',
  leadAr:
    'كافينا1 يجمع طلب جار الحي، وإدارة الأصناف والطلبات، وحضور المقهى المرئي، في نظام واحد: صفحة يفتحها الزبون من جواله، ولوحة كاشير حيّة، وشاشات داخل المقهى تُدار من نفس المكان.',
  howTitleAr: 'كيف يعمل النظام؟',
  howLeadAr: 'بخطوات بسيطة، بلا تعقيد. التوصيل في الحي هو المعتمد ما لم يُختر الاستلام.',
  howSteps: [
    'يُطبع رمز QR ويُعرض في المقهى، ويفتح صفحة جار الحي من أي متصفح، بلا تحميل أي تطبيق.',
    'يتصفح الزبون رف المشروبات: الأصناف المتوفرة فقط، بصور لأبرز المشروبات، وعرض اليوم إن وُجد.',
    'يختار مشروباته بالكمية، ويكتب اسمه ورقم جواله وملاحظة إن أراد، ويحدد التسليم: توصيل داخل الحي، وهو الخيار الافتراضي، أو استلام من المقهى. وفي حال التوصيل يكتب موقعه نصاً، ثم يختار طريقة الدفع: نقداً أو شبكة.',
    'يصل الطلب إلى لوحة الكاشير خلال ثوانٍ برقم تذكرة، مع تنبيه صوتي ووميض، ويظهر متضمناً: الأصناف والكميات، الاسم والجوال، طريقة التسليم والموقع، الملاحظة، وطريقة الدفع.',
    'من جهاز الكاشير نفسه تُفتح مذكرة واتساب جاهزة بنقرة واحدة لتمريرها لعامل التوصيل.',
  ],
  ticketItems: [
    'اسم جار الحي ورقم الجوال.',
    'نص موقع التوصيل إن اختار التوصيل.',
    'تفاصيل الطلب.',
    'طريقة الدفع: نقداً أو شبكة.',
    'المبلغ الإجمالي.',
  ],
  drinksTitleAr: 'إدارة الأصناف لحظياً، بلا كتابة يدوية طويلة',
  drinksLineAr:
    'لكل صنف في رف المشروبات حالة تُحدَّث من اللوحة: يُحضَّر الآن أو توقف، فلا يظهر للزبون صنف نفد أو توقف تحضيره. تبدأ بمشروبات جاهزة موزعة على فئات: حار، بارد، عصير، حلويات، إضافات، وعرض اليوم، تُفعَّل بأسعارها المقترحة أو تُعدَّل. ويمكن لصق قائمة أسعار جاهزة أو إرفاق صورة لها ومراجعة الصفوف قبل الحفظ: تُطابق الأسماء بأصناف الفئات أو تُضاف صنفاً مخصصاً.',
  hoursTitleAr: 'مفتوح، مغلق، ولا طلب يضيع',
  hoursLineAr:
    'يضبط صاحب المقهى حالة مفتوح الآن أو مغلق الآن وجدول ساعات العمل. وحتى في وضع الإغلاق لا يتوقف المقهى عن استقبال زبائنه: يستمر التصفح ويستطيع الزبون ترك طلبه في مذكرة طلب مسبقة، فيجدها الكاشير جاهزة عند بداية الدوام.',
  presenceTitleAr: 'موقع المقهى وخصوصية بلا تعقيد',
  presenceLineAr: `يتحكم صاحب المقهى بإبراز موقع المقهى للزبون أو إخفائه حسب ما يناسبه. وفي لوحته وحدها تظهر قراءة لحظية بعنوان ${STORE_SHOP_PRESENCE_LABEL_AR} على صفحة الطلب فقط. الرقم مجهول تماماً بلا اسم أو جوال، يختفي بمجرد إغلاق الصفحة، وليس تتبعاً للحضور ولا دفتر زيارات.`,
  screensTitleAr: 'شاشات تمنح المقهى حضوراً حقيقياً',
  screensLineAr:
    'ثلاث شاشات تُدار من لوحة الشاشات. شاشة رئيسية تعرض اسم المقهى وترحيباً ومقطع يوتيوب أو صورة وعرض اليوم وأبرز المشروبات ومشاركات الزبائن. شاشة هادئة تعرض الفيديو أو الصورة فقط دون مشاركات. وشاشة قائمة تعرض الأصناف المتوفرة بأسعارها. ويمكن لزبائن المقهى مشاركة عبارة عبر رابط مشترك، ويستطيع صاحب المقهى مراجعتها واعتمادها قبل ظهورها على الشاشة الرئيسية، دون أن تكون قائمة ضيوف أو دفتر حضور.',
  chatTitleAr: 'صندوق تواصل مباشر مع الزبون، مدرج بلا تكلفة إضافية',
  chatLineAr:
    'صندوق محادثة بين جار الحي والكاشير مدرج ضمن باقتي كافينا1 دون أي إضافة مدفوعة: صندوق في صفحة الزبون، وصندوق استقبال مقابل في لوحة الكاشير، قناة مباشرة بين الطرفين وليست غرفة دردشة عامة.',
  whatsappLineAr:
    'من جهاز تشغيل المقهى نفسه، يرسل الكاشير بطاقة الطلب إلى عامل التوصيل عبر واتساب بنقرة واحدة.',
  payTitleAr: 'بدون عمولة، وبدون تعقيد في المحاسبة',
  payIndependenceAr:
    'لا تحصيل لسلة جار الحي عبر وسيط دفع. المحاسبة نقداً أو عبر جهاز الشبكة عند التسليم، والتوصيل داخل الحي هو الخيار الافتراضي ما لم يختر الزبون الاستلام من المقهى. الاشتراك في كافينا1 هو فقط رسوم تشغيل النظام.',
  renewTitleAr: 'التجديد يبقي كل شيء كما هو',
  renewLineAr:
    'عند انتهاء المدة، تبقى روابط صفحة الزبون ولوحة الكاشير والشاشات كما هي دون أي تغيير؛ التجديد يمدّد نفس النظام، ولا يبدأ من جديد.',
  opsTitleAr: 'متطلبات التشغيل',
  opsBodyAr:
    'يحتاج المقهى جهازاً متصلاً بالإنترنت لدى الكاشير، وحساب واتساب على جهاز التشغيل نفسه. الباقة لجهاز تشغيل واحد. الشاشات الثلاث تُفتح بروابط مستقلة على نفس الرمز.',
  featuresTitleAr: 'تشمل الباقة',
  priceTitleAr: 'الأسعار',
  priceLineAr: 'باقة مئة وثمانين يوماً: 1199 ر.س – باقة ثلاثمئة وخمسة وستين يوماً: 2099 ر.س',
  durationLineAr: 'صندوق المحادثة مدرج ضمن الباقتين، بلا أي إضافة.',
  legalTitleAr: 'منتج من منشأة موثّقة نظامياً',
  legalLeadBeforeAr: 'كافينا1 من متجر خريطة الحل ',
  legalLeadAfterAr: `، وهو مؤسسة موثّقة نظامياً في المملكة العربية السعودية. الرقم الوطني الموحد ${LEGAL_NATIONAL_UNIFIED_NUMBER}، ورقم توثيق التجارة الإلكترونية ${LEGAL_ECOMMERCE_AUTH_NUMBER}. تعمل ضمن الأنظمة السعودية ومبادئ حماية البيانات الشخصية. والمنصة نفسها خدمة سحابية مرخصة وموثقة، ومحمية بحقوق الملكية الفكرية. بيانات صاحب المقهى وبيانات زبائنه تُستخدم فقط لتشغيل الطلبات، ولا تُستخدم لأي غرض إعلاني.`,
  privacyAr:
    'تُستخدم بيانات جار الحي لتنفيذ الطلب فقط، وتُحفظ على جهازه إن وافق، ولا دفتر زبائن لدى المنصة.',
  startTitleAr: 'معاينة قبل أن تقرر',
  closeAr:
    'يمكن معاينة صفحة جار الحي ولوحة الكاشير والشاشة الرئيسية معاينة حية على هذه الصفحة قبل الشراء. لا حاجة لخبرة تقنية: رمز واحد يفتح صفحة الطلب، ولوحة واحدة تدير الطلبات والأصناف والشاشات معاً، ليصبح المقهى حاضراً لجار الحي بواجهة منظمة، ولزوّاره بشاشة حيّة تليق بأجواء المقهى. اختر باقتك الآن.',
  chatBuyerTitleAr: 'صندوق ملاحظة للكاشير',
  chatBuyerHintAr: 'اكتب تخصيصاً أو سؤالاً عن المشروب. ليس دردشة عامة.',
  chatBuyerSendAr: 'أرسل للكاشير',
  chatDeskTitleAr: 'صندوق استقبال ملاحظات جار الحي',
  chatDeskReplyAr: 'رد على جار الحي',
  shopKickerAr: 'جار الحي يطلب من جواله',
  featuredTitleAr: 'صور العرض',
  shelfTitleAr: 'بقية القائمة',
  todayTitleAr: 'عرض اليوم',
  checkoutTitleAr: 'إتمام الطلب',
  buyerNameLabelAr: 'الاسم',
  buyerPhoneLabelAr: 'رقم الجوال',
  buyerPlaceLabelAr: 'موقع التوصيل في الحي',
  buyerNoteLabelAr: 'ملاحظة على الطلب',
  serviceDeliveryAr: 'توصيل في الحي',
  servicePickupAr: 'استلام من المحل',
  payCashAr: 'نقداً عند الاستلام',
  payCardAr: 'شبكة عند التسليم',
  saveBuyerAr: 'حفظ بياناتي لتسهيل الطلب القادم',
  submitOrderAr: 'أرسل الطلب للكاشير',
  locateMeAr: 'حدد موقعي',
  locatingAr: 'جاري تحديد الموقع…',
  locateFailAr: 'تعذّر تحديد الموقع. أعد المحاولة بعد موافقة المتصفح.',
  locateDeniedAr: 'رُفض إذن الموقع. فعّله من إعدادات المتصفح.',
  locateSavedAr: 'حُفظ الموقع. اضغط «تأكد من موقعي» لرؤية الدبوس.',
  confirmPlaceAr: 'تأكد من موقعي',
  deskPickupTitleAr: 'موقع المقهى',
  deskPickupLeadAr:
    'حدّد الموقع من الإعداد الأول بعد موافقة المتصفح، ثم أبرزه لجار الحي أو أخفه. المخفي لا يظهر في صفحة الطلب.',
  pickupShowAr: 'إبراز الموقع',
  pickupHideAr: 'إخفاء الموقع',
  pickupPlaceOpenAr: 'افتح الموقع',
  pickupPinAriaAr: 'موقع المقهى على الخريطة',
  deskTitleAr: 'لوحة الكاشير',
  liveOrdersAr: 'تذاكر الكاشير',
  whatsappReceiptAr: 'مذكرة واتساب للتوصيل',
  archiveCtaAr: 'تحميل الأرشيف',
  ingestTitleAr: 'بنك المشروبات الجاهزة',
  catalogLeadAr: 'فعّل الأصناف الشائعة وحدد سعرها، ثم أرفق صورة العرض إن رغبت.',
  activateAr: 'تفعيل الصنف',
  listIngestTitleAr: 'مراجعة قائمة مكتوبة أو مصوّرة',
  listIngestLeadAr: 'الصق أسماء المشروبات وأسعارها، أو أرفق صورة القائمة وراجع الصفوف قبل الحفظ.',
  flashLabelAr: 'شريط عرض اليوم',
  flashHintAr: 'عرض اليوم: قهوة مثلجة حتى نفاذ الكمية',
  qrPhraseAr: 'امسح واطلب من جوالك. التوصيل في الحي أو الاستلام من المحل.',
  qrPrintAr: 'طباعة ملصق QR',
  stockOnAr: 'يُحضَّر الآن',
  stockOffAr: 'توقف',
  photoUploadAr: 'صورة العرض',
  orderCtaAr: 'اختر الباقة',
  tryCtaAr: 'شاهد الصفحة والشاشات ولوحة الكاشير',
  deskLinkAr: 'لوحة الكاشير',
  shopLinkAr: 'رابط جار الحي',
  displayLinkAr: 'الشاشة الرئيسية',
  quietLinkAr: 'الشاشة الهادئة',
  menuLinkAr: 'شاشة القائمة',
  guestLinkAr: 'رابط المشاركة',
  hostLinkAr: 'لوحة الشاشات',
  termsFoldTriggerAr: 'اقرأ شروط الخدمة',
  termsFoldTitleAr: 'شروط الخدمة قبل الطلب',
  termsFoldBodyAr:
    'كافينا1 صفحة لجار الحي ولوحة للكاشير وثلاث شاشات داخل المقهى. المسار الثابت: 1199 ر.س لستة أشهر، أو 2099 ر.س لاثني عشر شهراً. المسار المتحرك من نموذج الطلب مشمول في سعره، بلا إضافة مدفوعة. صندوق المحادثة مدرج، بلا غرفة عامة. الطلب يصل خلال ثوانٍ مع تنبيه. إرسال بطاقة التوصيل عبر واتساب بنقرة واحدة من جهاز التشغيل. لا تحصيل إلكتروني لجار الحي ولا عمولة على قيمة الطلبات. بيانات جار الحي لتنفيذ الطلب فقط وتُحفظ على جهازه إن وافق. الباقة لجهاز تشغيل واحد. التفاصيل في شروط الخدمة.',
  labKickerAr: 'معاينة حيّة داخل الصفحة',
  labTitleAr: 'هكذا يطلب جار الحي وتظهر الشاشات داخل المقهى',
  labLeadAr: 'فعّل صنفاً، أرسل طلباً تجريبياً، وعاين الشاشات الثلاث كما في ساعة الذروة.',
  heroImage: '/images/store/lounge-hero-marketing.jpg',
  heroAltAr: 'مقهى حي بشاشات ومشروبات جاهزة للطلب من الجوال',
  heroCaptionAr: 'من رمز QR إلى الكاشير، وعلى شاشات المقهى',
  checkoutClosedAr: 'بوابة الدفع غير مفتوحة لهذا المنتج بعد.',
  orderConsentAr:
    'قرأت شروط الخدمة وأوافق على تحصيل باقة كافينا1 عبر بوابة الدفع بالمبلغ المعروض. لا تحصيل من جار الحي غير نقد أو شبكة عند التسليم.',
  orderSubmitAr: 'الانتقال إلى الدفع',
  cafeNameLabelAr: 'اسم المقهى',
  guestFormTitleAr: 'أرسل مشاركة تظهر على شاشة المقهى',
  guestNameLabelAr: 'اسمك إن رغبت',
  guestMessageLabelAr: 'العبارة على الشاشة',
  guestWriteChipAr: 'اكتب عبارتك',
  guestPickHintAr: 'اختَر جملة جاهزة فتُملأ في الحقل، أو اكتب عبارتك ثم أرسل.',
  guestExtraLabelAr: 'سطر إضافي منك',
  guestSubmitAr: 'أظهر مشاركتي على الشاشة',
  guestPausedAr: 'الاستقبال متوقف مؤقتاً. اطلب من الكاشير إعادة فتحه.',
  guestPendingAr: 'أُرسلت مشاركتك، وتظهر بعد مراجعة الكاشير.',
  guestSentAr: 'ظهرت مشاركتك على الشاشة.',
  guestRateAr: 'انتظر قليلاً قبل إرسال مشاركة أخرى.',
  guestDupAr: 'هذه العبارة أُرسلت للتو.',
  guestBlockedAr: 'تعذر إرسال هذه العبارة.',
  screenIdleCtaAr: 'أرسل مشاركتك لتظهر على الشاشة',
  screenQrHintAr: 'امسح الرمز من جوالك',
  screenLiveAr: 'الشاشة متصلة',
  screenStaleAr: 'تعذر تحديث الشاشة',
  hallKickerAr: 'المقهى على الشاشة',
  hallStampAr: 'halaqmap · خريطة الحل',
  hostPauseAr: 'إيقاف استقبال المشاركات',
  hostReviewAr: 'اعتماد المشاركة قبل ظهورها على الشاشة',
  hostApproveAr: 'اعتمد',
  hostHideAr: 'إخفاء',
  hostAnnouncementLabelAr: 'تنويه على الشاشة',
  hostYoutubeLabelAr: 'رابط يوتيوب',
  hostYoutubeHideAr: 'حجب الفيديو وإظهار صورة الشاشة',
  hostYoutubeShowAr: 'إعادة عرض يوتيوب',
  hostWelcomeLabelAr: 'نص الترحيب على الشاشة',
  hostUploadPhotoAr: 'رفع صورة للشاشة',
  hostNameLabelAr: 'اسم المسؤول',
  menuScreenTitleAr: 'قائمة المقهى على الشاشة',
  quietScreenTitleAr: 'شاشة هادئة',
} as const;

export const STORE_CAFE_LIVE_FEATURES = [
  {
    titleAr: 'صفحة المشروبات ورمز QR',
    bodyAr: 'عرض المشروبات وعرض اليوم. تُطبع الرموز للباب والطاولة والحي، ويطلب جار الحي توصيلاً في الحي أو استلاماً من المحل.',
  },
  {
    titleAr: 'لوحة الكاشير',
    bodyAr: 'تصل التذكرة خلال ثوانٍ مع تنبيه. تظهر تفاصيل الطلب والكميات ونوع التسليم.',
    pulse: true,
  },
  {
    titleAr: 'ثلاث شاشات داخل المقهى',
    bodyAr: 'رئيسية للمشاركات والعروض، وهادئة ليوتيوب والصور، وقائمة للمشروبات والفعاليات. كل شاشة برابطها.',
  },
  {
    titleAr: 'بطاقة واتساب بنقرة واحدة',
    bodyAr: 'من جهاز التشغيل نفسه تُرسل الاسم والجوال ونص موقع التوصيل وتفاصيل الطلب والدفع نقداً أو شبكة والمبلغ.',
  },
  {
    titleAr: 'بدون عمولة على قيمة الطلبات',
    bodyAr: 'لا تحصيل إلكتروني لجار الحي. المحاسبة نقداً أو عبر جهاز الشبكة لدى المقهى، والاشتراك لرسوم النظام فقط.',
  },
  {
    titleAr: 'صندوق المحادثة مدرج',
    bodyAr: 'صندوق في صفحة جار الحي وصندوق استقبال في الكاشير لتخصيص الطلب أو السؤال عن المشروب، بلا غرفة عامة.',
  },
] as const;

export const STORE_CAFE_LIVE_EVENTS = [
  {
    id: 'welcome',
    titleAr: 'ترحيب المقهى',
    welcomeAr: 'حياكم الله في المقهى. اكتبوا أسماءكم لتظهر المشاركات على الشاشة.',
  },
  {
    id: 'evening',
    titleAr: 'سهرة المساء',
    welcomeAr: 'سهرة هذا المساء على الشاشة. شاركوا عبارة باسمكم.',
  },
  {
    id: 'offer',
    titleAr: 'عرض خاص',
    welcomeAr: 'عرض الليلة على الشاشة. اكتبوا ترحيبكم ليظهر أمام الجميع.',
  },
  {
    id: 'custom',
    titleAr: 'فعالية من المقهى',
    welcomeAr: 'فعالية يسمّيها المقهى من لوحته وتعرض على الشاشة مع مشاركات الجيران.',
  },
] as const;

export type StoreCafeLiveEventId = (typeof STORE_CAFE_LIVE_EVENTS)[number]['id'];

export function cafeLiveEventById(id: string) {
  return STORE_CAFE_LIVE_EVENTS.find((item) => item.id === id) || STORE_CAFE_LIVE_EVENTS[0];
}

export const STORE_CAFE_LIVE_CANNED = [
  { id: 'welcome', textAr: 'حياك الله، والمقهى يرحب بك.' },
  { id: 'ahlain', textAr: 'أهلاً وسهلاً، تفضل بالراحة.' },
  { id: 'qahwa', textAr: 'قهوة هنيّة، تسعد أوقاتك.' },
  { id: 'noor', textAr: 'نورت المكان، حياك الله.' },
  { id: 'mubarak', textAr: 'ألف مبارك، سهرة سعيدة.' },
  { id: 'hania', textAr: 'سهرة هادئة وهنيّة.' },
] as const;

export const STORE_CAFE_LIVE_DEMO = {
  shopName: 'مقهى السدرة',
  hostName: 'الإدارة',
  blurbAr: 'كافينا1: مشروبات الحي من الجوال إلى الكاشير.',
  customFields: [
    'الدوام من العصر حتى منتصف الليل.',
    'التوصيل داخل الحي في ربع ساعة تقريباً.',
    'الاستلام من الباب إن رغبت.',
    'الدفع نقداً أو شبكة عند التسليم.',
    'إن توقف صنف نخفيه فوراً حتى لا يُطلب.',
  ] as string[],
  flashAr: 'عرض اليوم: قهوة مثلجة حتى نفاذ الكمية',
  welcomeAr: STORE_CAFE_LIVE_EVENTS[0].welcomeAr,
  youtubeUrl: '',
  youtubeHidden: true,
  announcement: '',
  photoSrc: '/images/store/lab/lab-lounge-interior.jpg',
  panoramaSrc: '/images/store/lab/lab-lounge-interior.jpg',
  guestPaused: false,
  reviewBeforeShow: false,
  activeEventId: 'welcome' as StoreCafeLiveEventId,
  customEventTitle: '',
} as const;
