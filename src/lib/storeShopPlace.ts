/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحديد موقع النشاط في صفحات الحي والشاشات بعد موافقة المتصفح.
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
