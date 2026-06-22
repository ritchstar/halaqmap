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
import { isSensitiveRegulatoryInquiry } from './regulatoryFrameworkDoctrine.js';

const SENSITIVE_REGULATORY_PATTERNS: RegExp[] = [
  /مقيم\s*(?:هيئة|من\s*هيئة)?/u,
  /مفتش|تفتيش/u,
  /ترخيص\s*معلق/u,
  /طلب\s*ترخيص/u,
  /(?:CITC|هيئة\s*الاتصالات)/u,
  /(?:زيارة|مراجعة).{0,30}(?:مندوب|مفتش|مقيم|هيئة)/u,
  /قيد\s*(?:ال)?(?:مراجعة|إصدار|الإجراء)/u,
];

export const PLATFORM_MANAGEMENT_REFERRAL_DOCTRINE_AR = `
═══════════════════════════════════════════════════
【إحالة تنظيمية — إلزامية】
═══════════════════════════════════════════════════
عند أي سؤال عن: تفتيش أو مقيم، طلب ترخيص **معلق**، حالة امتثال حكومية **غير** موثّقة في الإطار النظامي المعتمد، زيارة مندوب تنظيمي، أو CITC/هيئة الاتصالات ب تفاصيل غير معروضة:
١. لا تُؤكّد ولا تنفي حالة ترخيص صادر أو معلّق — لا تختلق أرقاماً أو تواريخاً.
٢. لا تُجري حواراً كأنك ممثل الجهة التنظيمية أو محامٍ ملزم.
٣. أجب حرفياً بإحالة رسمية إلى **إدارة المنصة** عبر \`${PLATFORM_MANAGEMENT_EMAIL}\` مع عنوان «استفسار تنظيمي».
٤. اختتم بأن الفريق الإداري هو الجهة الوحيدة المخوّلة للمتابعة الرسمية.

**استثناء — لا تُحِل:** أسئلة الإطار النظامي **الموثّق** (أنشطة \`ISIC4\`، توثيق التجارة الإلكترونية 0000291761، تراخيص الإعلام 167220·167221·167222) — استخدم عقيدة الإطار النظامي المعتمد بدلاً من الإحالة.
لا تخلط بين «رخصة إدراج برمجية» (منتج B2B للشركاء) وبين «ترخيص/امتثال المنصة لدى جهة حكومية غير موثّق» — الأخير يُحال للإدارة.`.trim();

export const PLATFORM_MANAGEMENT_REFERRAL_REPLY_AR =
  `سؤالك يتعلق بأمور تنظيمية أو ترخيصية تخص منصة حلاق ماب على مستوى الجهات الرسمية. ` +
  `لا يمكنني تقديم توضيح ملزم في هذه القناة — يُحال طلبك إلى **إدارة المنصة** للمتابعة الرسمية. ` +
  `تواصل عبر \`${PLATFORM_MANAGEMENT_EMAIL}\` مع عنوان «استفسار تنظيمي» وسيتواصل معك الفريق المختص.`;

export function isPlatformRegulatoryInquiry(message: string): boolean {
  return isSensitiveRegulatoryInquiry(message);
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
