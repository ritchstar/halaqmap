/** بيانات المنشأة وقنوات الدعم — تُعرض في صفحات سياسات الشركاء (اشتراك / خصوصية). */
export const LEGAL_TRADE_NAME_AR = 'مؤسسة أحمد بن عبدالله بن سراء التجارية';

/** الرقم الوطني الموحد للمنشأة (700xxxxxxxx) — كما في السجل المعتمد */
export const LEGAL_NATIONAL_UNIFIED_NUMBER = '7054117093';

/** عيّن في الإنتاج: VITE_LEGAL_COMMERCIAL_REGISTRATION=رقم_السجل */
export function getLegalCommercialRegistrationDisplay(): string | null {
  const v = String(import.meta.env.VITE_LEGAL_COMMERCIAL_REGISTRATION ?? '').trim();
  return v || null;
}

export const PARTNER_SUPPORT_EMAIL = 'admin@halaqmap.com';
/** بدون + — لروابط wa.me و tel: */
export const PARTNER_SUPPORT_PHONE_E164 = '966559602685';

export const PARTNER_SUPPORT_WHATSAPP_URL = `https://wa.me/${PARTNER_SUPPORT_PHONE_E164}`;

/** عنوان سياسة حزم الرخصة — موحّد في الوثائق القانونية والتذييل والتسجيل */
export const DIGITAL_SOFTWARE_PACKAGES_POLICY_TITLE_AR =
  'سياسة رخصة نفاذ حلاق ماب الرقمية (نظام الاستجابة الذكية)';
