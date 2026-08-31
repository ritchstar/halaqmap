/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحصيل كافينا1 — وسم store_cafe_live، 1199 أو 2099 ر.س، صندوق المحادثة مدرج.
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
import { isAllowedMoyasarInvoiceUrl } from './_lib/storeIssuedCards.js';
import {
  isCafeLiveCheckoutEnabled,
  isCafePriceHalalas,
  newCafeToken,
  parseCafeChat,
  parseCafeChats,
  parseCafeLiveOrderBody,
  parseCafePackId,
  publicCafePayload,
  cafeChargeHalalas,
  cafeLiveInvoiceDescription,
  cafeLiveInvoiceMetadata,
  cafeLiveIsExpired,
  cafeLivePaymentMatches,
  cafeLiveTermEndIso,
  cafePackFromHalalas,
  cafeBlessingDuplicate,
  cafeTextBlocked,
  STORE_CAFE_LIVE_POLICY,
  STORE_CAFE_LIVE_PRODUCT,
  STORE_CAFE_LIVE_TABLE,
  type CafeLiveOrderPayload,
} from './_lib/storeCafeLive.js';
import { parseStoreShopHours } from './_lib/storeShopHours.js';
import { lockPaidVendorMode, parseVendorMode } from './_lib/storeMobileVendor.js';
import { parseShopPickupPlace } from './_lib/storeShopPlace.js';
import { sendCafeLiveLinksEmail } from './_lib/storeCafeLiveMail.js';
import { applyStoreTrialClock, markStoreTrialConverted } from './_lib/storeProductTrial.js';
import { storeAffiliateCodeFromMeta } from './_lib/storeAffiliateCode.js';
import { creditStoreAffiliateLedger } from './_lib/storeAffiliateLedger.js';

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

function shopUrl(token: string): string {
  return `${storeOrigin()}/#/c/${encodeURIComponent(token)}`;
}
function deskUrl(token: string): string {
  return `${storeOrigin()}/#/c/${encodeURIComponent(token)}/desk`;
}
function displayUrl(token: string): string {
  return `${storeOrigin()}/#/c/${encodeURIComponent(token)}`;
}
function quietUrl(token: string): string {
  return `${storeOrigin()}/#/c/${encodeURIComponent(token)}/quiet`;
}
function menuUrl(token: string): string {
  return `${storeOrigin()}/#/c/${encodeURIComponent(token)}/menu`;
}
function guestUrl(token: string): string {
  return `${storeOrigin()}/#/c/${encodeURIComponent(token)}/guest`;
}
function hostUrl(token: string): string {
  return `${storeOrigin()}/#/c/${encodeURIComponent(token)}/host`;
}

