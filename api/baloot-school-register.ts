/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * تسجيل عميل في مدرسة البلوت (بالاسم والبريد) — يرسل بريد تأكيد حقيقياً.
 * لا يُنشئ حساب دخول (بلا كلمة مرور) ولا يُجري أي دفع في هذه المرحلة.
 * مطابق حرفياً لـ chess-school-register.ts.
 */
import { createClient } from '@supabase/supabase-js';
import { submitBalootSchoolRegistration } from './_lib/balootSchoolRegistrationService.js';
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
    { ok: true, route: 'baloot-school-register', publicApiGuard: registrationGuardDiagnostics() },
    { headers: corsHeaders(request) },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'baloot-school-register');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 8 });
  if (!secGuard.allowed) return secGuard.response;

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
    await recordHoneypotTrip(request, 'baloot-school-register');
    return Response.json(
      { ok: true, registrationId: 'ignored', confirmEmailSent: true, alreadyRegistered: false },
      { headers },
    );
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const result = await submitBalootSchoolRegistration(supabase, {
    fullName: String(body.fullName ?? ''),
    email: String(body.email ?? ''),
  });

  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: result.status, headers });
  }
  return Response.json(result, { status: 200, headers });
}
