import { SubscriptionTier } from '@/lib';
import { TIER_MONTHLY_SAR } from '@/config/subscriptionPricing';

export const LISTING_LICENSE_MIN_QUANTITY = 1;
export const LISTING_LICENSE_MAX_QUANTITY = 12;
export const LISTING_LICENSE_DAYS_PER_CARD = 30;

export function clampListingLicenseQuantity(raw: unknown): number {
  const n =
    typeof raw === 'number' && Number.isFinite(raw)
      ? Math.trunc(raw)
      : Number.parseInt(String(raw ?? '1').trim(), 10);
  if (!Number.isFinite(n)) return LISTING_LICENSE_MIN_QUANTITY;
  return Math.min(
    LISTING_LICENSE_MAX_QUANTITY,
    Math.max(LISTING_LICENSE_MIN_QUANTITY, n),
  );
}

export function listingLicenseDaysForQuantity(qty: number): number {
  return clampListingLicenseQuantity(qty) * LISTING_LICENSE_DAYS_PER_CARD;
}

/** نص توضيحي ديناميكي بجانب محدّد الكمية */
export function formatListingLicenseQuantitySummaryAr(qty: number): string {
  const q = clampListingLicenseQuantity(qty);
  const days = listingLicenseDaysForQuantity(q);
  if (q === 1) return 'تمنحك بطاقة واحدة (30 يوماً من الإدراج الرقمي)';
  if (q === 12) return 'تمنحك 12 بطاقة (تغطية كاملة لمدة سنة/360 يوماً من الإدراج)';
  return `تمنحك ${q} بطاقات (${days} يوماً من الإدراج الرقمي المتتابع)`;
}

export function listingLicenseCtaLabelAr(qty: number, totalSar: number): string {
  const q = clampListingLicenseQuantity(qty);
  const price = totalSar.toLocaleString('en-US');
  if (q === 1) return `شراء وتفعيل ترخيص رقمي واحد بـ ${price} ر.س`;
  return `شراء وتفعيل ${q} تراخيص رقمية بـ ${price} ر.س`;
}

export function computeListingLicenseTotalSar(tier: SubscriptionTier, qty: number): number {
  return TIER_MONTHLY_SAR[tier] * clampListingLicenseQuantity(qty);
}

export function computeListingLicenseUnitHalalas(tier: SubscriptionTier): number {
  return Math.round(TIER_MONTHLY_SAR[tier] * 100);
}

export function computeListingLicenseTotalHalalasBeforeVat(tier: SubscriptionTier, qty: number): number {
  return computeListingLicenseUnitHalalas(tier) * clampListingLicenseQuantity(qty);
}
