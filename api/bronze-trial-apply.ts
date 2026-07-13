/**
 * تقديم طلب تجربة برونزي (عام) — لا ينشئ حساباً.
 */
import { createClient } from '@supabase/supabase-js';
import { submitBronzeTrialApplication } from './_lib/bronzeTrialApplicationService.js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';

export const config = { maxDuration: 30 };

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
  return Response.json(
    { ok: true, route: 'bronze-trial-apply', publicApiGuard: registrationGuardDiagnostics() },
    { headers: corsHeaders(request) },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'bronze-trial-apply');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ ok: false, error: 'server_misconfigured' }, { status: 503, headers });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400, headers });
  }

  // honeypot
  if (String(body.website ?? '').trim()) {
    return Response.json({ ok: true, applicationId: 'ignored', confirmEmailSent: true }, { headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const result = await submitBronzeTrialApplication(supabase, {
    salonName: String(body.salonName ?? ''),
    establishmentName: String(body.establishmentName ?? ''),
    email: String(body.email ?? ''),
    phone: String(body.phone ?? ''),
    whatsapp: String(body.whatsapp ?? ''),
    cityAr: String(body.cityAr ?? ''),
    districtAr: String(body.districtAr ?? ''),
    regionAr: String(body.regionAr ?? '') || null,
    latitude: Number(body.latitude),
    longitude: Number(body.longitude),
    notes: String(body.notes ?? '') || null,
    photoExteriorSignUrl: String(body.photoExteriorSignUrl ?? ''),
    photoExterior2Url: String(body.photoExterior2Url ?? ''),
    photoInterior1Url: String(body.photoInterior1Url ?? ''),
    photoInterior2Url: String(body.photoInterior2Url ?? ''),
    uploadOrderId: String(body.uploadOrderId ?? '') || null,
  });

  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: result.status, headers });
  }
  return Response.json(result, { status: 200, headers });
}
