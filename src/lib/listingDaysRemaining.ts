/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * نفس منطق أيام الإدراج في الواجهة — يجب أن يطابق api/_lib/listingDaysRemaining.ts
 * و RPC barber_listing_summary.
 */

const MS_PER_DAY = 86_400_000;

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

export function buildListingDaysSnapshotFromEntitlementRows(
  rows: Array<{ valid_until?: string | null; tier?: string | null }>,
  nowMs: number = Date.now(),
): ListingDaysSnapshot {
  const nowIso = new Date(nowMs).toISOString();
  const active = rows.filter((r) => typeof r.valid_until === 'string' && r.valid_until > nowIso);
  if (active.length === 0) {
    return {
      hasActiveListing: false,
      listingDaysRemaining: 0,
      validUntil: null,
      activeTier: null,
    };
  }
  let maxUntil: string | null = null;
  for (const r of active) {
    const vu = String(r.valid_until);
    if (!maxUntil || vu > maxUntil) maxUntil = vu;
  }
  const byRank = [...active].sort((a, b) => {
    const rank = (t: string) => (t === 'diamond' ? 3 : t === 'gold' ? 2 : 1);
    const ra = rank(String(a.tier ?? '').toLowerCase());
    const rb = rank(String(b.tier ?? '').toLowerCase());
    if (rb !== ra) return rb - ra;
    return String(b.valid_until ?? '').localeCompare(String(a.valid_until ?? ''));
  });
  return {
    hasActiveListing: true,
    listingDaysRemaining: listingDaysRemainingFromValidUntil(maxUntil, nowMs),
    validUntil: maxUntil,
    activeTier: String(byRank[0]?.tier ?? '').toLowerCase() || null,
  };
}
