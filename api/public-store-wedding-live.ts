/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحصيل دعوة الزواج التفاعلية — وسم store_wedding_live، 899 ر.س.
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
  isWeddingLiveCheckoutEnabled,
  newWeddingToken,
  parseWeddingHostRole,
  parseWeddingLiveOrderBody,
  parseWeddingVoice,
  parseWeddingWelcomeLinesAr,
  publicWeddingPayload,
  STORE_WEDDING_LIVE_POLICY,
  STORE_WEDDING_LIVE_PRICE_HALALAS,
  STORE_WEDDING_LIVE_PRODUCT,
  STORE_WEDDING_LIVE_TABLE,
  weddingLiveInvoiceDescription,
  weddingLiveInvoiceMetadata,
  weddingLivePaymentMatches,
  type WeddingLiveOrderPayload,
} from './_lib/storeWeddingLive.js';
import {
  claimGuestSeat,
  guestInviteStats,
  guestSeatMatches,
  markGuestInviteSent,
  markGuestInvitesSent,
  mintGuestInviteBatch,
  parseGuestInvites,
  parseGuestSeats,
  summarizeGuestInvites,
} from './_lib/storeGuestDeviceLock.js';
import { sendWeddingLiveLinksEmail } from './_lib/storeWeddingLiveMail.js';
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
  return `${storeOrigin()}/#/w/${encodeURIComponent(token)}`;
}
function guestUrl(token: string): string {
  return `${storeOrigin()}/w/${encodeURIComponent(token)}/guest`;
}
function hostUrl(token: string): string {
  return `${storeOrigin()}/#/w/${encodeURIComponent(token)}/host`;
}

function successUrl(token: string, request: Request): string {
  const q = new URLSearchParams();
  q.set('purpose', STORE_WEDDING_LIVE_PRODUCT);
  q.set('store_wedding_token', token);
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
    return json({ ok: true, route: 'public-store-wedding-live', product: STORE_WEDDING_LIVE_PRODUCT }, 200, headers);
  }
  const db = serviceClient();
  if (!db) return json({ error: 'Server not configured' }, 503, headers);
  return readByRole(db, token, role, headers);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const guard = runRegistrationRouteGuards(request, 'public-store-wedding-live');
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
  if (action === 'add_blessing') return addBlessing(db, body, headers);
  if (action === 'claim_guest_seat') return claimGuestSeatAction(db, body, headers);
  if (action === 'mint_guest_invite') return mintGuestInviteAction(db, body, headers);
  if (action === 'list_guest_invites') return listGuestInvitesAction(db, body, headers);
  if (action === 'mark_guest_invite_sent') return markGuestInviteSentAction(db, body, headers);
  if (action === 'save_host') return saveHost(db, body, headers);
  if (action === 'get_public') {
    return readByRole(db, String(body.token || '').trim(), String(body.role || 'display'), headers);
  }
  return json({ error: 'إجراء غير معروف' }, 400, headers);
}

async function readByRole(db: Db, token: string, role: string, headers: Record<string, string>) {
  if (!token) return json({ error: 'الرابط غير صالح' }, 400, headers);
  const col = role === 'guest' ? 'guest_token' : role === 'host' ? 'host_token' : role === 'pay' ? 'display_token' : 'display_token';
  const { data } = await db.from(STORE_WEDDING_LIVE_TABLE).select('*').eq(col, token).maybeSingle();
  if (!data) return json({ error: 'الرابط غير موجود' }, 404, headers);
  const payload = (data.payload || {}) as WeddingLiveOrderPayload;
  if (role === 'pay') {
    return json(
      {
        ok: true,
        status: data.status,
        priceHalalas: data.price_halalas,
        invoiceUrl: invoiceUrlFromPayload(data.payload),
        hostName: payload.hostName,
      },
      200,
      headers,
    );
  }
  const clock = await applyStoreTrialClock(db, data, STORE_WEDDING_LIVE_TABLE);
  if (clock.expired) {
    return json(
      {
        ok: true,
        expired: true,
        trialGiftEnded: clock.giftEnded,
        expiresAt: clock.expiresAt,
      },
      200,
      headers,
    );
  }
  if (data.status !== 'live') return json({ error: 'الدعوة لم تُفعَّل بعد' }, 403, headers);
  return json(
    {
      ok: true,
      status: data.status,
      role,
      payload: publicWeddingPayload(payload),
      expiresAt: clock.expiresAt,
      isTrial: clock.isTrial,
    },
    200,
    headers,
  );
}

