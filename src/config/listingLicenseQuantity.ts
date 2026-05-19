import { SubscriptionTier } from '@/lib';
import { DIGITAL_SHIFT_MONTHLY_ADDON_SAR, TIER_MONTHLY_SAR } from '@/config/subscriptionPricing';

export type ListingLicensePricingOptions = {
  /** المناوب الرقمي — ماسي فقط */
  digitalShiftAddon?: boolean;
};

export function parseDigitalShiftAddonParam(raw: unknown): boolean {
  if (raw === true || raw === 1) return true;
  const s = String(raw ?? '').trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

export function isDigitalShiftAddonAllowed(
  tier: SubscriptionTier,
  selected: boolean,
): boolean {
  return tier === SubscriptionTier.DIAMOND && selected;
}

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
  if (q === 1) return `شراء وتفعيل حزمة برمجية واحدة بـ ${price} ر.س`;
  return `شراء وتفعيل ${q} حزم برمجية رقمية بـ ${price} ر.س`;
}

export function computeListingLicenseUnitSar(
  tier: SubscriptionTier,
  options?: ListingLicensePricingOptions,
): number {
  const base = TIER_MONTHLY_SAR[tier];
  if (isDigitalShiftAddonAllowed(tier, Boolean(options?.digitalShiftAddon))) {
    return base + DIGITAL_SHIFT_MONTHLY_ADDON_SAR;
  }
  return base;
}

export function computeListingLicenseTotalSar(
  tier: SubscriptionTier,
  qty: number,
  options?: ListingLicensePricingOptions,
): number {
  return computeListingLicenseUnitSar(tier, options) * clampListingLicenseQuantity(qty);
}

export function computeListingLicenseUnitHalalas(
  tier: SubscriptionTier,
  options?: ListingLicensePricingOptions,
): number {
  return Math.round(computeListingLicenseUnitSar(tier, options) * 100);
}

export function computeListingLicenseTotalHalalasBeforeVat(
  tier: SubscriptionTier,
  qty: number,
  options?: ListingLicensePricingOptions,
): number {
  return computeListingLicenseUnitHalalas(tier, options) * clampListingLicenseQuantity(qty);
}

export function digitalShiftAddonHalalasForQuantity(
  qty: number,
  addonSelected: boolean,
): number {
  if (!addonSelected) return 0;
  return Math.round(DIGITAL_SHIFT_MONTHLY_ADDON_SAR * 100) * clampListingLicenseQuantity(qty);
}
