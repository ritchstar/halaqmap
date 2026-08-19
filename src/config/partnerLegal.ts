/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * الاسم الرسمي لمتجر البيع الإلكتروني — لاتيني كما في توثيق التجارة الإلكترونية.
 * لا يُعرَّب اسم المتجر ولا يُستبدل بحروف عربية.
 */
export const LEGAL_ECOMMERCE_STORE_NAME = 'halaqmap' as const;

/** للمتجر داخل جملة عربية — لاتيني معزول حتى لا ينكسر الاتجاه */
export const LEGAL_ECOMMERCE_STORE_MARK_AR = '`halaqmap`' as const;

export const LEGAL_ECOMMERCE_STORE_ROLE_AR =
  'متجر `halaqmap` الإلكتروني للبيع بالتجزئة للبرمجيات';

/**
 * اسم عربي للجمهور على واجهة المتجر.
 * ليس بديلاً عن الاسم اللاتيني الموثّق، ولا يُقدَّم على أنه ترجمة رسمية.
 */
export const LEGAL_ECOMMERCE_STORE_PUBLIC_NAME_AR = 'خريطة الحل' as const;

/** سطر إنجليزي للعنوان العام — الاسم اللاتيني كما في التوثيق */
export const LEGAL_ECOMMERCE_STORE_ENGLISH_LINE = 'halaqmap — retail software store' as const;

/**
 * المنتج البرمجي الأول للمتجر — الاسم العربي للجمهور.
 * الخدمة للمستعلم مجانية، وللصالون حزم نفاذ برمجية.
 */
export const LEGAL_FIRST_SOFTWARE_PRODUCT_AR = 'منصة حلاق ماب' as const;

/**
 * توافق قديم: كان يُخلط مع اسم المتجر.
 * يبقى اسم المنتج الأول فقط. للمتجر استخدم `LEGAL_ECOMMERCE_STORE_NAME`.
 * لا يُدرَج اسم المؤسسة الصريح؛ يُكتفى بالرقم الوطني الموحد كمعرّف رسمي.
 */
export const LEGAL_TRADE_NAME_AR = LEGAL_FIRST_SOFTWARE_PRODUCT_AR;

/** الرقم الوطني الموحد — معرّف السجل التجاري المعتمد وفق وزارة التجارة */
export const LEGAL_NATIONAL_UNIFIED_NUMBER = '7054117093';

/** شهادة توثيق التجارة الإلكترونية — المركز السعودي للتنافسية والأعمال */
export const LEGAL_ECOMMERCE_AUTH_NUMBER = '0000291761';

export const LEGAL_ECOMMERCE_AUTH_STATUS_AR = 'ساري' as const;

/** سطر حالة توثيق التجارة الإلكترونية — للعرض والردود */
export const LEGAL_ECOMMERCE_AUTH_STATUS_LINE_AR = 'توثيق التجارة الإلكترونية ساري' as const;

export const LEGAL_ECOMMERCE_AUTH_ISSUER_AR = 'المركز السعودي للتنافسية والأعمال' as const;

/** بوابة الاستعلام عن متجر إلكتروني موثّق — المركز السعودي للأعمال */
export const LEGAL_ECOMMERCE_INQUIRY_URL =
  'https://eauthenticate.saudibusiness.gov.sa/inquiry' as const;

/** شعار المركز السعودي للأعمال — PNG شفاف */
export const LEGAL_SBC_LOGO_SRC = '/images/saudi-business-center-logo.png' as const;

/** شارة التوثيق في التذييل */
export const LEGAL_ECOMMERCE_VERIFIED_BADGE_AR = 'موثق' as const;

/** تسمية العرض — رقم توثيق التجارة الإلكترونية (للاستعلام في بوابة المركز) */
export const LEGAL_ECOMMERCE_AUTH_NUMBER_LABEL_AR = 'رقم التوثيق' as const;

