/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * مسارات المنصة فقط — ملف خفيف مستقل عن lib/index
 * حتى لا تُسحب حزمة App داخل chunks الصفحة الرئيسية (يكسر حلقة circular lazy).
 */

export const ROUTE_PATHS = {
  HOME: '/',
  /**
   * مركز نسك الحج — فزعة للحلق والتقصير.
   * النسخة الثابتة للفهرسة: `/nusuk` على القرص؛ هذا المسار لنسخة التطبيق.
   */
  HAJJ_NUSUK: '/nusuk',
  /** فزعات حسب الحاجة — نية البحث (HTML ثابت على /need) */
  FILTER_INTENT_HUB: '/need',
  /** فزعة المدن والأحياء — HTML ثابت على /near */
  GEO_NEAR_HUB: '/near',
  /** سمي — صفحات نوايا كوافير ماب (HTML ثابت على /summi) */
  SUMMI_HUB: '/summi',
  /** فزعات المناسبات وأوقات الزحام (HTML ثابت) */
  OCCASIONS_HUB: '/occasions',
  /** فزعة عيد الأضحى — حلاقة النسك بعد الأضحية */
  EID_ADHA_SHAVING: '/occasions/eid-adha-shaving',
  /** فزعة رمضان — الليل وبعد التراويح */
  RAMADAN_BARBER: '/occasions/ramadan',
  /** فزعة دائمة — تحضير الجمعة وزحمة الخميس */
  FRIDAY_PREP: '/occasions/friday-prep',
  BARBERS_LANDING: '/partners',
  /**
   * واجهة متجر halaqmap — store.halaqmap.com
   * هبوط الطلبات والخدمات البرمجية. الدفع يبقى على www.halaqmap.com.
   */
  STORE_LANDING: '/store',
  /** مشاهدة مقاطع خريطة الحل داخل الصفحة */
  YOUTUBE_STORE: '/store/videos',
  /** مشاهدة مقاطع حلاق ماب داخل الصفحة */
  YOUTUBE_HALAQ: '/videos',
  /** لوحة صناديق اليوتيوب — داخل لوحة التحكم */
  ADMIN_YOUTUBE_GALLERY: '/youtube-gallery',
  /** نموذج طلب خدمات المتجر */
  STORE_REQUEST: '/store/request',
  /** بطاقات تهنئة مجانية يصدرها العميل لنفسه */
  STORE_CARDS: '/store/cards',
  /** كروت تعريفية وتسويقية لواجهة المتجر — مستقلة عن كاردي8 وتهنئة المناسبات */
  STORE_INTRO_CARDS: '/store/id-cards',
  STORE_INTRO_CARD_VIEW: '/store/id-card',
  /** رمز QR بستايل المتجر لعرضه من الآيفون في المقابلات — يفتح /store بلا هاش */
  STORE_MEET_QR: '/store/qr',
  /** تعريف المتجر والأنشطة والمنتجات البرمجية */
  STORE_ABOUT: '/store/about',
  /** مزايا المنتجات المستضافة — إحالة من صفحات العرض */
  STORE_PRODUCT_BENEFITS: '/store/benefits',
  /** هدية خريطة الحل — خمسة نماذج مناسبات بالسحب التقني */
  STORE_GIFT: '/store/gift',
  STORE_GIFT_TERMS: '/store/gift/terms',
  STORE_GIFT_CONFIRM: '/store/gift/confirm',
  /** تقييمات متجر خريطة الحل — نجوم وتعليق. مستقلة عن /reviews */
  STORE_REVIEWS: '/store/reviews',
  /** تصنيفات وفحوص مستقلة قابلة للتحقق */
  STORE_TRUST: '/store/trust',
  /** شروط وأحكام وخصوصية منتجات المتجر الرقمية */
  STORE_ISSUED_CARDS_LEGAL: '/store/cards/legal',
  /** بطاقة مناسبة مدفوعة — معاينة ثم دفع عند النشر */
  STORE_INVITES: '/store/invites',
  STORE_INVITES_VIEW: '/store/invites/v/:token',
  /** رابط مشاركة بلا هاش — معاينة واتساب ثم البطاقة الحيّة */
  STORE_OCCASION_CARD_SHARE: '/oc',
  /** دفع بطاقة المناسبة على النطاق الأم عبر ميسر */
  STORE_OCCASION_CARD_PAY: '/pay/occasion-card/:token',
  /** مختبر نماذج البطاقة الحيّة — تجريبي بلا دفع */
  STORE_INVITES_LAB: '/store/invites/lab',
  /** دعوة زواج تفاعلية — منتج مستقل بلا خلط ببطاقة المناسبة */
  STORE_WEDDING: '/store/wedding',
  STORE_WEDDING_WOMEN: '/store/wedding/women',
  STORE_WEDDING_LAB: '/store/wedding/lab',
  STORE_WEDDING_VIEW: '/w/:token',
  STORE_WEDDING_GUEST: '/w/:token/guest',
  STORE_WEDDING_HOST: '/w/:token/host',
  /** دفع دعوة الزواج التفاعلية على النطاق الأم عبر ميسر */
  STORE_WEDDING_PAY: '/pay/wedding/:token',
  /** دعوة حرة تفاعلية — مناسبة يختارها العميل، شقان رجالي ونسائي */
  STORE_EVENT: '/store/event',
  STORE_EVENT_MEN: '/store/event/men',
  STORE_EVENT_WOMEN: '/store/event/women',
  STORE_EVENT_VIEW: '/e/:token',
  STORE_EVENT_GUEST: '/e/:token/guest',
  STORE_EVENT_HOST: '/e/:token/host',
  STORE_EVENT_PAY: '/pay/event/:token',
  /** لاونجا1 — تشغيل شاشات اللاونج، 600 ر.س لثلاثة أشهر */
  STORE_LOUNGE: '/store/lounge',
  STORE_LOUNGE_VIEW: '/l/:token',
  STORE_LOUNGE_GUEST: '/l/:token/guest',
  STORE_LOUNGE_HOST: '/l/:token/host',
  STORE_LOUNGE_PAY: '/pay/lounge/:token',
  /** تموينات الحي — متجر حي ولوحة كاشير، باقتا 6 و12 شهراً */
  STORE_GROCERS: '/store/grocers',
  STORE_GROCERS_VIEW: '/g/:token',
  STORE_GROCERS_DESK: '/g/:token/desk',
  STORE_GROCERS_PAY: '/pay/grocers/:token',
  /** مطعمنا1 — صفحة مطعم الحي ولوحة مطبخ، باقتا 6 و12 شهراً */
  STORE_RESTAURANT: '/store/restaurant',
  STORE_RESTAURANT_VIEW: '/r/:token',
  STORE_RESTAURANT_DESK: '/r/:token/desk',
  STORE_RESTAURANT_PAY: '/pay/restaurant/:token',
  /** كافينا1 — شاشات المقهى وصفحة الحي، باقتا 6 و12 شهراً */
  STORE_CAFE: '/store/cafe',
  STORE_CAFE_VIEW: '/c/:token',
  STORE_CAFE_DESK: '/c/:token/desk',
  STORE_CAFE_HOST: '/c/:token/host',
  STORE_CAFE_GUEST: '/c/:token/guest',
  STORE_CAFE_QUIET: '/c/:token/quiet',
  STORE_CAFE_MENU: '/c/:token/menu',
  STORE_CAFE_PAY: '/pay/cafe/:token',
  /** طبختنا1 — صفحة الأسرة المنتجة ولوحة نشاط. الاشتراك مغلق حتى اعتماد الأسعار. */
  STORE_KITCHEN: '/store/kitchen',
  STORE_KITCHEN_GIFT: '/store/kitchen/gift',
  STORE_KITCHEN_GIFT_TERMS: '/store/kitchen/gift/terms',
  STORE_KITCHEN_GIFT_CONFIRM: '/store/kitchen/gift/confirm',
  STORE_KITCHEN_VIEW: '/k/:token',
  STORE_KITCHEN_DESK: '/k/:token/desk',
  STORE_KITCHEN_PAY: '/pay/kitchen/:token',
  /** خضارنا1 — صفحة صندوق الخضار ولوحة الصندوق */
  STORE_PRODUCE: '/store/produce',
  STORE_PRODUCE_VIEW: '/v/:token',
  STORE_PRODUCE_DESK: '/v/:token/desk',
  STORE_PRODUCE_PAY: '/pay/produce/:token',
  /** بطاقة كيو آر للجوال: اسم ومنصب داخل المنتج لإبراز رمز الصفحة */
  STORE_PRODUCT_PASS: '/store/pass/:kind/:token',
  /** بوابة مسوّقي منتجات المتجر — مستقلة عن سفراء حلاق ماب وكوافير ماب */
  STORE_AFFILIATES: '/store/affiliates',
  STORE_AFFILIATES_ENTER: '/store/affiliates/enter',
  STORE_AFFILIATES_DESK: '/store/affiliates/desk',
  STORE_AFFILIATES_RULES: '/store/affiliates/rules',
  /** مسار قديم على نطاق المتجر — يُحوَّل إلى لوحة التحكم */
  STORE_OPS: '/store/ops',
  /** بلاغات الوفاة والعزاء — خدمة مجتمعية مستقلة */
  STORE_BEREAVEMENT: '/store/bereavement',
  STORE_BEREAVEMENT_CREATE: '/store/bereavement/create',
  /** رابط عام غير قابل للتخمين — noindex */
  STORE_BEREAVEMENT_VIEW: '/n/:token',
  STORE_BEREAVEMENT_MANAGE: '/n/:token/manage',
  /**
   * كوافير ماب — سطح قطاعي نسائي تحت مظلة حلاق ماب.
   * الدفع لا يُنسَخ هنا: يُحوَّل دائماً إلى PAYMENT على www.halaqmap.com.
   */
  COIFFEUR_LANDING: '/coiffeur',
  /** استعلام المستعلمة — قطاع نسائي فقط، منفصل عن بحث حلاق ماب للرجال */
  COIFFEUR_INQUIRE: '/coiffeur/need',
  COIFFEUR_PARTNERS: '/coiffeur/partners',
  /** إعادة توجيه إلى REGISTER مع surface=coiffeur — لا فورم مستقل */
  COIFFEUR_REGISTER: '/coiffeur/partners/register',
  /** خطط الظهور ومنجزات البحث لشريكات كوافير ماب */
  COIFFEUR_MARKETING: '/coiffeur/partners/marketing',
  /** تسويق بالعمولة — مسوّقات كوافير ماب (نسخة مؤنثة لسفراء حلاق ماب) */
  COIFFEUR_AMBASSADORS: '/coiffeur/ambassadors',
  COIFFEUR_AMBASSADOR_RULES: '/coiffeur/ambassadors/rules',
  /** اهتمام مسبق + تحديثات بريد + عدة كروت برمجية — تحويل يوتيوب */
  COIFFEUR_INTEREST: '/coiffeur/interest',
  /** استوديو كروت كوافير ماب — اسم وصفة ثم توليد بطاقة للمشاركة */
  COIFFEUR_CARD_STUDIO: '/coiffeur/cards',
  /** بطاقة عامة قابلة للضغط — ?n= الاسم و ?r= الصفة أو ?c= الرمز */
  COIFFEUR_CARD_VIEW: '/coiffeur/card',
  /** رابط مشاركة مختصر للكرت — /c/{token} بلا هاش حتى تظهر صورة واتساب */
  COIFFEUR_CARD_SHARE: '/c',
  /** صفحة هبوط B2B (Skywork) — partners.halaqmap.com */
  PARTNERS_B2B_LANDING: '/partners/b2b',
  /** إقناع عميق: لماذا حلاق ماب وليس مجرد «حجز» */
  PARTNER_WHY: '/partners/why',
  /** تعهدات التسويق والانتشار لشركاء الصالونات */
  PARTNER_MARKETING: '/partners/marketing',
  /** قصة المنصة ومنطق المسار */
  PARTNER_STORY: '/partners/story',
  /** فيديوهات تعليم تفعيل الرخصة للشركاء */
  PARTNER_TUTORIALS: '/partners/tutorials',
  /** مجتمع ماب — مساحة تواصل مهنية للشركاء */
  MAP_COMMUNITY: '/partners/community',
  REGISTER: '/partners/register',
  /** تعليمات طريقة الاشتراك — دليل المتطلبات والإجراءات بجانب نموذج التسجيل */
  REGISTER_GUIDE: '/partners/register/guide',
  /** تسجيل اهتمام مسبق (بريد + موافقة) — ما قبل الإطلاق الرسمي */
  PARTNER_INTEREST: '/partners/interest',
  /**
   * رشح صالونك المفضل — ترشيح صالون من المستعلم عند فراغ التغطية.
   * لا يظهر في نتائج البحث؛ يُحال لملف تسويقي في لوحة التحكم.
   */
  COVERAGE_SALON_NOMINATE: '/help-cover-area',
  /** بطاقة تواصل ماب — مصمّم بطاقة عضوية لإرسالها للصالون */
  MAP_CONTACT_CARD: '/map-contact-card',
  /** اختصار دعوة الصالون من بطاقة تواصل ماب → interest */
  MAP_CONTACT_JOIN_SHORT: '/i',
  /** طلب تجربة برونزي — طابور تقييم (ليس تسجيلاً رسمياً) */
  BRONZE_TRIAL_APPLY: '/partners/bronze-trial',
  /** تأكيد بريد طلب التجربة (?c=token) */
  BRONZE_TRIAL_CONFIRM: '/partners/bronze-trial/confirm',
  /** موافقة صريحة على إبراز الصالون في صفحات فزعة (?c=token) */
  FAZAA_LISTING_CONSENT: '/partners/fazaa-listing-consent',
  REGISTER_SUCCESS: '/partners/register/success',
  ABOUT: '/about',
  /** سياسة خصوصية المستخدم (موجزة — الموقع الجغرافي وعدم المشاركة الخارجية) */
  USER_PRIVACY_POLICY: '/privacy-policy',
  /** شروط الاستخدام العامة للمنصّة */
  TERMS_OF_SERVICE: '/terms',
  /** صفحة مرجعية تأسيسية: حوكمة المعالجة اللحظية وإتلاف الأثر البرمجي */
  EPHEMERAL_PROCESSING_GOVERNANCE: '/privacy/ephemeral-governance',
  /** سياسة خصوصية المستخدم — النسخة التفصيلية (PDPL والأقسام الكاملة) */
  PRIVACY_DETAILED: '/privacy/detailed',
  /** إبقاء المسار القديم؛ يُعاد توجيهه إلى PRIVACY_DETAILED في التوجيه */
  PRIVACY: '/privacy',
  PARTNER_PRIVACY: '/partners/privacy',
  SUBSCRIPTION_POLICY: '/partners/subscription-policy',
  BARBER_LOGIN: '/partners/login',
  /** تثبيت تطبيق الصالون (PWA) + جسر سريع للوحة التحكم */
  PARTNER_APP: '/partners/app',
  /** دخول سريع من بريد الترحيب: ?m=رمز موقّع (مرة واحدة) */
  BARBER_PORTAL_ENTER: '/barber/enter',
  BARBER_DASHBOARD: '/barber/dashboard',
  /** طلب حذف الحساب (باقة برونزية — نموذج يُحال للإدارة) */
  BARBER_ACCOUNT_DELETE_REQUEST: '/barber/request-account-deletion',
  PAYMENT: '/partners/payment',
  /** تأكيد الاشتراك بعد نجاح الدفع فقط — لتتبع إحالات Google Ads */
  PAYMENT_SUCCESS: '/partners/payment/success',
  /** دعم فني للشركاء — محادثة خاصة بجلسة ساعة (?t=رمز_فريد) */
  PARTNER_SUPPORT: '/partners/support',
  /** مكتب مدير المبيعات B2B — صفحة مستقلة للتفاوض والشرح والانضمام */
  PARTNER_SALES_OFFICE: '/partners/sales-office',
  /**
   * تفعيل الصالون — الجماهيرية والسيو قائمان، والمزيد في الطريق.
   */
  PARTNER_MERCHANT_SETTLEMENT: '/partners/merchant-settlement',
  /** تبديل «مفتوح/مغلق» للعملاء عبر نظام الرصد الذكي برابط سري (?t=رمز) — مفيد للبرونزي */
  SHOP_OPEN_STATUS: '/partners/shop-open',
  /** تجديد رابط مفتوح/مغلق — برونزي: رخصة + بريد + تأكيد */
  SHOP_OPEN_ROTATE: '/partners/shop-open/rotate',
  /** تأكيد تجديد الرابط من البريد (?c=رمز) */
  SHOP_OPEN_ROTATE_CONFIRM: '/partners/shop-open/rotate-confirm',
  /**
   * بطاقة QR لمسار الخدمات البرمجية للمنصة (طباعة/حملات) — للإدارة والتسويق فقط.
   * لا تُضاف روابط لها في الرئيسية أو مسار الخدمات البرمجية للمنصة أو القوائم.
   */
  INTERNAL_PARTNER_PATH_PRINT_CARD: '/m/hm-partner-path-card-q7',
  /**
   * مكتب المؤسس — بنر + شات ٦٠ دقيقة، ومستقبل المحادثات.
   * noindex، بدون رابط من القوائم العامة.
   */
  FOUNDER_DESK_LANDING: '/m/hm-desk-k7q3',
  /**
   * محادثة الزائر في صفحة مستقلة من بنر مسار الشركاء.
   * noindex، تُفتح من زر تحت صندوق الشات فقط.
   */
  FOUNDER_DESK_VISITOR_CHAT: '/partners/live-chat',
  /** معاينة فواتير رخصة النفاذ (PDF) — داخلي، بدون ربط من القوائم */
  INVOICE_PREVIEW_SAMPLES: '/m/invoice-preview-samples',
  /** صفحة هبوط تسويقية — عرض شرائح قصة المنصة (B2C · حملات · مشاركة) */
  PLATFORM_DISCOVER: '/discover',
  /**
   * عرض النمو التقديمي — شرائح مقارنة تسويقية + جذب الشركاء (Pitch Deck).
   * للعروض والاجتماعات — noindex، بدون رابط من القوائم العامة.
   */
  GROWTH_PITCH_DECK: '/m/growth-pitch-deck',
  /**
   * معاينة البنرات والواجهات — للعملاء التجاريين فقط.
   * لا تُضاف روابط لها من الرئيسية أو مسار المستهلك.
   */
  PARTNERS_BANNERS_PREVIEW: '/partners/banners-preview',
  /** طلب B2B للمنشآت الفندقية: بنرات QR مجانية مع الشحن */
  HOSPITALITY_B2B_REQUEST: '/partners/hospitality-request',
  /** صفحة تقييم عبر دعوة QR: /rate/:barberId?t=token */
  RATE_BARBER: '/rate/:barberId',
  /** صفحة الحجز بالاسم للصالون الماسي: /book/:barberId */
  BOOK_BARBER: '/book/:barberId',
  /** صفحة متابعة حجوزات عضو الطاقم عبر رابط سري: /staff-bookings/:token */
  STAFF_BOOKINGS: '/staff-bookings/:token',
  /** صفحة الهبوط التصميمية التجريبية — معاينة فقط */
  LANDING_PREVIEW: '/preview',
  /** صفحة هبوط مسار الخدمات التسويقية للشركاء — معاينة تصميمية */
  LANDING_PARTNERS_PREVIEW: '/preview-partners',
  /** استعراض تقني كوني — HALAQ MAP Cosmic Showcase */
  COSMIC_SHOWCASE: '/cosmic',
  /** صفحة آراء وتعليقات المستخدمين الحرة */
  PLATFORM_REVIEWS: '/reviews',
  /** مركز الوكلاء — صفحة مستقلة لبقية الوكلاء */
  ADMIN_STAFF_HUB: '/staff-hub',
  /** مركز كوافير ماب — مراقبة الهبوط والاهتمام والمهتمات */
  ADMIN_COIFFEUR_HUB: '/coiffeur-hub',
  /** مكتب طلبات متجر halaqmap — اجتماع وكلاء ومسودة الرد */
  ADMIN_STORE_DESK: '/store-desk',
  /** مركز قيد مبيعات المتجر الإلكتروني */
  ADMIN_STORE_SALES: '/store-sales',
  /** إصدار التجارب والمسدد المفعَّل — داخل لوحة التحكم */
  ADMIN_STORE_OPS: '/store-ops',
  /** قائمة مشاركات هدايا المتجر — داخل لوحة التحكم */
  ADMIN_STORE_GIFTS: '/store-gifts',
  /** قائمة تقييمات المتجر — داخل لوحة التحكم */
  ADMIN_STORE_REVIEWS: '/store-reviews',
  /** مركز موافقات إبراز فزعة على الصفحات العامة */
  ADMIN_FAZAA_LISTING: '/fazaa-listing',
  /** شرح مفصّل للمناوب الرقمي الذكي */
  DIGITAL_SHIFT_FEATURE: '/partners/digital-shift',
  /** دليل إضافة المكتب الخاص — تعليمات الاستخدام المفصّلة */
  PRIVATE_OFFICE_GUIDE: '/partners/private-office-guide',
  /** وكيل سعودي — الصفحة الرئيسية */
  SAUDI_AGENT: '/saudi',
  /** معاينة نظام الرصد الذكي — Showcase Radar */
  RADAR_SHOWCASE: '/radar',
  /** صفحة هبوط تجريبية — Roo Landing Lab Experiment */
  ROO_LANDING_LAB: '/lab/roo-landing',
  /** مخيم النجوم الصامت — معمل تصميم مستقل (فلك صحراوي) */
  SILENT_STAR_CAMP: '/lab/silent-star-camp',
  /** قفل الإضاءة الصحراوي — ليل/نجوم + تحكم إضاءة */
  DESERT_LIGHT_LOCK: '/lab/desert-light-lock',
  /** بطاقة سمات — السياسات والتعهدات (المدخل الإلزامي) */
  SEMAT_LEGAL: '/semat',
  /** بطاقة سمات — إعداد البطاقة (بعد الموافقة على السياسات) */
  SEMAT_SETUP: '/semat/setup',
  /** بطاقة سمات — صفحة المسح للحلاق (عرض فقط) */
  SEMAT_SCAN: '/s/:publicId',
  /** كرت تفضيلي للمستعلم — إنتاج تجريبي مجاني فوق سمات */
  INQUIRER_PREFERENCE_CARD: '/card',
  /**
   * جذر سفراء المنصة — يُعاد توجيهه إلى صفحة الدخول/الطلب.
   * يدعم الروابط النظيفة: https://www.halaqmap.com/ambassadors
   */
  AMBASSADOR_HOME: '/ambassadors',
  /**
   * وثيقة قواعد سفراء التسويق الميداني — مرجع قبل بناء لوحة السفير.
   * لا تُربط من القوائم العامة في المرحلة الحالية.
   */
  AMBASSADOR_RULES: '/ambassadors/rules',
  /** دخول / تسجيل سفير ميداني */
  AMBASSADOR_ENTER: '/ambassadors/enter',
  /** لوحة السفير */
  AMBASSADOR_DASHBOARD: '/ambassadors/dashboard',
  /** تدريب ميداني — عارض شرائح داخل المنصة */
  AMBASSADOR_TRAINING: '/ambassadors/training',
} as const;

/** إبقاء توافق مع روابط قديمة تم تداولها سابقاً */
export const LEGACY_PARTNER_ROUTE_PATHS = {
  BARBERS_LANDING: '/for-barbers',
  REGISTER: '/register',
  REGISTER_SUCCESS: '/register/success',
  SUBSCRIPTION_POLICY: '/subscription-policy',
  BARBER_LOGIN: '/barber/login',
  PAYMENT: '/payment',
} as const;
