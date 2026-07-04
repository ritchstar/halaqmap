import type { SupabaseClient } from '@supabase/supabase-js';
import { creditWalletFromTopup } from './digitalShiftAssistant.js';
import { dispatchWalletTopupReceiptEmail } from './walletTopupReceiptMail.js';
import {
  netCreditHalalasFromCharged,
  repliesFromHalalas,
  walletTopupPackageByChargedHalalas,
  walletTopupPackageBySku,
} from './digitalShiftWalletTopup.js';
import {
  fetchMoyasarPayment,
  moyasarPaymentIsPaid,
  resolveMoyasarApiBase,
  resolveMoyasarSecretKey,
  secretKeyLooksValid,
} from './moyasarApiClient.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type MoyasarPaymentJson = {
  id?: string;
  status?: string;
  amount?: number;
  currency?: string;
  /** يُملأ عندما تنشأ الدفعة من فاتورة ميسر — إشارة مصدر موثوق (أُنشئت بمفتاح سري). */
  invoice_id?: string | null;
  metadata?: Record<string, unknown> | null;
  source?: Record<string, unknown> | null;
};

export type WalletTopupFulfillmentResult =
  | {
      ok: true;
      alreadyCredited: boolean;
      barberId: string;
      walletSku: string;
      chargedHalalas: number;
      creditedHalalas: number;
      balanceHalalas: number;
      repliesRemaining: number;
    }
  | { ok: false; error: string; status: number };

function isWalletTopupMeta(meta: Record<string, unknown>): boolean {
  const pt = String(meta.product_type ?? meta.productType ?? '').trim().toLowerCase();
  const product = String(meta.product ?? '').trim().toLowerCase();
  return pt === 'wallet_topup' || product === 'wallet_topup';
}

async function resolveBarberIdForTopup(
  supabase: SupabaseClient,
  meta: Record<string, unknown>,
  payment: MoyasarPaymentJson,
): Promise<string | null> {
  // (1) barber_id صريح من الجلسة الموثّقة (يُمرَّر من الواجهة داخل اللوحة).
  const fromMeta = String(meta.linked_barber_id ?? meta.linkedBarberId ?? '').trim();
  if (UUID_RE.test(fromMeta)) {
    const { data } = await supabase.from('barbers').select('id').eq('id', fromMeta).maybeSingle();
    if (data?.id) return String(data.id);
  }

  // (2) عبر بريد الحلاق (الآلية المعتمدة) — من metadata أو مصدر الدفع.
  const metaEmail = String(meta.buyer_email ?? meta.buyerEmail ?? '').trim();
  const src = payment.source;
  const srcEmail =
    src && typeof src === 'object'
      ? (() => {
          const e = String((src as Record<string, unknown>).email ?? '').trim();
          if (e.includes('@')) return e;
          const n = String((src as Record<string, unknown>).number ?? '').trim();
          return n.includes('@') ? n : '';
        })()
      : '';
  const email = (metaEmail.includes('@') ? metaEmail : '') || srcEmail;
  if (email.includes('@')) {
    const { data } = await supabase
      .from('barbers')
      .select('id')
      .ilike('email', email)
      .limit(1)
      .maybeSingle();
    if (data?.id) return String(data.id);
  }

  return null;
}

/**
 * شحن المحفظة من دفعة ميسر ناجحة — يُستدعى من الـ webhook (موثوق) ومن مسار الواجهة (poll).
 * يتحقق من الدفع لدى ميسر ثم يشحن الرصيد الصافي بشكل idempotent.
 */
