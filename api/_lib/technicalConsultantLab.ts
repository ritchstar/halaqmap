import { getOpsBillingTemporalAnchor } from './opsBillingAi.js';

export type TechnicalConsultantLabChatTurn = { role: 'user' | 'assistant'; content: string };

export type TechnicalConsultantLabContext = {
  anchorLabelAr: string;
  pendingApprovals: number;
  cursorConfigured: boolean;
};

export async function loadTechnicalConsultantLabContext(
  supabase: import('@supabase/supabase-js').SupabaseClient,
): Promise<TechnicalConsultantLabContext> {
  const anchor = getOpsBillingTemporalAnchor();
  let pendingApprovals = 0;

  try {
    const { count } = await supabase
      .from('platform_engineering_executions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending_approval');
    if (typeof count === 'number') pendingApprovals = count;
  } catch {
    // partial
  }

  return {
    anchorLabelAr: anchor.labelAr,
    pendingApprovals,
    cursorConfigured: Boolean((process.env.CURSOR_API_KEY || '').trim()),
  };
}

export function buildTechnicalConsultantLabSystemPrompt(ctx: TechnicalConsultantLabContext): string {
  return [
    'أنت **Technical Consultant — Autonomous Engineering Wing** في **حلاق ماب**.',
    '',
    '## الهوية',
    '- مهندس استراتيجي ذاتي — منضبط، مهني، لا ينفّذ على main مباشرة.',
    '- تنسّق مع **Public Prosecutor** للامتثال قبل أي refactor.',
    '',
    '## Self-Development Protocol (إلزامي)',
    '1. **Propose Plan** — outline scope, files, risks.',
    '2. **Consult Prosecutor** — compliance review.',
    '3. **Draft Branch** — `draft/engineering-*` only.',
    '4. **Unit Tests** — document test plan before approval.',
    '5. **Pending Approval** — Founder must click Approve Execution.',
    '',
    '## Agent-to-Agent',
    '- Route compliance questions to Public Prosecutor via council bus.',
    '- Incorporate prosecutor feedback into refactor proposals.',
    '',
    '## لقطة',
    `- التاريخ: ${ctx.anchorLabelAr}`,
    `- Pending Approvals: ${ctx.pendingApprovals}`,
    `- Cursor API: ${ctx.cursorConfigured ? 'configured' : 'stub until CURSOR_API_KEY'}`,
    '',
    '## تنسيق الرد',
    '1. Plan (numbered)',
    '2. Prosecutor consultation notes',
    '3. Draft branch name',
    '4. Unit tests checklist',
    '5. «Awaiting Founder Approval» if execution required',
  ].join('\n');
}

export async function callTechnicalConsultantLabChat(input: {
  system: string;
  userText: string;
  conversationHistory?: TechnicalConsultantLabChatTurn[];
}): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('OPENAI_API_KEY not configured on server');

  const model =
    (process.env.TECHNICAL_CONSULTANT_OPENAI_MODEL ||
      process.env.ADMIN_SENTINEL_OPENAI_MODEL ||
      'gpt-4o').trim() || 'gpt-4o';

  const historyMessages: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const turn of (input.conversationHistory || []).slice(-10)) {
    historyMessages.push({
      role: turn.role === 'assistant' ? 'assistant' : 'user',
      content: turn.content.slice(0, 8000),
    });
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.22,
      max_tokens: 2200,
      messages: [
        { role: 'system', content: input.system },
        ...historyMessages,
        { role: 'user', content: input.userText.slice(0, 12_000) },
      ],
    }),
  });

  const json = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
  };
  if (!res.ok) throw new Error(json.error?.message || `OpenAI HTTP ${res.status}`);
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty model response');
  return text;
}
