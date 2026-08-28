/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تقييمات واجهة المتجر: إرسال وقائمة ظاهرة. لا وصول لجدول الإدارة.
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
  parseStoreReviewBody,
  publicReviewFromRow,
  STORE_REVIEWS_TABLE,
} from './_lib/storeReviews.js';

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
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}

function tableMissing(error: { message?: string } | null | undefined): boolean {
  const msg = String(error?.message || '').toLowerCase();
  return msg.includes('does not exist') || msg.includes('schema cache');
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
  const { data, error } = await db
    .from(STORE_REVIEWS_TABLE)
    .select('id, stars, comment, display_name, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(80);
  if (error) {
    if (tableMissing(error)) return json({ ok: true, rows: [] }, 200, headers);
    return json({ ok: false, error: 'تعذر قراءة التقييمات.' }, 500, headers);
  }
  return json({ ok: true, rows: (data || []).map(publicReviewFromRow) }, 200, headers);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const guard = runRegistrationRouteGuards(request, 'public-store-reviews');
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
    await recordHoneypotTrip(request, 'public-store-reviews');
    return json({ ok: true }, 200, headers);
  }
  const parsed = parseStoreReviewBody(body);
  if (!parsed.ok) return json(parsed, 400, headers);
  const { error } = await db.from(STORE_REVIEWS_TABLE).insert({
    stars: parsed.stars,
    comment: parsed.comment,
    display_name: parsed.displayName,
    status: 'published',
  });
  if (error) {
    if (tableMissing(error)) return json({ ok: false, error: 'التقييمات غير جاهزة بعد.' }, 503, headers);
    return json({ ok: false, error: 'تعذر حفظ التقييم.' }, 500, headers);
  }
  return json({ ok: true }, 200, headers);
}
