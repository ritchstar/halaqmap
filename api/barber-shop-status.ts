import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = {
  maxDuration: 20,
};

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-supabase-anon, x-client-supabase-url',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

/** رمز سري طويل (hex) — فريد في قاعدة البيانات عبر فهرس فريد على open_status_token. */
function isLikelyOpenStatusToken(raw: string): boolean {
  const t = raw.trim();
  if (t.length < 32 || t.length > 128) return false;
  return /^[0-9a-f]+$/i.test(t);
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

/** تشخيص — GET /api/barber-shop-status */
export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const url = Boolean((process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim());
  const serviceRole = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
  const anon = Boolean((process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim());

  const u = new URL(request.url);
  const token = u.searchParams.get('token')?.trim() || '';

  if (!token) {
    return Response.json(
      {
        ok: true,
        route: 'barber-shop-status',
        supabaseUrlSet: url,
        serviceRoleKeySet: serviceRole,
        anonKeySetForVerification: anon,
        ready: url && serviceRole,
        publicApiGuard: registrationGuardDiagnostics(),
        hint: 'Pass ?token=... from your shop quick link to read or update open status.',
      },
      { headers }
    );
  }

  if (!isLikelyOpenStatusToken(token)) {
    return Response.json({ error: 'Invalid token' }, { status: 400, headers });
  }

  const guard = runRegistrationRouteGuards(request, 'barber-shop-status');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const sr = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!supabaseUrl || !sr) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  const supabase = createClient(supabaseUrl, sr, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from('barbers')
    .select('id,name,tier,open_for_customers,is_active,open_status_token')
    .eq('open_status_token', token)
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message || 'Lookup failed' }, { status: 500, headers });
  }
  if (!data) {
    return Response.json({ error: 'Not found' }, { status: 404, headers });
  }

  const row = data as {
    id: string;
    name: string;
    tier: string | null;
    open_for_customers: boolean | null;
    is_active: boolean | null;
  };

  if (row.is_active === false) {
    return Response.json({ error: 'Account inactive' }, { status: 403, headers });
  }

  return Response.json(
    {
      ok: true,
      barberId: String(row.id),
      barberName: String(row.name ?? ''),
      tier: String(row.tier ?? 'bronze'),
      openForCustomers: row.open_for_customers !== false,
    },
    { headers }
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-shop-status');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const sr = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!supabaseUrl || !sr) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const token = String((body as { token?: unknown }).token ?? '').trim();
  const openRaw = (body as { openForCustomers?: unknown }).openForCustomers;
  if (!token || !isLikelyOpenStatusToken(token)) {
    return Response.json({ error: 'Invalid token' }, { status: 400, headers });
  }
  if (typeof openRaw !== 'boolean') {
    return Response.json({ error: 'openForCustomers must be a boolean' }, { status: 400, headers });
  }

  const supabase = createClient(supabaseUrl, sr, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: existing, error: exErr } = await supabase
    .from('barbers')
    .select('id,is_active')
    .eq('open_status_token', token)
    .maybeSingle();

  if (exErr) {
    return Response.json({ error: exErr.message || 'Lookup failed' }, { status: 500, headers });
  }
  if (!existing) {
    return Response.json({ error: 'Not found' }, { status: 404, headers });
  }
  if ((existing as { is_active?: boolean | null }).is_active === false) {
    return Response.json({ error: 'Account inactive' }, { status: 403, headers });
  }

  const { data: updated, error: upErr } = await supabase
    .from('barbers')
    .update({ open_for_customers: openRaw })
    .eq('open_status_token', token)
    .select('id, open_for_customers')
    .maybeSingle();

  if (upErr) {
    return Response.json({ error: upErr.message || 'Update failed' }, { status: 500, headers });
  }
  if (!updated) {
    return Response.json({ error: 'No row updated (invalid token or token mismatch)' }, { status: 404, headers });
  }
  const row = updated as { id?: string; open_for_customers?: boolean | null };
  if (row.open_for_customers !== openRaw) {
    return Response.json({ error: 'Update did not persist as requested' }, { status: 409, headers });
  }

  return Response.json({ ok: true, openForCustomers: openRaw, barberId: String(row.id ?? '') }, { status: 200, headers });
}
