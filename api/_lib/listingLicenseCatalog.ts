export type ListingLicenseTier = 'bronze' | 'gold' | 'diamond';

export type ListingLicenseProductRow = {
  id: string;
  sku_code: string;
  tier: ListingLicenseTier;
  listing_days_granted: number;
  price_sar: number;
  amount_halalas: number;
  currency: string;
  is_active: boolean;
  service_description_ar: string;
};

/** SKU افتراضي لدفع ميسر الشهري (30 يوم) */
export function defaultMoyasarSkuForTier(tier: string): string {
  const t = tier.trim().toLowerCase();
  if (t === 'gold') return 'gold_30';
  if (t === 'diamond') return 'diamond_30';
  return 'bronze_30';
}

export function tierFromSku(sku: string): ListingLicenseTier {
  const s = sku.trim().toLowerCase();
  if (s.startsWith('gold')) return 'gold';
  if (s.startsWith('diamond')) return 'diamond';
  return 'bronze';
}
