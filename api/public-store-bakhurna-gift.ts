/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مشاركة هدية بخورنا1 وتأكيد البريد. مستقلة عن هدية المناسبات وعن هدية طبختنا1.
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
  confirmBakhurnaGiftEntry,
  enterBakhurnaGiftCampaign,
  bakhurnaGiftConfirmUrl,
  publicBakhurnaGiftState,
} from './_lib/storeBakhurnaGiftCampaign.js';
import { sendBakhurnaGiftConfirmEmail } from './_lib/storeBakhurnaGiftMail.js';

export const config = { maxDuration: 30 };

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
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
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
  const headers = corsHeaders(request);
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: false, rateLimit: 40 });
  if (!secGuard.allowed) return secGuard.response;
  const db = serviceClient();
  if (!db) return json({ ok: false, error: 'تعذر الاتصال.' }, 503, headers);
  const token = new URL(request.url).searchParams.get('t') || '';
  if (token) {
    const confirmed = await confirmBakhurnaGiftEntry(db, token);
    if (!confirmed.ok) return json(confirmed, 400, headers);
    return json({ ok: true, confirmed: true }, 200, headers);
  }
  const state = await publicBakhurnaGiftState(db);
  return json({ ok: true, ...state }, 200, headers);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const guard = runRegistrationRouteGuards(request, 'public-store-bakhurna-gift');
  if (guard.ok === false) return json(guard.json, guard.status, headers);
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 6 });
  if (!secGuard.allowed) return secGuard.response;
  const db = serviceClient();
  if (!db) return json({ ok: false, error: 'تعذر الاتصال.' }, 503, headers);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'تعذر قراءة الطلب.' }, 400, headers);
  }
  if (String(body.website ?? body.company_url_hp ?? '').trim()) {
    await recordHoneypotTrip(request, 'public-store-bakhurna-gift');
    return json({ ok: true }, 200, headers);
  }
  const action = String(body.action || 'enter').trim();
  if (action === 'confirm') {
    const confirmed = await confirmBakhurnaGiftEntry(db, String(body.token || ''));
    if (!confirmed.ok) return json(confirmed, 400, headers);
    return json({ ok: true, confirmed: true }, 200, headers);
  }
  const entered = await enterBakhurnaGiftCampaign(db, {
    givenName: body.givenName,
    email: body.email,
    city: body.city,
    source: body.source,
    opinionBefore: body.opinionBefore,
    opinionAfter: body.opinionAfter,
    acceptedTerms: body.acceptedTerms,
  });
  if (!entered.ok) return json(entered, 400, headers);
  const mailed = await sendBakhurnaGiftConfirmEmail({
    to: String(body.email || '').trim().toLowerCase(),
    confirmUrl: bakhurnaGiftConfirmUrl(entered.confirmToken),
  });
  if (!mailed) {
    return json({ ok: false, error: 'تعذر إرسال رسالة التأكيد. أعد الإرسال من النموذج.' }, 503, headers);
  }
  return json({ ok: true }, 200, headers);
}
