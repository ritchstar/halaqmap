/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { recordHoneypotTrip, runSecurityGuard } from './_lib/securityGuard.js';
import {
  parseStoreServiceRequestBody,
  STORE_SERVICE_REQUEST_TABLE,
} from './_lib/storeServiceRequest.js';

export const config = { maxDuration: 15 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-client-supabase-url, x-supabase-anon',
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
      route: 'public-store-service-request',
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers: corsHeaders(request) },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'public-store-service-request');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 6 });
  if (!secGuard.allowed) return secGuard.response;

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const parsed = parseStoreServiceRequestBody(body);
  if (parsed.ok === false) {
    if (parsed.error === 'honeypot') {
      await recordHoneypotTrip(request, 'public-store-service-request');
      return Response.json({ ok: true }, { headers });
    }
    return Response.json({ error: parsed.error }, { status: parsed.status, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from(STORE_SERVICE_REQUEST_TABLE)
    .insert(parsed.row)
    .select('id')
    .maybeSingle();

  if (error) {
    return Response.json({ error: 'تعذّر حفظ الطلب' }, { status: 500, headers });
  }

  return Response.json(
    { ok: true, requestId: typeof data?.id === 'string' ? data.id : null },
    { headers },
  );
}
