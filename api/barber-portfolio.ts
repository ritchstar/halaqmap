import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = {
  maxDuration: 25,
};

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-supabase-anon, x-client-supabase-url',
} as const;

const MAX_UPLOAD_BYTES = 380 * 1024;
const MAX_IMAGES_GOLD = 20;
const MAX_IMAGES_DIAMOND = 40;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function safeHost(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    return new URL(rawUrl).host;
  } catch {
    return rawUrl;
  }
}

function maxPortfolioForTier(tier: string): number {
  const t = tier.toLowerCase();
  if (t === 'diamond') return MAX_IMAGES_DIAMOND;
  if (t === 'gold') return MAX_IMAGES_GOLD;
  return 0;
}

async function countPortfolioObjects(supabase: unknown, barberId: string): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  const sb = supabase as {
    storage: {
      from: (bucket: string) => {
        list: (path: string, opts?: { limit?: number }) => Promise<{ data: { name: string }[] | null; error: { message?: string } | null }>;
      };
    };
  };
  const { data, error } = await sb.storage.from('barber-portfolio').list(barberId, { limit: 200 });
  if (error) {
    return { ok: false, error: error.message || 'list failed' };
  }
  const n = Array.isArray(data) ? data.filter((e) => e.name && !e.name.endsWith('/')).length : 0;
  return { ok: true, count: n };
}

function normalizeObjectPath(barberId: string, objectPath: string): string | null {
  const raw = objectPath.trim().replace(/\\/g, '/');
  if (!raw || raw.includes('..')) return null;
  const prefix = `${barberId}/`;
  if (!raw.startsWith(prefix)) return null;
  const rest = raw.slice(prefix.length);
  if (!rest || rest.includes('/')) return null;
  if (!/^[a-zA-Z0-9._-]+\.webp$/i.test(rest)) return null;
  return `${barberId}/${rest}`;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const resolvedUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
  return Response.json(
    {
      ok: true,
      route: 'barber-portfolio',
      supabaseUrlSet: Boolean(resolvedUrl),
      supabaseUrlHost: safeHost(resolvedUrl),
      serviceRoleKeySet: serviceRole,
      publicApiGuard: registrationGuardDiagnostics(),
      ready: Boolean(resolvedUrl) && serviceRole,
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-portfolio');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }

  const clientSupabaseUrl = request.headers.get('x-client-supabase-url')?.trim() || '';
  if (clientSupabaseUrl && clientSupabaseUrl !== url) {
    return Response.json(
      {
        error: 'Supabase project mismatch between client and server',
        serverUrlHost: safeHost(url),
        clientUrlHost: safeHost(clientSupabaseUrl),
      },
      { status: 409, headers },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const b = body as Record<string, unknown>;
  const action = String(b.action ?? '').trim().toLowerCase();
  const barberId = String(b.barberId ?? '').trim();
  const rawEmail = String(b.email ?? '').trim();

  if (!barberId || !rawEmail) {
    return Response.json({ error: 'Missing barberId or email' }, { status: 400, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: row, error: selErr } = await supabase
    .from('barbers')
    .select('id, email, tier, is_active')
    .eq('id', barberId)
    .maybeSingle();

  if (selErr) {
    return Response.json({ error: selErr.message || 'Lookup failed' }, { status: 500, headers });
  }
  if (!row) {
    return Response.json({ error: 'Barber not found' }, { status: 404, headers });
  }

  const br = row as { id: string; email: string; tier: string; is_active: boolean | null };
  const emailNorm = rawEmail.trim().toLowerCase();
  const rowEmail = String(br.email ?? '').trim().toLowerCase();
  if (!rowEmail || rowEmail !== emailNorm) {
    return Response.json({ error: 'Email does not match this barber account' }, { status: 403, headers });
  }

  if (br.is_active === false) {
    return Response.json({ error: 'Account is not active' }, { status: 403, headers });
  }

  const tierNorm = String(br.tier ?? '').toLowerCase();
  const maxAllowed = maxPortfolioForTier(tierNorm);
  if (maxAllowed <= 0) {
    return Response.json(
      { error: 'معرض الأعمال متاح للباقة الذهبية والماسية فقط.' },
      { status: 403, headers },
    );
  }

  if (action === 'stats') {
    const listed = await countPortfolioObjects(supabase, barberId);
    if (!listed.ok) {
      return Response.json({ error: listed.error }, { status: 500, headers });
    }
    return Response.json(
      { ok: true, objectCount: listed.count, maxAllowed },
      { headers },
    );
  }

  if (action === 'delete') {
    const objectPathRaw = String(b.objectPath ?? '').trim();
    const pathNorm = normalizeObjectPath(barberId, objectPathRaw);
    if (!pathNorm) {
      return Response.json({ error: 'Invalid objectPath' }, { status: 400, headers });
    }
    const { error: rmErr } = await supabase.storage.from('barber-portfolio').remove([pathNorm]);
    if (rmErr) {
      return Response.json({ error: rmErr.message || 'Delete failed' }, { status: 500, headers });
    }
    return Response.json({ ok: true }, { headers });
  }

  if (action === 'upload') {
    const imageBase64 = String(b.imageBase64 ?? '').trim();
    if (!imageBase64) {
      return Response.json({ error: 'Missing imageBase64' }, { status: 400, headers });
    }
    let buf: Buffer;
    try {
      buf = Buffer.from(imageBase64, 'base64');
    } catch {
      return Response.json({ error: 'Invalid base64' }, { status: 400, headers });
    }
    if (buf.length < 32) {
      return Response.json({ error: 'Image payload too small' }, { status: 400, headers });
    }
    if (buf.length > MAX_UPLOAD_BYTES) {
      return Response.json({ error: 'Image payload too large' }, { status: 413, headers });
    }

    const listed = await countPortfolioObjects(supabase, barberId);
    if (!listed.ok) {
      return Response.json({ error: listed.error }, { status: 500, headers });
    }
    if (listed.count >= maxAllowed) {
      return Response.json(
        { error: 'تم بلوغ الحد الأقصى لعدد صور معرض الأعمال لهذه الباقة. احذف صوراً قديمة ثم أعد المحاولة.' },
        { status: 409, headers },
      );
    }

    const path = `${barberId}/${randomUUID()}.webp`;
    const { error: upErr } = await supabase.storage.from('barber-portfolio').upload(path, buf, {
      contentType: 'image/webp',
      upsert: false,
    });
    if (upErr) {
      return Response.json({ error: upErr.message || 'Upload failed' }, { status: 500, headers });
    }

    const { data: pub } = supabase.storage.from('barber-portfolio').getPublicUrl(path);
    const publicUrl = pub?.publicUrl ? String(pub.publicUrl) : '';
    if (!publicUrl) {
      return Response.json({ error: 'Public URL unavailable' }, { status: 500, headers });
    }

    return Response.json({ ok: true, publicUrl, objectPath: path }, { headers });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400, headers });
}
