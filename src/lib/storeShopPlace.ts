/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحديد موقع النشاط في صفحات الحي والشاشات بعد موافقة المتصفح.
 */
import {
  parsePickupHistory,
  parseVendorMode,
  parseWeekPlan,
  type StorePickupHistoryRow,
  type StoreVendorMode,
} from '@/lib/storeMobileVendor';
import { isMobileVendorStale } from '@/lib/storeMobileVendor';

export type ShopPickupPlace = {
  pickupLat: number;
  pickupLng: number;
  pickupMapsUrl: string;
  pickupPlaceVisible: boolean;
  vendorMode: StoreVendorMode;
  vendorTransit: boolean;
  pickupUpdatedAt: string;
  pickupHistory: StorePickupHistoryRow[];
  weekPlan: string[];
};

export const DEFAULT_SHOP_PICKUP: ShopPickupPlace = {
  pickupLat: 0,
  pickupLng: 0,
  pickupMapsUrl: '',
  pickupPlaceVisible: false,
  vendorMode: 'fixed',
  vendorTransit: false,
  pickupUpdatedAt: '',
  pickupHistory: [],
  weekPlan: ['', '', '', '', '', '', ''],
};

export function shopMapsSearchUrl(lat: number, lng: number): string {
  return `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

export function isShopMapsUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw.trim());
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'maps.google.com' || host === 'maps.app.goo.gl') return true;
    return host === 'google.com' && parsed.pathname.startsWith('/maps');
  } catch {
    return false;
  }
}

export function parseShopPickupPlace(
  raw: Record<string, unknown> | null | undefined,
  fallback: ShopPickupPlace = DEFAULT_SHOP_PICKUP,
): ShopPickupPlace {
  const row = raw && typeof raw === 'object' ? raw : {};
  const lat = Number(row.pickupLat);
  const lng = Number(row.pickupLng);
  const mapsUrl = String(row.pickupMapsUrl || '').trim().slice(0, 240);
  return {
    pickupLat: Number.isFinite(lat) && lat >= -90 && lat <= 90 ? lat : fallback.pickupLat,
    pickupLng: Number.isFinite(lng) && lng >= -180 && lng <= 180 ? lng : fallback.pickupLng,
    pickupMapsUrl: mapsUrl && isShopMapsUrl(mapsUrl) ? mapsUrl : fallback.pickupMapsUrl,
    pickupPlaceVisible: row.pickupPlaceVisible === true,
    vendorMode: parseVendorMode(row.vendorMode ?? fallback.vendorMode),
    vendorTransit: row.vendorTransit === true,
    pickupUpdatedAt: String(row.pickupUpdatedAt || fallback.pickupUpdatedAt || '').slice(0, 40),
    pickupHistory: parsePickupHistory(row.pickupHistory).length
      ? parsePickupHistory(row.pickupHistory)
      : fallback.pickupHistory,
    weekPlan: parseWeekPlan(row.weekPlan ?? fallback.weekPlan),
  };
}

export function requestShopGeo(): Promise<{ ok: true; lat: number; lng: number } | { ok: false; denied: boolean }> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({ ok: false, denied: false });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({ ok: true, lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        resolve({ ok: false, denied: err.code === 1 });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

export function shopPlaceRoleSeesCoords(role: string): boolean {
  return role === 'desk' || role === 'host';
}

export function publicShopPlaceFields(role: string, place: ShopPickupPlace): ShopPickupPlace {
  const desk = shopPlaceRoleSeesCoords(role);
  const stale = place.vendorMode === 'mobile' && isMobileVendorStale(place.pickupUpdatedAt);
  const showFixed = place.vendorMode !== 'mobile' && place.pickupPlaceVisible;
  const showMobile =
    place.vendorMode === 'mobile' && place.pickupPlaceVisible && !place.vendorTransit && !stale;
  const show = desk || showFixed || showMobile;
  return {
    ...place,
    pickupLat: show ? place.pickupLat : 0,
    pickupLng: show ? place.pickupLng : 0,
    pickupMapsUrl: show ? place.pickupMapsUrl : '',
    pickupHistory: desk ? place.pickupHistory : [],
  };
}
