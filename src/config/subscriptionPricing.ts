import { SubscriptionTier } from '@/lib/index';

/** أسعار شهرية مقررة (ر.س) — لم تُغيَّر؛ التحويل البنكي يُحسب منها ×6 */
export const TIER_MONTHLY_SAR: Record<SubscriptionTier, number> = {
  [SubscriptionTier.BRONZE]: 100,
  [SubscriptionTier.GOLD]: 150,
  [SubscriptionTier.DIAMOND]: 200,
};

/** الأشهر المدفوعة مقدماً بالتحويل البنكي (أساس المبلغ) */
export const BANK_TRANSFER_PREPAID_MONTHS = 6;

/**
 * أثناء العرض التشغيلي: أشهر إضافية تُمنَح مع نفس دفعة الـ6 أشهر (بدلاً من شهرين سابقاً).
 * بعد انتهاء العرض: لا أشهر هدية — الصلاحية = الأشهر المدفوعة فقط.
 */
export const BANK_TRANSFER_PROMO_BONUS_MONTHS = 3;

const BANK_TRANSFER_PROMO_DISCOUNT = 0.1;

/** إجمالي رسوم الستة أشهر قبل الخصم (ر.س) = السعر الشهري × 6 */
export function getBankTransferPeriodGrossSar(tier: SubscriptionTier): number {
  return TIER_MONTHLY_SAR[tier] * BANK_TRANSFER_PREPAID_MONTHS;
}

/**
 * نهاية فترة العرض التشغيلي (الخصم + الأشهر الإضافية).
 * Vercel / .env: VITE_BANK_TRANSFER_PROMO_END=2026-12-31
 * الافتراضي: 31 ديسمبر 2026 نهاية اليوم UTC.
 */
export function getBankTransferPromoEndMs(): number {
  const raw = import.meta.env.VITE_BANK_TRANSFER_PROMO_END?.trim();
  if (raw) {
    const t = new Date(raw).getTime();
    if (!Number.isNaN(t)) return t;
  }
  return Date.UTC(2026, 11, 31, 23, 59, 59);
}

export function isBankTransferPromoActive(nowMs = Date.now()): boolean {
  return nowMs <= getBankTransferPromoEndMs();
}

/**
 * المبلغ المطلوب تحويله (ر.س): مع العرض = 90% من إجمالي 6 أشهر (مُقرَّب)؛
 * بعد العرض = إجمالي 6 أشهر كاملة.
 */
export function getBankTransferPayableAmountSar(tier: SubscriptionTier, nowMs = Date.now()): number {
  const gross = getBankTransferPeriodGrossSar(tier);
  if (isBankTransferPromoActive(nowMs)) {
    return Math.round(gross * (1 - BANK_TRANSFER_PROMO_DISCOUNT));
  }
  return gross;
}

/** إجمالي أشهر الصلاحية: مع العرض = 6 مدفوعة +3 عرض تشغيلي = 9؛ بدون عرض = 6 */
export function getBankTransferCoveredMonths(nowMs = Date.now()): number {
  if (isBankTransferPromoActive(nowMs)) {
    return BANK_TRANSFER_PREPAID_MONTHS + BANK_TRANSFER_PROMO_BONUS_MONTHS;
  }
  return BANK_TRANSFER_PREPAID_MONTHS;
}

/** نص عربي موجز للملخصات والبريد */
export function getBankTransferPlanSummaryAr(tier: SubscriptionTier, nowMs = Date.now()): string {
  const amt = getBankTransferPayableAmountSar(tier, nowMs);
  const gross = getBankTransferPeriodGrossSar(tier);
  const paid = BANK_TRANSFER_PREPAID_MONTHS;
  if (isBankTransferPromoActive(nowMs)) {
    const total = getBankTransferCoveredMonths(nowMs);
    return `${amt} ر.س لمدة ${total} أشهر (${paid} مدفوعة + ${BANK_TRANSFER_PROMO_BONUS_MONTHS} أشهر عرض تشغيلي؛ خصم 10% على إجمالي ${gross} ر.س)`;
  }
  return `${amt} ر.س لمدة ${paid} أشهر (السعر الكامل لستة أشهر)`;
}
