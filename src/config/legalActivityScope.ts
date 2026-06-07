/**
 * legalActivityScope — امتثال النشاط المرخّص (ISIC4 474151)
 * مصدر واحد للفقرات القانونية التي تربط المنصة بنشاط «بيع البرمجيات بالتجزئة».
 */
import {
  ISIC_ACTIVITY_CODE,
  ISIC_ACTIVITY_CODE_LABEL_AR,
  ISIC_ACTIVITY_GASTAT_DEFINITION_AR,
  ISIC_ACTIVITY_LABEL_AR,
  ISIC_MOC_ACTIVITY_NAME_AR,
  ISIC_MOC_MAIN_SECTOR_AR,
  ISIC_MOC_SUB_SECTOR_AR,
} from '@/config/geospatialLicenseDoctrine';
import {
  LEGAL_COMMERCIAL_REGISTRATION_ISSUED_AT_AR,
  LEGAL_ENTITY_TYPE_AR,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
  LEGAL_REGISTRATION_ISSUING_AUTHORITY_AR,
  LEGAL_REGISTRATION_STATUS_AR,
  LEGAL_TRADE_NAME_AR,
  LEGAL_UNIFIED_NUMBER_LABEL_AR,
} from '@/config/partnerLegal';

export {
  ISIC_ACTIVITY_CODE,
  ISIC_ACTIVITY_CODE_LABEL_AR,
  ISIC_ACTIVITY_GASTAT_DEFINITION_AR,
  ISIC_ACTIVITY_LABEL_AR,
  ISIC_MOC_ACTIVITY_NAME_AR,
  ISIC_MOC_MAIN_SECTOR_AR,
  ISIC_MOC_SUB_SECTOR_AR,
};

export const LICENSED_ACTIVITY_SCOPE_TITLE_AR = 'نطاق النشاط المرخّص';

export const LICENSED_ACTIVITY_ENTITY_STRIP_AR =
  `${LEGAL_TRADE_NAME_AR} · ${LEGAL_ENTITY_TYPE_AR} · ${LEGAL_UNIFIED_NUMBER_LABEL_AR}: ${LEGAL_NATIONAL_UNIFIED_NUMBER} · سجل **${LEGAL_REGISTRATION_STATUS_AR}** (${LEGAL_REGISTRATION_ISSUING_AUTHORITY_AR} · إصدار ${LEGAL_COMMERCIAL_REGISTRATION_ISSUED_AT_AR}).`;

export const LICENSED_ACTIVITY_ISIC_HIERARCHY_AR =
  `**التصنيف الاسترشادي — وزارة التجارة (ISIC4):**\n` +
  `- القطاع الرئيسي: ${ISIC_MOC_MAIN_SECTOR_AR}\n` +
  `- القطاع الفرعي: ${ISIC_MOC_SUB_SECTOR_AR}\n` +
  `- النشاط (${ISIC_ACTIVITY_CODE}): ${ISIC_MOC_ACTIVITY_NAME_AR}`;

export const LICENSED_ACTIVITY_SCOPE_OPENING_AR =
  `تعمل **${LEGAL_TRADE_NAME_AR}** عبر منصة **حلاق ماب** بموجب نشاط **${ISIC_ACTIVITY_LABEL_AR}** (${ISIC_ACTIVITY_CODE_LABEL_AR}: **${ISIC_ACTIVITY_CODE}**)، وفق تعريف **الهيئة العامة للإحصاء (GaStat)**.`;

export const LICENSED_ACTIVITY_SCOPE_PARAGRAPH_AR =
  `${LICENSED_ACTIVITY_SCOPE_OPENING_AR}\n\n${ISIC_ACTIVITY_GASTAT_DEFINITION_AR}\n\n` +
  `${LICENSED_ACTIVITY_ENTITY_STRIP_AR}\n\n` +
  'المنتج المعروض للبيع إلكترونياً هو **رخصة نفاذ رقمية** و/أو **إضافات برمجية** (Add-on) على **نظام الاستجابة الذكية** — أي **برمجيات حاسوبية جاهزة** ضمن نطاق النشاط — وليس خدمة حلاقة أو حجزاً أو وساطة تجارية. ' +
  'خدمة الاستعلام والعرض اللحظي للمستخدم النهائي **مجانية** ولا تُعدّ بيعاً منفصلاً للأفراد؛ إيراد المنصة من **بيع المنتجات البرمجية B2B** فقط. ' +
  'تعمل المنصة بنظام الاستجابة الذكية، ويقتصر دورها على المعالجة والفلترة اللحظية بين استعلام المستخدمين وبيانات الحلاقين المتاحة داخل المنصة، ثم عرض النتيجة المناسبة وفق البيانات المتاحة من الأطراف أنفسهم، وأي علاقة بين المستخدم النهائي والصالون في تنفيذ الخدمة الحِرفية **مباشرة** بينهما دون وساطة المنصة أو عمولة عليها.';

