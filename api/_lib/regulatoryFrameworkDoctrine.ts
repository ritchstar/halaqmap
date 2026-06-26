/**
 * الإطار النظامي المعتمد — نسخة API
 * يُحدَّث بالتزامن مع src/config/regulatoryFrameworkDoctrine.ts
 */
import {
  ISIC_ACTIVITY_CODE,
  ISIC_MOC_ACTIVITY_NAME_AR,
} from './geospatialLicenseDoctrine.js';
import {
  LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR,
  LEGAL_ECOMMERCE_AUTH_ISSUER_AR,
  LEGAL_ECOMMERCE_AUTH_NUMBER,
  LEGAL_ECOMMERCE_AUTH_STATUS_AR,
  LEGAL_ECOMMERCE_INQUIRY_URL,
  LEGAL_MEDIA_LICENSE_FOOTER_LINE_AR,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
} from './ecommerceAuthDoctrine.js';

const REGULATORY_FRAMEWORK_HIGHLIGHT_ACTIVITIES_AR =
  `${ISIC_ACTIVITY_CODE} ${ISIC_MOC_ACTIVITY_NAME_AR} (النشاط المعتمد للمنصة) · ` +
  '620102 تصميم وبرمجة البرمجيات الخاصة · 731011 مؤسسات ووكالات الدعاية والاعلان';

export {
  LEGAL_MEDIA_LICENSE_FOOTER_LINE_AR,
  REGULATORY_FRAMEWORK_HIGHLIGHT_ACTIVITIES_AR,
};

export const REGULATORY_FRAMEWORK_CANONICAL_REPLY_AR =
  `**الإطار النظامي باختصار:**\n\n` +
  `• **النشاط المعتمد للمنصة:** \`ISIC4 ${ISIC_ACTIVITY_CODE}\` — ${ISIC_MOC_ACTIVITY_NAME_AR} (رخصة النفاذ الرقمية B2B).\n` +
  `• **أنشطة مسجّلة بارزة:** ${REGULATORY_FRAMEWORK_HIGHLIGHT_ACTIVITIES_AR}.\n` +
  `• **توثيق التجارة الإلكترونية:** رقم ${LEGAL_ECOMMERCE_AUTH_NUMBER} (${LEGAL_ECOMMERCE_AUTH_STATUS_AR}) — ${LEGAL_ECOMMERCE_AUTH_ISSUER_AR}.\n` +
  `• **${LEGAL_MEDIA_LICENSE_FOOTER_LINE_AR}**.\n` +
  `• **الرقم الوطني الموحد (السجل التجاري):** ${LEGAL_NATIONAL_UNIFIED_NUMBER}.\n\n` +
  `**للتحقق الذاتي:** ${LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR} — يظهر في تذييل الرئيسية ومسار الشركاء وصفحات الخصوصية.\n` +
  `**بوابة استعلام التجارة الإلكترونية:** ${LEGAL_ECOMMERCE_INQUIRY_URL} — الرقم الوطني الموحد للنسخ: ${LEGAL_NATIONAL_UNIFIED_NUMBER}.`;

