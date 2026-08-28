/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قائمة مشاركات هدايا المتجر للإدارة. لا وصول عام.
 */
import { createClient } from '@supabase/supabase-js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { giftConfirmUrl, prepareGiftConfirmResend } from './_lib/storeGiftCampaign.js';
import { sendGiftConfirmEmail } from './_lib/storeGiftMail.js';
import { kitchenGiftConfirmUrl, prepareKitchenGiftConfirmResend } from './_lib/storeKitchenGiftCampaign.js';
import { sendKitchenGiftConfirmEmail } from './_lib/storeKitchenGiftMail.js';
import { listStoreGiftRoster } from './_lib/storeGiftRoster.js';

export const config = { maxDuration: 30 };

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
  try {
    const rows = await listStoreGiftRoster(gate.db);
    const pending = rows.filter((row) => row.mailState === 'pending').length;
    const active = rows.filter((row) => row.mailState === 'active').length;
    const expiredLink = rows.filter((row) => row.mailState === 'expired_link').length;
    return json({ ok: true, rows, counts: { total: rows.length, pending, active, expiredLink } }, 200, headers);
  } catch {
    return json({ ok: false, error: 'تعذر قراءة القائمة.' }, 500, headers);
  }
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
  if (String(body.action || '') !== 'resend') {
    return json({ ok: false, error: 'إجراء غير معروف.' }, 400, headers);
  }
  const campaign = String(body.campaign || '').trim();
  const entryId = String(body.entryId || '').trim();
  if (campaign === 'occasion') {
    const prepared = await prepareGiftConfirmResend(gate.db, entryId);
    if (!prepared.ok) return json(prepared, 400, headers);
    const mailed = await sendGiftConfirmEmail({
      to: prepared.email,
      confirmUrl: giftConfirmUrl(prepared.confirmToken),
    });
    if (!mailed) return json({ ok: false, error: 'تعذر إرسال رسالة التأكيد.' }, 503, headers);
    return json({ ok: true }, 200, headers);
  }
  if (campaign === 'kitchen') {
    const prepared = await prepareKitchenGiftConfirmResend(gate.db, entryId);
    if (!prepared.ok) return json(prepared, 400, headers);
    const mailed = await sendKitchenGiftConfirmEmail({
      to: prepared.email,
      confirmUrl: kitchenGiftConfirmUrl(prepared.confirmToken),
    });
    if (!mailed) return json({ ok: false, error: 'تعذر إرسال رسالة التأكيد.' }, 503, headers);
    return json({ ok: true }, 200, headers);
  }
  return json({ ok: false, error: 'الحملة غير معروفة.' }, 400, headers);
}
