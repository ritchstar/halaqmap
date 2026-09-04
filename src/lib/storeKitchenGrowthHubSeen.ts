/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قراءة مركز نمو طبختنا1 على جهاز المشغّل. لا دفتر زبائن.
 */
import { STORE_KITCHEN_GROWTH_HUB_REVISION } from '@/config/storeKitchenGrowthHub';

const PREFIX = 'store-growth-hub:kitchen:';

function storageKey(token: string): string {
  return `${PREFIX}${String(token || '').trim()}:seenRevision`;
}

export function readKitchenGrowthSeenRevision(token: string): number {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(storageKey(token));
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function hasKitchenGrowthHubBadge(token: string): boolean {
  return readKitchenGrowthSeenRevision(token) < STORE_KITCHEN_GROWTH_HUB_REVISION;
}

export function markKitchenGrowthHubSeen(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey(token), String(STORE_KITCHEN_GROWTH_HUB_REVISION));
}
