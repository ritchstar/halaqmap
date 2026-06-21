/**
 * Regulatory / licensing inquiries → mandatory referral to platform management.
 * Used across public agents and admin lab prompts.
 */

import {
  PLATFORM_MANAGEMENT_EMAIL,
  type AgentPersonaId,
  getAgentPersona,
  saudiVoiceDoctrineAr,
} from './agentPersonas.js';

const REGULATORY_PATTERNS: RegExp[] = [
  /هيئ(?:ة|ه)\s*الإعلام/u,
  /General\s*Authority\s*for\s*Media/u,
  /مقيم\s*(?:هيئة|من\s*هيئة)?/u,
  /مفتش|تفتيش/u,
  /ترخيص\s*(?:المنصة|حلاق\s*ماب|حكومي|رسمي|مع(?:ل|)ق)/u,
  /طلب\s*ترخيص/u,
  /(?:CITC|هيئة\s*الاتصالات)/u,
  /(?:وزارة\s*التجارة|MoC).{0,40}(?:ترخيص|ISIC|سجل)/u,
  /(?:سجل\s*تجاري|الرقم\s*الموحد).{0,30}(?:المنصة|حلاق\s*ماب)/u,
  /(?:امتثال|تنظيم).{0,25}(?:حكوم|رسم|جهة\s*رسم)/u,
  /(?:زيارة|مراجعة).{0,30}(?:مندوب|مفتش|مقيم|هيئة)/u,
];

export const PLATFORM_MANAGEMENT_REFERRAL_DOCTRINE_AR = `
═══════════════════════════════════════════════════
【إحالة تنظيمية — إلزامية】
═══════════════════════════════════════════════════
عند أي سؤال عن: ترخيص المنصة لدى جهة رسمية **غير** توثيق التجارة الإلكترونية الموثّق (المركز السعودي للتنافسية والأعمال — رقم 0000291761)، هيئة الإعلام المرئي والمسموع، CITC، تفتيش أو مقيم، طلب ترخيص معلّق، حالة امتثال حكومية غير موثّقة للمنصة، أو زيارة مندوب تنظيمي:
١. لا تُؤكّد ولا تنفي حالة ترخيص صادر أو معلّق — لا تختلق أرقاماً أو تواريخاً.
٢. لا تُجري حواراً كأنك ممثل الجهة التنظيمية أو محامٍ ملزم.
٣. أجب حرفياً بإحالة رسمية إلى **إدارة المنصة** عبر \`${PLATFORM_MANAGEMENT_EMAIL}\` مع عنوان «استفسار تنظيمي».
٤. اختتم بأن الفريق الإداري هو الجهة الوحيدة المخوّلة للمتابعة الرسمية.
لا تخلط بين «رخصة إدراج برمجية» (منتج B2B للشركاء) وبين «ترخيص/امتثال المنصة لدى جهة حكومية» — الثاني يُحال دائماً للإدارة.`.trim();

export const PLATFORM_MANAGEMENT_REFERRAL_REPLY_AR =
  `سؤالك يتعلق بأمور تنظيمية أو ترخيصية تخص منصة حلاق ماب على مستوى الجهات الرسمية. ` +
  `لا يمكنني تقديم توضيح ملزم في هذه القناة — يُحال طلبك إلى **إدارة المنصة** للمتابعة الرسمية. ` +
  `تواصل عبر \`${PLATFORM_MANAGEMENT_EMAIL}\` مع عنوان «استفسار تنظيمي» وسيتواصل معك الفريق المختص.`;

export function isPlatformRegulatoryInquiry(message: string): boolean {
  const text = message.trim();
  if (!text) return false;
  return REGULATORY_PATTERNS.some((re) => re.test(text));
}

export function resolveRegulatoryReferral(message: string): string | null {
  return isPlatformRegulatoryInquiry(message) ? PLATFORM_MANAGEMENT_REFERRAL_REPLY_AR : null;
}

export function appendUniversalAgentDoctrines(prompt: string, agentId: AgentPersonaId): string {
  const persona = getAgentPersona(agentId);
  return [
    prompt,
    '',
    PLATFORM_MANAGEMENT_REFERRAL_DOCTRINE_AR,
    '',
    '═══════════════════════════════════════════════════',
    '【الهوية السعودية للوكيل】',
    '═══════════════════════════════════════════════════',
    saudiVoiceDoctrineAr(persona),
  ].join('\n');
}
