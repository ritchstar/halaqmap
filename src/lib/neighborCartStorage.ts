/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * سلة جار الحي — معزولة بحسب النشاط والرمز، بلا بيانات شخصية.
 */
import type { LiveActivityKind } from '@/config/storeLiveActivity';

export type NeighborCartKind = Exclude<LiveActivityKind, 'halana'>;

const SCHEMA_VERSION = 1;
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

type StoredCart = {
  schemaVersion: number;
  savedAt: string;
  qty: Record<string, number>;
};

export function neighborCartStorageKey(kind: NeighborCartKind, token: string): string {
  const safeToken = token.trim() || 'lab';
  return `halaqmap-neighbor-cart:${kind}:${safeToken}:v${SCHEMA_VERSION}`;
}

export function readNeighborCartQty(kind: NeighborCartKind, token: string): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(neighborCartStorageKey(kind, token));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<StoredCart>;
    if (parsed.schemaVersion !== SCHEMA_VERSION || !parsed.savedAt || !parsed.qty) return {};
    const age = Date.now() - new Date(parsed.savedAt).getTime();
    if (!Number.isFinite(age) || age > TTL_MS) {
      window.localStorage.removeItem(neighborCartStorageKey(kind, token));
      return {};
    }
    const qty: Record<string, number> = {};
    for (const [id, n] of Object.entries(parsed.qty)) {
      const v = Math.floor(Number(n));
      if (id && v > 0) qty[id] = v;
    }
    return qty;
  } catch {
    return {};
  }
}

export function writeNeighborCartQty(
  kind: NeighborCartKind,
  token: string,
  qty: Record<string, number>,
): void {
  if (typeof window === 'undefined') return;
  const cleaned: Record<string, number> = {};
  for (const [id, n] of Object.entries(qty)) {
    const v = Math.floor(Number(n));
    if (id && v > 0) cleaned[id] = v;
  }
  const key = neighborCartStorageKey(kind, token);
  if (Object.keys(cleaned).length === 0) {
    window.localStorage.removeItem(key);
    return;
  }
  const payload: StoredCart = {
    schemaVersion: SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    qty: cleaned,
  };
  window.localStorage.setItem(key, JSON.stringify(payload));
}

export function clearNeighborCartQty(kind: NeighborCartKind, token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(neighborCartStorageKey(kind, token));
}
