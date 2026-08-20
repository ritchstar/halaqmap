/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { createClient } from '@supabase/supabase-js';
import { randomInt } from 'node:crypto';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { runSecurityGuard } from './_lib/securityGuard.js';
import { fetchMoyasarPayment, moyasarPaymentIsPaid, resolveOccasionCardMoyasarSecretKey } from './_lib/moyasarApiClient.js';
import {
  hashSecret,
  hashesMatch,
  isOccasionCardCheckoutEnabled,
  maskPhoneLast4,
  newAdminToken,
  newPublicToken,
  occasionCardPaymentMatches,
  parseBereavementBody,
  parsePaidInviteBody,
  publicBereavementView,
  publicPaidView,
  STORE_ISSUED_CARD_OTP_TABLE,
  STORE_ISSUED_CARDS_TABLE,
  type BereavementPayload,
  type PaidInvitePayload,
} from './_lib/storeIssuedCards.js';
import { sendStoreIssuedWhatsApp } from './_lib/storeIssuedWhatsApp.js';
import { normalizeSaudiMobileForWa } from './_lib/saudiWhatsAppPhone.js';

export const config = { maxDuration: 20 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-client-supabase-url, x-supabase-anon',
} as const;

const POLICY_VERSION = '2026-08-20';
const OTP_TTL_MS = 10 * 60 * 1000;
const BEREAVEMENT_TTL_MS = 14 * 24 * 60 * 60 * 1000;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function pepper(): string {
  return (
    (process.env.STORE_ISSUED_CARDS_PEPPER || '').trim() ||
    (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim().slice(0, 48) ||
    'halaqmap-issued-cards'
  );
}

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return Response.json(body, { status, headers });
}

function publicOrigin(): string {
  return 'https://store.halaqmap.com';
}

function publicNoticeUrl(token: string): string {
  return `${publicOrigin()}/#/n/${token}`;
}

function manageNoticeUrl(token: string, admin: string): string {
  return `${publicOrigin()}/#/n/${token}/manage?k=${encodeURIComponent(admin)}`;
}

function inviteViewUrl(token: string): string {
  return `${publicOrigin()}/#/store/invites/v/${token}`;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const url = new URL(request.url);
  const token = String(url.searchParams.get('token') || '').trim();
  if (!token) {
    return json(
      { ok: true, route: 'public-store-issued-cards', publicApiGuard: registrationGuardDiagnostics() },
      200,
      headers,
    );
  }
  const db = serviceClient();
  if (!db) return json({ error: 'Server not configured' }, 503, headers);
  return readPublic(db, token, headers);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'public-store-issued-cards');
  if (guard.ok === false) return json(guard.json, guard.status, headers);

  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 8 });
  if (!secGuard.allowed) return secGuard.response;

  const db = serviceClient();
  if (!db) return json({ error: 'Server not configured' }, 503, headers);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, headers);
  }

  const action = String(body.action || '').trim();
  if (action === 'send_otp') return sendOtp(db, body, headers);
  if (action === 'publish_bereavement') return publishBereavement(db, body, headers);
  if (action === 'update_bereavement') return updateBereavement(db, body, headers);
  if (action === 'revoke') return revokeCard(db, body, headers);
  if (action === 'report') return reportCard(db, body, headers);
  if (action === 'create_paid_pending') return createPaidPending(db, body, headers);
  if (action === 'activate_paid') return activatePaid(db, body, headers);
  if (action === 'get_public') {
    const token = String(body.token || '').trim();
    if (!token) return json({ error: 'الرابط غير صالح' }, 400, headers);
    return readPublic(db, token, headers);
  }
  return json({ error: 'إجراء غير معروف' }, 400, headers);
}

function serviceClient() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}

type Db = NonNullable<ReturnType<typeof serviceClient>>;

async function sendOtp(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const phone = normalizeSaudiMobileForWa(String(body.phone || ''));
  if (!phone) return json({ error: 'رقم الجوال غير صالح' }, 400, headers);
  return dispatchOtp(db, phone, headers);
}

