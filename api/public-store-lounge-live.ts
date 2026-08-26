/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحصيل لاونجا1 — وسم store_lounge_live، باقات 3 و6 و12 شهراً.
 */
import { createClient } from '@supabase/supabase-js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { runSecurityGuard } from './_lib/securityGuard.js';
import {
  createMoyasarInvoice,
  fetchMoyasarInvoiceForOccasionCard,
  fetchMoyasarPaymentForOccasionCard,
  moyasarPaymentIsPaid,
  resolveOccasionCardMoyasarSecretKey,
} from './_lib/moyasarApiClient.js';
import { storeAffiliateCodeFromMeta } from './_lib/storeAffiliateCode.js';
import { creditStoreAffiliateLedger } from './_lib/storeAffiliateLedger.js';
import { isAllowedMoyasarInvoiceUrl } from './_lib/storeIssuedCards.js';
import {
  isLoungeLiveCheckoutEnabled,
  isLoungePriceHalalas,
  loungeChargeHalalas,
  loungeLiveInvoiceDescription,
  loungeLiveInvoiceMetadata,
  loungeLiveIsExpired,
  loungeLivePaymentMatches,
  loungeLiveTermEndIso,
  loungePackFromHalalas,
  newLoungeToken,
  parseLoungeEventId,
  parseLoungePackId,
  loungeBlessingDuplicate,
  loungeTextBlocked,
  parseLoungeLiveOrderBody,
  publicLoungePayload,
  STORE_LOUNGE_LIVE_POLICY,
  STORE_LOUNGE_LIVE_PRODUCT,
  STORE_LOUNGE_LIVE_TABLE,
  type LoungeLiveOrderPayload,
  type LoungeLivePackId,
} from './_lib/storeLoungeLive.js';
import { sendLoungeLiveLinksEmail } from './_lib/storeLoungeLiveMail.js';
import { applyStoreTrialClock, markStoreTrialConverted } from './_lib/storeProductTrial.js';

export const config = { maxDuration: 20 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-client-supabase-url, x-supabase-anon',
} as const;

type Db = NonNullable<ReturnType<typeof serviceClient>>;

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

function storeOrigin(): string {
  return 'https://store.halaqmap.com';
}

function payOrigin(request: Request): string {
  const host = (request.headers.get('host') || '').trim().toLowerCase();
  const proto = (request.headers.get('x-forwarded-proto') || 'https').split(',')[0]?.trim() || 'https';
  if (host.endsWith('.vercel.app')) return `${proto}://${host}`.replace(/\/+$/, '');
  return 'https://www.halaqmap.com';
}

function displayUrl(token: string): string {
  return `${storeOrigin()}/#/l/${encodeURIComponent(token)}`;
}
function guestUrl(token: string): string {
  return `${storeOrigin()}/#/l/${encodeURIComponent(token)}/guest`;
}
function hostUrl(token: string): string {
  return `${storeOrigin()}/#/l/${encodeURIComponent(token)}/host`;
}

function successUrl(token: string, request: Request): string {
  const q = new URLSearchParams();
  q.set('purpose', STORE_LOUNGE_LIVE_PRODUCT);
  q.set('store_lounge_token', token);
  return `${payOrigin(request)}/?${q.toString()}`;
}

function invoiceUrlFromPayload(payload: unknown): string {
  const raw = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const url = String(raw.moyasar_invoice_url || '').trim();
  return isAllowedMoyasarInvoiceUrl(url) ? url : '';
}

function invoiceIdFromPayload(payload: unknown): string {
  const raw = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  return String(raw.moyasar_invoice_id || '').trim();
}

type LoungeRow = {
  id: string;
  status: string;
  display_token: string;
  guest_token: string;
  host_token: string;
  buyer_email: string;
  price_halalas: number;
  moyasar_payment_id: string | null;
  moyasar_invoice_id: string | null;
  payload: LoungeLiveOrderPayload & Record<string, unknown>;
  expires_at: string | null;
};

function expiredPayload(row: LoungeRow) {
  return {
    ok: true,
    expired: true,
    renewToken: row.display_token,
    landingPath: `/store/lounge?renew=${encodeURIComponent(row.display_token)}`,
    loungeName: String(row.payload?.loungeName || ''),
    expiresAt: row.expires_at,
  };
}

