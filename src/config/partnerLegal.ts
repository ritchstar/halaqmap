/** بيانات المنشأة وقنوات الدعم — تُعرض في صفحات سياسات الشركاء (اشتراك / خصوصية). */
export const LEGAL_TRADE_NAME_AR = 'مؤسسة أحمد بن عبدالله بن سراء التجارية';

/** الرقم الوطني الموحد — معرّف السجل التجاري المعتمد وفق وزارة التجارة */
export const LEGAL_NATIONAL_UNIFIED_NUMBER = '7054117093';

/** شهادة توثيق التجارة الإلكترونية — المركز السعودي للتنافسية والأعمال */
export const LEGAL_ECOMMERCE_AUTH_NUMBER = '0000291761';

export const LEGAL_ECOMMERCE_AUTH_STATUS_AR = 'ساري' as const;

/** تاريخ إصدار شهادة توثيق التجارة الإلكترونية (Gregorian) */
export const LEGAL_ECOMMERCE_AUTH_ISSUED_AT_AR = '18/05/2026' as const;

/** تاريخ انتهاء شهادة توثيق التجارة الإلكترونية (Gregorian) */
export const LEGAL_ECOMMERCE_AUTH_EXPIRES_AT_AR = '18/04/2027' as const;

export const LEGAL_ECOMMERCE_AUTH_ISSUER_AR = 'المركز السعودي للتنافسية والأعمال' as const;

/** بوابة الاستعلام عن متجر إلكتروني موثّق — المركز السعودي للأعمال */
export const LEGAL_ECOMMERCE_INQUIRY_URL =
  'https://eauthenticate.saudibusiness.gov.sa/inquiry' as const;

/** شعار المركز السعودي للأعمال — PNG شفاف */
export const LEGAL_SBC_LOGO_SRC = '/images/saudi-business-center-logo.png' as const;

/** شارة التوثيق في التذييل */
export const LEGAL_ECOMMERCE_VERIFIED_BADGE_AR = 'موثق' as const;

/** تلميح النسخ — الرقم الوطني الموحد لصفحة الاستعلام */
export const LEGAL_ECOMMERCE_INQUIRY_COPY_HINT_AR =
  'انسخ الرقم الوطني الموحد والصقه في بوابة الاستعلام للتحقق الفوري';

/** سطر التذييل — يُعرض في الواجهات العامة ومسار الشركاء وصفحات الخصوصية */
export const LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR =
  `شهادة توثيق التجارة الإلكترونية — رقم التوثيق: ${LEGAL_ECOMMERCE_AUTH_NUMBER} (${LEGAL_ECOMMERCE_AUTH_STATUS_AR})`;

/** يُعرض في تذييل صفحة «من نحن» فقط — خط صغير */
export const LEGAL_ENTITY_ABOUT_FOOTER_LINE_AR =
  `${LEGAL_TRADE_NAME_AR} · الرقم الوطني الموحد: ${LEGAL_NATIONAL_UNIFIED_NUMBER}`;

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
