import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { getBarberListingBalance } from './_lib/listingLicenseService.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = { maxDuration: 15 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-supabase-anon, x-client-supabase-url',
} as const;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  return Response.json(
    {
      ok: true,
      route: 'listing-license-balance',
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'listing-license-balance');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ error: 'server_misconfigured' }, { status: 503, headers });
  }

  let body: { barberId?: unknown; email?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400, headers });
  }

  const barberId = String(body.barberId ?? '').trim();
  const email = String(body.email ?? '').trim();
  if (!UUID_RE.test(barberId) || !email.includes('@')) {
    return Response.json({ error: 'invalid_payload' }, { status: 400, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: row, error } = await supabase
    .from('barbers')
    .select('id, email')
    .eq('id', barberId)
    .maybeSingle();
  if (error || !row) {
    return Response.json({ error: 'barber_not_found' }, { status: 404, headers });
  }
  if (String(row.email ?? '').trim().toLowerCase() !== email.trim().toLowerCase()) {
    return Response.json({ error: 'email_mismatch' }, { status: 403, headers });
  }

  const balance = await getBarberListingBalance(supabase, barberId);
  return Response.json({ ok: true, ...balance }, { headers });
}
