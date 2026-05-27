/**
 * POST /api/map-community-message
 * Insert a new Map Chat message (authenticated barbers/admins only).
 */
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';
import { createServiceSupabase, verifyMapCommunityActor } from './_lib/mapCommunityAuth.js';

export const config = { maxDuration: 25 };

const CORS_OPTS = {
  allowMethods: 'POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url',
} as const;

const BLOCKED_TERMS = ['سب', 'لعن', 'قذف', 'عنصري', 'إهانة', 'فضيحة'] as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function json(data: unknown, status = 200, headers: Record<string, string>): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
      ...headers,
    },
  });
}

function moderateContent(text: string): { ok: true } | { ok: false; reason: string } {
  const t = text.trim().replace(/\s+/g, ' ').toLowerCase();
  if (!t) return { ok: false, reason: 'الرسالة فارغة.' };
  if (t.length > 1600) return { ok: false, reason: 'الرسالة طويلة جداً.' };
  const hit = BLOCKED_TERMS.find((term) => t.includes(term));
  if (hit) return { ok: false, reason: 'خلّونا نحافظ على آداب مجتمع ماب ونصيغ الرسالة باحترام.' };
  return { ok: true };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const headers = corsHeaders(request);
  const serverUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!serverUrl || !isLikelyHttpUrl(serverUrl) || !serviceRole) {
    return json({ ok: false, error: 'Server not configured' }, 503, headers);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400, headers);
  }

  const content = String(body.content ?? '').trim();
  const moderation = moderateContent(content);
  if (!moderation.ok) {
    return json({ ok: false, moderated: true, reply: moderation.reason }, 200, headers);
  }

  const silentView = body.silentView === true;
  const supabase = createServiceSupabase(serverUrl, serviceRole);
  const actor = await verifyMapCommunityActor(request, supabase, { silentView });

  if (!actor.ok) {
    return json({ ok: false, error: actor.message }, actor.status, headers);
  }
  if (!actor.canPost) {
    return json({ ok: false, error: 'وضع الاطلاع الصامت — لا يمكن النشر.' }, 403, headers);
  }

  const authorRole = actor.role === 'barber' ? 'barber' : 'admin';

  const { data, error } = await supabase
    .from('map_community_messages')
    .insert({
      author_user_id: actor.userId,
      author_display_name: actor.displayName,
      author_role: authorRole,
      content,
    })
    .select('id, author_display_name, author_role, content, created_at')
    .single();

  if (error || !data) {
    return json({ ok: false, error: error?.message || 'Insert failed' }, 500, headers);
  }

  const row = data as Record<string, unknown>;
  return json(
    {
      ok: true,
      message: {
        id: String(row.id),
        author: String(row.author_display_name || actor.displayName),
        role: String(row.author_role || authorRole),
        content: String(row.content || content),
        timestamp: String(row.created_at || new Date().toISOString()),
      },
    },
    200,
    headers,
  );
}
