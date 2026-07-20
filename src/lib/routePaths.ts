/**
 * مسارات المنصة فقط — ملف خفيف مستقل عن lib/index
 * حتى لا تُسحب حزمة App داخل chunks الصفحة الرئيسية (يكسر حلقة circular lazy).
 */

export const ROUTE_PATHS = {
  HOME: '/',
  BARBERS_LANDING: '/partners',
  /** صفحة هبوط B2B (Skywork) — partners.halaqmap.com */
  PARTNERS_B2B_LANDING: '/partners/b2b',
  /** إقناع عميق: لماذا حلاق ماب وليس مجرد «حجز» */
  PARTNER_WHY: '/partners/why',
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
  /** طلب تجربة برونزي — طابور تقييم (ليس تسجيلاً رسمياً) */
  BRONZE_TRIAL_APPLY: '/partners/bronze-trial',
  /** تأكيد بريد طلب التجربة (?c=token) */
  BRONZE_TRIAL_CONFIRM: '/partners/bronze-trial/confirm',
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
  /** دخول سريع من بريد الترحيب: ?m=رمز موقّع (مرة واحدة) */
  BARBER_PORTAL_ENTER: '/barber/enter',
  BARBER_DASHBOARD: '/barber/dashboard',
  /** طلب حذف الحساب (باقة برونزية — نموذج يُحال للإدارة) */
  BARBER_ACCOUNT_DELETE_REQUEST: '/barber/request-account-deletion',
  PAYMENT: '/partners/payment',
  /** دعم فني للشركاء — محادثة خاصة بجلسة ساعة (?t=رمز_فريد) */
  PARTNER_SUPPORT: '/partners/support',
  /** مكتب مدير المبيعات B2B — صفحة مستقلة للتفاوض والشرح والانضمام */
  PARTNER_SALES_OFFICE: '/partners/sales-office',
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
