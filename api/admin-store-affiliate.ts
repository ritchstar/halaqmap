/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مراجعة طلبات مسوّقي المتجر — أدمن.
 * GET قائمة | POST approve | decline | send_login
 */
import { createClient } from '@supabase/supabase-js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { issueStoreAffiliateMagic } from './_lib/storeAffiliateMagic.js';

export const config = { maxDuration: 30 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

const ADMIN_PERMS = ['review_payments', 'manage_partner_billing', 'manage_partner_marketing'] as const;

const LIST_COLS =
  'id, email, display_name, phone, city, channel_plan, experience, status, review_note, reviewed_at, reviewed_by, code, created_at, updated_at';

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function serviceClient() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}

function clip(raw: unknown, max: number): string {
  return String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const db = serviceClient();
  if (!db) {
    return Response.json({ error: 'server_misconfigured' }, { status: 503, headers });
  }

  const serverUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [...ADMIN_PERMS]);
  if (auth.ok === false) {
    return Response.json(auth.json, { status: auth.status, headers });
  }

  const status = new URL(request.url).searchParams.get('status')?.trim() || '';
  let query = db.from('store_affiliate_marketers').select(LIST_COLS).order('updated_at', { ascending: false }).limit(80);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) {
    return Response.json({ ok: false, error: 'تعذر قراءة الطلبات.' }, { status: 500, headers });
  }
  return Response.json({ ok: true, rows: data || [] }, { headers });
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const db = serviceClient();
  if (!db) {
    return Response.json({ error: 'server_misconfigured' }, { status: 503, headers });
  }

  const serverUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [...ADMIN_PERMS]);
  if (auth.ok === false) {
    return Response.json(auth.json, { status: auth.status, headers });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400, headers });
  }

  const action = String(body.action ?? '').trim();
  const id = String(body.applicationId ?? body.id ?? '').trim();
  if (!id) {
    return Response.json({ ok: false, error: 'missing_application_id' }, { status: 400, headers });
  }

  const { data: existing } = await db
    .from('store_affiliate_marketers')
    .select('id, status, email, code')
    .eq('id', id)
    .maybeSingle();
  if (!existing) {
    return Response.json({ ok: false, error: 'not_found' }, { status: 404, headers });
  }

  const now = new Date().toISOString();
  const reviewer = String(auth.actorEmail || '').trim();

  if (action === 'send_login') {
    if (String(existing.status) !== 'approved') {
      return Response.json({ ok: false, error: 'not_approved' }, { status: 409, headers });
    }
    const issued = await issueStoreAffiliateMagic({
      db,
      request,
      marketerId: String(existing.id),
      email: String(existing.email || '').trim().toLowerCase(),
      code: String(existing.code || ''),
      skipHourlyCap: true,
    });
    if (!issued.ok) {
      return Response.json({ ok: false, error: 'تعذر إنشاء رابط الدخول.' }, { status: 500, headers });
    }
    if (!issued.mailed) {
      return Response.json({ ok: false, error: 'تعذر إرسال البريد. أعد المحاولة.' }, { status: 502, headers });
    }
    return Response.json({ ok: true, mailed: true }, { headers });
  }

  if (String(existing.status) !== 'pending_review') {
    return Response.json({ ok: false, error: 'not_pending_review' }, { status: 409, headers });
  }

  if (action === 'approve') {
    const { data, error } = await db
      .from('store_affiliate_marketers')
      .update({
        status: 'approved',
        review_note: '',
        reviewed_at: now,
        reviewed_by: reviewer,
        updated_at: now,
      })
      .eq('id', id)
      .eq('status', 'pending_review')
      .select(LIST_COLS)
      .maybeSingle();
    if (error || !data) {
      return Response.json({ ok: false, error: 'تعذر اعتماد الطلب.' }, { status: 500, headers });
    }
    const issued = await issueStoreAffiliateMagic({
      db,
      request,
      marketerId: String(data.id),
      email: String(data.email || '').trim().toLowerCase(),
      code: String(data.code || ''),
      skipHourlyCap: true,
    });
    return Response.json({ ok: true, row: data, mailed: issued.ok && issued.mailed }, { headers });
  }

  if (action === 'decline') {
    const reason = clip(body.reason, 400);
    if (reason.length < 4) {
      return Response.json({ ok: false, error: 'reject_reason_required' }, { status: 400, headers });
    }
    const { data, error } = await db
      .from('store_affiliate_marketers')
      .update({
        status: 'declined',
        review_note: reason,
        reviewed_at: now,
        reviewed_by: reviewer,
        updated_at: now,
      })
      .eq('id', id)
      .eq('status', 'pending_review')
      .select(LIST_COLS)
      .maybeSingle();
    if (error || !data) {
      return Response.json({ ok: false, error: 'تعذر الاعتذار عن الطلب.' }, { status: 500, headers });
    }
    return Response.json({ ok: true, row: data }, { headers });
  }

  return Response.json({ ok: false, error: 'unknown_action' }, { status: 400, headers });
}