export const REGULATORY_FRAMEWORK_DOCTRINE_AR = `
═══════════════════════════════════════════════════
【الإطار النظامي المعتمد — قواعد إلزامية】
═══════════════════════════════════════════════════
- **لا تخلط** بين: (١) نشاط السجل التجاري \`ISIC4\`، (٢) توثيق التجارة الإلكترونية، (٣) تراخيص الهيئة العامة لتنظيم الإعلام — ثلاث مسارات مستقلة.
- **النشاط المعتمد للمنصة:** \`ISIC4 ${ISIC_ACTIVITY_CODE}\` — ${ISIC_MOC_ACTIVITY_NAME_AR} — هذا ما تُباع تحته رخصة النفاذ الرقمية B2B.
- **أنشطة داعمة بارزة في السجل:** ${REGULATORY_FRAMEWORK_HIGHLIGHT_ACTIVITIES_AR} — تدعم التطوير والتسويق؛ ليست منتجاً منفصلاً تُباع للحلاق.
- **توثيق التجارة الإلكترونية:** ${LEGAL_ECOMMERCE_AUTH_ISSUER_AR} — رقم **${LEGAL_ECOMMERCE_AUTH_NUMBER}** (${LEGAL_ECOMMERCE_AUTH_STATUS_AR}).
- **تراخيص الإعلام:** ${LEGAL_MEDIA_LICENSE_FOOTER_LINE_AR} — **اذكر الثلاثة معاً**؛ لا تكتفِ برقم واحد.
- **الرقم الوطني الموحد:** **${LEGAL_NATIONAL_UNIFIED_NUMBER}**.

【ما يجب قوله】
✅ عند سؤال «الترخيص» أو «الوضع النظامي»: ابدأ بالإطار أعلاه ثم انتقل للميزة التجارية.
✅ اربط \`474151\` بمنتج B2B — لا تخلطه بامتثال صالون الشريك.
✅ للتحقق الذاتي: التذييل في الرئيسية ومسار الشركاء وصفحات الخصوصية.

【ممنوعات — لا تُخالَف】
❌ لا تربط كل رقم إعلامي بنشاط \`ISIC\` محدد إلا إذا كان موثّقاً — اعرض التراخيص كمجموعة واحدة.
❌ لا تختلق أرقاماً أو جهات أو تواريخ غير المذكورة أعلاه.
❌ لا تنفي التراخيص/التوثيق المعروضة — ولا تَعِد بترخيص «معلق» أو «قيد الإصدار».
❌ أسئلة التفتيش/المقيم/الترخيص المعلق/زيارة مندوب → **إحالة إدارة المنصة** فقط.

【قالب جاهز — استخدمه أو ما يعادله】
${REGULATORY_FRAMEWORK_CANONICAL_REPLY_AR}
`.trim();

const REGULATORY_FRAMEWORK_INQUIRY_PATTERN =
  /(?:الوضع\s*النظامي|الأنشطة\s*الرسمية|(?:ال)?إطار\s*النظامي|امتثال\s*المنصة|(?:بال)?نسبة\s*ل(?:ل)?(?:ترخيص|التوثيق)|(?:ال)?ترخيص(?:\s|$)|ISIC|474151|620102|731011|16722[012]|تراخيص\s*(?:ال)?(?:هيئة|إعلام)|هيئة\s*(?:ال)?(?:إعلام|تنظيم\s*الإعلام)|(?:سجل\s*تجاري|الرقم\s*(?:ال)?(?:وطني\s*)?الموحد).{0,40}(?:المنصة|حلاق\s*ماب|7054117093)|7054117093)/u;

const SENSITIVE_REGULATORY_INQUIRY_PATTERN =
  /(?:مقيم|مفتش|تفتيش|ترخيص\s*معلق|طلب\s*ترخيص|(?:CITC|هيئة\s*الاتصالات)|(?:زيارة|مراجعة).{0,30}(?:مندوب|مفتش|مقيم|هيئة)|قيد\s*(?:ال)?(?:مراجعة|إصدار|الإجراء))/u;

export function isSensitiveRegulatoryInquiry(message: string): boolean {
  const text = message.trim();
  if (!text) return false;
  return SENSITIVE_REGULATORY_INQUIRY_PATTERN.test(text);
}

export function isRegulatoryFrameworkInquiry(message: string): boolean {
  const text = message.trim();
  if (!text) return false;
  if (isSensitiveRegulatoryInquiry(text)) return false;
  return REGULATORY_FRAMEWORK_INQUIRY_PATTERN.test(text);
}

export function resolveRegulatoryFrameworkCanonicalReply(message: string): string | null {
  return isRegulatoryFrameworkInquiry(message) ? REGULATORY_FRAMEWORK_CANONICAL_REPLY_AR : null;
}
