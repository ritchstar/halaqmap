/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * موقع نشاط صفحات الحي والشاشات — إبراز أو إخفاء دون تسريب الإحداثيات للعامة.
 */
export type ShopPickupPlace = {
  pickupLat: number;
  pickupLng: number;
  pickupMapsUrl: string;
  pickupPlaceVisible: boolean;
};

export const DEFAULT_SHOP_PICKUP: ShopPickupPlace = {
  pickupLat: 0,
  pickupLng: 0,
  pickupMapsUrl: '',
  pickupPlaceVisible: false,
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
  return {
    pickupLat: Number.isFinite(lat) && lat >= -90 && lat <= 90 ? lat : fallback.pickupLat,
    pickupLng: Number.isFinite(lng) && lng >= -180 && lng <= 180 ? lng : fallback.pickupLng,
    pickupMapsUrl: clipShopMapsUrl(row.pickupMapsUrl) || fallback.pickupMapsUrl,
    pickupPlaceVisible: row.pickupPlaceVisible === true,
  };
}

export function shopPlaceRoleSeesCoords(role: string): boolean {
  return role === 'desk' || role === 'host';
}

export function publicShopPlaceFields(role: string, place: ShopPickupPlace): ShopPickupPlace {
  const show = shopPlaceRoleSeesCoords(role) || place.pickupPlaceVisible;
  return {
    pickupLat: show ? place.pickupLat : 0,
    pickupLng: show ? place.pickupLng : 0,
    pickupMapsUrl: show ? place.pickupMapsUrl : '',
    pickupPlaceVisible: place.pickupPlaceVisible,
  };
}
