export const PORTFOLIO_MAX_IMAGES_GOLD = 20;
export const PORTFOLIO_MAX_IMAGES_DIAMOND = 40;
/** عدد الصور المميزة على البنر العام للعميل */
export const PORTFOLIO_FEATURED_BANNER_MAX = 4;

export function portfolioMaxImagesForSubscriptionTier(tier: string): number {
  const t = String(tier).toLowerCase();
  if (t === 'diamond') return PORTFOLIO_MAX_IMAGES_DIAMOND;
  if (t === 'gold') return PORTFOLIO_MAX_IMAGES_GOLD;
  return 0;
}
