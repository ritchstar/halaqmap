/**
 * مجلس استشارة مساعد الشركاء — وكلاء داخليون بملخصات **آمنة للشركاء**.
 * لا تُكشف: مقاصد سرية، labs، migrations، مسارات API، أو بنية AI Staff.
 */
import {
  DIGITAL_SHIFT_LANGUAGE_DETECTION_FEATURE_AR,
  DIGITAL_SHIFT_TRANSLATED_CHAT_FEATURE_AR,
  formatSupportedLanguagesLabelAr,
} from './digitalShiftLanguages.js';
import { DIGITAL_SHIFT_REPLY_COST_HALALAS } from './digitalShiftAssistant.js';
import {
  DIGITAL_SHIFT_ADDON_VALUE_AR,
  DIGITAL_SHIFT_ADMIN_LAB_PRODUCT_NOTE_AR,
  DIGITAL_SHIFT_MONTHLY_ADDON_SAR,
  DIGITAL_SHIFT_PRODUCT_NAME_AR,
  DIGITAL_SHIFT_SOFTWARE_ADDON_BADGE_AR,
  ZATCA_PLATFORM_PACKAGES_NOTE_AR,
} from './subscriptionPricingCopy.js';
import { TERM_PACKAGE_ACTIVATION_AR } from './softwareLicenseTerminology.js';

export type PartnerCouncilAgentId =
  | 'digital_shift_field'
  | 'fleet_operations_center'
  | 'partner_relations_liaison'
  | 'zatca_tax_advisor'
  | 'b2b_marketing_strategist'
  | 'public_prosecutor'
  | 'billing_treasurer'
  | 'system_crisis_advisor';

export type PartnerCouncilAgentDef = {
  id: PartnerCouncilAgentId;
  /** للربط الداخلي بسجل AI Staff — لا يُعرض للشركاء */
  staffRegistryId?: string;
  topicKeywords: readonly string[];
  publicBriefLines: readonly string[];
};

const LANGS = formatSupportedLanguagesLabelAr();

