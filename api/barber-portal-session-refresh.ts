import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildInclusiveCareSnapshotFromBarberRow } from './_lib/inclusiveCareBarberSnapshot.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = {
  maxDuration: 15,
};

function safeHost(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    return new URL(rawUrl).host;
  } catch {
    return rawUrl;
  }
}

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-supabase-anon, x-client-supabase-url',
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
  const resolvedUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
  return Response.json(
    {
      ok: true,
      route: 'barber-portal-session-refresh',
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

  const guard = runRegistrationRouteGuards(request, 'barber-portal-session-refresh');
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

  const barberId = String((body as { barberId?: unknown }).barberId ?? '').trim();
  const rawEmail = String((body as { email?: unknown }).email ?? '').trim();

  if (!barberId || !rawEmail) {
    return Response.json({ error: 'Missing barberId or email' }, { status: 400, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const selectCols =
    'id, name, email, phone, tier, rating_invite_token, member_number, is_active, inclusive_care_offered, inclusive_care_price_sar, inclusive_care_public_visible, inclusive_care_restrict_days, inclusive_care_days, inclusive_care_customer_note';

  const { data: row, error } = await supabase.from('barbers').select(selectCols).eq('id', barberId).maybeSingle();

  if (error) {
    return Response.json({ error: error.message || 'Lookup failed' }, { status: 500, headers });
  }

  if (!row) {
    return Response.json({ error: 'Barber not found' }, { status: 404, headers });
  }

  const b = row as {
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

  const emailNorm = rawEmail.trim().toLowerCase();
  const rowEmail = String(b.email ?? '').trim().toLowerCase();
  if (!rowEmail || rowEmail !== emailNorm) {
    return Response.json({ error: 'Email does not match this barber account' }, { status: 403, headers });
  }

  if (b.is_active === false) {
    return Response.json({ error: 'Account is not active' }, { status: 403, headers });
  }

  const tierNorm = String(b.tier ?? '').toLowerCase();
  if (tierNorm !== 'gold' && tierNorm !== 'diamond') {
    return Response.json(
      {
        error:
          'باقتك البرونزية لا تتضمن لوحة التحكم الإلكترونية. رقِ للذهبي أو الماسي للاستمرار.',
        code: 'TIER_BRONZE_NO_DASHBOARD',
      },
      { status: 403, headers }
    );
  }

  return Response.json(
    {
      ok: true,
      barber: {
        id: String(b.id),
        name: String(b.name ?? ''),
        email: String(b.email ?? ''),
        phone: String(b.phone ?? ''),
        tier: String(b.tier ?? 'bronze'),
        rating_invite_token: b.rating_invite_token != null ? String(b.rating_invite_token) : '',
        member_number:
          b.member_number != null && Number.isFinite(Number(b.member_number))
            ? Math.floor(Number(b.member_number))
            : null,
        inclusiveCare: buildInclusiveCareSnapshotFromBarberRow(b),
      },
    },
    { headers },
  );
}
