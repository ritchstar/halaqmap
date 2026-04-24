import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildInclusiveCareSnapshotFromBarberRow } from './_lib/inclusiveCareBarberSnapshot.js';

export const config = {
  maxDuration: 30,
};

function safeHost(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    return new URL(rawUrl).host;
  } catch {
    return rawUrl;
  }
}

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-supabase-anon, x-client-supabase-url',
    'Access-Control-Max-Age': '86400',
  };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function GET(request: Request): Promise<Response> {
  const headers = corsHeaders(request);
  const resolvedUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
  const portalPw = Boolean((process.env.BARBER_PORTAL_PASSWORD || '').trim());
  return Response.json(
    {
      ok: true,
      route: 'barber-portal-login',
      supabaseUrlSet: Boolean(resolvedUrl),
      supabaseUrlHost: safeHost(resolvedUrl),
      serviceRoleKeySet: serviceRole,
      barberPortalPasswordSet: portalPw,
      publicApiGuard: registrationGuardDiagnostics(),
      ready: Boolean(resolvedUrl) && serviceRole && portalPw,
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-portal-login');
  if (guard.ok === false) {
    const { status, json } = guard;
    return Response.json(json, { status, headers });
  }

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const portalPassword = (process.env.BARBER_PORTAL_PASSWORD || '').trim();

  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }
  if (!portalPassword) {
    return Response.json(
      {
        error: 'BARBER_PORTAL_PASSWORD is not set',
        hint: 'Set a shared portal password on the server (Vercel env). Barbers use it with their registered email.',
      },
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

  const rawEmail = String((body as { email?: unknown }).email ?? '').trim();
  const password = String((body as { password?: unknown }).password ?? '');

  if (!rawEmail || !password) {
    return Response.json({ error: 'Missing email or password' }, { status: 400, headers });
  }

  if (password !== portalPassword) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const selectCols =
    'id, name, email, phone, tier, rating_invite_token, member_number, is_active, inclusive_care_offered, inclusive_care_price_sar, inclusive_care_public_visible, inclusive_care_restrict_days, inclusive_care_days, inclusive_care_customer_note';

  type BarberPortalRow = {
    id: string;
    name: string;
    email: string;
    phone: string;
    tier: string;
    rating_invite_token: string | null;
    member_number: number | null;
    is_active: boolean | null;
    inclusive_care_offered?: boolean | null;
    inclusive_care_price_sar?: unknown;
    inclusive_care_public_visible?: boolean | null;
    inclusive_care_restrict_days?: boolean | null;
    inclusive_care_days?: unknown;
    inclusive_care_customer_note?: string | null;
  };

  let barber: BarberPortalRow | null = null;
  let error: { message?: string } | null = null;

  const tryEq = async (addr: string) => {
    const r = await supabase.from('barbers').select(selectCols).eq('email', addr).maybeSingle();
    return r;
  };

  const r0 = await tryEq(rawEmail);
  if (r0.error) error = r0.error;
  else if (r0.data) barber = r0.data as BarberPortalRow;

  if (!barber && !error) {
    const r1 = await tryEq(rawEmail.toLowerCase());
    if (r1.error) error = r1.error;
    else if (r1.data) barber = r1.data as BarberPortalRow;
  }

  if (!barber && !error) {
    const r2 = await supabase
      .from('barbers')
      .select(selectCols)
      .ilike('email', rawEmail)
      .maybeSingle();
    if (r2.error) error = r2.error;
    else if (r2.data) barber = r2.data as BarberPortalRow;
  }

  if (error) {
    return Response.json({ error: error.message || 'Lookup failed' }, { status: 500, headers });
  }
  if (!barber || barber.is_active === false) {
    return Response.json({ error: 'No active barber account for this email' }, { status: 404, headers });
  }

  return Response.json(
    {
      ok: true,
      barber: {
        id: String(barber.id),
        name: String(barber.name ?? ''),
        email: String(barber.email ?? ''),
        phone: String(barber.phone ?? ''),
        tier: String(barber.tier ?? 'bronze'),
        rating_invite_token: barber.rating_invite_token != null ? String(barber.rating_invite_token) : '',
        member_number:
          barber.member_number != null && Number.isFinite(Number(barber.member_number))
            ? Math.floor(Number(barber.member_number))
            : null,
        inclusiveCare: buildInclusiveCareSnapshotFromBarberRow(barber),
      },
    },
    { headers },
  );
}
