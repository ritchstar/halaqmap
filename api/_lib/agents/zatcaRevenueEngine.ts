import type { SupabaseClient } from '@supabase/supabase-js';
import { isMissingDbRelationError } from '../financialOfficeCoordination.js';
import {
  ZATCA_MANDATORY_LIMIT_HALALAS,
  ZATCA_RUN_RATE_HORIZON_DAYS,
  ZATCA_SOFT_ALERT_HALALAS,
  ZATCA_VOLUNTARY_LIMIT_HALALAS,
  type ZatcaEarlyWarningSignal,
  type ZatcaRevenueAnalytics,
  type ZatcaRevenueOrderRow,
  type ZatcaWarningLevel,
} from './zatcaTaxTypes.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const ZATCA_WARNING_COPY_AR: Record<ZatcaWarningLevel, string> = {
  soft_voluntary_half:
    'إشعار استباقي: نمو المدخول مستقر، نوصي بمراجعة متطلبات زكاة المنشأة التقديرية.',
  voluntary_limit: 'تنبيه نظامي: تم بلوغ حد التسجيل الاختياري لهيئة الزكاة والدخل.',
  critical_run_rate:
    'تحذير حرج: بناءً على تحليل الإيرادات الحالي، ستتجاوز المنصة حد التسجيل الإلزامي خلال 30 يوماً. يرجى تجهيز الأوراق الضريبية فوراً.',
  mandatory_breached:
    'خبير ZATCA: تم رصد بلوغ الحد الإلزامي. كافة الحسب والتقارير جاهزة بنسبة 15%. يرجى مراجعة شهادة التسجيل والضغط على «التفعيل الفوري الحي».',
};

function halalasToSar(halalas: number): number {
  return Math.round(halalas) / 100;
}

function paymentAmountToHalalas(amount: number | string | null): number {
  const n = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
}

function pickPaidAt(row: { paid_at?: string | null; created_at?: string | null }): string {
  const raw = row.paid_at || row.created_at;
  return raw ? String(raw) : new Date().toISOString();
}

type ListingLicenseOrderDbRow = {
  id: string;
  amount_halalas: number | string | null;
  paid_at: string | null;
  created_at: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
};

type LegacyPaymentDbRow = {
  id: string;
  amount: number | string | null;
  paid_at: string | null;
  created_at: string | null;
  status: string;
  transaction_id: string | null;
};

/** Unified paid revenue stream from listing software packages (primary) + legacy payments. */
export async function loadPlatformRevenueOrders(
  supabase: SupabaseClient,
): Promise<ZatcaRevenueOrderRow[]> {
  const [ordersRes, paymentsRes] = await Promise.all([
    supabase
      .from('listing_license_orders')
      .select('id, amount_halalas, paid_at, created_at, status, metadata')
      .eq('status', 'paid')
      .order('paid_at', { ascending: true, nullsFirst: false }),
    supabase
      .from('payments')
      .select('id, amount, paid_at, created_at, status, transaction_id')
      .eq('status', 'completed')
      .order('paid_at', { ascending: true, nullsFirst: false }),
  ]);

  if (ordersRes.error) {
    if (isMissingDbRelationError(ordersRes.error.message)) {
      console.warn('[zatca-radar] listing_license_orders unavailable:', ordersRes.error.message);
    } else {
      throw new Error(`listing_license_orders: ${ordersRes.error.message}`);
    }
  }
  if (paymentsRes.error) {
    if (isMissingDbRelationError(paymentsRes.error.message)) {
      console.warn('[zatca-radar] payments unavailable:', paymentsRes.error.message);
    } else {
      throw new Error(`payments: ${paymentsRes.error.message}`);
    }
  }

  const moyasarIdsFromOrders = new Set<string>();
  for (const row of (ordersRes.data ?? []) as ListingLicenseOrderDbRow[]) {
    const meta = row.metadata ?? {};
    const mp = String(meta.moyasar_payment_id ?? meta.moyasarPaymentId ?? '').trim();
    if (mp) moyasarIdsFromOrders.add(mp);
  }

  const events: ZatcaRevenueOrderRow[] = [];

  for (const row of (ordersRes.data ?? []) as ListingLicenseOrderDbRow[]) {
    const halalas = paymentAmountToHalalas(row.amount_halalas);
    if (halalas <= 0) continue;
    events.push({
      source: 'listing_license_order',
      id: row.id,
      amountHalalas: halalas,
      paidAt: pickPaidAt(row),
      metadata: row.metadata ?? undefined,
    });
  }

  for (const row of (paymentsRes.data ?? []) as LegacyPaymentDbRow[]) {
    const tx = String(row.transaction_id ?? '').trim();
    if (tx && moyasarIdsFromOrders.has(tx)) continue;
    const halalas = paymentAmountToHalalas(row.amount);
    if (halalas <= 0) continue;
    events.push({
      source: 'legacy_payment',
      id: row.id,
      amountHalalas: halalas,
      paidAt: pickPaidAt(row),
    });
  }

  events.sort((a, b) => new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime());
  return events;
}