async function createPending(
  db: Db,
  body: Record<string, unknown>,
  headers: Record<string, string>,
  request: Request,
) {
  if (!isWeddingLiveCheckoutEnabled()) {
    return json({ error: 'تحصيل دعوة الزواج مغلق حالياً.' }, 503, headers);
  }
  const parsed = parseWeddingLiveOrderBody(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400, headers);
  const displayToken = newWeddingToken();
  const guestToken = newWeddingToken();
  const hostToken = newWeddingToken();
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await db.from(STORE_WEDDING_LIVE_TABLE).insert({
    status: 'pending_payment',
    display_token: displayToken,
    guest_token: guestToken,
    host_token: hostToken,
    buyer_email: parsed.email,
    buyer_name: parsed.buyerName || parsed.payload.hostName,
    price_halalas: STORE_WEDDING_LIVE_PRICE_HALALAS,
    payload: parsed.payload,
    policy_version: STORE_WEDDING_LIVE_POLICY,
    expires_at: expiresAt,
  });
  if (error) return json({ error: 'تعذر إنشاء طلب الدعوة' }, 500, headers);

  let invoiceUrl = '';
  const secret = resolveOccasionCardMoyasarSecretKey();
  if (secret) {
    const created = await createMoyasarInvoice(secret, {
      amount: STORE_WEDDING_LIVE_PRICE_HALALAS,
      currency: 'SAR',
      description: weddingLiveInvoiceDescription(),
      success_url: successUrl(displayToken, request),
      back_url: `${storeOrigin()}/#/store/wedding`,
      callback_url: `${payOrigin(request)}/api/public-store-wedding-live`,
      expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      metadata: weddingLiveInvoiceMetadata(displayToken, body.affiliateCode),
    });
    if (created.status < 400) {
      try {
        const inv = JSON.parse(created.text) as { id?: string; url?: string };
        const id = String(inv.id || '').trim();
        const url = String(inv.url || '').trim();
        if (id && isAllowedMoyasarInvoiceUrl(url)) {
          invoiceUrl = url;
          await db
            .from(STORE_WEDDING_LIVE_TABLE)
            .update({
              moyasar_invoice_id: id,
              payload: { ...parsed.payload, moyasar_invoice_id: id, moyasar_invoice_url: url },
              updated_at: new Date().toISOString(),
            })
            .eq('display_token', displayToken);
        }
      } catch {
        invoiceUrl = '';
      }
    }
  }

  return json(
    {
      ok: true,
      token: displayToken,
      guestToken,
      hostToken,
      priceHalalas: STORE_WEDDING_LIVE_PRICE_HALALAS,
      payPath: `/pay/wedding/${displayToken}`,
      invoiceUrl,
      displayUrl: displayUrl(displayToken),
      guestUrl: guestUrl(guestToken),
      hostUrl: hostUrl(hostToken),
    },
    200,
    headers,
  );
}

