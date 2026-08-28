/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قائمة تقييمات المتجر للإدارة. مؤشر غير المقروء.
 */
import { createClient } from '@supabase/supabase-js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { adminReviewFromRow, STORE_REVIEWS_TABLE } from './_lib/storeReviews.js';

export const config = { maxDuration: 20 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

const ADMIN_PERMS = ['view_overview', 'view_payments', 'manage_partner_marketing'] as const;

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

async function authorize(request: Request, headers: Record<string, string>) {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) return { ok: false as const, response: json({ ok: false, error: 'تعذر الاتصال.' }, 503, headers) };
  const auth = await verifyPlatformAdminFromRequestAny(request, url, serviceRole, [...ADMIN_PERMS]);
  if (!auth.ok) {
    return { ok: false as const, response: json({ ok: false, error: 'غير مصرّح.' }, auth.status || 401, headers) };
  }
  const db = serviceClient();
  if (!db) return { ok: false as const, response: json({ ok: false, error: 'تعذر الاتصال.' }, 503, headers) };
  return { ok: true as const, db };
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const gate = await authorize(request, headers);
  if (!gate.ok) return gate.response;
  const countsOnly = new URL(request.url).searchParams.get('counts') === '1';
  const { data, error } = await gate.db
    .from(STORE_REVIEWS_TABLE)
    .select('id, stars, comment, display_name, status, admin_seen_at, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) {
    if (tableMissing(error)) return json({ ok: true, rows: [], counts: { total: 0, unseen: 0 } }, 200, headers);
    return json({ ok: false, error: 'تعذر قراءة التقييمات.' }, 500, headers);
  }
  const rows = (data || []).map(adminReviewFromRow);
  const unseen = rows.filter((row) => row.unseen).length;
  const counts = { total: rows.length, unseen };
  if (!countsOnly) {
    await gate.db
      .from(STORE_REVIEWS_TABLE)
      .update({ admin_seen_at: new Date().toISOString() })
      .is('admin_seen_at', null);
  }
  return json({ ok: true, rows: countsOnly ? [] : rows, counts }, 200, headers);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const gate = await authorize(request, headers);
  if (!gate.ok) return gate.response;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'تعذر قراءة الطلب.' }, 400, headers);
  }
  const id = String(body.id || '').trim();
  const action = String(body.action || '').trim();
  if (!id || (action !== 'hide' && action !== 'show')) {
    return json({ ok: false, error: 'إجراء غير معروف.' }, 400, headers);
  }
  const { error } = await gate.db
    .from(STORE_REVIEWS_TABLE)
    .update({ status: action === 'hide' ? 'hidden' : 'published' })
    .eq('id', id);
  if (error) return json({ ok: false, error: 'تعذر تحديث التقييم.' }, 500, headers);
  return json({ ok: true }, 200, headers);
}
