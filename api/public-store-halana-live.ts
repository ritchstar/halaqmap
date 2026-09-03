/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة حلانا1 ولوحتها. لا ميسر على طلب العميلة.
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
  addHalanaGallery,
  addHalanaRequest,
  findHalanaCopy,
  listHalanaGallery,
  listHalanaRequests,
  publicCopyPayload,
  removeHalanaGallery,
  saveHalanaHost,
  updateHalanaGalleryCaption,
  updateHalanaRequest,
} from './_lib/storeHalanaLive.js';

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
  const token = String(url.searchParams.get('token') || '').trim();
  const role = roleOf(url.searchParams.get('role'));
  if (token.length < 16) return json({ ok: false, error: 'رابط غير صالح.' }, 400, headers);
  const copy = await findHalanaCopy(db, token, role);
  if (!copy) return json({ ok: false, error: 'النسخة غير موجودة.' }, 404, headers);
  const requests = role === 'desk' ? await listHalanaRequests(db, String(copy.id)) : [];
  const gallery = await listHalanaGallery(db, String(copy.id));
  return json({ ok: true, payload: publicCopyPayload(copy, requests, gallery) }, 200, headers);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const guard = runRegistrationRouteGuards(request, 'public-store-halana-live');
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
    await recordHoneypotTrip(request, 'public-store-halana-live');
    return json({ ok: true }, 200, headers);
  }

  const token = String(body.token || '').trim();
  const action = String(body.action || '').trim();
  if (token.length < 16) return json({ ok: false, error: 'رابط غير صالح.' }, 400, headers);

  if (action === 'add_request') {
    const copy = await findHalanaCopy(db, token, 'shop');
    if (!copy) return json({ ok: false, error: 'النسخة غير موجودة.' }, 404, headers);
    const added = await addHalanaRequest(db, String(copy.id), body);
    if (!added.ok) return json(added, 400, headers);
    return json({ ok: true }, 200, headers);
  }

  const desk = await findHalanaCopy(db, token, 'desk');
  if (!desk) return json({ ok: false, error: 'لوحة غير صالحة.' }, 404, headers);

  if (action === 'save_host') {
    const saved = await saveHalanaHost(db, String(desk.id), body);
    if (!saved.ok) return json(saved, 400, headers);
    return json({ ok: true }, 200, headers);
  }

  if (action === 'update_request') {
    const updated = await updateHalanaRequest(db, String(desk.id), String(body.requestId || ''), body);
    if (!updated.ok) return json(updated, 400, headers);
    return json({ ok: true }, 200, headers);
  }

  if (action === 'add_gallery') {
    const added = await addHalanaGallery(db, String(desk.id), body);
    if (!added.ok) return json(added, 400, headers);
    return json({ ok: true }, 200, headers);
  }

  if (action === 'update_gallery') {
    const updated = await updateHalanaGalleryCaption(db, String(desk.id), String(body.imageId || ''), body.caption);
    if (!updated.ok) return json(updated, 400, headers);
    return json({ ok: true }, 200, headers);
  }

  if (action === 'remove_gallery') {
    const removed = await removeHalanaGallery(db, String(desk.id), String(body.imageId || ''));
    if (!removed.ok) return json(removed, 400, headers);
    return json({ ok: true }, 200, headers);
  }

  return json({ ok: false, error: 'إجراء غير معروف.' }, 400, headers);
}
