/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بحث وتصنيف محلي لرف جار الحي — بلا API.
 */
export type NeighborShelfRow = {
  catalogId: string;
  nameAr: string;
  category: string;
  price: number;
  inStock: boolean;
  photoSrc?: string;
};

export type NeighborShelfFilter = {
  query: string;
  category: string;
};

export const NEIGHBOR_SHELF_ALL_CATEGORY = 'all';

export function neighborShelfCategories(items: readonly NeighborShelfRow[]): string[] {
  const set = new Set<string>();
  for (const item of items) {
    const cat = item.category.trim();
    if (cat) set.add(cat);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'ar'));
}

export function filterNeighborShelf(
  items: readonly NeighborShelfRow[],
  filter: NeighborShelfFilter,
): NeighborShelfRow[] {
  const q = filter.query.trim().toLowerCase();
  const cat = filter.category.trim();
  return items.filter((item) => {
    if (!item.inStock) return false;
    if (cat && cat !== NEIGHBOR_SHELF_ALL_CATEGORY && item.category !== cat) return false;
    if (!q) return true;
    const hay = `${item.nameAr} ${item.category}`.toLowerCase();
    return hay.includes(q);
  });
}

/** بطاقة مضغوطة (عمودان) أو صف أفقي للأسماء/الوحدات الطويلة. */
export function neighborProductLayout(item: NeighborShelfRow): 'compact' | 'row' {
  const nameLen = Array.from(item.nameAr.trim()).length;
  if (nameLen > 28) return 'row';
  if (/\b(كيلو|كرتون|حزمة|صندوق|نصف)\b/u.test(item.nameAr)) return 'row';
  return 'compact';
}
