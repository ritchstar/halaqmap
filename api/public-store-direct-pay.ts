/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * نظام موحّد لتمرير تعليمات الدفع. لا ميسر على سلة العميل.
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
  addDirectPayProof,
  findDirectPayCopy,
  getDirectPayInstructions,
  isDirectPayProduct,
  listDirectPayProofs,
  loadDirectPayProfile,
  publicDirectPayFromRow,
  deskDirectPayFromRow,
  saveDirectPayProfile,
} from './_lib/storeDirectPayService.js';

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

function roleOf(raw: unknown): 'shop' | 'desk' {
  return String(raw || '') === 'desk' ? 'desk' : 'shop';
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
  const url = new URL(request.url);
  const product = String(url.searchParams.get('product') || '').trim();
  const token = String(url.searchParams.get('token') || '').trim();
  const role = roleOf(url.searchParams.get('role'));
  const requestRef = String(url.searchParams.get('requestRef') || '').trim();
  if (!isDirectPayProduct(product) || token.length < 16) {
    return json({ ok: false, error: 'رابط غير صالح.' }, 400, headers);
  }
  const copy = await findDirectPayCopy(db, product, token, role);
  if (!copy) return json({ ok: false, error: 'النسخة غير موجودة.' }, 404, headers);
  if (role === 'shop') {
    const pay = await getDirectPayInstructions(db, product, String(copy.id), requestRef);
    if (!pay.ok) return json(pay, 400, headers);
    return json(pay, 200, headers);
  }
  const profile = await loadDirectPayProfile(db, product, String(copy.id));
  const proofs = await listDirectPayProofs(db, product, String(copy.id));
  return json(
    {
      ok: true,
      payDesk: deskDirectPayFromRow(profile || {}),
      payPublic: publicDirectPayFromRow(profile || {}),
      proofs,
    },
    200,
    headers,
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const guard = runRegistrationRouteGuards(request, 'public-store-direct-pay');
  if (guard.ok === false) return json(guard.json, guard.status, headers);
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 12 });
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
    await recordHoneypotTrip(request, 'public-store-direct-pay');
    return json({ ok: true }, 200, headers);
  }
  const product = String(body.product || '').trim();
  const token = String(body.token || '').trim();
  const action = String(body.action || '').trim();
  if (!isDirectPayProduct(product) || token.length < 16) {
    return json({ ok: false, error: 'رابط غير صالح.' }, 400, headers);
  }
  if (action === 'add_proof') {
    const copy = await findDirectPayCopy(db, product, token, 'shop');
    if (!copy) return json({ ok: false, error: 'النسخة غير موجودة.' }, 404, headers);
    const added = await addDirectPayProof(db, product, String(copy.id), String(body.requestRef || ''), body.imageSrc);
    if (!added.ok) return json(added, 400, headers);
    return json({ ok: true }, 200, headers);
  }
  if (action === 'save_pay') {
    const desk = await findDirectPayCopy(db, product, token, 'desk');
    if (!desk) return json({ ok: false, error: 'لوحة غير صالحة.' }, 404, headers);
    const saved = await saveDirectPayProfile(db, product, String(desk.id), body);
    if (!saved.ok) return json(saved, 400, headers);
    return json({ ok: true }, 200, headers);
  }
  return json({ ok: false, error: 'إجراء غير معروف.' }, 400, headers);
}
