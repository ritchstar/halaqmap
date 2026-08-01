/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * ترشيح تغطية منطقة من المستعلم — عام، بدون حساب.
 */
import { createClient } from '@supabase/supabase-js';
import { submitCoverageSalonNomination } from './_lib/coverageSalonNominateService.js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';
import { recordHoneypotTrip, runSecurityGuard } from './_lib/securityGuard.js';

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
    {
      ok: true,
      route: 'coverage-salon-nominate',
      publicApiGuard: registrationGuardDiagnostics(),
      note: 'POST multipart: salonName, contactPhone, latitude, longitude, insideSalon=true, locationShared=true, photo?, website honeypot',
    },
    { headers: corsHeaders(request) },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'coverage-salon-nominate');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 6 });
  if (!secGuard.allowed) return secGuard.response;

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ ok: false, error: 'server_misconfigured' }, { status: 503, headers });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: 'invalid_form' }, { status: 400, headers });
  }

  const honeypot = String(form.get('website') ?? '').trim();
  if (honeypot) {
    await recordHoneypotTrip(request, 'coverage-salon-nominate');
    return Response.json({ ok: true, id: 'ignored' }, { headers });
  }

  const photoEntry = form.get('photo');
  let photo: { bytes: Uint8Array; contentType: string; fileName: string } | null = null;
  if (photoEntry && typeof photoEntry === 'object' && 'arrayBuffer' in photoEntry) {
    const file = photoEntry as File;
    if (file.size > 0) {
      const buf = new Uint8Array(await file.arrayBuffer());
      photo = {
        bytes: buf,
        contentType: (file.type || 'image/jpeg').toLowerCase(),
        fileName: file.name || 'photo.jpg',
      };
    }
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const result = await submitCoverageSalonNomination(supabase, {
    salonName: String(form.get('salonName') ?? ''),
    contactPhone: String(form.get('contactPhone') ?? ''),
    latitude: Number(form.get('latitude')),
    longitude: Number(form.get('longitude')),
    insideSalonConfirmed: String(form.get('insideSalon') ?? '') === 'true',
    locationShared: String(form.get('locationShared') ?? '') === 'true',
    photo,
    websiteHoneypot: honeypot,
  });

  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: result.status, headers });
  }
  return Response.json({ ok: true, id: result.id }, { status: 200, headers });
}
