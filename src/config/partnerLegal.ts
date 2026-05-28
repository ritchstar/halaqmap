/** بيانات المنشأة وقنوات الدعم — تُعرض في صفحات سياسات الشركاء (اشتراك / خصوصية). */
export const LEGAL_TRADE_NAME_AR = 'مؤسسة أحمد بن عبدالله بن سراء التجارية';

/** الرقم الوطني الموحد — معرّف السجل التجاري المعتمد وفق وزارة التجارة */
export const LEGAL_NATIONAL_UNIFIED_NUMBER = '7054117093';

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
