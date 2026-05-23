import type { SupabaseClient } from '@supabase/supabase-js';
import { safeHost, verifyPlatformAdminFromRequest } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = {
  maxDuration: 60,
};

const BUCKET = 'partner-promo';

const ALLOWED_EXT = new Set(['mp4', 'webm', 'mov']);

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function mimeForExt(ext: string): string {
  if (ext === 'webm') return 'video/webm';
  if (ext === 'mov') return 'video/quicktime';
  return 'video/mp4';
}

function buildVideoPayload(
  supabase: SupabaseClient,
  row: { enabled?: unknown; object_path?: unknown; updated_at?: unknown } | null
): {
  enabled: boolean;
  videoUrl: string | null;
  objectPath: string | null;
  updatedAt: string | null;
} {
  const enabled = Boolean(row?.enabled);
  const objectPath = typeof row?.object_path === 'string' && row.object_path.trim() ? row.object_path.trim() : '';
  const updatedAt = typeof row?.updated_at === 'string' ? row.updated_at : null;
  if (!enabled || !objectPath) {
    return { enabled: false, videoUrl: null, objectPath: objectPath || null, updatedAt };
  }
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  const base = pub?.publicUrl || '';
  const videoUrl = base
    ? `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(updatedAt || String(Date.now()))}`
    : null;
  return { enabled: true, videoUrl, objectPath, updatedAt };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const urlOk = Boolean(url && isLikelyHttpUrl(url));

  const authHeader = request.headers.get('authorization')?.trim() || '';
  const hasBearer = authHeader.startsWith('Bearer ') && authHeader.length > 'Bearer '.length + 8;

  if (!hasBearer) {
    return Response.json(
      {
        ok: true,
        route: 'partner-promo-admin',
        supabaseUrlSet: Boolean(url),
        supabaseUrlHost: url ? safeHost(url) : null,
        serviceRoleKeySet: Boolean(serviceRole),
        hint: 'Send Authorization: Bearer <session access_token> for full promo status.',
      },
      { headers }
    );
  }

  if (!urlOk || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  const adminAuth = await verifyPlatformAdminFromRequest(request, url, serviceRole, 'view_settings');
  if (adminAuth.ok === false) {
    return Response.json(adminAuth.json, { status: adminAuth.status, headers });
  }
  const supabase = adminAuth.supabase;

  const { data: row, error } = await supabase.from('partner_promo_video_config').select('enabled, object_path, updated_at').eq('id', 1).maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500, headers });
  }

  const payload = buildVideoPayload(supabase, row);
  return Response.json({ ok: true, ...payload, bucket: BUCKET }, { headers });
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!url || !isLikelyHttpUrl(url) || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  const adminAuth = await verifyPlatformAdminFromRequest(request, url, serviceRole, 'view_settings');
  if (adminAuth.ok === false) {
    return Response.json(adminAuth.json, { status: adminAuth.status, headers });
  }
  const supabase = adminAuth.supabase;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const obj = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const action = typeof obj.action === 'string' ? obj.action.trim() : '';

  if (action === 'signedUpload') {
    const extRaw = typeof obj.ext === 'string' ? obj.ext.trim().toLowerCase().replace(/^\./, '') : '';
    if (!ALLOWED_EXT.has(extRaw)) {
      return Response.json({ error: 'Invalid ext — use mp4, webm, or mov' }, { status: 400, headers });
    }
    const objectPath = `current/promo.${extRaw}`;
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(objectPath);
    if (error || !data?.signedUrl) {
      return Response.json(
        { error: error?.message || 'Could not create signed upload URL. Run migration 47 and ensure bucket exists.' },
        { status: 500, headers }
      );
    }
    return Response.json(
      {
        ok: true,
        signedUrl: data.signedUrl,
        path: data.path || objectPath,
        token: data.token,
        contentType: mimeForExt(extRaw),
      },
      { headers }
    );
  }

  if (action === 'commit') {
    const path = typeof obj.path === 'string' ? obj.path.trim() : '';
    if (!/^current\/promo\.(mp4|webm|mov)$/.test(path)) {
      return Response.json({ error: 'Invalid path' }, { status: 400, headers });
    }
    const ext = path.split('.').pop() || 'mp4';
    const nowIso = new Date().toISOString();
    const { error: upErr } = await supabase
      .from('partner_promo_video_config')
      .upsert(
        {
          id: 1,
          enabled: true,
          object_path: path,
          mime_type: mimeForExt(ext),
          updated_at: nowIso,
        },
        { onConflict: 'id' }
      );
    if (upErr) {
      return Response.json({ error: upErr.message }, { status: 500, headers });
    }
    const { data: listed, error: listErr } = await supabase.storage.from(BUCKET).list('current', { limit: 100 });
    if (!listErr && listed?.length) {
      const toRemove = listed.map((f) => `current/${f.name}`).filter((p) => p !== path);
      if (toRemove.length) {
        await supabase.storage.from(BUCKET).remove(toRemove);
      }
    }
    const { data: row } = await supabase.from('partner_promo_video_config').select('enabled, object_path, updated_at').eq('id', 1).maybeSingle();
    return Response.json({ ok: true, ...buildVideoPayload(supabase, row) }, { headers });
  }

  if (action === 'setEnabled') {
    const enabled = obj.enabled === true;
    if (enabled) {
      const { data: cur } = await supabase.from('partner_promo_video_config').select('object_path').eq('id', 1).maybeSingle();
      const p = typeof cur?.object_path === 'string' ? cur.object_path.trim() : '';
      if (!p) {
        return Response.json({ error: 'Cannot enable: no video uploaded yet' }, { status: 400, headers });
      }
    }
    const { error: upErr } = await supabase
      .from('partner_promo_video_config')
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq('id', 1);
    if (upErr) {
      return Response.json({ error: upErr.message }, { status: 500, headers });
    }
    const { data: row } = await supabase.from('partner_promo_video_config').select('enabled, object_path, updated_at').eq('id', 1).maybeSingle();
    return Response.json({ ok: true, ...buildVideoPayload(supabase, row) }, { headers });
  }

  if (action === 'clear') {
    const { data: rowBefore } = await supabase.from('partner_promo_video_config').select('object_path').eq('id', 1).maybeSingle();
    const prev = typeof rowBefore?.object_path === 'string' ? rowBefore.object_path.trim() : '';
    const { data: listed } = await supabase.storage.from(BUCKET).list('current', { limit: 100 });
    const paths = (listed || []).map((f) => `current/${f.name}`);
    if (paths.length) {
      await supabase.storage.from(BUCKET).remove(paths);
    } else if (prev) {
      await supabase.storage.from(BUCKET).remove([prev]);
    }
    const { error: upErr } = await supabase
      .from('partner_promo_video_config')
      .update({
        enabled: false,
        object_path: null,
        mime_type: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);
    if (upErr) {
      return Response.json({ error: upErr.message }, { status: 500, headers });
    }
    const { data: row } = await supabase.from('partner_promo_video_config').select('enabled, object_path, updated_at').eq('id', 1).maybeSingle();
    return Response.json({ ok: true, ...buildVideoPayload(supabase, row) }, { headers });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400, headers });
}