function isTermExpired(row: Pick<LoungeRow, 'status' | 'expires_at'>): boolean {
  if (row.status === 'revoked') return true;
  if (row.status === 'expired' || row.status === 'pending_renewal') return true;
  if (row.status === 'live' && loungeLiveIsExpired(row.expires_at)) return true;
  return false;
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
  const role = String(url.searchParams.get('role') || 'display').trim();
  if (!token) {
    return json({ ok: true, route: 'public-store-lounge-live', product: STORE_LOUNGE_LIVE_PRODUCT }, 200, headers);
  }
  const db = serviceClient();
  if (!db) return json({ error: 'Server not configured' }, 503, headers);
  return readByRole(db, token, role, headers);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const guard = runRegistrationRouteGuards(request, 'public-store-lounge-live');
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
  if (action === 'create_pending') return createPending(db, body, headers, request);
  if (action === 'activate_paid') return activatePaid(db, body, headers);
  if (action === 'sync_paid') return syncPaid(db, body, headers);
  if (action === 'add_blessing') return addBlessing(db, body, headers);
  if (action === 'save_host') return saveHost(db, body, headers);
  if (action === 'get_public') {
    return readByRole(db, String(body.token || '').trim(), String(body.role || 'display'), headers);
  }
  return json({ error: 'إجراء غير معروف' }, 400, headers);
}

async function findByAnyToken(db: Db, token: string): Promise<LoungeRow | null> {
  for (const col of ['display_token', 'guest_token', 'host_token'] as const) {
    const { data } = await db.from(STORE_LOUNGE_LIVE_TABLE).select('*').eq(col, token).maybeSingle();
    if (data) return data as LoungeRow;
  }
  return null;
}

async function readByRole(db: Db, token: string, role: string, headers: Record<string, string>) {
  if (!token) return json({ error: 'الرابط غير صالح' }, 400, headers);
  const col =
    role === 'guest' ? 'guest_token' : role === 'host' ? 'host_token' : 'display_token';
  const { data } = await db.from(STORE_LOUNGE_LIVE_TABLE).select('*').eq(col, token).maybeSingle();
  if (!data) return json({ error: 'الرابط غير موجود' }, 404, headers);
  const row = data as LoungeRow;
  const payload = (row.payload || {}) as LoungeLiveOrderPayload;
  if (role === 'pay') {
    return json(
      {
        ok: true,
        status: row.status,
        priceHalalas: row.price_halalas,
        invoiceUrl: invoiceUrlFromPayload(row.payload),
        loungeName: payload.loungeName,
        expiresAt: row.expires_at,
      },
      200,
      headers,
    );
  }
  const clock = await applyStoreTrialClock(db, row, STORE_LOUNGE_LIVE_TABLE);
  if (clock.expired || isTermExpired(row)) {
    return json(expiredPayload(row), 200, headers);
  }
  if (row.status !== 'live') return json({ error: 'التشغيل لم يُفعَّل بعد' }, 403, headers);
  return json(
    {
      ok: true,
      status: row.status,
      role,
      payload: publicLoungePayload(payload, role === 'host' || role === 'guest' || role === 'display' ? role : 'display'),
      expiresAt: clock.expiresAt,
      isTrial: clock.isTrial,
      ...(role === 'display' ? { guestUrl: guestUrl(row.guest_token) } : {}),
      ...(role === 'host'
        ? {
            displayToken: row.display_token,
            guestToken: row.guest_token,
            hostToken: row.host_token,
            displayUrl: displayUrl(row.display_token),
            guestUrl: guestUrl(row.guest_token),
            hostUrl: hostUrl(row.host_token),
          }
        : {}),
    },
    200,
    headers,
  );
}

