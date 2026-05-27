/**
 * POST /api/map-community-read
 * Update the caller's read cursor for Map Community badge state.
 */
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';
import { createServiceSupabase, verifyMapCommunityActor } from './_lib/mapCommunityAuth.js';

export const config = { maxDuration: 15 };

const CORS_OPTS = {
  allowMethods: 'POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url',
} as const;

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

  const supabase = createServiceSupabase(serverUrl, serviceRole);
  const actor = await verifyMapCommunityActor(request, supabase);

  if (!actor.ok) {
    return json({ ok: false, error: actor.message }, actor.status, headers);
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from('map_community_read_cursors').upsert(
    {
      user_id: actor.userId,
      last_read_at: now,
      updated_at: now,
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    return json({ ok: false, error: error.message || 'Cursor update failed' }, 500, headers);
  }

  return json({ ok: true, lastReadAt: now, hasNewPosts: false }, 200, headers);
}
