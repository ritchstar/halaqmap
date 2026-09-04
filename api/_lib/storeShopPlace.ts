/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * موقع نشاط صفحات الحي والشاشات — إبراز أو إخفاء دون تسريب الإحداثيات للعامة.
 */
import {
  isMobileVendorStale,
  parsePickupHistory,
  parseVendorMode,
  parseWeekPlan,
  type StorePickupHistoryRow,
  type StoreVendorMode,
} from './storeMobileVendor.js';

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

function clipShopMapsUrl(raw: unknown): string {
  const value = String(raw ?? '').trim().slice(0, 240);
  if (!value) return '';
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'maps.google.com' || host === 'maps.app.goo.gl') return value;
    if (host === 'google.com' && parsed.pathname.startsWith('/maps')) return value;
  } catch {
    return '';
  }
  return '';
}

export function parseShopPickupPlace(
  raw: object | null | undefined,
  fallback: ShopPickupPlace = DEFAULT_SHOP_PICKUP,
): ShopPickupPlace {
  const row = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const lat = Number(row.pickupLat);
  const lng = Number(row.pickupLng);
  const history = parsePickupHistory(row.pickupHistory);
  return {
    pickupLat: Number.isFinite(lat) && lat >= -90 && lat <= 90 ? lat : fallback.pickupLat,
    pickupLng: Number.isFinite(lng) && lng >= -180 && lng <= 180 ? lng : fallback.pickupLng,
    pickupMapsUrl: clipShopMapsUrl(row.pickupMapsUrl) || fallback.pickupMapsUrl,
    pickupPlaceVisible: row.pickupPlaceVisible === true,
    vendorMode: parseVendorMode(row.vendorMode ?? fallback.vendorMode),
    vendorTransit: row.vendorTransit === true,
    pickupUpdatedAt: String(row.pickupUpdatedAt || fallback.pickupUpdatedAt || '').slice(0, 40),
    pickupHistory: history.length ? history : fallback.pickupHistory,
    weekPlan: parseWeekPlan(row.weekPlan ?? fallback.weekPlan),
  };
}

export function shopPlaceRoleSeesCoords(role: string): boolean {
  return role === 'desk' || role === 'host';
}

export function publicShopPlaceFields(role: string, place: ShopPickupPlace): ShopPickupPlace {
  const desk = shopPlaceRoleSeesCoords(role);
  const stale = place.vendorMode === 'mobile' && isMobileVendorStale(place.pickupUpdatedAt);
  const showFixed = place.vendorMode !== 'mobile' && place.pickupPlaceVisible;
  const showMobile = place.vendorMode === 'mobile' && place.pickupPlaceVisible && !stale;
  const show = desk || showFixed || showMobile;
  return {
    ...place,
    pickupLat: show ? place.pickupLat : 0,
    pickupLng: show ? place.pickupLng : 0,
    pickupMapsUrl: show ? place.pickupMapsUrl : '',
    pickupHistory: desk ? place.pickupHistory : [],
  };
}
