/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * اشتراك حلانا1 عبر ميسر. لا يمس طلب العميلة.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  fetchMoyasarPaymentForOccasionCard,
  moyasarPaymentIsPaid,
} from './moyasarApiClient.js';
import { creditStoreAffiliateLedger } from './storeAffiliateLedger.js';
import { storeAffiliateCodeFromMeta } from './storeAffiliateCode.js';
import { markStoreTrialConverted } from './storeProductTrial.js';
import {
  STORE_HALANA_COPIES_TABLE,
  STORE_HALANA_LIVE_PRODUCT,
  findHalanaCopy,
  halanaChargeHalalas,
  halanaDaysForAmount,
  isHalanaEmail,
  isHalanaLiveCheckoutEnabled,
  isHalanaPriceHalalas,
  newHalanaToken,
  normalizeHalanaEmail,
  parseHalanaPackId,
} from './storeHalanaLive.js';

type Db = SupabaseClient;

function clip(raw: unknown, max: number): string {
  return String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function termEndIso(days: number, from = Date.now()): string {
  return new Date(from + days * 24 * 60 * 60 * 1000).toISOString();
}

function isExpired(expiresAt: unknown): boolean {
  const ms = Date.parse(String(expiresAt || ''));
  return Number.isFinite(ms) && ms <= Date.now();
}

function paymentMatches(meta: Record<string, unknown> | undefined, token: string, amount: number): boolean {
  if (!isHalanaPriceHalalas(amount)) return false;
  if (!meta || typeof meta !== 'object') return false;
  const product = String(meta.product_type ?? meta.productType ?? meta.product ?? '')
    .trim()
    .toLowerCase();
  const metaToken = String(meta.store_halana_token ?? meta.storeHalanaToken ?? meta.token ?? '').trim();
  return product === STORE_HALANA_LIVE_PRODUCT && metaToken === token;
}

async function markLive(db: Db, id: string, paymentId: string, amount: number): Promise<boolean> {
  const days = halanaDaysForAmount(amount);
  if (!days) return false;
  const now = new Date().toISOString();
  const { data: current } = await db
    .from(STORE_HALANA_COPIES_TABLE)
    .select('id, status, moyasar_payment_id, expires_at')
    .eq('id', id)
    .maybeSingle();
  if (!current) return false;
  if (
    (current.status === 'live' || current.status === 'issued') &&
    String(current.moyasar_payment_id || '') === paymentId &&
    !isExpired(current.expires_at)
  ) {
    return true;
  }
  const { data: updated } = await db
    .from(STORE_HALANA_COPIES_TABLE)
    .update({
      status: 'live',
      moyasar_payment_id: paymentId,
      price_halalas: amount,
      paid_at: now,
      expires_at: termEndIso(days),
      is_trial: false,
      updated_at: now,
    })
    .eq('id', id)
    .in('status', ['pending_payment', 'pending_renewal', 'expired', 'live', 'issued'])
    .select('id')
    .maybeSingle();
  if (updated) {
    await markStoreTrialConverted(db, id);
    return true;
  }
  const { data: again } = await db.from(STORE_HALANA_COPIES_TABLE).select('status').eq('id', id).maybeSingle();
  return again?.status === 'live';
}

export async function createHalanaPending(
  db: Db,
  body: Record<string, unknown>,
): Promise<{ ok: true; token: string; deskToken: string; priceHalalas: number } | { ok: false; error: string; status?: number }> {
  if (!isHalanaLiveCheckoutEnabled()) return { ok: false, error: 'تحصيل حلانا1 مغلق حالياً.', status: 503 };
  const renewToken = String(body.renewToken || '').trim();
  const packId = parseHalanaPackId(body.packId);
  const charge = halanaChargeHalalas(packId);
  const email = normalizeHalanaEmail(body.email);
  if (!isHalanaEmail(email)) return { ok: false, error: 'أدخل بريداً صالحاً.', status: 400 };

  if (renewToken) {
    const row =
      (await findHalanaCopy(db, renewToken, 'shop')) || (await findHalanaCopy(db, renewToken, 'desk'));
    if (!row) return { ok: false, error: 'الرابط غير موجود.', status: 404 };
    if (String(row.status) === 'closed') return { ok: false, error: 'هذا التشغيل ملغى.', status: 403 };
    if (String(row.status) === 'pending_payment') {
      return {
        ok: true,
        token: String(row.shop_token),
        deskToken: String(row.desk_token),
        priceHalalas: Number(row.price_halalas) || charge,
      };
    }
    if ((String(row.status) === 'live' || String(row.status) === 'issued') && !isExpired(row.expires_at) && row.expires_at) {
      return { ok: false, error: 'التشغيل ما زال سارياً. إعادة الشراء بعد انتهاء المدة.', status: 409 };
    }
    await db
      .from(STORE_HALANA_COPIES_TABLE)
      .update({
        status: 'pending_renewal',
        pack_id: packId,
        price_halalas: charge,
        buyer_email: email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);
    return {
      ok: true,
      token: String(row.shop_token),
      deskToken: String(row.desk_token),
      priceHalalas: charge,
    };
  }

  const name = clip(body.shopName || body.buyerName, 80);
  if (name.length < 2) return { ok: false, error: 'أدخل اسم المتخصصة.', status: 400 };
  const shopToken = newHalanaToken();
  const deskToken = newHalanaToken();
  const { error } = await db.from(STORE_HALANA_COPIES_TABLE).insert({
    status: 'pending_payment',
    specialist_name: name,
    shop_name: name,
    beneficiary_email: email,
    buyer_name: name,
    buyer_email: email,
    shop_token: shopToken,
    desk_token: deskToken,
    pack_id: packId,
    price_halalas: charge,
    is_trial: false,
  });
  if (error) return { ok: false, error: 'تعذر إنشاء طلب التشغيل.', status: 500 };
  return { ok: true, token: shopToken, deskToken, priceHalalas: charge };
}

export async function readHalanaPay(
  db: Db,
  token: string,
): Promise<{ ok: true; status: string; priceHalalas: number; shopName: string; invoiceUrl: string } | { ok: false; error: string; status?: number }> {
  const row = await findHalanaCopy(db, token, 'shop');
  if (!row) return { ok: false, error: 'الرابط غير موجود.', status: 404 };
  return {
    ok: true,
    status: String(row.status || ''),
    priceHalalas: Number(row.price_halalas) || 0,
    shopName: String(row.shop_name || row.specialist_name || ''),
    invoiceUrl: '',
  };
}

export async function activateHalanaPaid(
  db: Db,
  token: string,
  paymentId: string,
): Promise<{ ok: true; token: string } | { ok: false; error: string; status?: number }> {
  if (!isHalanaLiveCheckoutEnabled()) return { ok: false, error: 'تحصيل حلانا1 مغلق حالياً.', status: 503 };
  const row = await findHalanaCopy(db, token, 'shop');
  if (!row) return { ok: false, error: 'الطلب غير موجود.', status: 404 };
  if (
    (String(row.status) === 'live' || String(row.status) === 'issued') &&
    String(row.moyasar_payment_id || '') === paymentId &&
    !isExpired(row.expires_at)
  ) {
    return { ok: true, token };
  }
  const upstream = await fetchMoyasarPaymentForOccasionCard(paymentId);
  if (upstream.status >= 400) return { ok: false, error: 'تعذر التحقق من الدفع.', status: 502 };
  let parsed: { status?: string; amount?: number; metadata?: Record<string, unknown> };
  try {
    parsed = JSON.parse(upstream.text) as typeof parsed;
  } catch {
    return { ok: false, error: 'تعذر قراءة نتيجة الدفع.', status: 502 };
  }
  if (!moyasarPaymentIsPaid(String(parsed.status || ''))) return { ok: false, error: 'الدفع لم يكتمل.', status: 402 };
  if (!isHalanaPriceHalalas(Number(parsed.amount)) || (Number(row.price_halalas) > 0 && Number(parsed.amount) !== Number(row.price_halalas))) {
    return { ok: false, error: 'مبلغ الدفع لا يطابق باقة حلانا1.', status: 409 };
  }
  if (!paymentMatches(parsed.metadata, token, Number(parsed.amount))) {
    return { ok: false, error: 'وسم الدفع لا يطابق حلانا1.', status: 409 };
  }
  const ok = await markLive(db, String(row.id), paymentId, Number(parsed.amount));
  if (ok) {
    await creditStoreAffiliateLedger(db, {
      productTag: STORE_HALANA_LIVE_PRODUCT,
      amountHalalas: Number(parsed.amount),
      paymentId,
      affiliateCode: storeAffiliateCodeFromMeta(parsed.metadata),
    });
  }
  if (!ok) return { ok: false, error: 'تعذر تفعيل التشغيل.', status: 409 };
  return { ok: true, token };
}

export async function syncHalanaPaid(
  db: Db,
  token: string,
): Promise<{ ok: true; token: string } | { ok: false; error: string; status?: number }> {
  const row = await findHalanaCopy(db, token, 'shop');
  if (!row) return { ok: false, error: 'الطلب غير موجود.', status: 404 };
  if ((String(row.status) === 'live' || String(row.status) === 'issued') && !isExpired(row.expires_at)) {
    return { ok: true, token };
  }
  return { ok: false, error: 'لا فاتورة للمزامنة.', status: 400 };
}
