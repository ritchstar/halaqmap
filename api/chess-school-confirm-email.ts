/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * تأكيد بريد تسجيل مدرسة الشطرنج الاحترافية عبر رابط الرسالة.
 */
import { createClient } from '@supabase/supabase-js';
import { confirmChessSchoolRegistrationEmail } from './_lib/chessSchoolRegistrationService.js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';
import { runSecurityGuard } from './_lib/securityGuard.js';

export const config = { maxDuration: 20 };

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
  const headers = corsHeaders(request);
  const guard = runRegistrationRouteGuards(request, 'chess-school-confirm-email');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 6 });
  if (!secGuard.allowed) return secGuard.response;
  const urlObj = new URL(request.url);
  const token = (urlObj.searchParams.get('c') || urlObj.searchParams.get('token') || '').trim();
  return handleConfirm(token, headers);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const guard = runRegistrationRouteGuards(request, 'chess-school-confirm-email');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 6 });
  if (!secGuard.allowed) return secGuard.response;
  let body: { token?: unknown; c?: unknown } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    /* empty */
  }
  const token = String(body.token ?? body.c ?? '').trim();
  return handleConfirm(token, headers);
}

async function handleConfirm(token: string, headers: Record<string, string>): Promise<Response> {
  if (!token) {
    return Response.json({ ok: false, error: 'missing_token' }, { status: 400, headers });
  }
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ ok: false, error: 'server_misconfigured' }, { status: 503, headers });
  }
  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const result = await confirmChessSchoolRegistrationEmail(supabase, token);
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: result.status, headers });
  }
  return Response.json(
    {
      ok: true,
      registrationId: result.registrationId,
      fullName: result.fullName,
      payPath: `/chess/school/pay/${encodeURIComponent(result.registrationId)}`,
      messageAr:
        'تم تأكيد بريدك بنجاح وتفعيل حسابك. الخطوة الأخيرة هي دفع الاشتراك (175 ر.س — دفعة واحدة، وصول دائم) لتفعيل مدرسة الشطرنج الاحترافية باسمك.',
    },
    { status: 200, headers },
  );
}
