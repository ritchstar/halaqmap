/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * دفع مدرسة الشطرنج الاحترافية — المرحلة ٢ (175 ر.س، Moyasar حقيقي مباشر).
 * action: 'get_public' (حالة الدفع للعرض) | 'activate_paid' (تفعيل بعد تحقق حقيقي من ميسر).
 * لا فاتورة مستضافة ولا تجديد — نموذج ميسر المُضمَّن مباشرة (نفس بنية بقية دفعات المنصة).
 */
import { createClient } from '@supabase/supabase-js';
import { activateChessSchoolPaid, getChessSchoolPayPublic } from './_lib/chessSchoolPaymentService.js';
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

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return Response.json(body, { status, headers });
}

function serviceClient() {
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  return Response.json({ ok: true, route: 'chess-school-pay' }, { headers: corsHeaders(request) });
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'chess-school-pay');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 20 });
  if (!secGuard.allowed) return secGuard.response;

  const db = serviceClient();
  if (!db) return json({ ok: false, error: 'server_misconfigured' }, 503, headers);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400, headers);
  }

  const action = String(body.action || '').trim();

  if (action === 'get_public') {
    const result = await getChessSchoolPayPublic(db, String(body.registrationId || ''));
    if (!result.ok) return json({ ok: false, error: result.error }, result.status, headers);
    return json(result, 200, headers);
  }

  if (action === 'activate_paid') {
    const result = await activateChessSchoolPaid(db, {
      registrationId: String(body.registrationId || ''),
      paymentId: String(body.paymentId || ''),
    });
    if (!result.ok) return json({ ok: false, error: result.error }, result.status, headers);
    return json(result, 200, headers);
  }

  return json({ ok: false, error: 'unknown_action' }, 400, headers);
}