function successUrl(token: string, request: Request): string {
  const q = new URLSearchParams();
  q.set('purpose', STORE_CAFE_LIVE_PRODUCT);
  q.set('store_cafe_token', token);
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

type CafeRow = {
  id: string;
  status: string;
  display_token: string;
  guest_token: string;
  shop_token: string;
  desk_token: string;
  buyer_email: string;
  price_halalas: number;
  moyasar_payment_id: string | null;
  moyasar_invoice_id: string | null;
  payload: CafeLiveOrderPayload & Record<string, unknown>;
  expires_at: string | null;
};

function expiredPayload(row: CafeRow) {
  return {
    ok: true,
    expired: true,
    renewToken: row.shop_token,
    landingPath: `/store/cafe?renew=${encodeURIComponent(row.shop_token)}`,
    shopName: String(row.payload?.shopName || ''),
    expiresAt: row.expires_at,
  };
}

function isTermExpired(row: Pick<CafeRow, 'status' | 'expires_at'>): boolean {
  if (row.status === 'revoked') return true;
  if (row.status === 'expired' || row.status === 'pending_renewal') return true;
  if (row.status === 'live' && cafeLiveIsExpired(row.expires_at)) return true;
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
  const role = String(url.searchParams.get('role') || 'shop').trim();
  if (!token) {
    return json({ ok: true, route: 'public-store-cafe-live', product: STORE_CAFE_LIVE_PRODUCT }, 200, headers);
  }
  const db = serviceClient();
  if (!db) return json({ error: 'Server not configured' }, 503, headers);
  return readByRole(db, token, role, headers);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const guard = runRegistrationRouteGuards(request, 'public-store-cafe-live');
  if (guard.ok === false) return json(guard.json, guard.status, headers);
  const db = serviceClient();
  if (!db) return json({ error: 'Server not configured' }, 503, headers);
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, headers);
  }
  const action = String(body.action || '').trim();
  const secGuard = await runSecurityGuard(request, {
    sensitiveRoute: true,
    rateLimit: action === 'get_public' ? 45 : action === 'save_host' ? 40 : 8,
  });
  if (!secGuard.allowed) return secGuard.response;
  if (action === 'create_pending') return createPending(db, body, headers, request);
  if (action === 'activate_paid') return activatePaid(db, body, headers);
  if (action === 'sync_paid') return syncPaid(db, body, headers);
  if (action === 'add_order') return addOrder(db, body, headers);
  if (action === 'add_chat') return addChat(db, body, headers);
  if (action === 'add_blessing') return addBlessing(db, body, headers);
  if (action === 'save_host') return saveHost(db, body, headers);
  if (action === 'get_public') {
    return readByRole(db, String(body.token || '').trim(), String(body.role || 'shop'), headers);
  }
  return json({ error: 'إجراء غير معروف' }, 400, headers);
}

async function findByAnyToken(db: Db, token: string): Promise<CafeRow | null> {
  for (const col of ['shop_token', 'desk_token', 'display_token', 'guest_token'] as const) {
    const { data } = await db.from(STORE_CAFE_LIVE_TABLE).select('*').eq(col, token).maybeSingle();
    if (data) return data as CafeRow;
  }
  return null;
}

function inferredRole(row: CafeRow, token: string, requested: string): string {
  if (requested === 'pay') return 'pay';
  if (token === row.display_token) return requested === 'shop' ? 'display' : requested || 'display';
  if (token === row.guest_token) return 'guest';
  if (token === row.desk_token) return requested === 'host' ? 'host' : 'desk';
  return 'shop';
}

async function readByRole(db: Db, token: string, role: string, headers: Record<string, string>) {
  if (!token) return json({ error: 'الرابط غير صالح' }, 400, headers);
  if (role === 'pay') {
    const { data } = await db.from(STORE_CAFE_LIVE_TABLE).select('*').eq('shop_token', token).maybeSingle();
    if (!data) return json({ error: 'الرابط غير موجود' }, 404, headers);
    return readRow(db, data as CafeRow, 'pay', headers);
  }
  const row = await findByAnyToken(db, token);
  if (!row) return json({ error: 'الرابط غير موجود' }, 404, headers);
  return readRow(db, row, inferredRole(row, token, role), headers);
}

async function readRow(db: Db, row: CafeRow, role: string, headers: Record<string, string>) {
  const payload = (row.payload || {}) as CafeLiveOrderPayload;
  if (role === 'pay') {
    return json(
      {
        ok: true,
        status: row.status,
        priceHalalas: row.price_halalas,
        invoiceUrl: invoiceUrlFromPayload(row.payload),
        shopName: payload.shopName,
        packId: parseCafePackId(payload.packId),
        expiresAt: row.expires_at,
      },
      200,
      headers,
    );
  }
  const clock = await applyStoreTrialClock(db, row, STORE_CAFE_LIVE_TABLE);
  if (clock.expired || isTermExpired(row)) return json(expiredPayload(row), 200, headers);
  if (row.status !== 'live') return json({ error: 'التشغيل لم يُفعَّل بعد' }, 403, headers);
  return json(
    {
      ok: true,
      status: row.status,
      role,
      payload: publicCafePayload(payload, role),
      expiresAt: clock.expiresAt,
      isTrial: clock.isTrial,
      shopUrl: shopUrl(row.shop_token),
      deskUrl: deskUrl(row.desk_token),
      displayUrl: displayUrl(row.display_token),
      quietUrl: quietUrl(row.display_token),
      menuUrl: menuUrl(row.display_token),
      guestUrl: guestUrl(row.guest_token),
      hostUrl: hostUrl(row.desk_token),
      ...(role === 'desk' || role === 'host'
        ? { shopToken: row.shop_token, deskToken: row.desk_token, displayToken: row.display_token, guestToken: row.guest_token }
        : {}),
    },
    200,
    headers,
  );
}