async function dispatchOtp(db: Db, phone966: string, headers: Record<string, string>) {
  const code = String(randomInt(100000, 1000000));
  const phoneHash = hashSecret(phone966, pepper());
  const { error: insErr } = await db.from(STORE_ISSUED_CARD_OTP_TABLE).insert({
    phone_hash: phoneHash,
    code_hash: hashSecret(code, pepper()),
    purpose: 'bereavement_publish',
    expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
  });
  if (insErr) return json({ error: 'تعذر إنشاء رمز التحقق' }, 500, headers);

  const sent = await sendStoreIssuedWhatsApp(
    `+${phone966}`,
    `رمز التحقق لبلاغ الوفاة في خريطة الحل: ${code}\nلا تشارك الرمز. صالح لعشر دقائق.`,
  );
  if (!sent.ok) return json({ error: sent.error }, 503, headers);
  return json({ ok: true, masked: maskPhoneLast4(phone966) }, 200, headers);
}

async function consumeOtp(db: Db, phone966: string, code: string): Promise<boolean> {
  const phoneHash = hashSecret(phone966, pepper());
  const { data } = await db
    .from(STORE_ISSUED_CARD_OTP_TABLE)
    .select('id, code_hash, attempts, expires_at, consumed_at')
    .eq('phone_hash', phoneHash)
    .eq('purpose', 'bereavement_publish')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data || data.consumed_at) return false;
  if (new Date(String(data.expires_at)).getTime() < Date.now()) return false;
  if (Number(data.attempts) >= 5) return false;
  const ok = hashesMatch(String(data.code_hash), hashSecret(String(code || '').trim(), pepper()));
  await db
    .from(STORE_ISSUED_CARD_OTP_TABLE)
    .update({
      attempts: Number(data.attempts) + 1,
      consumed_at: ok ? new Date().toISOString() : null,
    })
    .eq('id', data.id);
  return ok;
}

async function publishBereavement(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  if (body.attestation !== true) {
    return json({ error: 'الإقرار إلزامي قبل النشر' }, 400, headers);
  }
  const parsed = parseBereavementBody(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400, headers);
  const otpOk = await consumeOtp(db, parsed.phone966, String(body.otp || ''));
  if (!otpOk) return json({ error: 'رمز التحقق غير صحيح أو منتهٍ' }, 403, headers);

  const publicToken = newPublicToken();
  const adminToken = newAdminToken();
  const now = new Date();
  const { error } = await db.from(STORE_ISSUED_CARDS_TABLE).insert({
    kind: 'bereavement',
    status: 'live',
    public_token: publicToken,
    admin_token_hash: hashSecret(adminToken, pepper()),
    publisher_phone_hash: hashSecret(parsed.phone966, pepper()),
    publisher_phone_last4: maskPhoneLast4(parsed.phone966),
    payload: parsed.payload,
    attestor_name: parsed.attestorName,
    attestor_role: parsed.attestorRole,
    policy_version: POLICY_VERSION,
    expires_at: new Date(now.getTime() + BEREAVEMENT_TTL_MS).toISOString(),
    last_public_change_at: now.toISOString(),
  });
  if (error) return json({ error: 'تعذر حفظ البلاغ' }, 500, headers);

  const share = publicNoticeUrl(publicToken);
  const manage = manageNoticeUrl(publicToken, adminToken);
  await sendStoreIssuedWhatsApp(
    `+${parsed.phone966}`,
    `رابط البلاغ للمشاركة:\n${share}\n\nرابط الإدارة — لا تشاركه:\n${manage}`,
  );
  return json({ ok: true, token: publicToken, url: share }, 200, headers);
}

async function requireAdminRow(db: Db, token: string, adminKey: string) {
  const { data } = await db
    .from(STORE_ISSUED_CARDS_TABLE)
    .select('id, kind, status, admin_token_hash, payload, expires_at, last_public_change_at, public_token')
    .eq('public_token', token)
    .maybeSingle();
  if (!data) return null;
  if (!hashesMatch(String(data.admin_token_hash), hashSecret(adminKey, pepper()))) return null;
  return data;
}