export async function syncWalletTopupFulfillment(
  supabase: SupabaseClient,
  paymentId: string,
  options?: { prefetched?: MoyasarPaymentJson },
): Promise<WalletTopupFulfillmentResult> {
  const normalizedPaymentId = paymentId.trim();
  if (!UUID_RE.test(normalizedPaymentId)) {
    return { ok: false, error: 'invalid_payment_id', status: 400 };
  }

  let payment = options?.prefetched ?? null;

  if (!payment) {
    const secret = resolveMoyasarSecretKey();
    if (!secret || !secretKeyLooksValid(secret)) {
      return { ok: false, error: 'moyasar_disabled', status: 503 };
    }
    let upstream: Awaited<ReturnType<typeof fetchMoyasarPayment>>;
    try {
      upstream = await fetchMoyasarPayment(normalizedPaymentId, secret, resolveMoyasarApiBase());
    } catch {
      return { ok: false, error: 'upstream_network', status: 502 };
    }
    if (upstream.status < 200 || upstream.status >= 300) {
      return { ok: false, error: 'moyasar_error', status: upstream.status === 404 ? 404 : 502 };
    }
    try {
      payment = JSON.parse(upstream.text) as MoyasarPaymentJson;
    } catch {
      return { ok: false, error: 'invalid_upstream', status: 502 };
    }
  }

  if (!payment || !moyasarPaymentIsPaid(String(payment.status ?? ''))) {
    return { ok: false, error: 'payment_not_paid', status: 409 };
  }

  const meta =
    payment.metadata && typeof payment.metadata === 'object' && !Array.isArray(payment.metadata)
      ? (payment.metadata as Record<string, unknown>)
      : {};

  if (!isWalletTopupMeta(meta)) {
    return { ok: false, error: 'not_wallet_topup', status: 409 };
  }

  const chargedHalalas =
    typeof payment.amount === 'number' && Number.isFinite(payment.amount)
      ? Math.trunc(payment.amount)
      : null;
  if (chargedHalalas == null || chargedHalalas < 100) {
    return { ok: false, error: 'invalid_amount', status: 409 };
  }

  // مصدر موثوق: الدفعة نشأت من فاتورة ميسر (تُنشأ بمفتاح سري لدى الإدارة فقط).
  const fromInvoice = String(payment.invoice_id ?? '').trim().length > 0;
  const skuFromMeta = String(meta.wallet_sku ?? meta.walletSku ?? '').trim().toLowerCase();

  let resolvedSku: string;
  if (fromInvoice) {
    // فاتورة يدوية: تُقبل أي قيمة (قد تكون تفاوضية). الرصيد = الصافي بعد الضريبة.
    const bySku = walletTopupPackageBySku(skuFromMeta);
    resolvedSku = bySku ? bySku.sku : skuFromMeta || 'wallet_topup_custom';
  } else {
    // شحن ذاتي من النموذج العام: يجب مطابقة باقة معتمدة (منع مبالغ اعتباطية).
    const pkgBySku = walletTopupPackageBySku(skuFromMeta);
    const pkgByAmount = walletTopupPackageByChargedHalalas(chargedHalalas);
    const pkg = pkgByAmount ?? pkgBySku;
    if (!pkg || (pkgBySku && pkgBySku.chargedHalalas !== chargedHalalas)) {
      return { ok: false, error: 'wallet_topup_amount_mismatch', status: 409 };
    }
    resolvedSku = pkg.sku;
  }

  const currency = String(payment.currency ?? 'SAR').toUpperCase() || 'SAR';
  if (currency !== 'SAR') {
    return { ok: false, error: 'wallet_topup_currency_mismatch', status: 409 };
  }

  const barberId = await resolveBarberIdForTopup(supabase, meta, payment);
  if (!barberId) {
    return { ok: false, error: 'wallet_topup_barber_unresolved', status: 409 };
  }

  const creditedHalalas = netCreditHalalasFromCharged(chargedHalalas);
  const buyerEmail =
    String(meta.buyer_email ?? meta.buyerEmail ?? '').trim() ||
    (payment.source && typeof payment.source === 'object'
      ? String((payment.source as Record<string, unknown>).email ?? '').trim()
      : '');

  const credit = await creditWalletFromTopup(supabase, {
    barberId,
    moyasarPaymentId: normalizedPaymentId,
    walletSku: resolvedSku,
    chargedHalalas,
    creditedHalalas,
    currency,
    buyerEmail: buyerEmail || null,
    source: fromInvoice ? 'moyasar_invoice' : 'moyasar',
    metadata: { moyasar_meta_product: 'wallet_topup', from_invoice: fromInvoice },
  });

  if (!credit.ok) {
    return { ok: false, error: credit.error, status: 500 };
  }

  // إيصال شحن للمشتري — فقط عند شحن جديد (ليس idempotent-hit) وبشكل غير معطِّل:
  // أي فشل في البريد لا يؤثر على نتيجة الشحن.
  if (!credit.alreadyCredited) {
    await dispatchWalletTopupReceiptEmail(supabase, {
      barberId,
      buyerEmail: buyerEmail || null,
      walletSku: resolvedSku,
      chargedHalalas,
      creditedHalalas,
      balanceHalalas: credit.balanceHalalas,
      paymentId: normalizedPaymentId,
      source: fromInvoice ? 'moyasar_invoice' : 'moyasar',
    }).catch(() => undefined);
  }

  return {
    ok: true,
    alreadyCredited: credit.alreadyCredited,
    barberId,
    walletSku: resolvedSku,
    chargedHalalas,
    creditedHalalas: credit.alreadyCredited ? 0 : credit.creditedHalalas,
    balanceHalalas: credit.balanceHalalas,
    repliesRemaining: repliesFromHalalas(credit.balanceHalalas),
  };
}
