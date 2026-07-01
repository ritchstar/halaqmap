export type PartnerTier = 'bronze' | 'gold' | 'diamond';

export function normalizePartnerTier(tier: unknown): PartnerTier {
  const t = String(tier ?? '').trim().toLowerCase();
  if (t === 'gold') return 'gold';
  if (t === 'diamond') return 'diamond';
  return 'bronze';
}

export function isBronzeTier(tier: unknown): boolean {
  return normalizePartnerTier(tier) === 'bronze';
}

export function tierLabelAr(tier: unknown): string {
  const t = normalizePartnerTier(tier);
  if (t === 'diamond') return 'الماسي';
  if (t === 'gold') return 'الذهبي';
  return 'البرونزي';
}
