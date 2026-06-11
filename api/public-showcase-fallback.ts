import { createClient } from '@supabase/supabase-js';
import {
  mapShowcaseRowToApiPayload,
  resolveShowcaseFallbackForPublic,
} from './_lib/platformShowcasePreview.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = {
  maxDuration: 15,
};

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: 'Content-Type, x-supabase-anon, x-client-supabase-url',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

/**
 * /api/public-showcase-fallback
 * يُستدعى عند غياب نتائج البحث — يعيد حلاق المعاينة الماسي إن كان مفعّلاً.
 */
export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const expectedAnon = (
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ''
  ).trim();

  if (!url || !serviceRole || !expectedAnon) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  const providedAnon = request.headers.get('x-supabase-anon')?.trim() || '';
  if (providedAnon !== expectedAnon) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const fallback = await resolveShowcaseFallbackForPublic(supabase);
  if (fallback.ok === false) {
    return Response.json({ ok: true, available: false, reason: fallback.reason }, { headers });
  }

  return Response.json(
    {
      ok: true,
      available: true,
      education_intro_ar: fallback.educationIntroAr,
      row: mapShowcaseRowToApiPayload(fallback.row),
    },
    { headers },
  );
}