async function attachInvoice(
  db: Db,
  shopToken: string,
  payload: Record<string, unknown>,
  request: Request,
  packId: 'm6' | 'm12',
  kind: 'purchase' | 'renewal',
  affiliateCode?: unknown,
): Promise<string> {
  let invoiceUrl = '';
  const secret = resolveOccasionCardMoyasarSecretKey();
  if (!secret) return invoiceUrl;
  const vendorMode = parseVendorMode(payload.vendorMode);
  const created = await createMoyasarInvoice(secret, {
    amount: cafeChargeHalalas(packId, vendorMode),
    currency: 'SAR',
    description: cafeLiveInvoiceDescription(packId, vendorMode),
    success_url: successUrl(shopToken, request),
    back_url: `${storeOrigin()}/#/store/cafe`,
    callback_url: `${payOrigin(request)}/api/public-store-cafe-live`,
    expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    metadata: cafeLiveInvoiceMetadata(shopToken, packId, kind, affiliateCode, vendorMode),
  });
  if (created.status >= 400) return invoiceUrl;
  try {
    const inv = JSON.parse(created.text) as { id?: string; url?: string };
    const id = String(inv.id || '').trim();
    const url = String(inv.url || '').trim();
    if (id && isAllowedMoyasarInvoiceUrl(url)) {
      invoiceUrl = url;
      await db
        .from(STORE_CAFE_LIVE_TABLE)
        .update({
          moyasar_invoice_id: id,
          payload: { ...payload, moyasar_invoice_id: id, moyasar_invoice_url: url },
          updated_at: new Date().toISOString(),
        })
        .eq('shop_token', shopToken);
    }
  } catch {
    invoiceUrl = '';
  }
  return invoiceUrl;
}

