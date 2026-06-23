/**
 * عقيدة توثيق التجارة الإلكترونية — مصدر الحقيقة للنصوص والوكلاء.
 * يُحدَّث بالتزامن مع api/_lib/ecommerceAuthDoctrine.ts
 */
import {
  LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR,
  LEGAL_ECOMMERCE_AUTH_ISSUER_AR,
  LEGAL_ECOMMERCE_AUTH_STATUS_LINE_AR,
  LEGAL_ECOMMERCE_AUTH_NUMBER,
  LEGAL_ECOMMERCE_AUTH_STATUS_AR,
  LEGAL_ECOMMERCE_INQUIRY_URL,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
} from '@/config/partnerLegal';

export {
  LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR,
  LEGAL_ECOMMERCE_AUTH_ISSUER_AR,
  LEGAL_ECOMMERCE_AUTH_STATUS_LINE_AR,
  LEGAL_ECOMMERCE_AUTH_NUMBER,
  LEGAL_ECOMMERCE_AUTH_STATUS_AR,
};

/** ملخص واحد — للنصوص القصيرة والوكلاء */
export const ECOMMERCE_AUTH_VERIFIED_SUMMARY_AR =
  `المنصة موثّقة للعمل بالتجارة الإلكترونية لدى ${LEGAL_ECOMMERCE_AUTH_ISSUER_AR} — رقم التوثيق ${LEGAL_ECOMMERCE_AUTH_NUMBER} (${LEGAL_ECOMMERCE_AUTH_STATUS_AR}).`;

/** قالب جاهز — مدير المبيعات / المتحدث / الناظر */
export const ECOMMERCE_AUTH_CANONICAL_REPLY_AR =
  `نعم — ${ECOMMERCE_AUTH_VERIFIED_SUMMARY_AR}\n\n` +
  `• الجهة: ${LEGAL_ECOMMERCE_AUTH_ISSUER_AR}\n` +
  `• الرقم الوطني الموحد (السجل التجاري): ${LEGAL_NATIONAL_UNIFIED_NUMBER}\n` +
  `• الحالة: ${LEGAL_ECOMMERCE_AUTH_STATUS_LINE_AR}\n` +
  `• للتحقق الذاتي: ${LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR} — يظهر في تذييل الرئيسية ومسار الشركاء وصفحات الخصوصية.\n` +
  `• بوابة الاستعلام: ${LEGAL_ECOMMERCE_INQUIRY_URL} — الرقم الوطني الموحد للنسخ: ${LEGAL_NATIONAL_UNIFIED_NUMBER}.`;

/** عقيدة إلزامية — تُحقَن في prompts الوكلاء */
export const ECOMMERCE_AUTH_DOCTRINE_AR = `
═══════════════════════════════════════════════════
【توثيق التجارة الإلكترونية — عقيدة إلزامية · مكتمل】
═══════════════════════════════════════════════════
- المنصة **موثّقة رسمياً** للعمل بالتجارة الإلكترونية لدى **${LEGAL_ECOMMERCE_AUTH_ISSUER_AR}**.
- رقم التوثيق: **${LEGAL_ECOMMERCE_AUTH_NUMBER}** — الحالة: **${LEGAL_ECOMMERCE_AUTH_STATUS_AR}**.
- لا تذكر تاريخ انتهاء ولا «ساري حتى» في ردك على توثيق التجارة الإلكترونية.
- الرقم الوطني الموحد (السجل التجاري): **${LEGAL_NATIONAL_UNIFIED_NUMBER}**.
- سطر التذييل العام: «${LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR}».

【ما يجب قوله】
✅ «المنصة موثّقة للتجارة الإلكترونية من ${LEGAL_ECOMMERCE_AUTH_ISSUER_AR} — رقم ${LEGAL_ECOMMERCE_AUTH_NUMBER} (ساري)».
✅ «يمكنك التحقق من رقم التوثيق في تذييل الموقع — الرئيسية، مسار الشركاء، وصفحات الخصوصية».
✅ اربط التوثيق بثقة الشريك دون مبالغة: امتثال رسمي + شفافية + مسار تسجيل واضح.

【ممنوعات — لا تُخالَف】
❌ لا تقل إن توثيق التجارة الإلكترونية «تحت المعالجة» أو «قيد الإجراء» أو «لم يكتمل» — **اكتمل**.
❌ لا تؤجّل «التشغيل التجاري» أو «فتح الاشتراكات» بسبب انتظار توثيق التجارة — التوثيق **ساري**.
❌ **ممنوع** ذكر **تاريخ انتهاء** أو **ساري حتى** أو **صلاحية الشهادة** (من–إلى) لتوثيق التجارة الإلكترونية.
❌ لا تختلق أرقاماً أو جهات أو تواريخ غير المذكورة أعلاه.
❌ لا تخلط بين «توثيق التجارة الإلكترونية للمنصة» وبين «امتثال صالون الشريك لاشتراطاته» — الأخير مسؤولية الشريك بالتعهد القانوني.

【قالب جاهز — استخدمه أو ما يعادله】
${ECOMMERCE_AUTH_CANONICAL_REPLY_AR}
`.trim();

const ECOMMERCE_INQUIRY_PATTERN =
  /(?:توثيق|شهادة|موث(?:ق|قة)|اعتماد).{0,40}(?:التجارة\s*ال(?:إ|ا)لكترون(?:ية|يه)|e-?\s*commerce)|(?:التجارة\s*ال(?:إ|ا)لكترون(?:ية|يه)).{0,40}(?:توثيق|شهادة|موث(?:ق|قة)|0000291761)|0000291761|(?:المركز\s*السعودي|مركز\s*أعمال).{0,30}(?:تنافس|أعمال)|رقم\s*التوثيق/u;

export function isEcommerceAuthInquiry(message: string): boolean {
  const text = message.trim();
  if (!text) return false;
  return ECOMMERCE_INQUIRY_PATTERN.test(text);
}

export function resolveEcommerceAuthCanonicalReply(message: string): string | null {
  return isEcommerceAuthInquiry(message) ? ECOMMERCE_AUTH_CANONICAL_REPLY_AR : null;
}
