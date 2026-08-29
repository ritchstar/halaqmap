/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مسار عربة مشمول في السعر. المطابقة بالوسم أولاً ثم المبلغ.
 */
export const STORE_MOBILE_VENDOR_PRICE_6_HALALAS = 79900 as const;
export const STORE_MOBILE_VENDOR_PRICE_12_HALALAS = 125000 as const;
export const STORE_MOBILE_VENDOR_STALE_MS = 40 * 60 * 1000;
export const STORE_MOBILE_VENDOR_HISTORY_CAP = 30 as const;

export type StoreVendorMode = 'fixed' | 'mobile';

export type StorePickupHistoryRow = {
  at: string;
  lat: number;
  lng: number;
  mapsUrl: string;
};

export function parseVendorMode(raw: unknown): StoreVendorMode {
  return String(raw || '').trim().toLowerCase() === 'mobile' ? 'mobile' : 'fixed';
}

export function isMobileVendorPriceHalalas(amount: number): boolean {
  return amount === STORE_MOBILE_VENDOR_PRICE_6_HALALAS || amount === STORE_MOBILE_VENDOR_PRICE_12_HALALAS;
}

export function mobileVendorChargeHalalas(packId: 'm6' | 'm12'): number {
  return packId === 'm12' ? STORE_MOBILE_VENDOR_PRICE_12_HALALAS : STORE_MOBILE_VENDOR_PRICE_6_HALALAS;
}

export function mobileVendorPackFromHalalas(amount: number): 'm6' | 'm12' {
  return amount === STORE_MOBILE_VENDOR_PRICE_12_HALALAS ? 'm12' : 'm6';
}

export function isMobileVendorStale(
  updatedAt: string,
  nowMs = Date.now(),
  staleMs = STORE_MOBILE_VENDOR_STALE_MS,
): boolean {
  const t = Date.parse(updatedAt);
  if (!updatedAt || !Number.isFinite(t)) return true;
  return nowMs - t > staleMs;
}

export function parseWeekPlan(raw: unknown): string[] {
  const list = Array.isArray(raw) ? raw : [];
  return Array.from({ length: 7 }, (_, i) => String(list[i] || '').replace(/\s+/g, ' ').trim().slice(0, 80));
}

export function parsePickupHistory(raw: unknown): StorePickupHistoryRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      const lat = Number(row.lat);
      const lng = Number(row.lng);
      const at = String(row.at || '').slice(0, 40);
      const mapsUrl = String(row.mapsUrl || '').trim().slice(0, 240);
      if (!at || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return { at, lat, lng, mapsUrl };
    })
    .filter((row): row is StorePickupHistoryRow => Boolean(row))
    .slice(0, STORE_MOBILE_VENDOR_HISTORY_CAP);
}

export function lockPaidVendorMode<T extends { vendorMode: StoreVendorMode }>(next: T, current: T): T {
  return { ...next, vendorMode: current.vendorMode };
}
