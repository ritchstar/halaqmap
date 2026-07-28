/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * منحة المؤسس: تفعيل 90 يوماً بدون دفع.
 * POST/GET — Bootstrap admin only.
 */
import { isBootstrapAdminEmail, verifyActivePlatformAdminFromRequest } from './_lib/adminManageBarbersAuth.js';
import { clientIpFromRequest } from './_lib/adminSentinelRequest.js';
import {
  activateFounderComp90,
  lookupBarberForFounderComp,
  type FounderCompBarberHit,
} from './_lib/founderCompGrantService.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 60 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function serverEnv(): { url: string; serviceRole: string } | null {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !isLikelyHttpUrl(url) || !serviceRole) return null;
  return { url, serviceRole };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const env = serverEnv();
  if (!env) {
    return Response.json({ error: 'server_misconfigured' }, { status: 503, headers });
  }

  const adminAuth = await verifyActivePlatformAdminFromRequest(request, env.url, env.serviceRole);
  if (adminAuth.ok === false) {
    return Response.json(adminAuth.json, { status: adminAuth.status, headers });
  }
  if (!isBootstrapAdminEmail(adminAuth.actorEmail)) {
    return Response.json({ error: 'Bootstrap admin only' }, { status: 403, headers });
  }

  const url = new URL(request.url);
  const q = String(url.searchParams.get('q') ?? url.searchParams.get('query') ?? '').trim();
  if (!q) {
    return Response.json({ error: 'missing_query' }, { status: 400, headers });
  }

  const result = await lookupBarberForFounderComp(adminAuth.supabase, q);
  if (!result.ok) {
    const status = result.error === 'ambiguous_match' ? 409 : result.error === 'barber_not_found' ? 404 : 400;
    return Response.json(
      {
        ok: false,
        error: result.error,
        candidates: (result.candidates ?? []) as FounderCompBarberHit[],
      },
      { status, headers },
    );
  }

  return Response.json({ ok: true, barber: result.barber }, { headers });
}

type PostBody = {
  barberId?: unknown;
  tier?: unknown;
  reason?: unknown;
  lookupQuery?: unknown;
  q?: unknown;
};

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const env = serverEnv();
  if (!env) {
    return Response.json({ error: 'server_misconfigured' }, { status: 503, headers });
  }

  const adminAuth = await verifyActivePlatformAdminFromRequest(request, env.url, env.serviceRole);
  if (adminAuth.ok === false) {
    return Response.json(adminAuth.json, { status: adminAuth.status, headers });
  }
  if (!isBootstrapAdminEmail(adminAuth.actorEmail)) {
    return Response.json({ error: 'Bootstrap admin only' }, { status: 403, headers });
  }

  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400, headers });
  }

  const reason = String(body.reason ?? '').trim();
  const tierRaw = String(body.tier ?? 'bronze').trim().toLowerCase();
  const lookupQuery = String(body.lookupQuery ?? body.q ?? '').trim();
  let barberId = String(body.barberId ?? '').trim();

  if (!UUID_RE.test(barberId) && lookupQuery) {
    const looked = await lookupBarberForFounderComp(adminAuth.supabase, lookupQuery);
    if (!looked.ok) {
      const status = looked.error === 'ambiguous_match' ? 409 : looked.error === 'barber_not_found' ? 404 : 400;
      return Response.json(
        { ok: false, error: looked.error, candidates: looked.candidates ?? [] },
        { status, headers },
      );
    }
    barberId = looked.barber.id;
  }

  if (!UUID_RE.test(barberId)) {
    return Response.json({ error: 'invalid_barber_id' }, { status: 400, headers });
  }

  if (tierRaw !== 'bronze' && tierRaw !== 'gold' && tierRaw !== 'diamond') {
    return Response.json({ error: 'invalid_tier' }, { status: 400, headers });
  }

  const grant = await activateFounderComp90(adminAuth.supabase, {
    barberId,
    tier: tierRaw,
    reason,
    actorEmail: adminAuth.actorEmail,
    lookupQuery: lookupQuery || null,
  });

  if (!grant.ok) {
    const status =
      grant.error === 'barber_not_found'
        ? 404
        : grant.error === 'reason_too_short' || grant.error === 'invalid_tier' || grant.error === 'invalid_barber_id'
          ? 400
          : 500;
    return Response.json({ ok: false, error: grant.error }, { status, headers });
  }

  const ua = (request.headers.get('user-agent') || '').slice(0, 512);
  const ip = clientIpFromRequest(request);
  await adminAuth.supabase.from('admin_actions_log').insert({
    actor_email: adminAuth.actorEmail,
    action_type: 'founder_comp_activate_90',
    detail: {
      barberId: grant.barberId,
      tier: grant.tier,
      entitlementId: grant.entitlementId,
      orderId: grant.orderId,
      validUntil: grant.validUntil,
      listingDaysGranted: grant.listingDaysGranted,
      listingDaysRemaining: grant.listingDaysRemaining,
      previousValidUntil: grant.previousValidUntil,
      previousListingDaysRemaining: grant.previousListingDaysRemaining,
      reason,
      lookupQuery: lookupQuery || null,
      source: 'founder_comp_activate_ui',
      balanceSource: 'barber_listing_summary',
    },
    client_ip: ip,
    client_user_agent: ua,
  });

  return Response.json(
    {
      ok: true,
      barberId: grant.barberId,
      tier: grant.tier,
      entitlementId: grant.entitlementId,
      orderId: grant.orderId,
      validUntil: grant.validUntil,
      listingDaysGranted: grant.listingDaysGranted,
      listingDaysRemaining: grant.listingDaysRemaining,
      previousValidUntil: grant.previousValidUntil,
      previousListingDaysRemaining: grant.previousListingDaysRemaining,
      balanceSource: 'barber_listing_summary',
    },
    { headers },
  );
}
