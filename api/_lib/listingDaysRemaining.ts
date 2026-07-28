/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مصدر حقيقة واحد لأيام الإدراج المتبقية — مطابق لمنطق RPC `barber_listing_summary`
 * (CEIL لثوانٍ حتى valid_until / 86400، لا يقل عن 0).
 */

const MS_PER_DAY = 86_400_000;

/** عدد الأيام المتبقية من `valid_until` بنفس تقريب قاعدة البيانات. */
export function listingDaysRemainingFromValidUntil(
  validUntilIso: string | null | undefined,
  nowMs: number = Date.now(),
): number {
  if (!validUntilIso) return 0;
  const end = Date.parse(validUntilIso);
  if (!Number.isFinite(end)) return 0;
  const delta = end - nowMs;
  if (delta <= 0) return 0;
  return Math.max(0, Math.ceil(delta / MS_PER_DAY));
}

export type ListingDaysSnapshot = {
  hasActiveListing: boolean;
  listingDaysRemaining: number;
  validUntil: string | null;
  activeTier: string | null;
};

/** يبني لقطة من صفوف صلاحية نشطة (valid_until > now، غير ملغاة). */
export function buildListingDaysSnapshotFromEntitlementRows(
  rows: Array<{ valid_until?: string | null; tier?: string | null }>,
  nowMs: number = Date.now(),
): ListingDaysSnapshot {
  const nowIso = new Date(nowMs).toISOString();
  const active = rows.filter((r) => {
    const vu = r.valid_until;
    return typeof vu === 'string' && vu > nowIso;
  });
  if (active.length === 0) {
    return {
      hasActiveListing: false,
      listingDaysRemaining: 0,
      validUntil: null,
      activeTier: null,
    };
  }
  let maxUntil: string | null = null;
  let maxDays = 0;
  let bestTier: string | null = null;
  let bestRank = -1;
  for (const r of active) {
    const vu = String(r.valid_until);
    const days = listingDaysRemainingFromValidUntil(vu, nowMs);
    if (!maxUntil || vu > maxUntil) maxUntil = vu;
    if (days > maxDays) maxDays = days;
    const tier = String(r.tier ?? '').toLowerCase();
    const rank = tier === 'diamond' ? 3 : tier === 'gold' ? 2 : tier === 'bronze' ? 1 : 0;
    if (rank > bestRank || (rank === bestRank && (!maxUntil || vu >= (maxUntil ?? '')))) {
      bestRank = rank;
      bestTier = tier || null;
    }
  }
  // active_tier: أعلى باقة ثم الأبعد valid_until (مثل الـ RPC)
  const byRank = [...active].sort((a, b) => {
    const ra = String(a.tier ?? '').toLowerCase() === 'diamond' ? 3 : String(a.tier ?? '').toLowerCase() === 'gold' ? 2 : 1;
    const rb = String(b.tier ?? '').toLowerCase() === 'diamond' ? 3 : String(b.tier ?? '').toLowerCase() === 'gold' ? 2 : 1;
    if (rb !== ra) return rb - ra;
    return String(b.valid_until ?? '').localeCompare(String(a.valid_until ?? ''));
  });
  bestTier = String(byRank[0]?.tier ?? '').toLowerCase() || null;

  return {
    hasActiveListing: true,
    listingDaysRemaining: listingDaysRemainingFromValidUntil(maxUntil, nowMs),
    validUntil: maxUntil,
    activeTier: bestTier,
  };
}