export const LICENSED_ACTIVITY_IN_SCOPE_AR: readonly string[] = [
  'تجارة وعرض وبيع برمجيات حاسوبية جاهزة (Software) — رخصة نفاذ رقمية',
  'بيع رخصة نفاذ رقمية مسبقة الدفع (برونزي · ذهبي · ماسي)',
  'بيع إضافات برمجية اختيارية (مثل المناوب الرقمي الذكي)',
  'تشغيل نظام استجابة وعرض رقمي كبنية تقنية مرفقة بالرخصة',
  'إصدار شهادة تفعيل وإيصال إلكتروني يُثبت شراء المنتج البرمجي',
];

export const LICENSED_ACTIVITY_OUT_OF_SCOPE_AR: readonly string[] = [
  'وساطة حجز أو عمولة على خدمة الحلاقة',
  'تعاقد نيابة عن العميل أو الصالون',
  'تحصيل أو تسعير نيابة عن الصالون',
  'تقديم خدمة بدنية (حلاقة · قص · تشغيل صالون)',
];

export const SOFTWARE_PRODUCT_PURCHASE_ACK_AR =
  `أقر أنني أشتري **منتجاً برمجياً رقمياً** (رخصة نفاذ و/أو إضافة برمجية) بموجب نشاط **${ISIC_ACTIVITY_LABEL_AR}** (${ISIC_ACTIVITY_CODE_LABEL_AR}: ${ISIC_ACTIVITY_CODE})، ` +
  'وليس خدمة حلاقة أو حجزاً أو وساطة تجارية.';

export const SOFTWARE_PRODUCT_PURCHASE_ACK_SHORT_AR =
  'أقر شراء منتج برمجي رقمي وفق ISIC4 474151';

export const SOFTWARE_PRODUCT_PURCHASE_ACK_MODAL_AR =
  `${SOFTWARE_PRODUCT_PURCHASE_ACK_AR}\n\n` +
  'يُفعَّل الظهور ضمن نظام الاستجابة الذكية بعد نجاح الدفع فقط، وفق مدة حزمة الرخصة المشتراة. لا تجديد تلقائي.';

/** فقرة موحّدة لصفحات الشروط والسياسات */
export function formatLicensedActivityScopeLegalSection(): string {
  const inScope = LICENSED_ACTIVITY_IN_SCOPE_AR.map((x) => `- ${x}`).join('\n');
  const outScope = LICENSED_ACTIVITY_OUT_OF_SCOPE_AR.map((x) => `- ${x}`).join('\n');
  return (
    `${LICENSED_ACTIVITY_SCOPE_PARAGRAPH_AR}\n\n` +
    `${LICENSED_ACTIVITY_ISIC_HIERARCHY_AR}\n\n` +
    `**ضمن نطاق النشاط (${ISIC_ACTIVITY_CODE}):**\n${inScope}\n\n` +
    `**خارج نطاق النشاط — ولا تُمارسه المنصة:**\n${outScope}`
  );
}

/** مذكّر للوكلاء الذكيين — يُنسخ في api/_lib/legalActivityScope.ts أيضاً */
export const LICENSED_ACTIVITY_AI_DOCTRINE_AR =
  `【نطاق النشاط المرخّص — ISIC4 ${ISIC_ACTIVITY_CODE} · GaStat】\n` +
  `- ${ISIC_ACTIVITY_LABEL_AR}\n` +
  `- GaStat: تجارة وعرض وبيع برمجيات حاسوبية جاهزة (Software)\n` +
  `- البيع: رخصة نفاذ رقمية + Add-ons برمجية فقط\n` +
  `- ممنوع وصف المنصة كوسيط حجز أو عمولة حلاقة\n` +
  `- B2C مجاني — B2B مدفوع`;
