/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
const E7 = 10_000_000;
const KSA_LAT = { min: 16, max: 33 } as const;
const KSA_LNG = { min: 34, max: 56 } as const;

export type ParsedMapCoordinates =
  | {
      ok: true;
      latitude: number | null;
      longitude: number | null;
    }
  | { ok: false; error: string };

function parseCoordToken(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim().replace(/\s+/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function maybeFromE7Degrees(value: number): number {
  const abs = Math.abs(value);
  if (abs > 180 && abs <= 180 * E7 + 1) return value / E7;
  return value;
}

function maybeSwapKsaLatLng(lat: number, lng: number): { lat: number; lng: number } {
  const latLooksLikeLng = lat >= KSA_LNG.min && lat <= KSA_LNG.max;
  const lngLooksLikeLat = lng >= KSA_LAT.min && lng <= KSA_LAT.max;
  if (latLooksLikeLng && lngLooksLikeLat) {
    return { lat: lng, lng: lat };
  }
  return { lat, lng };
}

export function normalizeMapCoordinatePair(
  latRaw: unknown,
  lngRaw: unknown,
): ParsedMapCoordinates {
  const latParsed = parseCoordToken(latRaw);
  const lngParsed = parseCoordToken(lngRaw);
  if (latParsed == null && lngParsed == null) {
    return { ok: true, latitude: null, longitude: null };
  }
  if (latParsed == null || lngParsed == null) {
    return { ok: false, error: 'incomplete_coordinates' };
  }
  const pair = maybeSwapKsaLatLng(maybeFromE7Degrees(latParsed), maybeFromE7Degrees(lngParsed));
  if (pair.lat < -90 || pair.lat > 90 || pair.lng < -180 || pair.lng > 180) {
    return { ok: false, error: 'coordinates_out_of_range' };
  }
  return {
    ok: true,
    latitude: Number(pair.lat.toFixed(8)),
    longitude: Number(pair.lng.toFixed(8)),
  };
}

export function mapCoordinateDbError(message: string): string {
  if (/numeric field/i.test(message) || /overflow/i.test(message)) {
    return 'قيمة الإحداثيات أكبر من سعة الحقل الرقمي. أدخل درجات عشرية مثل 21.54 و 39.17.';
  }
  return message;
}
