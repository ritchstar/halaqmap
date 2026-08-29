/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مسار عربة: حالات الجار وختم التحديث بلا بث حي وبلا تتبع خلفي.
 */
import {
  STORE_MOBILE_VENDOR_HISTORY_CAP,
  STORE_MOBILE_VENDOR_LOCATE_GAP_MS,
  STORE_MOBILE_VENDOR_PRICE_12_HALALAS,
  STORE_MOBILE_VENDOR_PRICE_6_HALALAS,
  STORE_MOBILE_VENDOR_STALE_MS,
  type StoreVendorMode,
} from '@/config/storeMobileVendor';

export type StoreNeighborVendorState = 'closed' | 'at_pin' | 'in_transit' | 'stale';

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

export function mobileVendorAffiliateSar(packId: 'm6' | 'm12'): number {
  return packId === 'm12' ? 250 : 99;
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

export function neighborVendorState(input: {
  vendorMode: StoreVendorMode;
  vendorTransit: boolean;
  pickupPlaceVisible: boolean;
  pickupUpdatedAt: string;
  pickupLat: number;
  pickupLng: number;
  closed: boolean;
}): StoreNeighborVendorState {
  if (input.closed) return 'closed';
  if (input.vendorMode !== 'mobile') return input.pickupPlaceVisible ? 'at_pin' : 'stale';
  if (input.vendorTransit) return 'in_transit';
  if (
    !input.pickupPlaceVisible
    || isMobileVendorStale(input.pickupUpdatedAt)
    || !Number.isFinite(input.pickupLat)
    || !input.pickupLat
  ) {
    return 'stale';
  }
  return 'at_pin';
}

export function mobileLocateTooSoon(
  prevAt: string,
  prevLat: number,
  prevLng: number,
  nextLat: number,
  nextLng: number,
  nowMs = Date.now(),
): boolean {
  const t = Date.parse(prevAt);
  if (!prevAt || !Number.isFinite(t)) return false;
  if (nowMs - t >= STORE_MOBILE_VENDOR_LOCATE_GAP_MS) return false;
  const moved = Math.abs(prevLat - nextLat) > 0.0004 || Math.abs(prevLng - nextLng) > 0.0004;
  return !moved;
}

export function appendPickupHistory(
  history: StorePickupHistoryRow[],
  row: StorePickupHistoryRow,
): StorePickupHistoryRow[] {
  return [row, ...history].slice(0, STORE_MOBILE_VENDOR_HISTORY_CAP);
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

export function formatPickupUpdatedAtAr(iso: string): string {
  const t = Date.parse(iso);
  if (!iso || !Number.isFinite(t)) return '';
  try {
    return new Intl.DateTimeFormat('ar-SA', {
      timeZone: 'Asia/Riyadh',
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
    }).format(new Date(t));
  } catch {
    return iso.slice(0, 16);
  }
}

export function lockPaidVendorMode<T extends { vendorMode: StoreVendorMode }>(next: T, current: T): T {
  return { ...next, vendorMode: current.vendorMode };
}
