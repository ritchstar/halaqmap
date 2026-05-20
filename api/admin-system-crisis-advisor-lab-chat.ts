import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import {
  buildSystemCrisisAdvisorLabSystemPrompt,
  callSystemCrisisAdvisorLabChat,
  loadCrisisPlaybookMarkdown,
  loadSystemCrisisLabContext,
  type SystemCrisisLabChatTurn,
} from './_lib/systemCrisisAdvisorLab.js';

export const config = { maxDuration: 60 };

const CRISIS_ADVISOR_PERMS = ['manage_admins', 'view_overview'] as const;

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    },
  });
}

function parseHistory(raw: unknown): SystemCrisisLabChatTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const role = o.role === 'assistant' ? 'assistant' : o.role === 'user' ? 'user' : null;
      const content = String(o.content || '').trim();
      if (!role || !content) return null;
      return { role, content: content.slice(0, 8000) };
    })
    .filter((x): x is SystemCrisisLabChatTurn => x !== null)
    .slice(-10);
}

export async function GET(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    ...CRISIS_ADVISOR_PERMS,
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  const playbook = loadCrisisPlaybookMarkdown();
  const key = Boolean((process.env.OPENAI_API_KEY || '').trim());

  return json({
    ok: true,
    route: 'admin-system-crisis-advisor-lab-chat',
    role: 'Strategic Technical Consultant',
    openaiConfigured: key,
    playbookLoaded: playbook.length > 0,
    playbookPath: 'docs/crisis-playbook.md',
    model:
      (process.env.SYSTEM_CRISIS_ADVISOR_OPENAI_MODEL ||
        process.env.ADMIN_SENTINEL_OPENAI_MODEL ||
        'gpt-4o').trim() || 'gpt-4o',
  });
}

export async function POST(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    ...CRISIS_ADVISOR_PERMS,
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const userMessage = String(body.userMessage || body.message || '').trim();
  const conversationHistory = parseHistory(body.conversationHistory);
  const crisisMode = body.crisisMode === true;

  if (!userMessage) {
    return json({ error: 'صف الحادث أو الأعراض التشغيلية' }, 400);
  }

  const labContext = await loadSystemCrisisLabContext(auth.supabase);
  const playbook = loadCrisisPlaybookMarkdown();
  const system = buildSystemCrisisAdvisorLabSystemPrompt(labContext, playbook);

  const prefixedUser =
    crisisMode && conversationHistory.length === 0
      ? `[CRISIS MODE — PANIC BUTTON]\n${userMessage}`
      : userMessage;

  try {
    const reply = await callSystemCrisisAdvisorLabChat({
      system,
      userText: prefixedUser,
      conversationHistory,
    });

    return json({
      ok: true,
      reply,
      crisisContext: labContext,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'تعذّر توليد الرد';
    return json({ error: msg }, 502);
  }
}
