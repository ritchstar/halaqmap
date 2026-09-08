/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import type { LiveActivityShelfPreview } from '@/components/store/live/StoreLiveActivityPanels';

type ShelfRow = {
  catalogId: string;
  nameAr: string;
  price: number;
  photoSrc?: string;
  inStock: boolean;
  featured?: boolean;
  arrivedToday?: boolean;
};

export function toLiveActivityShelf(shelf: ShelfRow[]): LiveActivityShelfPreview[] {
  return shelf
    .filter((item) => item.inStock)
    .map((item) => ({
      catalogId: item.catalogId,
      nameAr: item.nameAr,
      price: item.price,
      photoSrc: item.photoSrc,
      inStock: item.inStock,
      featured: item.featured,
    }));
}

export function liveActivityTodayName(shelf: ShelfRow[]): string | undefined {
  const visible = shelf.filter((item) => item.inStock);
  const todayBoard = visible.find((item) => item.catalogId === 'today-board');
  if (todayBoard) return todayBoard.nameAr;
  const arrived = visible.find((item) => item.arrivedToday);
  if (arrived) return arrived.nameAr;
  const featured = visible.find((item) => item.featured);
  return featured?.nameAr;
}

export function liveActivityCoverSrc(shelf: ShelfRow[]): string | undefined {
  const visible = shelf.filter((item) => item.inStock);
  const today = visible.find((item) => item.catalogId === 'today-board' && item.photoSrc);
  if (today?.photoSrc) return today.photoSrc;
  return visible.find((item) => item.photoSrc)?.photoSrc;
}