async function updateBereavement(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  const adminKey = String(body.adminKey || '').trim();
  const row = await requireAdminRow(db, token, adminKey);
  if (!row || row.kind !== 'bereavement') return json({ error: 'رابط الإدارة غير صالح' }, 403, headers);
  if (row.status === 'revoked') return json({ error: 'البلاغ موقف' }, 409, headers);

  const parsed = parseBereavementBody(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400, headers);

  const { error } = await db
    .from(STORE_ISSUED_CARDS_TABLE)
    .update({
      payload: parsed.payload,
      last_public_change_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'live',
    })
    .eq('id', row.id);
  if (error) return json({ error: 'تعذر التحديث' }, 500, headers);
  return json({ ok: true, token, url: publicNoticeUrl(token) }, 200, headers);
}

async function revokeCard(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  const adminKey = String(body.adminKey || '').trim();
  const row = await requireAdminRow(db, token, adminKey);
  if (!row) return json({ error: 'رابط الإدارة غير صالح' }, 403, headers);
  const { error } = await db
    .from(STORE_ISSUED_CARDS_TABLE)
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', row.id);
  if (error) return json({ error: 'تعذر الإيقاف' }, 500, headers);
  return json({ ok: true }, 200, headers);
}

async function reportCard(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  const note = String(body.note || '').trim().slice(0, 400);
  if (!token || note.length < 8) return json({ error: 'اكتب سبب البلاغ' }, 400, headers);
  const { data } = await db
    .from(STORE_ISSUED_CARDS_TABLE)
    .select('id, payload')
    .eq('public_token', token)
    .maybeSingle();
  if (!data) return json({ error: 'البلاغ غير موجود' }, 404, headers);
  const payload = (data.payload || {}) as Record<string, unknown>;
  await db
    .from(STORE_ISSUED_CARDS_TABLE)
    .update({
      payload: { ...payload, last_report: { note, at: new Date().toISOString() } },
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.id);
  return json({ ok: true }, 200, headers);
}

async function createPaidPending(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  if (!isOccasionCardCheckoutEnabled()) {
    return json(
      { error: 'تحصيل بطاقة المناسبة مغلق حالياً.' },
      503,
      headers,
    );
  }
  const parsed = parsePaidInviteBody(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400, headers);
  const publicToken = newPublicToken();
  const adminToken = newAdminToken();
  const { error } = await db.from(STORE_ISSUED_CARDS_TABLE).insert({
    kind: 'paid_invite',
    status: 'pending_payment',
    public_token: publicToken,
    admin_token_hash: hashSecret(adminToken, pepper()),
    template_id: parsed.templateId,
    price_halalas: parsed.priceHalalas,
    payload: parsed.payload,
    policy_version: POLICY_VERSION,
  });
  if (error) return json({ error: 'تعذر إنشاء طلب النشر' }, 500, headers);
  return json(
    {
      ok: true,
      token: publicToken,
      adminKey: adminToken,
      priceHalalas: parsed.priceHalalas,
      payPath: `/pay/occasion-card/${publicToken}`,
    },
    200,
    headers,
  );
}

async function activatePaid(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  if (!isOccasionCardCheckoutEnabled()) {
    return json(
      { error: 'تحصيل بطاقة المناسبة مغلق حالياً.' },
      503,
      headers,
    );
  }
  const token = String(body.token || '').trim();
  const paymentId = String(body.paymentId || '').trim();
  if (!token || !paymentId) return json({ error: 'مرجع الدفع ناقص' }, 400, headers);

  const { data } = await db
    .from(STORE_ISSUED_CARDS_TABLE)
    .select('id, status, price_halalas, kind')
    .eq('public_token', token)
    .maybeSingle();
  if (!data || data.kind !== 'paid_invite') return json({ error: 'البطاقة غير موجودة' }, 404, headers);
  if (data.status === 'live') return json({ ok: true, token, url: inviteViewUrl(token) }, 200, headers);

  const { data: reused } = await db
    .from(STORE_ISSUED_CARDS_TABLE)
    .select('id')
    .eq('moyasar_payment_id', paymentId)
    .maybeSingle();
  if (reused && reused.id !== data.id) {
    return json({ error: 'مرجع الدفع مستخدم لبطاقة أخرى' }, 409, headers);
  }

  const secret = resolveOccasionCardMoyasarSecretKey();
  if (!secret) return json({ error: 'بوابة الدفع غير مهيأة لهذه البطاقة' }, 503, headers);
  const upstream = await fetchMoyasarPayment(paymentId, secret);
  if (upstream.status >= 400) return json({ error: 'تعذر التحقق من الدفع' }, 502, headers);
  let parsed: { status?: string; amount?: number; metadata?: Record<string, unknown> };
  try {
    parsed = JSON.parse(upstream.text) as typeof parsed;
  } catch {
    return json({ error: 'تعذر قراءة نتيجة الدفع' }, 502, headers);
  }
  if (!moyasarPaymentIsPaid(String(parsed.status || ''))) {
    return json({ error: 'الدفع لم يكتمل' }, 402, headers);
  }
  if (Number(parsed.amount) !== Number(data.price_halalas)) {
    return json({ error: 'مبلغ الدفع لا يطابق البطاقة' }, 409, headers);
  }
  if (
    !occasionCardPaymentMatches({
      meta: parsed.metadata,
      token,
      amount: Number(parsed.amount),
    })
  ) {
    return json({ error: 'وسم الدفع لا يطابق بطاقة المناسبة' }, 409, headers);
  }

  const { data: updated, error } = await db
    .from(STORE_ISSUED_CARDS_TABLE)
    .update({
      status: 'live',
      moyasar_payment_id: paymentId,
      last_public_change_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.id)
    .eq('status', 'pending_payment')
    .select('id')
    .maybeSingle();
  if (error) return json({ error: 'تعذر تفعيل البطاقة' }, 500, headers);
  if (!updated) {
    const { data: again } = await db
      .from(STORE_ISSUED_CARDS_TABLE)
      .select('status')
      .eq('id', data.id)
      .maybeSingle();
    if (again?.status === 'live') {
      return json({ ok: true, token, url: inviteViewUrl(token) }, 200, headers);
    }
    return json({ error: 'تعذر تفعيل البطاقة' }, 409, headers);
  }
  return json({ ok: true, token, url: inviteViewUrl(token) }, 200, headers);
}

async function readPublic(db: Db, token: string, headers: Record<string, string>) {
  const { data } = await db
    .from(STORE_ISSUED_CARDS_TABLE)
    .select('kind, status, template_id, price_halalas, payload, expires_at, last_public_change_at, revoked_at')
    .eq('public_token', token)
    .maybeSingle();
  if (!data) return json({ error: 'الرابط غير موجود' }, 404, headers);

  if (data.status === 'revoked') {
    return json({ ok: true, kind: data.kind, status: 'revoked' }, 200, headers);
  }

  const expired =
    data.status === 'expired' ||
    (data.expires_at && new Date(String(data.expires_at)).getTime() < Date.now());
  if (data.kind === 'bereavement' && expired) {
    return json({ ok: true, kind: 'bereavement', status: 'expired' }, 200, headers);
  }

  if (data.kind === 'paid_invite' && data.status !== 'live') {
    return json(
      {
        ok: true,
        kind: 'paid_invite',
        status: data.status,
        priceHalalas: Number(data.price_halalas || 0),
        templateId: String(data.template_id || ''),
      },
      200,
      headers,
    );
  }

  if (data.kind === 'bereavement') {
    return json(
      {
        ok: true,
        kind: 'bereavement',
        status: 'live',
        card: publicBereavementView(data.payload as BereavementPayload, data.last_public_change_at),
      },
      200,
      headers,
    );
  }

  return json(
    {
      ok: true,
      kind: 'paid_invite',
      status: 'live',
      card: publicPaidView(
        data.payload as PaidInvitePayload,
        String(data.template_id || ''),
        Number(data.price_halalas || 0),
      ),
    },
    200,
    headers,
  );
}
