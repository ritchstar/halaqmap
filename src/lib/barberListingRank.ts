import type { ListingRankInput } from '@/lib/barberListingRankTypes';

export type { ListingRankInput } from '@/lib/barberListingRankTypes';

/**
 * ترتيب القائمة بعد التصفية: المسافة (الأقرب أولاً) ثم حالة العمل (مفتوح قبل المغلق).
 * لا أولوية لباقة السعر أو التقييم — مواءمة مع search_barbers_nearby في
 * supabase/migrations/61_search_barbers_subscription_filter_distance_open.sql
 */
export function compareBarbersByListingScore(a: ListingRankInput, b: ListingRankInput): number {
  if (Math.abs(a.distance - b.distance) > 1e-6) return a.distance - b.distance;
  const openA = a.isOpen ? 1 : 0;
  const openB = b.isOpen ? 1 : 0;
  return openB - openA;
}

/** درجة رقمية بسيطة للعرض/التصحيح فقط — أعلى يعني أوفر للمستخدم */
export function listingCompositeScore(barber: ListingRankInput): number {
  const openBonus = barber.isOpen ? 0.001 : 0;
  return -barber.distance + openBonus;
}
