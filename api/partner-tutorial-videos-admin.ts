import { safeHost, verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 30 };

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

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const authHeader = request.headers.get('authorization')?.trim() || '';
  const hasBearer = authHeader.startsWith('Bearer ') && authHeader.length > 'Bearer '.length + 8;

  if (!hasBearer) {
    return Response.json(
      {
        ok: true,
        route: 'partner-tutorial-videos-admin',
        supabaseUrlHost: url ? safeHost(url) : null,
        hint: 'Send Authorization: Bearer <session access_token>.',
      },
      { headers },
    );
  }

  if (!url || !isLikelyHttpUrl(url) || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  const adminAuth = await verifyPlatformAdminFromRequestAny(request, url, serviceRole, [
    'manage_payment_settings',
    'view_payment_settings',
    'view_settings',
  ]);
  if (adminAuth.ok === false) return Response.json(adminAuth.json, { status: adminAuth.status, headers });

  const supabase = adminAuth.supabase;
  const { data, error } = await supabase
    .from('partner_tutorial_videos')
    .select('id,title,description,object_path,mime_type,sort_order,is_published,created_at,updated_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500, headers });

  const rows = (data || []).map((r) => {
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(String(r.object_path || ''));
    const base = pub?.publicUrl || '';
    const previewUrl = base
      ? `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(String(r.updated_at || ''))}`
      : null;
    return { ...r, previewUrl };
  });

  return Response.json({ ok: true, rows }, { headers });
}

type PostBody = Record<string, unknown>;

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !isLikelyHttpUrl(url) || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  const adminAuth = await verifyPlatformAdminFromRequestAny(request, url, serviceRole, [
    'manage_payment_settings',
    'view_settings',
  ]);
  if (adminAuth.ok === false) return Response.json(adminAuth.json, { status: adminAuth.status, headers });
  const supabase = adminAuth.supabase;

  let body: PostBody = {};
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }
  const action = String(body.action || '').trim();

  if (action === 'signedUpload') {
    const extRaw = String(body.ext || '').trim().toLowerCase().replace(/^\./, '');
    if (!ALLOWED_EXT.has(extRaw)) {
      return Response.json({ error: 'Invalid ext — use mp4, webm, mov' }, { status: 400, headers });
    }
    const key = Date.now();
    const objectPath = `tutorials/${key}.${extRaw}`;
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(objectPath);
    if (error || !data?.signedUrl) {
      return Response.json({ error: error?.message || 'Could not create signed upload URL' }, { status: 500, headers });
    }
    return Response.json(
      { ok: true, signedUrl: data.signedUrl, path: data.path || objectPath, token: data.token, contentType: mimeForExt(extRaw) },
      { headers },
    );
  }

  if (action === 'create') {
    const path = String(body.path || '').trim();
    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim();
    const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Math.trunc(Number(body.sortOrder)) : 0;
    if (!path.startsWith('tutorials/') || !title) {
      return Response.json({ error: 'Invalid input' }, { status: 400, headers });
    }
    const ext = path.split('.').pop()?.toLowerCase() || 'mp4';
    const { error } = await supabase.from('partner_tutorial_videos').insert({
      title,
      description: description || null,
      object_path: path,
      mime_type: mimeForExt(ext),
      sort_order: sortOrder,
      is_published: true,
    });
    if (error) return Response.json({ error: error.message }, { status: 500, headers });
    return Response.json({ ok: true }, { headers });
  }

  if (action === 'update') {
    const id = String(body.id || '').trim();
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400, headers });
    const patch: Record<string, unknown> = {};
    if (body.title !== undefined) patch.title = String(body.title || '').trim();
    if (body.description !== undefined) patch.description = String(body.description || '').trim() || null;
    if (body.sortOrder !== undefined) patch.sort_order = Math.trunc(Number(body.sortOrder) || 0);
    if (body.isPublished !== undefined) patch.is_published = body.isPublished === true;
    const { error } = await supabase.from('partner_tutorial_videos').update(patch).eq('id', id);
    if (error) return Response.json({ error: error.message }, { status: 500, headers });
    return Response.json({ ok: true }, { headers });
  }

  if (action === 'delete') {
    const id = String(body.id || '').trim();
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400, headers });
    const { data: row } = await supabase.from('partner_tutorial_videos').select('object_path').eq('id', id).maybeSingle();
    const objectPath = String(row?.object_path || '').trim();
    const { error } = await supabase.from('partner_tutorial_videos').delete().eq('id', id);
    if (error) return Response.json({ error: error.message }, { status: 500, headers });
    if (objectPath) {
      await supabase.storage.from(BUCKET).remove([objectPath]);
    }
    return Response.json({ ok: true }, { headers });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400, headers });
}

