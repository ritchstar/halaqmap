/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دخول لوحة مشغّلي خريطة الحل. بلا شراء وبلا ميسر.
 */
import { createClient } from '@supabase/supabase-js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';
import { recordHoneypotTrip, runSecurityGuard } from './_lib/securityGuard.js';
import {
  consumeOperatorOtp,
  createOperatorSession,
  deleteOperatorSession,
  emailHasOperatorCopies,
  issueOperatorOtp,
  isOperatorEmail,
  isStoreOperatorReviewEmail,
  listOperatorTiles,
  matchesStoreOperatorReviewCode,
  normalizeOperatorEmail,
  readOperatorSession,
} from './_lib/storeOperatorsDesk.js';
import { sendStoreOperatorOtpEmail } from './_lib/storeOperatorsMail.js';

export const config = { maxDuration: 20 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

const SENT_AR = 'إن كان البريد معتمداً فسيصل الرمز خلال لحظات.';

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return Response.json(body, { status, headers });
}

function serviceClient() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}

function bearerToken(request: Request): string {
  return (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  return json({ ok: true, route: 'public-store-operators' }, 200, corsHeaders(request));
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const guard = runRegistrationRouteGuards(request, 'public-store-operators');
  if (guard.ok === false) return json(guard.json, guard.status, headers);
  const db = serviceClient();
  if (!db) return json({ ok: false, error: 'تعذر الاتصال.' }, 503, headers);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'تعذر قراءة الطلب.' }, 400, headers);
  }
  if (String(body.website ?? body.company_url_hp ?? '').trim()) {
    await recordHoneypotTrip(request, 'public-store-operators');
    return json({ ok: true }, 200, headers);
  }

  const action = String(body.action || '').trim();
  const secGuard = await runSecurityGuard(request, {
    sensitiveRoute: true,
    rateLimit: action === 'send_code' ? 8 : 20,
  });
  if (!secGuard.allowed) return secGuard.response;

  if (action === 'send_code') {
    const email = normalizeOperatorEmail(body.email);
    if (!isOperatorEmail(email)) return json({ ok: true, message: SENT_AR }, 200, headers);
    if (isStoreOperatorReviewEmail(email)) return json({ ok: true, message: SENT_AR }, 200, headers);
    const hasCopies = await emailHasOperatorCopies(db, email);
    if (!hasCopies) return json({ ok: true, message: SENT_AR }, 200, headers);
    const issued = await issueOperatorOtp(db, email);
    if (!issued.ok) {
      return json({ ok: true, message: SENT_AR }, 200, headers);
    }
    await sendStoreOperatorOtpEmail({ to: email, code: issued.code });
    return json({ ok: true, message: SENT_AR }, 200, headers);
  }

  if (action === 'verify_code') {
    const email = normalizeOperatorEmail(body.email);
    const code = String(body.code || '').replace(/\D/g, '').slice(0, 6);
    if (!isOperatorEmail(email) || code.length !== 6) {
      return json({ ok: false, error: 'الرمز غير صالح.' }, 400, headers);
    }
    const consumed = matchesStoreOperatorReviewCode(email, code)
      ? ({ ok: true } as const)
      : await consumeOperatorOtp(db, email, code);
    if (!consumed.ok) {
      return json(
        { ok: false, error: consumed.reason === 'locked' ? 'تجاوزت المحاولات. اطلب رمزاً جديداً.' : 'الرمز غير صالح.' },
        400,
        headers,
      );
    }
    const sessionToken = await createOperatorSession(db, email);
    if (!sessionToken) return json({ ok: false, error: 'تعذر فتح الجلسة.' }, 500, headers);
    const tiles = await listOperatorTiles(db, email);
    return json({ ok: true, sessionToken, tiles }, 200, headers);
  }

  if (action === 'me') {
    const email = await readOperatorSession(db, bearerToken(request));
    if (!email) return json({ ok: false, error: 'انتهت الجلسة. أدخل البريد من جديد.' }, 401, headers);
    const tiles = await listOperatorTiles(db, email);
    return json({ ok: true, tiles }, 200, headers);
  }

  if (action === 'logout') {
    await deleteOperatorSession(db, bearerToken(request));
    return json({ ok: true }, 200, headers);
  }

  return json({ ok: false, error: 'إجراء غير معروف.' }, 400, headers);
}
