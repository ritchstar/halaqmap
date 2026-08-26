/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة المتجر المستقلة: إصدار تجارب ومراجعة طلبات المسوّقين.
 */
import { createClient } from '@supabase/supabase-js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import {
  findBlockingTrial,
  isStoreProductTrialKey,
  issueStoreProductTrial,
  normalizeTrialEmail,
  STORE_PRODUCT_TRIAL_TABLE,
} from './_lib/storeProductTrial.js';

export const config = { maxDuration: 30 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

const ADMIN_PERMS = ['review_payments', 'manage_partner_billing', 'manage_partner_marketing'] as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
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
  const db = serviceClient();
  if (!db) return Response.json({ error: 'server_misconfigured' }, { status: 503, headers });

  const serverUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [...ADMIN_PERMS]);
  if (auth.ok === false) {
    return Response.json(auth.json, { status: auth.status, headers });
  }

  const status = new URL(request.url).searchParams.get('status')?.trim() || '';
  let query = db.from(STORE_PRODUCT_TRIAL_TABLE).select('*').order('updated_at', { ascending: false }).limit(120);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) {
    return Response.json({ ok: false, error: 'تعذر قراءة طلبات التجربة.' }, { status: 500, headers });
  }
  return Response.json({ ok: true, rows: data || [] }, { headers });
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const db = serviceClient();
  if (!db) return Response.json({ error: 'server_misconfigured' }, { status: 503, headers });

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

  const action = String(body.action || '').trim();
  const reviewer = String(auth.actorEmail || '').trim();

  if (action === 'issue') {
    const productKey = body.productKey;
    if (!isStoreProductTrialKey(productKey)) {
      return Response.json({ ok: false, error: 'حدّد المنتج.' }, { status: 400, headers });
    }
    const email = normalizeTrialEmail(body.email);
    const result = await issueStoreProductTrial(db, {
      productKey,
      email,
      issuerKind: 'admin',
      issuedByLabel: 'الإدارة',
      reviewer,
    });
    if (!result.ok) return Response.json({ ok: false, error: result.error }, { status: 400, headers });
    return Response.json({ ok: true, trialId: result.trialId }, { headers });
  }

  const id = String(body.trialId || body.id || '').trim();
  if (!id) return Response.json({ ok: false, error: 'معرّف الطلب ناقص.' }, { status: 400, headers });

  const { data: existing } = await db.from(STORE_PRODUCT_TRIAL_TABLE).select('*').eq('id', id).maybeSingle();
  if (!existing) return Response.json({ ok: false, error: 'الطلب غير موجود.' }, { status: 404, headers });
  if (String(existing.status) !== 'pending_review') {
    return Response.json({ ok: false, error: 'الطلب ليس قيد التشاور.' }, { status: 409, headers });
  }

  if (action === 'decline') {
    const note = String(body.reason || '').replace(/\s+/g, ' ').trim().slice(0, 400);
    if (note.length < 4) {
      return Response.json({ ok: false, error: 'اكتب سبب الاعتذار.' }, { status: 400, headers });
    }
    const now = new Date().toISOString();
    const { error } = await db
      .from(STORE_PRODUCT_TRIAL_TABLE)
      .update({
        status: 'declined',
        review_note: note,
        reviewed_by: reviewer,
        reviewed_at: now,
        updated_at: now,
      })
      .eq('id', id);
    if (error) return Response.json({ ok: false, error: 'تعذر الاعتذار.' }, { status: 500, headers });
    return Response.json({ ok: true }, { headers });
  }

  if (action === 'approve') {
    const productKey = existing.product_key;
    if (!isStoreProductTrialKey(productKey)) {
      return Response.json({ ok: false, error: 'منتج غير صالح.' }, { status: 400, headers });
    }
    const blocking = await findBlockingTrial(db, productKey, String(existing.beneficiary_email));
    if (blocking && blocking.id !== id) {
      return Response.json({ ok: false, error: 'هذا الإيميل مرتبط بنموذج لنفس المنتج.' }, { status: 409, headers });
    }
    const result = await issueStoreProductTrial(db, {
      productKey,
      email: String(existing.beneficiary_email),
      issuerKind: String(existing.issuer_kind) === 'marketer' ? 'marketer' : 'admin',
      marketerId: existing.marketer_id ? String(existing.marketer_id) : null,
      issuedByLabel: String(existing.issued_by_label || 'مسوّق'),
      reviewer,
      existingTrialId: id,
    });
    if (!result.ok) return Response.json({ ok: false, error: result.error }, { status: 400, headers });
    return Response.json({ ok: true, trialId: result.trialId }, { headers });
  }

  return Response.json({ error: 'إجراء غير معروف' }, { status: 400, headers });
}
