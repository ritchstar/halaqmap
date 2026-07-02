import { createClient } from '@supabase/supabase-js';
import { resolveBarberPortalBookingActor } from './_lib/barberPortalBookingAuth.js';
import {
  barberHasQrReviewsAccess,
  listBarberQrReviewsForManage,
  updateBarberQrReviewVisibility,
} from './_lib/barberQrReviewService.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';

export const config = { maxDuration: 25 };

const CORS_OPTS = {
  allowMethods: 'GET, PATCH, OPTIONS',
  allowHeaders:
    'Content-Type, x-supabase-anon, x-client-supabase-url, x-barber-portal-session, Authorization',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

function supabaseAdmin() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const supabase = supabaseAdmin();
  if (!supabase) {
    return Response.json({ ok: false, error: 'server_misconfigured' }, { status: 503, headers });
  }

  const url = new URL(request.url);
  const barberId = String(url.searchParams.get('barberId') ?? '').trim();
  const email = String(url.searchParams.get('email') ?? '').trim();

  const actor = await resolveBarberPortalBookingActor(request, { barberId, email }, supabase);
  if (!actor.ok) {
    return Response.json({ ok: false, error: actor.error }, { status: actor.status, headers });
  }

  const { data: barberRow } = await supabase
    .from('barbers')
    .select('tier, total_reviews')
    .eq('id', actor.barberId)
    .maybeSingle();

  const hasAccess = await barberHasQrReviewsAccess(supabase, {
    id: actor.barberId,
    tier: barberRow?.tier != null ? String(barberRow.tier) : null,
  });
  if (!hasAccess) {
    return Response.json({ ok: false, error: 'tier_not_eligible' }, { status: 403, headers });
  }

  const listed = await listBarberQrReviewsForManage(supabase, actor.barberId);
  const barberTotalReviews = Math.max(0, Math.floor(Number(barberRow?.total_reviews ?? 0)));
  return Response.json(
    {
      ok: true,
      reviews: listed.reviews,
      barberTotalReviews,
      ...(listed.queryError ? { queryWarning: listed.queryError } : {}),
    },
    { headers },
  );
}

export async function PATCH(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const supabase = supabaseAdmin();
  if (!supabase) {
    return Response.json({ ok: false, error: 'server_misconfigured' }, { status: 503, headers });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400, headers });
  }

  const b = body as {
    barberId?: unknown;
    email?: unknown;
    reviewId?: unknown;
    isPublished?: unknown;
    isHighlighted?: unknown;
  };

  const actor = await resolveBarberPortalBookingActor(
    request,
    { barberId: b.barberId, email: b.email },
    supabase,
  );
  if (!actor.ok) {
    return Response.json({ ok: false, error: actor.error }, { status: actor.status, headers });
  }

  const { data: barberRow } = await supabase
    .from('barbers')
    .select('tier')
    .eq('id', actor.barberId)
    .maybeSingle();

  const hasAccess = await barberHasQrReviewsAccess(supabase, {
    id: actor.barberId,
    tier: barberRow?.tier != null ? String(barberRow.tier) : null,
  });
  if (!hasAccess) {
    return Response.json({ ok: false, error: 'tier_not_eligible' }, { status: 403, headers });
  }

  const result = await updateBarberQrReviewVisibility(supabase, actor.barberId, String(b.reviewId ?? '').trim(), {
    ...(typeof b.isPublished === 'boolean' ? { isPublished: b.isPublished } : {}),
    ...(typeof b.isHighlighted === 'boolean' ? { isHighlighted: b.isHighlighted } : {}),
  });

  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: 404, headers });
  }

  return Response.json({ ok: true, review: result.review }, { headers });
}
