import { createClient } from '@supabase/supabase-js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 20 };

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

type Row = {
  id: string;
  title: string;
  description: string | null;
  object_path: string;
  sort_order: number | null;
  updated_at: string | null;
};

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !isLikelyHttpUrl(url) || !serviceRole) {
    return Response.json({ ok: false, error: 'server_not_configured' }, { status: 503, headers });
  }

  const supabase = createClient(url, serviceRole, { auth: { persistSession: false } });

  const { data: cfg, error: cfgError } = await supabase
    .from('partner_tutorial_videos_config')
    .select('enabled')
    .eq('id', 1)
    .maybeSingle();

  if (cfgError) {
    return Response.json({ ok: false, error: cfgError.message }, { status: 500, headers });
  }

  const sectionEnabled = cfg?.enabled !== false;
  if (!sectionEnabled) {
    return Response.json({ ok: true, enabled: false, videos: [] }, { headers });
  }

  const { data, error } = await supabase
    .from('partner_tutorial_videos')
    .select('id,title,description,object_path,sort_order,updated_at')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500, headers });
  }

  const rows = (data || []) as Row[];
  const videos = rows.map((r) => {
    const { data: pub } = supabase.storage.from('partner-promo').getPublicUrl(r.object_path);
    const base = pub?.publicUrl || '';
    const videoUrl = base
      ? `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(r.updated_at || String(Date.now()))}`
      : null;
    return {
      id: r.id,
      title: r.title,
      description: r.description || '',
      videoUrl,
      sortOrder: r.sort_order ?? 0,
      updatedAt: r.updated_at,
    };
  });

  return Response.json({ ok: true, enabled: true, videos }, { headers });
}