async function attachInvoice(
  db: Db,
  displayToken: string,
  payload: Record<string, unknown>,
  request: Request,
  kind: 'purchase' | 'renewal',
  affiliateCode: unknown,
  packId: LoungeLivePackId,
): Promise<string> {
  let invoiceUrl = '';
  const secret = resolveOccasionCardMoyasarSecretKey();
  if (!secret) return invoiceUrl;
  const created = await createMoyasarInvoice(secret, {
    amount: loungeChargeHalalas(packId),
    currency: 'SAR',
    description: loungeLiveInvoiceDescription(packId),
    success_url: successUrl(displayToken, request),
    back_url: `${storeOrigin()}/#/store/lounge`,
    callback_url: `${payOrigin(request)}/api/public-store-lounge-live`,
    expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    metadata: loungeLiveInvoiceMetadata(displayToken, kind, affiliateCode, packId),
  });
  if (created.status >= 400) return invoiceUrl;
  try {
    const inv = JSON.parse(created.text) as { id?: string; url?: string };
    const id = String(inv.id || '').trim();
    const url = String(inv.url || '').trim();
    if (id && isAllowedMoyasarInvoiceUrl(url)) {
      invoiceUrl = url;
      await db
        .from(STORE_LOUNGE_LIVE_TABLE)
        .update({
          moyasar_invoice_id: id,
          payload: { ...payload, moyasar_invoice_id: id, moyasar_invoice_url: url },
          updated_at: new Date().toISOString(),
        })
        .eq('display_token', displayToken);
    }
  } catch {
    invoiceUrl = '';
  }
  return invoiceUrl;
}

async function createPending(
  db: Db,
  body: Record<string, unknown>,
  headers: Record<string, string>,
  request: Request,
) {
  if (!isLoungeLiveCheckoutEnabled()) {
    return json({ error: 'تحصيل لاونجا1 مغلق حالياً.' }, 503, headers);
  }
  const renewToken = String(body.renewToken || '').trim();
  if (renewToken) {
    return createRenewal(db, body, headers, request);
  }
  const parsed = parseLoungeLiveOrderBody(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400, headers);
  const packId = parseLoungePackId(body.packId);
  const charge = loungeChargeHalalas(packId);
  const payload = { ...parsed.payload, packId };
  const displayToken = newLoungeToken();
  const guestToken = newLoungeToken();
  const hostToken = newLoungeToken();
  const { error } = await db.from(STORE_LOUNGE_LIVE_TABLE).insert({
    status: 'pending_payment',
    display_token: displayToken,
    guest_token: guestToken,
    host_token: hostToken,
    buyer_email: parsed.email,
    buyer_name: parsed.buyerName,
    price_halalas: charge,
    payload,
    policy_version: STORE_LOUNGE_LIVE_POLICY,
  });
  if (error) return json({ error: 'تعذر إنشاء طلب التشغيل' }, 500, headers);

  const invoiceUrl = await attachInvoice(
    db,
    displayToken,
    payload as unknown as Record<string, unknown>,
    request,
    'purchase',
    body.affiliateCode,
    packId,
  );

  return json(
    {
      ok: true,
      token: displayToken,
      guestToken,
      hostToken,
      priceHalalas: charge,
      payPath: `/pay/lounge/${displayToken}`,
      invoiceUrl,
      displayUrl: displayUrl(displayToken),
      guestUrl: guestUrl(guestToken),
      hostUrl: hostUrl(hostToken),
    },
    200,
    headers,
  );
}