async function markLive(db: Db, id: string, paymentId: string): Promise<boolean> {
  const { data: updated, error } = await db
    .from(STORE_WEDDING_LIVE_TABLE)
    .update({
      status: 'live',
      moyasar_payment_id: paymentId,
      last_public_change_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'pending_payment')
    .select('id, buyer_email, display_token, guest_token, host_token, expires_at')
    .maybeSingle();
  if (error) return false;
  if (updated) {
    const exp = updated.expires_at ? String(updated.expires_at).slice(0, 10) : '';
    void sendWeddingLiveLinksEmail({
      to: String(updated.buyer_email),
      displayUrl: displayUrl(String(updated.display_token)),
      guestUrl: guestUrl(String(updated.guest_token)),
      hostUrl: hostUrl(String(updated.host_token)),
      expiresLabel: exp,
    });
    void markStoreTrialConverted(db, String(updated.id));
    return true;
  }
  const { data: again } = await db.from(STORE_WEDDING_LIVE_TABLE).select('status').eq('id', id).maybeSingle();
  return again?.status === 'live';
}

async function fulfillFromPaymentId(db: Db, token: string, paymentId: string, headers: Record<string, string>) {
  const { data } = await db.from(STORE_WEDDING_LIVE_TABLE).select('*').eq('display_token', token).maybeSingle();
  if (!data) return json({ error: 'الطلب غير موجود' }, 404, headers);
  if (data.status === 'live') {
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
  if (Number(parsed.amount) !== STORE_WEDDING_LIVE_PRICE_HALALAS) {
    return json({ error: 'مبلغ الدفع لا يطابق الدعوة' }, 409, headers);
  }
  const metaOk = weddingLivePaymentMatches({ meta: parsed.metadata, token, amount: Number(parsed.amount) });
  if (!metaOk) {
    const invoiceId = invoiceIdFromPayload(data.payload) || String(parsed.invoice_id || '').trim();
    if (!invoiceId) return json({ error: 'وسم الدفع لا يطابق دعوة الزواج' }, 409, headers);
    const invoice = await fetchMoyasarInvoiceForOccasionCard(invoiceId);
    if (invoice.status >= 400) return json({ error: 'تعذر التحقق من الفاتورة' }, 502, headers);
    try {
      const inv = JSON.parse(invoice.text) as { amount?: number; metadata?: Record<string, unknown> };
      if (
        !weddingLivePaymentMatches({
          meta: inv.metadata,
          token,
          amount: Number(inv.amount),
        })
      ) {
        return json({ error: 'وسم الفاتورة لا يطابق دعوة الزواج' }, 409, headers);
      }
    } catch {
      return json({ error: 'تعذر قراءة الفاتورة' }, 502, headers);
    }
  }
  const ok = await markLive(db, String(data.id), paymentId);
  if (ok) {
    await creditStoreAffiliateLedger(db, {
      productTag: STORE_WEDDING_LIVE_PRODUCT,
      amountHalalas: Number(parsed.amount),
      paymentId,
      affiliateCode: storeAffiliateCodeFromMeta(parsed.metadata),
    });
  }
  if (!ok) return json({ error: 'تعذر تفعيل الدعوة' }, 409, headers);
  return json({ ok: true, token, displayUrl: displayUrl(token) }, 200, headers);
}

async function activatePaid(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  if (!isWeddingLiveCheckoutEnabled()) return json({ error: 'تحصيل دعوة الزواج مغلق حالياً.' }, 503, headers);
  const token = String(body.token || '').trim();
  const paymentId = String(body.paymentId || '').trim();
  if (!token || !paymentId) return json({ error: 'مرجع الدفع ناقص' }, 400, headers);
  return fulfillFromPaymentId(db, token, paymentId, headers);
}

async function syncPaid(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  if (!token) return json({ error: 'مرجع الدفع ناقص' }, 400, headers);
  const { data } = await db.from(STORE_WEDDING_LIVE_TABLE).select('*').eq('display_token', token).maybeSingle();
  if (!data) return json({ error: 'الطلب غير موجود' }, 404, headers);
  if (data.status === 'live') return json({ ok: true, token, displayUrl: displayUrl(token) }, 200, headers);
  const invoiceId = String(data.moyasar_invoice_id || invoiceIdFromPayload(data.payload) || '').trim();
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
    if (Number(parsed.amount) !== STORE_WEDDING_LIVE_PRICE_HALALAS) {
      return json({ error: 'مبلغ الفاتورة لا يطابق الدعوة' }, 409, headers);
    }
    if (!weddingLivePaymentMatches({ meta: parsed.metadata, token, amount: Number(parsed.amount) })) {
      return json({ error: 'وسم الفاتورة لا يطابق دعوة الزواج' }, 409, headers);
    }
    const paid = (parsed.payments || []).find((item) => moyasarPaymentIsPaid(String(item.status || '')));
    const paymentId = String(paid?.id || `invoice:${invoiceId}`);
    const ok = await markLive(db, String(data.id), paymentId);
    if (ok) {
      await creditStoreAffiliateLedger(db, {
        productTag: STORE_WEDDING_LIVE_PRODUCT,
        amountHalalas: Number(parsed.amount),
        paymentId,
        affiliateCode: storeAffiliateCodeFromMeta(parsed.metadata),
      });
    }
    if (!ok) return json({ error: 'تعذر تفعيل الدعوة' }, 409, headers);
    return json({ ok: true, token, displayUrl: displayUrl(token) }, 200, headers);
  } catch {
    return json({ error: 'تعذر قراءة الفاتورة' }, 502, headers);
  }
}

async function claimGuestSeatAction(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  const deviceHash = String(body.deviceHash || '').trim();
  if (!token || !deviceHash) return json({ error: 'مقعد الضيف ناقص', blocked: true }, 403, headers);
  const { data } = await db.from(STORE_WEDDING_LIVE_TABLE).select('id, status, payload').eq('guest_token', token).maybeSingle();
  if (!data || data.status !== 'live') return json({ error: 'رابط الضيف غير صالح', blocked: true }, 404, headers);
  const payload = { ...(data.payload as WeddingLiveOrderPayload & { guestSeats?: unknown; guestInvites?: unknown }) };
  const claimed = claimGuestSeat(parseGuestSeats(payload.guestSeats), parseGuestInvites(payload.guestInvites), {
    seatId: String(body.seatId || ''),
    inviteId: String(body.inviteId || ''),
    deviceHash,
  });
  if (!claimed.ok) return json({ ok: false, blocked: true, error: 'الدعوة لا تُقبل إلا من رابط أصدره المشتري' }, 403, headers);
  payload.guestSeats = claimed.seats;
  payload.guestInvites = claimed.stamps;
  await db.from(STORE_WEDDING_LIVE_TABLE).update({ payload, updated_at: new Date().toISOString() }).eq('id', data.id);
  return json({ ok: true, seatId: claimed.seatId }, 200, headers);
}

function hostInvitePayload(baseGuestUrl: string, stamps: ReturnType<typeof parseGuestInvites>) {
  return {
    ok: true,
    stats: guestInviteStats(stamps),
    invites: summarizeGuestInvites(stamps, baseGuestUrl),
  };
}

async function loadHostInvites(db: Db, token: string) {
  const { data } = await db
    .from(STORE_WEDDING_LIVE_TABLE)
    .select('id, status, guest_token, payload')
    .eq('host_token', token)
    .maybeSingle();
  if (!data || data.status !== 'live') return null;
  return data;
}

async function mintGuestInviteAction(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  if (!token) return json({ error: 'رابط المضيف غير صالح' }, 400, headers);
  const data = await loadHostInvites(db, token);
  if (!data) return json({ error: 'رابط المضيف غير صالح' }, 404, headers);
  const payload = { ...(data.payload as WeddingLiveOrderPayload & { guestInvites?: unknown }) };
  const minted = mintGuestInviteBatch(parseGuestInvites(payload.guestInvites), Number(body.count) || 200);
  payload.guestInvites = minted.stamps;
  await db.from(STORE_WEDDING_LIVE_TABLE).update({ payload, updated_at: new Date().toISOString() }).eq('id', data.id);
  const base = guestUrl(String(data.guest_token));
  return json({ ...hostInvitePayload(base, minted.stamps), created: minted.created.length }, 200, headers);
}

async function listGuestInvitesAction(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  if (!token) return json({ error: 'رابط المضيف غير صالح' }, 400, headers);
  const data = await loadHostInvites(db, token);
  if (!data) return json({ error: 'رابط المضيف غير صالح' }, 404, headers);
  const stamps = parseGuestInvites((data.payload as { guestInvites?: unknown }).guestInvites);
  return json(hostInvitePayload(guestUrl(String(data.guest_token)), stamps), 200, headers);
}

async function markGuestInviteSentAction(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  if (!token) return json({ error: 'رابط المضيف غير صالح' }, 400, headers);
  const data = await loadHostInvites(db, token);
  if (!data) return json({ error: 'رابط المضيف غير صالح' }, 404, headers);
  const payload = { ...(data.payload as WeddingLiveOrderPayload & { guestInvites?: unknown }) };
  const batchIds = Array.isArray(body.inviteIds) ? body.inviteIds : null;
  const stamps = parseGuestInvites(payload.guestInvites);
  const base = guestUrl(String(data.guest_token));
  if (batchIds) {
    const marked = markGuestInvitesSent(stamps, batchIds);
    if (!marked.ok) return json({ error: 'الرابط غير صالح أو مستهلك' }, 404, headers);
    payload.guestInvites = marked.stamps;
    await db.from(STORE_WEDDING_LIVE_TABLE).update({ payload, updated_at: new Date().toISOString() }).eq('id', data.id);
    return json({ ...hostInvitePayload(base, marked.stamps), marked: marked.marked }, 200, headers);
  }
  const marked = markGuestInviteSent(stamps, String(body.inviteId || ''));
  if (!marked.ok) return json({ error: 'الرابط غير صالح أو مستهلك' }, 404, headers);
  payload.guestInvites = marked.stamps;
  await db.from(STORE_WEDDING_LIVE_TABLE).update({ payload, updated_at: new Date().toISOString() }).eq('id', data.id);
  return json({
    ...hostInvitePayload(base, marked.stamps),
    inviteId: marked.stamp.id,
    guestUrl: `${base}?invite=${encodeURIComponent(marked.stamp.id)}`,
  }, 200, headers);
}

async function addBlessing(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  const name = String(body.name || '').replace(/\s+/g, ' ').trim().slice(0, 40);
  const cannedText = String(body.cannedText || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  const extra = String(body.extra || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  if (!token || name.length < 2 || !cannedText) return json({ error: 'التهنئة ناقصة' }, 400, headers);
  const { data } = await db.from(STORE_WEDDING_LIVE_TABLE).select('id, status, payload').eq('guest_token', token).maybeSingle();
  if (!data || data.status !== 'live') return json({ error: 'رابط الضيف غير صالح' }, 404, headers);
  const payload = { ...(data.payload as WeddingLiveOrderPayload & { guestSeats?: unknown }) };
  if (
    !guestSeatMatches(
      parseGuestSeats(payload.guestSeats),
      String(body.seatId || ''),
      String(body.deviceHash || ''),
    )
  ) {
    return json({ error: 'الدعوة مربوطة بجهاز المدعو', blocked: true }, 403, headers);
  }
  const blessings = Array.isArray(payload.blessings) ? payload.blessings : [];
  blessings.push({
    id: `${Date.now()}`,
    name,
    cannedId: String(body.cannedId || '').slice(0, 24),
    cannedText,
    extra,
    hidden: false,
    at: new Date().toISOString(),
  });
  payload.blessings = blessings.slice(-80);
  await db
    .from(STORE_WEDDING_LIVE_TABLE)
    .update({ payload, last_public_change_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', data.id);
  return json({ ok: true }, 200, headers);
}

async function saveHost(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  if (!token) return json({ error: 'رابط المضيف غير صالح' }, 400, headers);
  const { data } = await db.from(STORE_WEDDING_LIVE_TABLE).select('id, status, payload').eq('host_token', token).maybeSingle();
  if (!data || data.status !== 'live') return json({ error: 'رابط المضيف غير صالح' }, 404, headers);
  const current = { ...(data.payload as WeddingLiveOrderPayload) };
  const voice = parseWeddingVoice(current.voice);
  const next: WeddingLiveOrderPayload = {
    ...current,
    voice,
    hostRole: parseWeddingHostRole(body.hostRole ?? current.hostRole, voice),
    hostName: String(body.hostName ?? current.hostName).slice(0, 80),
    offspringKind: String(body.offspringKind ?? current.offspringKind).trim() === 'daughter' ? 'daughter' : 'son',
    groomName: String(body.groomName ?? current.groomName).slice(0, 80),
    brideName: String(body.brideName ?? current.brideName).slice(0, 80),
    eventDate: String(body.eventDate ?? current.eventDate).slice(0, 80),
    eventDateEn: String(body.eventDateEn ?? current.eventDateEn ?? '').slice(0, 80),
    eventTime: String(body.eventTime ?? current.eventTime).slice(0, 80),
    venueKind: (['hall', 'resthouse', 'hotel', 'other'] as const).includes(
      String(body.venueKind ?? current.venueKind) as 'hall',
    )
      ? (String(body.venueKind ?? current.venueKind) as WeddingLiveOrderPayload['venueKind'])
      : 'hall',
    venueName: String(body.venueName ?? current.venueName).slice(0, 120),
    venueMapsUrl: String(body.venueMapsUrl ?? current.venueMapsUrl).slice(0, 500),
    invitationAr: String(body.invitationAr ?? current.invitationAr ?? '').slice(0, 800),
    kickerAr: String(body.kickerAr ?? current.kickerAr ?? '').slice(0, 80),
    welcomeAr: String(body.welcomeAr ?? current.welcomeAr).slice(0, 400),
    welcomeSetIndex: Math.max(
      0,
      Math.min(99, Number(body.welcomeSetIndex ?? current.welcomeSetIndex) || 0),
    ),
    welcomeLinesAr: Array.isArray(body.welcomeLinesAr)
      ? parseWeddingWelcomeLinesAr(body.welcomeLinesAr)
      : parseWeddingWelcomeLinesAr(current.welcomeLinesAr),
    youtubeUrl: String(body.youtubeUrl ?? current.youtubeUrl).slice(0, 300),
    youtubeHidden: body.youtubeHidden == null ? current.youtubeHidden : Boolean(body.youtubeHidden),
    announcement: String(body.announcement ?? current.announcement).slice(0, 160),
    photoSrc: String(body.photoSrc ?? current.photoSrc).slice(0, 350000),
    panoramaSrc: String(body.panoramaSrc ?? current.panoramaSrc).slice(0, 350000),
    blessings: Array.isArray(body.blessings) ? (body.blessings as WeddingLiveOrderPayload['blessings']) : current.blessings,
  };
  await db
    .from(STORE_WEDDING_LIVE_TABLE)
    .update({ payload: next, last_public_change_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', data.id);
  return json({ ok: true }, 200, headers);
}
