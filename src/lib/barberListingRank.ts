import { isDemoShowcaseBarberId } from '@/config/demoCatalog';

/** أوزان موزونة = 1 — باقة / قرب / جودة تقييم (مع تصحيح بايزي لعيّنة المراجعات) */
export const LISTING_WEIGHT_TIER = 0.35;
export const LISTING_WEIGHT_DISTANCE = 0.35;
export const LISTING_WEIGHT_RATING = 0.3;

const PRIOR_RATING = 3.5;
const PRIOR_REVIEW_WEIGHT = 8;
const DISTANCE_DECAY_KM = 10;

type TierToken = 'bronze' | 'gold' | 'diamond';

function tierNormalized(tier: TierToken): number {
  switch (tier) {
    case 'diamond':
      return 1;
    case 'gold':
      return 2 / 3;
    case 'bronze':
    default:
      return 1 / 3;
  }
}

/**
 * متوسط بايزي على مقياس 1–5 ثم تحويل إلى [0،1].
 * يقلّل من تضليل «5 نجوم» بمراجعة واحدة مقارنة بتقييم أقل بعدد أكبر.
 */
export function bayesianRating01(rawRating: number, reviewCount: number): number {
  const v = Math.max(0, Math.floor(reviewCount));
  const m = PRIOR_REVIEW_WEIGHT;
  const R = v > 0 ? Math.min(5, Math.max(1, Number(rawRating) || PRIOR_RATING)) : PRIOR_RATING;
  const bayes = (v / (v + m)) * R + (m / (v + m)) * PRIOR_RATING;
  return (bayes - 1) / 4;
}

/** قرب: 1 عند 0 كم، يضعف ببعد المستخدم؛ عيّنات العرض التجريبي تُعامل كأفضل قرب للعرض. */
export function distanceComponent01(distanceKm: number, barberId: string): number {
  if (isDemoShowcaseBarberId(barberId)) return 1;
  const d = Math.max(0, distanceKm);
  return Math.exp(-d / DISTANCE_DECAY_KM);
}

export function listingCompositeScore(barber: {
  id: string;
  subscription: TierToken;
  rating: number;
  reviewCount: number;
  distance: number;
}): number {
  const t = tierNormalized(barber.subscription);
  const d = distanceComponent01(barber.distance, barber.id);
  const r = bayesianRating01(barber.rating, barber.reviewCount);
  return LISTING_WEIGHT_TIER * t + LISTING_WEIGHT_DISTANCE * d + LISTING_WEIGHT_RATING * r;
}

/** للترتيب: أعلى درجة أولاً، ثم أقرب، ثم باقة أعلى. */
export function compareBarbersByListingScore(
  a: { id: string; subscription: TierToken; distance: number; rating: number; reviewCount: number },
  b: { id: string; subscription: TierToken; distance: number; rating: number; reviewCount: number }
): number {
  const sa = listingCompositeScore(a);
  const sb = listingCompositeScore(b);
  if (Math.abs(sa - sb) > 1e-9) return sb - sa;
  if (a.distance !== b.distance) return a.distance - b.distance;
  return tierNormalized(b.subscription) - tierNormalized(a.subscription);
}