async function createRenewal(
  db: Db,
  body: Record<string, unknown>,
  headers: Record<string, string>,
  request: Request,
) {
  const renewToken = String(body.renewToken || '').trim();
  const packId = parseLoungePackId(body.packId);
  const charge = loungeChargeHalalas(packId);
  const row = await findByAnyToken(db, renewToken);
  if (!row) return json({ error: 'الرابط غير موجود' }, 404, headers);
  if (row.status === 'revoked') return json({ error: 'هذا التشغيل ملغى' }, 403, headers);
  if (row.status === 'pending_payment') {
    return json(
      {
        ok: true,
        token: row.display_token,
        guestToken: row.guest_token,
        hostToken: row.host_token,
        priceHalalas: row.price_halalas,
        payPath: `/pay/lounge/${row.display_token}`,
        invoiceUrl: invoiceUrlFromPayload(row.payload),
        displayUrl: displayUrl(row.display_token),
        guestUrl: guestUrl(row.guest_token),
        hostUrl: hostUrl(row.host_token),
      },
      200,
      headers,
    );
  }
  if (row.status === 'live' && !loungeLiveIsExpired(row.expires_at)) {
    return json({ error: 'التشغيل ما زال سارياً. إعادة الشراء بعد انتهاء المدة.' }, 409, headers);
  }
  const payload = { ...(row.payload || {}), packId };
  await db
    .from(STORE_LOUNGE_LIVE_TABLE)
    .update({
      status: 'pending_renewal',
      price_halalas: charge,
      payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', row.id)
    .in('status', ['live', 'expired', 'pending_renewal']);
  const invoiceUrl = await attachInvoice(
    db,
    row.display_token,
    payload,
    request,
    'renewal',
    body.affiliateCode,
    packId,
  );
  return json(
    {
      ok: true,
      token: row.display_token,
      guestToken: row.guest_token,
      hostToken: row.host_token,
      renewed: true,
      priceHalalas: charge,
      payPath: `/pay/lounge/${row.display_token}`,
      invoiceUrl,
      displayUrl: displayUrl(row.display_token),
      guestUrl: guestUrl(row.guest_token),
      hostUrl: hostUrl(row.host_token),
    },
    200,
    headers,
  );
}

async function markLive(db: Db, id: string, paymentId: string, amount: number): Promise<boolean> {
  const { data: current } = await db
    .from(STORE_LOUNGE_LIVE_TABLE)
    .select('id, status, buyer_email, display_token, guest_token, host_token, payload, moyasar_payment_id, expires_at')
    .eq('id', id)
    .maybeSingle();
  if (!current) return false;
  if (
    current.status === 'live' &&
    String(current.moyasar_payment_id || '') === paymentId &&
    !loungeLiveIsExpired(current.expires_at)
  ) {
    return true;
  }
  const wasRenewal = current.status === 'pending_renewal' || current.status === 'expired' || current.status === 'live';
  const pack = loungePackFromHalalas(amount);
  const expiresAt = loungeLiveTermEndIso(pack.days);
  const payload: Record<string, unknown> = {
    ...((current.payload || {}) as Record<string, unknown>),
    packId: pack.id,
  };
  const history = Array.isArray(payload.paymentHistory) ? payload.paymentHistory : [];
  history.push({ id: paymentId, at: new Date().toISOString(), kind: wasRenewal ? 'renewal' : 'purchase' });
  payload.paymentHistory = history.slice(-12);
  const { data: updated, error } = await db
    .from(STORE_LOUNGE_LIVE_TABLE)
    .update({
      status: 'live',
      moyasar_payment_id: paymentId,
      expires_at: expiresAt,
      price_halalas: amount,
      is_trial: false,
      last_public_change_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      payload,
    })
    .eq('id', id)
    .in('status', ['pending_payment', 'pending_renewal', 'expired', 'live'])
    .select('id, buyer_email, display_token, guest_token, host_token, expires_at')
    .maybeSingle();
  if (error) return false;
  if (updated) {
    const exp = updated.expires_at ? String(updated.expires_at).slice(0, 10) : '';
    void sendLoungeLiveLinksEmail({
      to: String(updated.buyer_email),
      displayUrl: displayUrl(String(updated.display_token)),
      guestUrl: guestUrl(String(updated.guest_token)),
      hostUrl: hostUrl(String(updated.host_token)),
      expiresLabel: exp,
      renewed: wasRenewal,
    });
    void markStoreTrialConverted(db, String(updated.id));
    return true;
  }
  const { data: again } = await db.from(STORE_LOUNGE_LIVE_TABLE).select('status').eq('id', id).maybeSingle();
  return again?.status === 'live';
}

async function fulfillFromPaymentId(db: Db, token: string, paymentId: string, headers: Record<string, string>) {
  const { data } = await db.from(STORE_LOUNGE_LIVE_TABLE).select('*').eq('display_token', token).maybeSingle();
  if (!data) return json({ error: 'الطلب غير موجود' }, 404, headers);
  const row = data as LoungeRow;
  if (row.status === 'live' && !loungeLiveIsExpired(row.expires_at) && String(row.moyasar_payment_id || '') === paymentId) {
    return json({ ok: true, token, displayUrl: displayUrl(token) }, 200, headers);
  }
  const upstream = await fetchMoyasarPaymentForOccasionCard(paymentId);
  if (upstream.status >= 400) return json({ error: 'تعذر التحقق من الدفع' }, 502, headers);
  let parsed: { status?: string; amount?: number; metadata?: Record<string, unknown>; invoice_id?: string };
  try {
    parsed = JSON.parse(upstream.text) as typeof parsed;
  } catch {
    return json({ error: 'تعذر قراءة نتيجة الدفع' }, 502, headers);
  }
  if (!moyasarPaymentIsPaid(String(parsed.status || ''))) return json({ error: 'الدفع لم يكتمل' }, 402, headers);
  if (!isLoungePriceHalalas(Number(parsed.amount))) {
    return json({ error: 'مبلغ الدفع لا يطابق لاونجا1' }, 409, headers);
  }
  const metaOk = loungeLivePaymentMatches({ meta: parsed.metadata, token, amount: Number(parsed.amount) });
  if (!metaOk) {
    const invoiceId = invoiceIdFromPayload(row.payload) || String(parsed.invoice_id || '').trim();
    if (!invoiceId) return json({ error: 'وسم الدفع لا يطابق لاونجا1' }, 409, headers);
    const invoice = await fetchMoyasarInvoiceForOccasionCard(invoiceId);
    if (invoice.status >= 400) return json({ error: 'تعذر التحقق من الفاتورة' }, 502, headers);
    try {
      const inv = JSON.parse(invoice.text) as { amount?: number; metadata?: Record<string, unknown> };
      if (
        !loungeLivePaymentMatches({
          meta: inv.metadata,
          token,
          amount: Number(inv.amount),
        })
      ) {
        return json({ error: 'وسم الفاتورة لا يطابق لاونجا1' }, 409, headers);
      }
    } catch {
      return json({ error: 'تعذر قراءة الفاتورة' }, 502, headers);
    }
  }
  const ok = await markLive(db, String(row.id), paymentId, Number(parsed.amount));
  if (ok) {
    await creditStoreAffiliateLedger(db, {
      productTag: STORE_LOUNGE_LIVE_PRODUCT,
      amountHalalas: Number(parsed.amount),
      paymentId,
      affiliateCode: storeAffiliateCodeFromMeta(parsed.metadata),
    });
  }
  if (!ok) return json({ error: 'تعذر تفعيل التشغيل' }, 409, headers);
  return json({ ok: true, token, displayUrl: displayUrl(token) }, 200, headers);
}

async function activatePaid(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  if (!isLoungeLiveCheckoutEnabled()) return json({ error: 'تحصيل لاونجا1 مغلق حالياً.' }, 503, headers);
  const token = String(body.token || '').trim();
  const paymentId = String(body.paymentId || '').trim();
  if (!token || !paymentId) return json({ error: 'مرجع الدفع ناقص' }, 400, headers);
  return fulfillFromPaymentId(db, token, paymentId, headers);
}

async function syncPaid(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  if (!token) return json({ error: 'مرجع الدفع ناقص' }, 400, headers);
  const { data } = await db.from(STORE_LOUNGE_LIVE_TABLE).select('*').eq('display_token', token).maybeSingle();
  if (!data) return json({ error: 'الطلب غير موجود' }, 404, headers);
  const row = data as LoungeRow;
  if (row.status === 'live' && !loungeLiveIsExpired(row.expires_at)) {
    return json({ ok: true, token, displayUrl: displayUrl(token) }, 200, headers);
  }
  const invoiceId = String(row.moyasar_invoice_id || invoiceIdFromPayload(row.payload) || '').trim();
  if (!invoiceId) return json({ error: 'لا فاتورة للمزامنة' }, 400, headers);
  const invoice = await fetchMoyasarInvoiceForOccasionCard(invoiceId);
  if (invoice.status >= 400) return json({ error: 'تعذر التحقق من الفاتورة' }, 502, headers);
  try {
    const parsed = JSON.parse(invoice.text) as {
      status?: string;
      amount?: number;
      metadata?: Record<string, unknown>;
      payments?: Array<{ id?: unknown; status?: unknown }>;
    };
    if (!isLoungePriceHalalas(Number(parsed.amount))) {
      return json({ error: 'مبلغ الفاتورة لا يطابق لاونجا1' }, 409, headers);
    }
    if (!loungeLivePaymentMatches({ meta: parsed.metadata, token, amount: Number(parsed.amount) })) {
      return json({ error: 'وسم الفاتورة لا يطابق لاونجا1' }, 409, headers);
    }
    const paid = (parsed.payments || []).find((item) => moyasarPaymentIsPaid(String(item.status || '')));
    const paymentId = String(paid?.id || `invoice:${invoiceId}`);
    const ok = await markLive(db, String(row.id), paymentId, Number(parsed.amount));
    if (ok) {
      await creditStoreAffiliateLedger(db, {
        productTag: STORE_LOUNGE_LIVE_PRODUCT,
        amountHalalas: Number(parsed.amount),
        paymentId,
        affiliateCode: storeAffiliateCodeFromMeta(parsed.metadata),
      });
    }
    if (!ok) return json({ error: 'تعذر تفعيل التشغيل' }, 409, headers);
    return json({ ok: true, token, displayUrl: displayUrl(token) }, 200, headers);
  } catch {
    return json({ error: 'تعذر قراءة الفاتورة' }, 502, headers);
  }
}

async function addBlessing(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  const name = String(body.name || '').replace(/\s+/g, ' ').trim().slice(0, 40);
  const cannedText = String(body.cannedText || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  const extra = String(body.extra || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  if (!token || name.length < 2 || !cannedText) return json({ error: 'الترحيب ناقص' }, 400, headers);
  const { data } = await db.from(STORE_LOUNGE_LIVE_TABLE).select('*').eq('guest_token', token).maybeSingle();
  if (!data) return json({ error: 'رابط الزبون غير صالح' }, 404, headers);
  const row = data as LoungeRow;
  if (row.status !== 'live' || isTermExpired(row)) return json({ error: 'انتهت مدة التشغيل' }, 403, headers);
  const payload = { ...(row.payload as LoungeLiveOrderPayload) };
  if (payload.guestPaused === true) return json({ error: 'الاستقبال متوقف مؤقتاً' }, 403, headers);
  if (loungeTextBlocked(`${cannedText} ${extra}`)) return json({ error: 'تعذر إرسال هذه العبارة' }, 400, headers);
  const blessings = Array.isArray(payload.blessings) ? payload.blessings : [];
  if (loungeBlessingDuplicate(blessings, { cannedText, extra })) {
    return json({ error: 'هذه العبارة أُرسلت للتو' }, 429, headers);
  }
  blessings.push({
    id: `${Date.now()}`,
    name,
    cannedId: String(body.cannedId || '').slice(0, 24),
    cannedText,
    extra,
    hidden: false,
    pending: payload.reviewBeforeShow === true,
    at: new Date().toISOString(),
  });
  payload.blessings = blessings.slice(-80);
  await db
    .from(STORE_LOUNGE_LIVE_TABLE)
    .update({ payload, last_public_change_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', row.id);
  return json({ ok: true }, 200, headers);
}

async function saveHost(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  if (!token) return json({ error: 'رابط المضيف غير صالح' }, 400, headers);
  const { data } = await db.from(STORE_LOUNGE_LIVE_TABLE).select('*').eq('host_token', token).maybeSingle();
  if (!data) return json({ error: 'رابط المضيف غير صالح' }, 404, headers);
  const row = data as LoungeRow;
  if (row.status !== 'live' || isTermExpired(row)) return json({ error: 'انتهت مدة التشغيل' }, 403, headers);
  const current = { ...(row.payload as LoungeLiveOrderPayload) };
  const next: LoungeLiveOrderPayload = {
    ...current,
    loungeName: String(body.loungeName ?? current.loungeName).slice(0, 80),
    hostName: String(body.hostName ?? current.hostName).slice(0, 80),
    activeEventId: parseLoungeEventId(body.activeEventId ?? current.activeEventId),
    customEventTitle: String(body.customEventTitle ?? current.customEventTitle).slice(0, 80),
    welcomeAr: String(body.welcomeAr ?? current.welcomeAr).slice(0, 400),
    youtubeUrl: String(body.youtubeUrl ?? current.youtubeUrl).slice(0, 300),
    youtubeHidden: body.youtubeHidden == null ? current.youtubeHidden : Boolean(body.youtubeHidden),
    announcement: String(body.announcement ?? current.announcement).slice(0, 160),
    photoSrc: String(body.photoSrc ?? current.photoSrc).slice(0, 350000),
    panoramaSrc: String(body.panoramaSrc ?? current.panoramaSrc).slice(0, 350000),
    guestPaused: body.guestPaused == null ? current.guestPaused === true : Boolean(body.guestPaused),
    reviewBeforeShow: body.reviewBeforeShow == null ? current.reviewBeforeShow === true : Boolean(body.reviewBeforeShow),
    blessings: Array.isArray(body.blessings) ? (body.blessings as LoungeLiveOrderPayload['blessings']) : current.blessings,
  };
  await db
    .from(STORE_LOUNGE_LIVE_TABLE)
    .update({ payload: next, last_public_change_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', row.id);
  return json({ ok: true }, 200, headers);
}