export const PARTNER_CONSULTABLE_AGENTS: readonly PartnerCouncilAgentDef[] = [
  {
    id: 'digital_shift_field',
    staffRegistryId: 'digital_shift_field',
    topicKeywords: [
      'مناوب',
      'المناوب',
      'shift',
      'addon',
      'add-on',
      '225',
      '25',
      'شات',
      'ترجمة',
      'لغة',
      'اعتراض',
      'إغلاق',
      'محفظة',
      'هللة',
      'ضيافة',
      'عميل',
      'زبون',
    ],
    publicBriefLines: [
      `${DIGITAL_SHIFT_PRODUCT_NAME_AR} — ${DIGITAL_SHIFT_SOFTWARE_ADDON_BADGE_AR}.`,
      DIGITAL_SHIFT_ADMIN_LAB_PRODUCT_NOTE_AR,
      DIGITAL_SHIFT_ADDON_VALUE_AR,
      `- تكلفة كل رد آلي: ${DIGITAL_SHIFT_REPLY_COST_HALALAS} هللة (1.50 ر.س) من محفظة الحلاق — لا من العميل.`,
      '- يعمل في الشات الخاص داخل المنصة: (1) اعتراض عند إغلاق المحل فوراً (2) بعد مهلة تأخير (افتراضي 3 دقائق) أثناء الدوام إذا لم يرد الحلاق.',
      `- ${DIGITAL_SHIFT_LANGUAGE_DETECTION_FEATURE_AR}`,
      `- اللغات: ${LANGS}.`,
      `- ${DIGITAL_SHIFT_TRANSLATED_CHAT_FEATURE_AR}`,
      '- أسلوب: آداب سعودية تجارية («يا عمنا»، «تفضل») — مختصر ومحترم.',
      '- ممنوع: تغيير أسعار الخدمة، حجز مدفوع، أو التلاعب بمحفظة العميل.',
      '- التفعيل: شراء Add-on مع الماسية (+25 ر.س/حزمة) → لوحة الحلاق → تبويب المناوب الذكي.',
    ],
  },
  {
    id: 'fleet_operations_center',
    staffRegistryId: 'fleet_director_general',
    topicKeywords: [
      'أسطول',
      'قيادة',
      'fleet',
      'جودة',
      'تدريب',
      'آداب',
      'معايير',
      'اتساق',
      'مناوب',
      'ضيافة',
      'rollout',
      'تحسين',
    ],
    publicBriefLines: [
      '**معرفة تشغيلية مركزية (نسخة آمنة للشركاء)** — تُحسّن جودة المناوب الرقمي على مستوى المنصة دون أن يرى الحلاق أي «غرفة قيادة».',
      '- معايير موحّدة للآداب السعودية ولغات الضيافة السبع — لضمان ردود متسقة تعكس صالونك.',
      '- قواعد اعتراض موحّدة: مغلق → رد فوري؛ مفتوح + تأخر → اعتراض بعد المهلة.',
      '- توصيات ذكية للحلاق: رصيد المحفظة، جودة البنر، معرض الصور، أسلوب الشات — من لوحة المناوب.',
      '- المنصة تطوّر سلوك المناوب تدريجياً بتحديثات منتج — **لا حاجة لإجراء من الحلاق**؛ يظهر التحسين في جودة الردود.',
      '- **لا تُكشف للشريك:** قنوات خلفية، مقاصد سرية، أو أسماء وكلاء داخليين.',
    ],
  },
  {
    id: 'partner_relations_liaison',
    staffRegistryId: 'partner_relations_liaison',
    topicKeywords: [
      'انضمام',
      'تسجيل',
      'شراكة',
      'دفع',
      'تفعيل',
      'ويب هوك',
      'رخصة',
      'حزمة',
      'برونز',
      'ذهب',
      'ماس',
      '100',
      '150',
      '200',
    ],
    publicBriefLines: [
      'مسار الانضمام: (1) طلب شراكة (2) دفع ميسر (3) تفعيل تلقائي + شهادة نجاح (4) لوحة الحلاق.',
      'لا «اعتماد يدوي» افتراضي بعد الدفع — الاستثناءات إدارية فقط عند تأخير.',
      'حزم رخصة 30 يوم: برونزي 100 · ذهبي 150 · ماسي 200 ر.س — Add-on المناوب +25 للماسية.',
    ],
  },
  {
    id: 'zatca_tax_advisor',
    staffRegistryId: 'zatca_tax_advisor',
    topicKeywords: ['ضريبة', 'zatca', 'ض.ق.م', 'vat', 'فاتورة', '15%', 'زكاة'],
    publicBriefLines: [
      ZATCA_PLATFORM_PACKAGES_NOTE_AR,
      '- ض.ق.م 15% تُعرض على الواجهة فقط عند تفعيلها من إعدادات المنصة — ليست استشارة ضريبية شخصية.',
      '- للقرارات النهائية: استشر مختصاً مرخّصاً.',
    ],
  },
  {
    id: 'b2b_marketing_strategist',
    staffRegistryId: 'b2b_marketing_strategist',
    topicKeywords: ['ترقية', 'باقة', 'ذهبي', 'ماسي', 'برونز', 'فرق', 'مقارنة', 'معرض', 'بنر'],
    publicBriefLines: [
      'برونزي: دخول محلي — بطاقة أساسية.',
      'ذهبي: إبراز + معرض 20 + QR تقييم + شات.',
      'ماسي: تمييز أعلى + معرض 40 + شات مترجم + مواعيد + Add-on المناوب اختياري.',
      'الترقية = شراء حزمة رخصة جديدة — لا ترقية تناسبية منتصف المدة.',
    ],
  },
  {
    id: 'public_prosecutor',
    staffRegistryId: 'public_prosecutor',
    topicKeywords: ['قانون', 'نظام', 'مخالفة', 'امتثال', 'تعهد', 'مسؤولية', 'خصوصية'],
    publicBriefLines: [
      'الحلاق يتحمل مسؤولية امتثال منشأته — المنصة مزوّد حلول تقنية لا وسيط تجاري.',
      'محتوى الشات والصور خاضع لسياسة الاستخدام — مخالفات قد تؤدي لتعليق الإدراج.',
      'لا نصائح قانونية ملزمة — للحالات الحساسة: دعم فني أو مختص.',
    ],
  },
  {
    id: 'billing_treasurer',
    staffRegistryId: 'billing_treasurer',
    topicKeywords: ['فاتورة', 'إيصال', 'دفع', 'moyasar', 'ميسر', 'renew', 'تجديد', 'انتهاء'],
    publicBriefLines: [
      `${TERM_PACKAGE_ACTIVATION_AR} — دفع لمرة واحدة، 30 يوم، **لا تجديد تلقائي**.`,
      'إيصال وشهادة تفعيل بعد الدفع — فاتورة رسمية عند تفعيل نظام الفوترة.',
      'انتهاء المدة → يتوقف الإدراج حتى شراء حزمة جديدة.',
    ],
  },
  {
    id: 'system_crisis_advisor',
    staffRegistryId: 'system_crisis_advisor',
    topicKeywords: ['تأخير', 'مشكلة', 'عطل', 'لا يظهر', 'bug', 'خطأ', 'دعم'],
    publicBriefLines: [
      'تأخير التفعيل بعد الدفع: تحقق من البريد، انتظر دقائق لمعالجة الدفع، ثم الدعم الفني (واتساب).',
      'لا تعد بمواعيد SLA — المنصة تعالج آلياً قدر الإمكان.',
    ],
  },
] as const;

const AGENT_BY_ID = new Map(PARTNER_CONSULTABLE_AGENTS.map((a) => [a.id, a]));

