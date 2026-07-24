import { createClient } from '@supabase/supabase-js';
import { submitBarberQrReview } from './_lib/barberQrReviewService.js';
import { clientIpFromRequest } from './_lib/qrReviewAntiAbuse.js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';

export const config = { maxDuration: 20 };

const CORS_OPTS = {
  allowMethods: 'POST, OPTIONS',
  allowHeaders: 'Content-Type, x-client-supabase-url, x-supabase-anon',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'submit-barber-qr-review');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
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
    token?: unknown;
    customerName?: unknown;
    rating?: unknown;
    comment?: unknown;
    clientInstanceId?: unknown;
  };

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const result = await submitBarberQrReview(supabase, {
    barberId: String(b.barberId ?? '').trim(),
    token: String(b.token ?? '').trim(),
    customerName: String(b.customerName ?? '').trim(),
    rating: Number(b.rating),
    comment: typeof b.comment === 'string' ? b.comment : '',
    clientInstanceId: String(b.clientInstanceId ?? '').trim(),
    clientIp: clientIpFromRequest(request),
  });

  if (!result.ok) {
    const status =
      result.error === 'invalid_token' || result.error === 'tier_not_eligible'
        ? 403
        : result.error === 'not_found'
          ? 404
          : result.error === 'already_submitted'
            ? 409
            : result.error === 'rate_limited_ip'
              ? 429
              : 400;
    return Response.json({ ok: false, error: result.error }, { status, headers });
  }

  return Response.json({ ok: true, review: result.review }, { headers });
}
