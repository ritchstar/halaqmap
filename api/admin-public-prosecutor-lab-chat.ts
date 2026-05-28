import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import {
  buildPublicProsecutorLabSystemPrompt,
  callPublicProsecutorLabChat,
  evaluateProsecutorInterject,
  loadPublicProsecutorLabContext,
  type PublicProsecutorLabChatTurn,
} from './_lib/publicProsecutorLab.js';
import { finalizeAgentReply } from './_lib/agentConversationLog.js';

export const config = { maxDuration: 60 };

const PROSECUTOR_PERMS = ['manage_admins', 'view_overview'] as const;

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    },
  });
}

function parseHistory(raw: unknown): PublicProsecutorLabChatTurn[] {
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
    .filter((x): x is PublicProsecutorLabChatTurn => x !== null)
    .slice(-10);
}

export async function GET(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    ...PROSECUTOR_PERMS,
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  const key = Boolean((process.env.OPENAI_API_KEY || '').trim());

  return json({
    ok: true,
    route: 'admin-public-prosecutor-lab-chat',
    role: 'Public Prosecutor Agent — Central Governance',
    openaiConfigured: key,
    model:
      (process.env.PUBLIC_PROSECUTOR_OPENAI_MODEL ||
        process.env.ADMIN_SENTINEL_OPENAI_MODEL ||
        'gpt-4o').trim() || 'gpt-4o',
  });
}

export async function POST(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    ...PROSECUTOR_PERMS,
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
  const watchAgent = String(body.watchAgent || '').trim() || undefined;
  const crisisMode = body.crisisMode === true;
  const assistantSnippet = String(body.assistantSnippet || '').trim() || undefined;

  if (!userMessage) {
    return json({ error: 'صف الانحراف أو مسألة الحوكمة' }, 400);
  }

  const labContext = await loadPublicProsecutorLabContext(auth.supabase);
  const system = buildPublicProsecutorLabSystemPrompt(labContext);

  const interject = evaluateProsecutorInterject({
    userMessage,
    assistantSnippet,
    watchAgent,
    crisisMode,
  });

  try {
    const { reply } = await finalizeAgentReply(
      auth.supabase,
      'public_prosecutor',
      userMessage,
      'admin_public_prosecutor_lab',
      () =>
        callPublicProsecutorLabChat({
          system,
          userText: userMessage,
          conversationHistory,
        }),
      {
        actorEmail: auth.actorEmail,
        sessionMeta: { watchAgent, crisisMode, hasInterject: Boolean(interject) },
      },
    );

    return json({
      ok: true,
      reply,
      governanceContext: labContext,
      interject,
      governanceActions: interject ? [interject] : [],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'تعذّر توليد الرد';
    return json({ error: msg }, 502);
  }
}