/** قواعد التصفية — ممنوع ظهورها في رد الشركاء */
export const PARTNER_REPLY_SANITIZE_FORBIDDEN_TERMS = [
  'قائد الأسطول',
  'قيادة الأسطول',
  'مقصورة سرية',
  'سري للغاية',
  'Super Admin',
  'AI Staff',
  'غرفة قيادة',
  'admin lab',
  'مختبر',
  'migration',
  'barber_ai_',
  '/api/',
  'وكيل داخلي',
  'استشارة داخلية',
  'Fleet Order',
  'عقدة #',
] as const;

export const PARTNER_ORCHESTRATION_RULES_AR = [
  '## آلية الاستشارة الداخلية (لا تُكشف للشريك)',
  'لديك ملخصات **آمنة للشركاء** من وكلاء متخصصين (مناوب، تشغيل مركزي، مسار انضمام، ZATCA، تسويق B2B، امتثال، فوترة، دعم).',
  '**استخدم** هذه الملخصات و«ملاحظات المجلس» (إن وُجدت) لتكوين إجابة واحدة متكاملة.',
  '**ممنوع** على الشريك أن يرى: أسماء الوكلاء، غرف قيادة، labs، migrations، مسارات API، قنوات سرية، أو «سأستشير وكيلاً».',
  '**مسموح** أن تقول: «منصة حلاق ماب»، «المناوب الرقمي»، «نظام الرصد الذكي»، «حزمة الرخصة» — بلغة منتج واضحة.',
  'إن تعارضت ملاحظات — قدّم الأدق للشريك واذكر استثناءً واحداً إن لزم.',
  'عند سؤال عن المناوب + العملاء: **دمج** ملخص المناوب + التشغيل المركزي في إجابة واحدة عملية.',
].join('\n');

function normalizeForMatch(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function routeQuestionToCouncilAgents(question: string): PartnerCouncilAgentId[] {
  const q = normalizeForMatch(question);
  if (!q) return ['partner_relations_liaison'];

  const scored = PARTNER_CONSULTABLE_AGENTS.map((agent) => {
    let score = 0;
    for (const kw of agent.topicKeywords) {
      if (q.includes(normalizeForMatch(kw))) score += kw.length >= 4 ? 2 : 1;
    }
    return { id: agent.id, score };
  }).filter((x) => x.score > 0);

  scored.sort((a, b) => b.score - a.score);

  const ids = scored.map((x) => x.id);
  if (ids.length === 0) return ['partner_relations_liaison'];

  const top = ids.slice(0, 4);
  if (
    top.includes('digital_shift_field') &&
    !top.includes('fleet_operations_center') &&
    (q.includes('مناوب') || q.includes('shift') || q.includes('عميل') || q.includes('زبون'))
  ) {
    top.push('fleet_operations_center');
  }
  return [...new Set(top)];
}

export function composePartnerAgentCouncilPack(agentIds: readonly PartnerCouncilAgentId[]): string {
  const lines = ['### مجلس الاستشارة الداخلي (ملخصات آمنة — لا تُذكر للشريك)', ''];
  for (const id of agentIds) {
    const agent = AGENT_BY_ID.get(id);
    if (!agent) continue;
    lines.push(`#### [${id}]`);
    for (const line of agent.publicBriefLines) lines.push(`- ${line}`);
    lines.push('');
  }
  return lines.join('\n').trim();
}

export function shouldRunCouncilDeepConsult(
  question: string,
  agentIds: readonly PartnerCouncilAgentId[],
): boolean {
  if (process.env.PARTNER_ASSISTANT_DEEP_CONSULT === '0') return false;
  const q = question.trim();
  if (q.length < 12) return false;
  const specialist = agentIds.some(
    (id) =>
      id === 'digital_shift_field' ||
      id === 'fleet_operations_center' ||
      id === 'zatca_tax_advisor',
  );
  return specialist || agentIds.length >= 2;
}

export function buildCouncilConsultSystemPrompt(agentIds: readonly PartnerCouncilAgentId[]): string {
  const pack = composePartnerAgentCouncilPack(agentIds);
  return [
    'أنت **مجلس استشاري داخلي** لمساعد الشركاء في حلاق ماب.',
    'المُدخَل: سؤال حلاق محتمل. المُخرَج: ملاحظات **آمنة للنشر للشركاء** فقط — بدون مصطلحات داخلية.',
    'ممنوع في الملاحظات: ' + PARTNER_REPLY_SANITIZE_FORBIDDEN_TERMS.slice(0, 8).join(' · '),
    '',
    pack,
    '',
    'اكتب 4–8 نقاط مرقّمة بالعربية — إجابة عملية للسؤال. لا مقدمة ولا خاتمة.',
  ].join('\n');
}

export function getPartnerCouncilMeta(agentIds: readonly PartnerCouncilAgentId[]) {
  return {
    routedAgents: agentIds,
    agentCount: agentIds.length,
    deepConsultDefault: process.env.PARTNER_ASSISTANT_DEEP_CONSULT !== '0',
  };
}