/** تلميح النسخ — رقم التوثيق لصفحة الاستعلام */
export const LEGAL_ECOMMERCE_INQUIRY_COPY_HINT_AR =
  'انسخ رقم التوثيق والصقه في بوابة الاستعلام للتحقق الفوري';

/** سطر التذييل — يُعرض في الواجهات العامة ومسار الشركاء وصفحات الخصوصية */
export const LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR =
  `شهادة توثيق التجارة الإلكترونية — رقم التوثيق: ${LEGAL_ECOMMERCE_AUTH_NUMBER} (${LEGAL_ECOMMERCE_AUTH_STATUS_AR})`;

/** تراخيص الهيئة العامة لتنظيم الإعلام — كما في التذييل العام */
export const LEGAL_MEDIA_LICENSE_NUMBERS = ['167220', '167221', '167222'] as const;

export const LEGAL_MEDIA_LICENSE_FOOTER_LINE_AR =
  `تراخيص الهيئة العامة لتنظيم الإعلام ${LEGAL_MEDIA_LICENSE_NUMBERS.join(' · ')}`;

/** يُعرض في تذييل صفحة «من نحن» فقط — خط صغير */
export const LEGAL_ENTITY_ABOUT_FOOTER_LINE_AR =
  `متجر ${LEGAL_ECOMMERCE_STORE_MARK_AR} · الرقم الوطني الموحد: ${LEGAL_NATIONAL_UNIFIED_NUMBER}`;

/** تسمية العرض الرسمية — الرقم الموحد هو السجل المعتمد حالياً */
export const LEGAL_UNIFIED_NUMBER_LABEL_AR =
  'الرقم الوطني الموحد (معرّف السجل التجاري المعتمد)' as const;

/** نوع الكيان — شهادة السجل التجاري · وزارة التجارة */
export const LEGAL_ENTITY_TYPE_AR = 'مؤسسة' as const;

/** حالة السجل — شهادة السجل التجاري */
export const LEGAL_REGISTRATION_STATUS_AR = 'نشط' as const;

/** تاريخ إصدار السجل التجاري (Gregorian) — كما في الشهادة */
export const LEGAL_COMMERCIAL_REGISTRATION_ISSUED_AT_AR = '19/04/2026' as const;

export const LEGAL_REGISTRATION_ISSUING_AUTHORITY_AR = 'وزارة التجارة — المملكة العربية السعودية' as const;

/** يُرجع معرّف السجل التجاري المعتمد — الرقم الوطني الموحد (7054117093). */
export function getLegalCommercialRegistrationDisplay(): string {
  return LEGAL_NATIONAL_UNIFIED_NUMBER;
}

export const PARTNER_SUPPORT_EMAIL = 'admin@halaqmap.com';
/** بدون + — لروابط wa.me و tel: */
export const PARTNER_SUPPORT_PHONE_E164 = '966559602685';

export const PARTNER_SUPPORT_WHATSAPP_URL = `https://wa.me/${PARTNER_SUPPORT_PHONE_E164}`;

/** عنوان سياسة حزم الرخصة — موحّد في الوثائق القانونية والتذييل والتسجيل */
export const DIGITAL_SOFTWARE_PACKAGES_POLICY_TITLE_AR =
  'سياسة رخصة نفاذ حلاق ماب الرقمية (نظام الاستجابة الذكية)';

/**
 * صياغة إلزامية في السياسات: المتجر ≠ المنتج.
 * بوابة ميسر واحدة للمتجر؛ كل منتج برمجي يُسمّى ويُسعَّر ثم يُربط بها.
 */
export const LEGAL_STORE_PRODUCT_GATEWAY_DOCTRINE_AR =
  'المتجر الإلكتروني الموثّق هو `halaqmap`، ويعمل بنشاط البيع بالتجزئة للبرمجيات. **منصة حلاق ماب** المنتج البرمجي الأول لهذا المتجر. قد تُسمّى منتجات برمجية لاحقة وتُسعَّر ثم تُربط ببوابة الدفع المعتمدة نفسها، كما رُبط شحن المناوب، دون فتح بوابة ثانية.';
