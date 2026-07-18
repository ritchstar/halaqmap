import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { redeemListingLicenseVoucher } from './_lib/listingLicenseService.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { runSecurityGuard } from './_lib/securityGuard.js';

export const config = { maxDuration: 30 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-supabase-anon, x-client-supabase-url',
} as const;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

async function assertBarberEmailOwnsRow(
  supabase: SupabaseClient,
  barberId: string,
  rawEmail: string,
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const emailNorm = rawEmail.trim().toLowerCase();
  if (!barberId || !emailNorm) {
    return { ok: false, status: 400, message: 'Missing barberId or email' };
  }
  const { data: row, error } = await supabase
    .from('barbers')
    .select('id, email')
    .eq('id', barberId)
    .maybeSingle();
  if (error || !row) return { ok: false, status: 404, message: 'Barber not found' };
  const stored = String(row.email ?? '').trim().toLowerCase();
  if (stored !== emailNorm) return { ok: false, status: 403, message: 'Email does not match barber' };
  return { ok: true };
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
      route: 'listing-license-redeem',
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'listing-license-redeem');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 5 });
  if (!secGuard.allowed) return secGuard.response;

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ error: 'server_misconfigured' }, { status: 503, headers });
  }

  let body: { code?: unknown; barberId?: unknown; email?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400, headers });
  }

  const code = String(body.code ?? '').trim();
  const barberId = String(body.barberId ?? '').trim();
  const email = String(body.email ?? '').trim();

  if (!code || !UUID_RE.test(barberId) || !email.includes('@')) {
    return Response.json({ error: 'invalid_payload' }, { status: 400, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const owned = await assertBarberEmailOwnsRow(supabase, barberId, email);
  if (!owned.ok) {
    return Response.json({ error: owned.message }, { status: owned.status, headers });
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    '';
  const clientIpHash = ip
    ? createHash('sha256').update(`${ip}|listing-redeem`).digest('hex').slice(0, 32)
    : null;

  const result = await redeemListingLicenseVoucher(supabase, {
    code,
    barberId,
    clientIpHash,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status, headers });
  }

  return Response.json(
    {
      ok: true,
      entitlementId: result.entitlementId,
      validUntil: result.validUntil,
      listingDaysRemaining: result.listingDaysRemaining,
      listingDaysGranted: result.listingDaysGranted,
      tier: result.tier,
    },
    { headers },
  );
}
