import { createClient } from '@supabase/supabase-js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = {
  maxDuration: 15,
};

const BUCKET = 'partner-promo';

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: 'Content-Type',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const supabaseUrlRaw = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!supabaseUrlRaw || !isLikelyHttpUrl(supabaseUrlRaw) || !serviceRole) {
    return Response.json(
      { ok: false, enabled: false, videoUrl: null, error: 'Promo video API not configured' },
      { status: 503, headers }
    );
  }

  const supabase = createClient(supabaseUrlRaw, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: row, error } = await supabase.from('partner_promo_video_config').select('enabled, object_path, updated_at').eq('id', 1).maybeSingle();

  if (error) {
    return Response.json(
      { ok: false, enabled: false, videoUrl: null, error: error.message },
      { status: 500, headers }
    );
  }

  const enabled = Boolean(row?.enabled);
  const objectPath = typeof row?.object_path === 'string' && row.object_path.trim() ? row.object_path.trim() : '';
  const updatedAt = typeof row?.updated_at === 'string' ? row.updated_at : '';

  if (!enabled || !objectPath) {
    return Response.json(
      {
        ok: true,
        enabled: false,
        videoUrl: null,
        updatedAt: updatedAt || null,
      },
      { headers }
    );
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  const base = pub?.publicUrl || '';
  const videoUrl = base ? `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(updatedAt || String(Date.now()))}` : null;

  return Response.json(
    {
      ok: true,
      enabled: true,
      videoUrl,
      updatedAt: updatedAt || null,
    },
    { headers }
  );
}