async function createPending(db: Db, body: Record<string, unknown>, headers: Record<string, string>, request: Request) {
  if (!isCafeLiveCheckoutEnabled()) {
    return json({ error: 'تحصيل مقهى الحي مغلق حالياً.' }, 503, headers);
  }
  const renewToken = String(body.renewToken || '').trim();
  if (renewToken) return createRenewal(db, body, headers, request);
  const parsed = parseCafeLiveOrderBody(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400, headers);
  const charge = cafeChargeHalalas(parsed.packId, parsed.vendorMode);
  const shopToken = newCafeToken();
  const deskToken = newCafeToken();
  const displayToken = newCafeToken();
  const guestToken = newCafeToken();
  const { error } = await db.from(STORE_CAFE_LIVE_TABLE).insert({
    status: 'pending_payment',
    display_token: displayToken,
    guest_token: guestToken,
    shop_token: shopToken,
    desk_token: deskToken,
    buyer_email: parsed.email,
    buyer_name: parsed.buyerName,
    price_halalas: charge,
    payload: parsed.payload,
    policy_version: STORE_CAFE_LIVE_POLICY,
  });
  if (error) return json({ error: 'تعذر إنشاء طلب التشغيل' }, 500, headers);
  const invoiceUrl = await attachInvoice(
    db,
    shopToken,
    parsed.payload as unknown as Record<string, unknown>,
    request,
    parsed.packId,
    'purchase',
    body.affiliateCode,
  );
  return json(
    {
      ok: true,
      token: shopToken,
      deskToken,
      displayToken,
      guestToken,
      priceHalalas: charge,
      payPath: `/pay/cafe/${shopToken}`,
      invoiceUrl,
      shopUrl: shopUrl(shopToken),
      deskUrl: deskUrl(deskToken),
      displayUrl: displayUrl(displayToken),
      guestUrl: guestUrl(guestToken),
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
  const packId = parseCafePackId(body.packId);
  const vendorMode = parseVendorMode(body.vendorMode);
  const charge = cafeChargeHalalas(packId, vendorMode);
  const row = await findByAnyToken(db, renewToken);
  if (!row) return json({ error: 'الرابط غير موجود' }, 404, headers);
  if (row.status === 'revoked') return json({ error: 'هذا التشغيل ملغى' }, 403, headers);
  if (row.status === 'pending_payment') {
    return json(
      {
        ok: true,
        token: row.shop_token,
        deskToken: row.desk_token,
        priceHalalas: row.price_halalas,
        payPath: `/pay/cafe/${row.shop_token}`,
        invoiceUrl: invoiceUrlFromPayload(row.payload),
        shopUrl: shopUrl(row.shop_token),
        deskUrl: deskUrl(row.desk_token),
      },
      200,
      headers,
    );
  }
  if (row.status === 'live' && !cafeLiveIsExpired(row.expires_at)) {
    return json({ error: 'التشغيل ما زال سارياً. إعادة الشراء بعد انتهاء المدة.' }, 409, headers);
  }
  const payload = { ...(row.payload || {}), packId, chatIncluded: true, vendorMode };
  await db
    .from(STORE_CAFE_LIVE_TABLE)
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
    row.shop_token,
    payload,
    request,
    packId,
    'renewal',
    body.affiliateCode,
  );
  return json(
    {
      ok: true,
      token: row.shop_token,
      deskToken: row.desk_token,
      renewed: true,
      priceHalalas: charge,
      payPath: `/pay/cafe/${row.shop_token}`,
      invoiceUrl,
      shopUrl: shopUrl(row.shop_token),
      deskUrl: deskUrl(row.desk_token),
    },
    200,
    headers,
  );
}

async function markLive(db: Db, id: string, paymentId: string, amount: number): Promise<boolean> {
  const { data: current } = await db
    .from(STORE_CAFE_LIVE_TABLE)
    .select('id, status, buyer_email, shop_token, desk_token, display_token, guest_token, payload, moyasar_payment_id, expires_at, price_halalas')
    .eq('id', id)
    .maybeSingle();
  if (!current) return false;
  if (
    current.status === 'live' &&
    String(current.moyasar_payment_id || '') === paymentId &&
    !cafeLiveIsExpired(current.expires_at)
  ) {
    return true;
  }
  const wasRenewal = current.status === 'pending_renewal' || current.status === 'expired' || current.status === 'live';
  const pack = cafePackFromHalalas(amount);
  const expiresAt = cafeLiveTermEndIso(pack.days);
  const payload: Record<string, unknown> = {
    ...((current.payload || {}) as Record<string, unknown>),
    packId: pack.id,
    chatIncluded: true,
  };
  const history = Array.isArray(payload.paymentHistory) ? payload.paymentHistory : [];
  history.push({ id: paymentId, at: new Date().toISOString(), kind: wasRenewal ? 'renewal' : 'purchase' });
  payload.paymentHistory = history.slice(-12);
  const { data: updated, error } = await db
    .from(STORE_CAFE_LIVE_TABLE)
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
    .select('id, buyer_email, shop_token, desk_token, display_token, guest_token, expires_at')
    .maybeSingle();
  if (error) return false;
  if (updated) {
    const exp = updated.expires_at ? String(updated.expires_at).slice(0, 10) : '';
    void sendCafeLiveLinksEmail({
      to: String(updated.buyer_email),
      shopUrl: shopUrl(String(updated.shop_token)),
      deskUrl: deskUrl(String(updated.desk_token)),
      displayUrl: displayUrl(String(updated.display_token)),
      quietUrl: quietUrl(String(updated.display_token)),
      menuUrl: menuUrl(String(updated.display_token)),
      guestUrl: guestUrl(String(updated.guest_token)),
      hostUrl: hostUrl(String(updated.desk_token)),
      expiresLabel: exp,
      renewed: wasRenewal,
    });
    void markStoreTrialConverted(db, String(updated.id));
    return true;
  }
  const { data: again } = await db.from(STORE_CAFE_LIVE_TABLE).select('status').eq('id', id).maybeSingle();
  return again?.status === 'live';
}

async function fulfillFromPaymentId(db: Db, token: string, paymentId: string, headers: Record<string, string>) {
  const { data } = await db.from(STORE_CAFE_LIVE_TABLE).select('*').eq('shop_token', token).maybeSingle();
  if (!data) return json({ error: 'الطلب غير موجود' }, 404, headers);
  const row = data as CafeRow;
  if (row.status === 'live' && !cafeLiveIsExpired(row.expires_at) && String(row.moyasar_payment_id || '') === paymentId) {
    return json({ ok: true, token, shopUrl: shopUrl(token) }, 200, headers);
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
  if (!isCafePriceHalalas(Number(parsed.amount)) || (Number(row.price_halalas) > 0 && Number(parsed.amount) !== Number(row.price_halalas))) {
    return json({ error: 'مبلغ الدفع لا يطابق باقة مقهى الحي' }, 409, headers);
  }
  const metaOk = cafeLivePaymentMatches({ meta: parsed.metadata, token, amount: Number(parsed.amount) });
  if (!metaOk) {
    const invoiceId = invoiceIdFromPayload(row.payload) || String(parsed.invoice_id || '').trim();
    if (!invoiceId) return json({ error: 'وسم الدفع لا يطابق مقهى الحي' }, 409, headers);
    const invoice = await fetchMoyasarInvoiceForOccasionCard(invoiceId);
    if (invoice.status >= 400) return json({ error: 'تعذر التحقق من الفاتورة' }, 502, headers);
    try {
      const inv = JSON.parse(invoice.text) as { amount?: number; metadata?: Record<string, unknown> };
      if (!cafeLivePaymentMatches({ meta: inv.metadata, token, amount: Number(inv.amount) })) {
        return json({ error: 'وسم الفاتورة لا يطابق مقهى الحي' }, 409, headers);
      }
    } catch {
      return json({ error: 'تعذر قراءة الفاتورة' }, 502, headers);
    }
  }
  const ok = await markLive(db, String(row.id), paymentId, Number(parsed.amount));
  if (ok) {
    await creditStoreAffiliateLedger(db, {
      productTag: STORE_CAFE_LIVE_PRODUCT,
      amountHalalas: Number(parsed.amount),
      paymentId,
      affiliateCode: storeAffiliateCodeFromMeta(parsed.metadata),
    });
  }
  if (!ok) return json({ error: 'تعذر تفعيل التشغيل' }, 409, headers);
  return json({ ok: true, token, shopUrl: shopUrl(token) }, 200, headers);
}

async function activatePaid(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  if (!isCafeLiveCheckoutEnabled()) return json({ error: 'تحصيل مقهى الحي مغلق حالياً.' }, 503, headers);
  const token = String(body.token || '').trim();
  const paymentId = String(body.paymentId || '').trim();
  if (!token || !paymentId) return json({ error: 'مرجع الدفع ناقص' }, 400, headers);
  return fulfillFromPaymentId(db, token, paymentId, headers);
}

async function syncPaid(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  if (!token) return json({ error: 'مرجع الدفع ناقص' }, 400, headers);
  const { data } = await db.from(STORE_CAFE_LIVE_TABLE).select('*').eq('shop_token', token).maybeSingle();
  if (!data) return json({ error: 'الطلب غير موجود' }, 404, headers);
  const row = data as CafeRow;
  if (row.status === 'live' && !cafeLiveIsExpired(row.expires_at)) {
    return json({ ok: true, token, shopUrl: shopUrl(token) }, 200, headers);
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
    if (Number(parsed.amount) !== row.price_halalas || !isCafePriceHalalas(Number(parsed.amount))) {
      return json({ error: 'مبلغ الفاتورة لا يطابق باقة مقهى الحي' }, 409, headers);
    }
    if (!cafeLivePaymentMatches({ meta: parsed.metadata, token, amount: Number(parsed.amount) })) {
      return json({ error: 'وسم الفاتورة لا يطابق مقهى الحي' }, 409, headers);
    }
    const paid = (parsed.payments || []).find((item) => moyasarPaymentIsPaid(String(item.status || '')));
    const paymentId = String(paid?.id || `invoice:${invoiceId}`);
    const ok = await markLive(db, String(row.id), paymentId, Number(parsed.amount));
    if (ok) {
      await creditStoreAffiliateLedger(db, {
        productTag: STORE_CAFE_LIVE_PRODUCT,
        amountHalalas: Number(parsed.amount),
        paymentId,
        affiliateCode: storeAffiliateCodeFromMeta(parsed.metadata),
      });
    }
    if (!ok) return json({ error: 'تعذر تفعيل التشغيل' }, 409, headers);
    return json({ ok: true, token, shopUrl: shopUrl(token) }, 200, headers);
  } catch {
    return json({ error: 'تعذر قراءة الفاتورة' }, 502, headers);
  }
}

async function addOrder(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  const order = body.order && typeof body.order === 'object' ? (body.order as Record<string, unknown>) : null;
  if (!token || !order) return json({ error: 'الطلب ناقص' }, 400, headers);
  const { data } = await db.from(STORE_CAFE_LIVE_TABLE).select('*').eq('shop_token', token).maybeSingle();
  if (!data) return json({ error: 'رابط الصفحة غير صالح' }, 404, headers);
  const row = data as CafeRow;
  if (row.status !== 'live' || isTermExpired(row)) return json({ error: 'انتهت مدة التشغيل' }, 403, headers);
  const payload = { ...(row.payload as CafeLiveOrderPayload), chatIncluded: true as const };
  const orders = Array.isArray(payload.orders) ? payload.orders : [];
  orders.unshift(order);
  payload.orders = orders.slice(0, 200);
  const ticketNo = Number(order.ticketNo);
  if (Number.isFinite(ticketNo) && ticketNo >= payload.nextTicket) {
    payload.nextTicket = ticketNo + 1;
  }
  await db
    .from(STORE_CAFE_LIVE_TABLE)
    .update({ payload, last_public_change_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', row.id);
  return json({ ok: true }, 200, headers);
}

async function addChat(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  const chat = parseCafeChat(body.chat, 'buyer');
  if (!token || !chat) return json({ error: 'الملاحظة ناقصة' }, 400, headers);
  const { data } = await db.from(STORE_CAFE_LIVE_TABLE).select('*').eq('shop_token', token).maybeSingle();
  if (!data) return json({ error: 'رابط الصفحة غير صالح' }, 404, headers);
  const row = data as CafeRow;
  if (row.status !== 'live' || isTermExpired(row)) return json({ error: 'انتهت مدة التشغيل' }, 403, headers);
  const payload = { ...(row.payload as CafeLiveOrderPayload), chatIncluded: true as const };
  const chats = parseCafeChats(payload.chats);
  chats.unshift(chat);
  payload.chats = chats.slice(0, 200);
  await db
    .from(STORE_CAFE_LIVE_TABLE)
    .update({ payload, last_public_change_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', row.id);
  return json({ ok: true }, 200, headers);
}

async function saveHost(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  if (!token) return json({ error: 'رابط الكاشير غير صالح' }, 400, headers);
  const { data } = await db.from(STORE_CAFE_LIVE_TABLE).select('*').eq('desk_token', token).maybeSingle();
  if (!data) return json({ error: 'رابط الكاشير غير صالح' }, 404, headers);
  const row = data as CafeRow;
  if (row.status !== 'live' || isTermExpired(row)) return json({ error: 'انتهت مدة التشغيل' }, 403, headers);
  const current = { ...(row.payload as CafeLiveOrderPayload) };
  const nextTicket = Number(body.nextTicket);
  const next: CafeLiveOrderPayload = {
    ...current,
    shopName: String(body.shopName ?? current.shopName).slice(0, 80),
    hostName: String(body.hostName ?? current.hostName).slice(0, 80),
    blurbAr: String(body.blurbAr ?? current.blurbAr).slice(0, 200),
    customFields: Array.isArray(body.customFields) ? (body.customFields as string[]).slice(0, 5) : current.customFields,
    flashAr: String(body.flashAr ?? current.flashAr).slice(0, 160),
    shelf: Array.isArray(body.shelf) ? body.shelf : current.shelf,
    orders: Array.isArray(body.orders) ? (body.orders as unknown[]).slice(0, 80) : current.orders,
    orderArchive: Array.isArray(body.orderArchive) ? (body.orderArchive as unknown[]).slice(0, 1000) : current.orderArchive || [],
    chatIncluded: true,
    chats: Array.isArray(body.chats) ? parseCafeChats(body.chats) : parseCafeChats(current.chats),
    nextTicket: Number.isFinite(nextTicket) && nextTicket > 0 ? nextTicket : current.nextTicket || 1,
    welcomeAr: String(body.welcomeAr ?? current.welcomeAr ?? '').slice(0, 400),
    youtubeUrl: String(body.youtubeUrl ?? current.youtubeUrl ?? '').slice(0, 300),
    youtubeHidden: body.youtubeHidden == null ? current.youtubeHidden !== false : Boolean(body.youtubeHidden),
    announcement: String(body.announcement ?? current.announcement ?? '').slice(0, 160),
    photoSrc: String(body.photoSrc ?? current.photoSrc ?? '').slice(0, 350000),
    panoramaSrc: String(body.panoramaSrc ?? current.panoramaSrc ?? '').slice(0, 350000),
    guestPaused: body.guestPaused == null ? current.guestPaused === true : Boolean(body.guestPaused),
    reviewBeforeShow: body.reviewBeforeShow == null ? current.reviewBeforeShow === true : Boolean(body.reviewBeforeShow),
    activeEventId: String(body.activeEventId ?? current.activeEventId ?? 'welcome').slice(0, 24),
    customEventTitle: String(body.customEventTitle ?? current.customEventTitle ?? '').slice(0, 80),
    blessings: Array.isArray(body.blessings) ? (body.blessings as CafeLiveOrderPayload['blessings']) : current.blessings || [],
    ...parseStoreShopHours(body, parseStoreShopHours(current)),
    ...lockPaidVendorMode(parseShopPickupPlace(body, parseShopPickupPlace(current)), parseShopPickupPlace(current)),
  };
  await db
    .from(STORE_CAFE_LIVE_TABLE)
    .update({ payload: next, last_public_change_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', row.id);
  return json({ ok: true }, 200, headers);
}

async function addBlessing(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  const name = String(body.name || '').replace(/\s+/g, ' ').trim().slice(0, 40);
  const cannedText = String(body.cannedText || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  const extra = String(body.extra || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  if (!token || name.length < 2 || !cannedText) return json({ error: 'المشاركة ناقصة' }, 400, headers);
  const { data } = await db.from(STORE_CAFE_LIVE_TABLE).select('*').eq('guest_token', token).maybeSingle();
  if (!data) return json({ error: 'رابط المشاركة غير صالح' }, 404, headers);
  const row = data as CafeRow;
  if (row.status !== 'live' || isTermExpired(row)) return json({ error: 'انتهت مدة التشغيل' }, 403, headers);
  const payload = { ...(row.payload as CafeLiveOrderPayload) };
  if (payload.guestPaused === true) return json({ error: 'الاستقبال متوقف مؤقتاً' }, 403, headers);
  if (cafeTextBlocked(`${cannedText} ${extra}`)) return json({ error: 'تعذر إرسال هذه العبارة' }, 400, headers);
  const blessings = Array.isArray(payload.blessings) ? payload.blessings : [];
  if (cafeBlessingDuplicate(blessings, { cannedText, extra })) {
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
    .from(STORE_CAFE_LIVE_TABLE)
    .update({ payload, last_public_change_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', row.id);
  return json({ ok: true }, 200, headers);
}
