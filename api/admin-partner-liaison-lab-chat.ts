import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import {
  buildPartnerLiaisonAdminLabSystemPrompt,
  callPartnerLiaisonAdminLabVision,
  loadPartnerLiaisonAnalyticsSnapshot,
  type PartnerLiaisonLabChatTurn,
} from './_lib/partnerLiaisonAdminLab.js';
import { finalizeAgentReply } from './_lib/agentConversationLog.js';
import { assertVisionMime } from './_lib/opsBillingAi.js';

export const config = { maxDuration: 60 };

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const PARTNER_LIAISON_PERMS = [
  'view_partner_marketing',
  'view_messages',
  'manage_partner_marketing',
] as const;

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    },
  });
}

function parseHistory(raw: unknown): PartnerLiaisonLabChatTurn[] {
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
    .filter((x): x is PartnerLiaisonLabChatTurn => x !== null)
    .slice(-10);
}

export async function GET(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    ...PARTNER_LIAISON_PERMS,
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  const key = Boolean((process.env.OPENAI_API_KEY || '').trim());
  return json({
    ok: true,
    route: 'admin-partner-liaison-lab-chat',
    openaiConfigured: key,
    model:
      (process.env.PARTNER_LIAISON_LAB_OPENAI_MODEL ||
        process.env.PARTNER_ASSISTANT_OPENAI_MODEL ||
        'gpt-4o').trim() || 'gpt-4o',
  });
}

export async function POST(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    ...PARTNER_LIAISON_PERMS,
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const userMessage = String(body.userMessage || body.message || '').trim();
  const imageBase64Raw = typeof body.imageBase64 === 'string' ? body.imageBase64.trim() : '';
  const imageMime = String(body.imageMime || body.mimeType || '').trim().toLowerCase();
  const conversationHistory = parseHistory(body.conversationHistory);

  if (!userMessage && !imageBase64Raw) {
    return json({ error: 'أدخل رسالة أو ارفع صورة للمناقشة' }, 400);
  }

  let imageBase64: string | undefined;
  if (imageBase64Raw) {
    const mimeErr = assertVisionMime(imageMime);
    if (mimeErr) return json({ error: mimeErr }, 400);
    const buf = Buffer.from(imageBase64Raw, 'base64');
    if (buf.length > MAX_IMAGE_BYTES) {
      return json({ error: 'حجم الصورة يتجاوز 4 ميغابايت' }, 400);
    }
    imageBase64 = imageBase64Raw;
  }

  const snapshot = await loadPartnerLiaisonAnalyticsSnapshot(auth.supabase);
  const system = buildPartnerLiaisonAdminLabSystemPrompt(snapshot);

  try {
    const { reply } = await finalizeAgentReply(
      auth.supabase,
      'partner_relations_liaison',
      userMessage || '[صورة]',
      'admin_partner_liaison_lab',
      () =>
        callPartnerLiaisonAdminLabVision({
          system,
          userText: userMessage || 'حلّل الصورة المرفقة في سياق مساعد الشركاء.',
          imageBase64,
          imageMime: imageBase64 ? imageMime : undefined,
          conversationHistory,
        }),
      { actorEmail: auth.actorEmail, sessionMeta: { hasImage: Boolean(imageBase64) } },
    );

    return json({
      ok: true,
      reply,
      analyticsSnapshot: snapshot,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'تعذّر توليد الرد';
    return json({ error: msg }, 502);
  }
}
