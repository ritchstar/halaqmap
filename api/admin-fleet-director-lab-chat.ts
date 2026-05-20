import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import {
  buildFleetDirectorAdminLabSystemPrompt,
  callFleetDirectorAdminLabVision,
  loadFleetDirectorLabContext,
  type FleetDirectorLabChatTurn,
} from './_lib/fleetDirectorAdminLab.js';
import { assertVisionMime } from './_lib/opsBillingAi.js';

export const config = { maxDuration: 60 };

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const FLEET_DIRECTOR_PERMS = ['manage_admins'] as const;

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    },
  });
}

function parseHistory(raw: unknown): FleetDirectorLabChatTurn[] {
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
    .filter((x): x is FleetDirectorLabChatTurn => x !== null)
    .slice(-12);
}

export async function GET(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    ...FLEET_DIRECTOR_PERMS,
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  const key = Boolean((process.env.OPENAI_API_KEY || '').trim());
  return json({
    ok: true,
    route: 'admin-fleet-director-lab-chat',
    classification: 'elite_covert',
    openaiConfigured: key,
    model:
      (process.env.FLEET_DIRECTOR_LAB_OPENAI_MODEL ||
        process.env.DIGITAL_SHIFT_LAB_OPENAI_MODEL ||
        'gpt-4o').trim() || 'gpt-4o',
  });
}

export async function POST(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    ...FLEET_DIRECTOR_PERMS,
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
    return json({ error: 'أدخل رسالة أو ارفع مرفقاً للاجتماع السري' }, 400);
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

  const labContext = await loadFleetDirectorLabContext(auth.supabase);
  const system = buildFleetDirectorAdminLabSystemPrompt(labContext);

  try {
    const reply = await callFleetDirectorAdminLabVision({
      system,
      userText: userMessage || 'حلّل المرفق في سياق قيادة الأسطول السرية.',
      imageBase64,
      imageMime: imageBase64 ? imageMime : undefined,
      conversationHistory,
    });

    return json({
      ok: true,
      reply,
      fleetContext: labContext,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'تعذّر توليد الرد';
    return json({ error: msg }, 502);
  }
}