export function computeRevenueAnalytics(
  orders: ZatcaRevenueOrderRow[],
  nowMs: number = Date.now(),
): ZatcaRevenueAnalytics {
  const computedAt = new Date(nowMs).toISOString();
  const window30 = nowMs - 30 * MS_PER_DAY;
  const window7 = nowMs - 7 * MS_PER_DAY;

  let totalHistoricalHalalas = 0;
  let trailing30dHalalas = 0;
  let trailing7dHalalas = 0;
  let listingLicenseOrderCount = 0;
  let legacyPaymentCount = 0;

  for (const o of orders) {
    totalHistoricalHalalas += o.amountHalalas;
    if (o.source === 'listing_license_order') listingLicenseOrderCount += 1;
    else legacyPaymentCount += 1;
    const t = new Date(o.paidAt).getTime();
    if (t >= window30) trailing30dHalalas += o.amountHalalas;
    if (t >= window7) trailing7dHalalas += o.amountHalalas;
  }

  const dailyVelocityHalalas = Math.max(0, Math.round(trailing30dHalalas / 30));
  const monthlyVelocityHalalas = trailing30dHalalas;
  const projectedRevenue30dHalalas = totalHistoricalHalalas + dailyVelocityHalalas * ZATCA_RUN_RATE_HORIZON_DAYS;

  let daysToMandatoryLimit: number | null = null;
  if (totalHistoricalHalalas < ZATCA_MANDATORY_LIMIT_HALALAS && dailyVelocityHalalas > 0) {
    const remaining = ZATCA_MANDATORY_LIMIT_HALALAS - totalHistoricalHalalas;
    daysToMandatoryLimit = Math.max(1, Math.ceil(remaining / dailyVelocityHalalas));
  } else if (totalHistoricalHalalas >= ZATCA_MANDATORY_LIMIT_HALALAS) {
    daysToMandatoryLimit = 0;
  }

  return {
    totalHistoricalHalalas,
    totalHistoricalSar: halalasToSar(totalHistoricalHalalas),
    trailing30dHalalas,
    trailing7dHalalas,
    dailyVelocityHalalas,
    dailyVelocitySar: halalasToSar(dailyVelocityHalalas),
    monthlyVelocityHalalas,
    monthlyVelocitySar: halalasToSar(monthlyVelocityHalalas),
    projectedRevenue30dHalalas,
    projectedRevenue30dSar: halalasToSar(projectedRevenue30dHalalas),
    daysToMandatoryLimit,
    orderCount: orders.length,
    listingLicenseOrderCount,
    legacyPaymentCount,
    computedAt,
  };
}

function buildSignal(
  level: ZatcaWarningLevel,
  analytics: ZatcaRevenueAnalytics,
  triggeredAt: string,
): ZatcaEarlyWarningSignal {
  return {
    level,
    triggeredAt,
    messageAr: ZATCA_WARNING_COPY_AR[level],
    totalRevenueHalalas: analytics.totalHistoricalHalalas,
    totalRevenueSar: analytics.totalHistoricalSar,
    dailyVelocityHalalas: analytics.dailyVelocityHalalas,
    dailyVelocitySar: analytics.dailyVelocitySar,
    projectedRevenue30dHalalas: analytics.projectedRevenue30dHalalas,
    daysToMandatoryLimit: analytics.daysToMandatoryLimit,
  };
}

/** Evaluate early-warning ladder; highest-severity active signals are all returned. */
export function evaluateEarlyWarningSignals(
  analytics: ZatcaRevenueAnalytics,
  nowMs: number = Date.now(),
): ZatcaEarlyWarningSignal[] {
  const triggeredAt = new Date(nowMs).toISOString();
  const total = analytics.totalHistoricalHalalas;
  const signals: ZatcaEarlyWarningSignal[] = [];

  if (total >= ZATCA_MANDATORY_LIMIT_HALALAS) {
    signals.push(buildSignal('mandatory_breached', analytics, triggeredAt));
    return signals;
  }

  if (total >= ZATCA_SOFT_ALERT_HALALAS && total < ZATCA_VOLUNTARY_LIMIT_HALALAS) {
    signals.push(buildSignal('soft_voluntary_half', analytics, triggeredAt));
  }

  if (total >= ZATCA_VOLUNTARY_LIMIT_HALALAS) {
    signals.push(buildSignal('voluntary_limit', analytics, triggeredAt));
  }

  const runRateHit =
    analytics.projectedRevenue30dHalalas >= ZATCA_MANDATORY_LIMIT_HALALAS &&
    total < ZATCA_MANDATORY_LIMIT_HALALAS;

  if (runRateHit) {
    signals.push(buildSignal('critical_run_rate', analytics, triggeredAt));
  }

  return signals;
}

export function isMandatoryLimitBreached(analytics: ZatcaRevenueAnalytics): boolean {
  return analytics.totalHistoricalHalalas >= ZATCA_MANDATORY_LIMIT_HALALAS;
}
