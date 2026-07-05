import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import {
  awaitDigitalShiftInterceptAfterCustomerSend,
  runDigitalShiftIntercept,
} from './_lib/digitalShiftInterceptService.js';
import {
  assertShiftInterceptCaller,
  isShiftInterceptWorkerRequest,
} from './_lib/digitalShiftInterceptAuth.js';
import { runSecurityGuard } from './_lib/securityGuard.js';

export const config = { maxDuration: 60 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-supabase-anon, x-client-supabase-url',
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
    { ok: true, route: 'customer-digital-shift-intercept', publicApiGuard: registrationGuardDiagnostics() },
    { headers: corsHeaders(request) },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 20 });
  if (!secGuard.allowed) return secGuard.response;

  const routeGuard = runRegistrationRouteGuards(request, 'customer-digital-shift-intercept');
  if (routeGuard.ok === false) {
    return Response.json(routeGuard.json, { status: routeGuard.status, headers });
  }

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400, headers });
  }

  const conversationId = String(body.conversationId ?? '').trim();
  if (!conversationId) {
    return Response.json({ error: 'Missing conversationId' }, { status: 400, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const isWorker = isShiftInterceptWorkerRequest(body, request);
  if (!isWorker) {
    const caller = await assertShiftInterceptCaller(supabase, {
      conversationId,
      guestClientId: String(body.guestClientId ?? ''),
      barberId: String(body.barberId ?? ''),
      email: String(body.email ?? ''),
    });
    if (!caller.ok) {
      return Response.json({ error: caller.error }, { status: caller.status, headers });
    }
  }

  let result;
  try {
    result = isWorker
      ? (await awaitDigitalShiftInterceptAfterCustomerSend(supabase, conversationId)) ?? {
          ok: true as const,
          replied: false,
          reason: 'shift_skipped',
        }
      : await runDigitalShiftIntercept(supabase, conversationId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'intercept_failed';
    console.error('[customer-digital-shift-intercept]', conversationId, msg);
    return Response.json({ error: msg }, { status: 500, headers });
  }
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status, headers });
  }
  if (result.replied) {
    return Response.json(
      {
        ok: true,
        replied: true,
        trigger: result.trigger,
        message: result.message,
      },
      { headers },
    );
  }
  return Response.json(
    { ok: true, replied: false, reason: result.reason, trigger: result.trigger },
    { headers },
  );
}
