import { SubscriptionTier } from '@/lib/index';

/** أسعار شهرية مقررة (ر.س) — تعديل لوحة المالك لاحقاً يمر من هنا */
export const TIER_MONTHLY_SAR: Record<SubscriptionTier, number> = {
  [SubscriptionTier.BRONZE]: 100,
  [SubscriptionTier.GOLD]: 150,
  [SubscriptionTier.DIAMOND]: 200,
};

/** إجمالي 6 أشهر بدون خصم: برونزي 600، ذهبي 900، ماسي 1200 */
export function getSixMonthGrossSar(tier: SubscriptionTier): number {
  return TIER_MONTHLY_SAR[tier] * 6;
}

/**
 * نهاية فترة العرض (سنة أولى تشغيلية): شهران إضافيان + خصم 10%.
 * يضبط المالك في Vercel: VITE_BANK_TRANSFER_PROMO_END=2026-12-31
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

/** المبلغ المطلوب تحويله (ر.س): مع العرض 90% من إجمالي 6 أشهر؛ بعد العرض = إجمالي 6 أشهر كاملة */
export function getBankTransferPayableAmountSar(tier: SubscriptionTier, nowMs = Date.now()): number {
  const gross = getSixMonthGrossSar(tier);
  if (isBankTransferPromoActive(nowMs)) return Math.round(gross * 0.9);
  return gross;
}

/** مدة الصلاحية بالأشهر: 8 أثناء العرض (6+2)، وإلا 6 */
export function getBankTransferCoveredMonths(nowMs = Date.now()): 6 | 8 {
  return isBankTransferPromoActive(nowMs) ? 8 : 6;
}

/** نص عربي موجز للملخصات والبريد */
export function getBankTransferPlanSummaryAr(tier: SubscriptionTier, nowMs = Date.now()): string {
  const amt = getBankTransferPayableAmountSar(tier, nowMs);
  const months = getBankTransferCoveredMonths(nowMs);
  const gross = getSixMonthGrossSar(tier);
  if (months === 8) {
    return `${amt} ر.س لمدة 8 أشهر (6 مدفوعة + شهران إضافيان؛ خصم 10% على إجمالي ${gross} ر.س)`;
  }
  return `${amt} ر.س لمدة 6 أشهر (السعر الكامل لستة أشهر)`;
}
