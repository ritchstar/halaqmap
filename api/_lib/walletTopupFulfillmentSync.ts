import type { SupabaseClient } from '@supabase/supabase-js';
import { clawbackWalletTopupOnRefund, creditWalletFromTopup } from './digitalShiftAssistant.js';
import { dispatchWalletTopupReceiptEmail } from './walletTopupReceiptMail.js';
import {
  chargedWithCanonicalVat,
  repliesFromHalalas,
  walletTopupPackageAcceptingCharged,
  walletTopupPackageBySku,
} from './digitalShiftWalletTopup.js';
import { baseFromChargedWithVat, getPlatformVatConfig } from './platformVatConfig.js';
import {
  fetchMoyasarPayment,
  moyasarPaymentIsPaid,
  moyasarPaymentRequiresWalletClawback,
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

  // إعداد الضريبة الحيّ (مصدر الحقيقة: علم ZATCA). مطفأ افتراضياً.
  const vatCfg = await getPlatformVatConfig(supabase);

  let resolvedSku: string;
  let creditedHalalas: number;
  if (fromInvoice) {
    // فاتورة يدوية: تُقبل أي قيمة (قد تكون تفاوضية). الرصيد الصافي = واعٍ بحالة الضريبة.
    const bySku = walletTopupPackageBySku(skuFromMeta);
    resolvedSku = bySku ? bySku.sku : skuFromMeta || 'wallet_topup_custom';
    creditedHalalas = baseFromChargedWithVat(chargedHalalas, vatCfg);
  } else {
    // شحن ذاتي: يجب مطابقة باقة معتمدة، ويُقبل المبلغ = الأساسي أو الأساسي + 15% (canonical)
    // بمنأى عن حالة العلم لحظة إنشاء الدفعة. الرصيد المُضاف = الأساسي الثابت.
    const pkg = walletTopupPackageBySku(skuFromMeta) ?? walletTopupPackageAcceptingCharged(chargedHalalas);
    const amountAccepted =
      pkg != null &&
      (chargedHalalas === pkg.baseHalalas || chargedHalalas === chargedWithCanonicalVat(pkg.baseHalalas));
    if (!pkg || !amountAccepted) {
      return { ok: false, error: 'wallet_topup_amount_mismatch', status: 409 };
    }
    resolvedSku = pkg.sku;
    creditedHalalas = pkg.baseHalalas;
  }

  if (!Number.isFinite(creditedHalalas) || creditedHalalas <= 0) {
    return { ok: false, error: 'wallet_topup_amount_mismatch', status: 409 };
  }

  const currency = String(payment.currency ?? 'SAR').toUpperCase() || 'SAR';
  if (currency !== 'SAR') {
    return { ok: false, error: 'wallet_topup_currency_mismatch', status: 409 };
  }

  const barberId = await resolveBarberIdForTopup(supabase, meta, payment);
  if (!barberId) {
    return { ok: false, error: 'wallet_topup_barber_unresolved', status: 409 };
  }

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

export type WalletTopupClawbackResult =
  | {
      ok: true;
      alreadyClawedBack: boolean;
      clawedHalalas: number;
      balanceHalalas: number;
      barberId: string;
      moyasarStatus: string;
    }
  | { ok: false; error: string; status: number };

/**
 * سحب رصيد شحن محفظة بعد استرجاع/إلغاء دفعة ميسر.
 * يتحقق من حالة الدفع لدى ميسر قبل الخصم (لا يُسمح بسحب عشوائي من الواجهة العامة).
 */
export async function syncWalletTopupClawback(
  supabase: SupabaseClient,
  moyasarPaymentId: string,
): Promise<WalletTopupClawbackResult> {
  const normalizedPaymentId = String(moyasarPaymentId ?? '').trim();
  if (!UUID_RE.test(normalizedPaymentId)) {
    return { ok: false, error: 'invalid_payment_id', status: 400 };
  }

  const secret = resolveMoyasarSecretKey();
  if (!secretKeyLooksValid(secret)) {
    return { ok: false, error: 'moyasar_secret_missing', status: 503 };
  }

  const apiBase = resolveMoyasarApiBase();
  let payment: MoyasarPaymentJson | null = null;
  try {
    const upstream = await fetchMoyasarPayment(normalizedPaymentId, secret, apiBase);
    if (upstream.status === 404) {
      return { ok: false, error: 'payment_not_found', status: 404 };
    }
    if (upstream.status < 200 || upstream.status >= 300) {
      return { ok: false, error: 'moyasar_upstream_error', status: 502 };
    }
    payment = JSON.parse(upstream.text) as MoyasarPaymentJson;
  } catch {
    return { ok: false, error: 'invalid_upstream', status: 502 };
  }

  const moyasarStatus = String(payment?.status ?? '').trim().toLowerCase();
  if (!moyasarPaymentRequiresWalletClawback(moyasarStatus)) {
    return { ok: false, error: 'payment_not_refunded', status: 409 };
  }

  const meta =
    payment?.metadata && typeof payment.metadata === 'object' && !Array.isArray(payment.metadata)
      ? (payment.metadata as Record<string, unknown>)
      : {};

  // اسمح بالسحب إن كانت metadata شحن محفظة، أو إن وُجد سجل topup محلياً (حماية من metadata ناقصة).
  if (!isWalletTopupMeta(meta)) {
    const { data: localTopup } = await supabase
      .from('barber_ai_wallet_topups')
      .select('moyasar_payment_id')
      .eq('moyasar_payment_id', normalizedPaymentId)
      .maybeSingle();
    if (!localTopup) {
      return { ok: false, error: 'not_wallet_topup', status: 409 };
    }
  }

  const claw = await clawbackWalletTopupOnRefund(supabase, normalizedPaymentId);
  if (!claw.ok) {
    return { ok: false, error: claw.error, status: claw.status ?? 500 };
  }

  return {
    ok: true,
    alreadyClawedBack: claw.alreadyClawedBack,
    clawedHalalas: claw.clawedHalalas,
    balanceHalalas: claw.balanceHalalas,
    barberId: claw.barberId,
    moyasarStatus,
  };
}
