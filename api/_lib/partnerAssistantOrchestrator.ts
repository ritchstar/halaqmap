import {
  buildCouncilConsultSystemPrompt,
  composePartnerAgentCouncilPack,
  getPartnerCouncilMeta,
  PARTNER_ORCHESTRATION_RULES_AR,
  routeQuestionToCouncilAgents,
  shouldRunCouncilDeepConsult,
  type PartnerCouncilAgentId,
} from './partnerAssistantAgentCouncil.js';
import {
  composePartnerPathKnowledgePack,
  getPartnerAssistantKnowledgeMeta,
} from './partnerAssistantKnowledge.js';

type ChatTurn = { role: 'user' | 'assistant'; content: string };

export type OrchestratedPartnerPrompt = {
  system: string;
  councilMeta: ReturnType<typeof getPartnerCouncilMeta>;
  deepConsultUsed: boolean;
};

export function buildOrchestratedPartnerSystemPrompt(input: {
  pathnameHint: string;
  userQuestion: string;
  councilNotes?: string;
}): OrchestratedPartnerPrompt {
  const agentIds = routeQuestionToCouncilAgents(input.userQuestion);
  const councilPack = composePartnerAgentCouncilPack(agentIds);
  const kb = composePartnerPathKnowledgePack();
  const meta = getPartnerAssistantKnowledgeMeta();
  const councilMeta = getPartnerCouncilMeta(agentIds);
  const deepConsultUsed = Boolean(input.councilNotes?.trim());

  const system = [
    'أنت **مساعد الشركاء الرقمي** في مسار الخدمات البرمجية لمنصة **حلاق ماب**.',
    `Knowledge v${meta.version} · مجلس استشارة: ${agentIds.join(', ')}`,
    '',
    PARTNER_ORCHESTRATION_RULES_AR,
    '',
    input.councilNotes?.trim()
      ? '### ملاحظات المجلس الداخلية (استخدمها — **لا تذكر** أنها من مجلس أو وكلاء)\n' +
        input.councilNotes.trim()
      : '',
    '',
    '--- قاعدة المعرفة العامة ---',
    kb,
    '',
    '--- مجلس الاستشارة (ملخصات الوكلاء — للاستخدام الداخلي في صياغة ردك) ---',
    councilPack,
    '',
    '## تعليمات الرد النهائي للشريك',
    '- جاوب بالعربية المُبسّطة (أو بلغة سؤاله).',
    '- **لا تعتذر** عن نقص معلومات إذا الجواب في القاعدة أو المجلس أعلاه.',
    '- **لا تذكر** وكلاء، أسطول، labs، API، migrations، أو عمليات داخلية.',
    '- عند سؤال المناوب + العملاء: اشرح الاعتراض، اللغات، الآداب، المحفظة، والتفعيل — بوضوح.',
    input.pathnameHint ? `سياق الصفحة: ${input.pathnameHint}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return { system, councilMeta, deepConsultUsed };
}

async function callOpenAIMini(system: string, user: string): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  const model = (process.env.PARTNER_ASSISTANT_COUNCIL_MODEL || 'gpt-4o-mini').trim();
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      max_tokens: 550,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
  };
  if (!res.ok) throw new Error(json.error?.message || `OpenAI HTTP ${res.status}`);
  return json.choices?.[0]?.message?.content?.trim() || '';
}

async function callAnthropicMini(system: string, user: string): Promise<string> {
  const key = (process.env.ANTHROPIC_API_KEY || '').trim();
  const model = (process.env.PARTNER_ASSISTANT_COUNCIL_MODEL || 'claude-3-5-haiku-20241022').trim();
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 550,
      temperature: 0.25,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    content?: { type?: string; text?: string }[];
  };
  if (!res.ok) throw new Error(json.error?.message || `Anthropic HTTP ${res.status}`);
  return json.content?.find((c) => c.type === 'text')?.text?.trim() || '';
}

export async function runPartnerCouncilDeepConsult(input: {
  provider: 'openai' | 'anthropic';
  userQuestion: string;
  agentIds: readonly PartnerCouncilAgentId[];
}): Promise<string> {
  const system = buildCouncilConsultSystemPrompt(input.agentIds);
  const user = `سؤال الحلاق المحتمل:\n${input.userQuestion}`;
  try {
    return input.provider === 'openai'
      ? await callOpenAIMini(system, user)
      : await callAnthropicMini(system, user);
  } catch {
    return '';
  }
}

export function lastUserMessage(turns: ChatTurn[]): string {
  for (let i = turns.length - 1; i >= 0; i--) {
    if (turns[i]?.role === 'user') return turns[i]!.content;
  }
  return '';
}

export function shouldDeepConsultForMessage(
  question: string,
  agentIds: readonly PartnerCouncilAgentId[],
): boolean {
  return shouldRunCouncilDeepConsult(question, agentIds);
}
