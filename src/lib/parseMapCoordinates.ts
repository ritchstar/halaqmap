/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * تحليل إحداثيات الخريطة لصلاحية المؤسس/التسجيل.
 * عمود barbers.latitude هو DECIMAL(10,8) — الأعداد الصحيحة الضخمة تفيضه
 * (`numeric field overflow`) إذا أُدخلت بصيغة خرائط ×10⁷ أو بلا فاصلة عشرية.
 */

const E7 = 10_000_000;
const KSA_LAT = { min: 16, max: 33 } as const;
const KSA_LNG = { min: 34, max: 56 } as const;

export type ParsedMapCoordinates =
  | {
      ok: true;
      latitude: number;
      longitude: number;
      fromE7: boolean;
      swapped: boolean;
    }
  | { ok: false; error: string };

function parseCoordToken(raw: string): number | null {
  const trimmed = raw.trim().replace(/\s+/g, '').replace(',', '.');
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

/** درجات عشرية مخزّنة كعدد صحيح × 10⁷ (صيغة Google Maps E7). */
export function maybeFromE7Degrees(value: number): { value: number; fromE7: boolean } {
  const abs = Math.abs(value);
  if (abs > 180 && abs <= 180 * E7 + 1) {
    return { value: value / E7, fromE7: true };
  }
  return { value, fromE7: false };
}

function maybeSwapKsaLatLng(lat: number, lng: number): { lat: number; lng: number; swapped: boolean } {
  const latLooksLikeLng = lat >= KSA_LNG.min && lat <= KSA_LNG.max;
  const lngLooksLikeLat = lng >= KSA_LAT.min && lng <= KSA_LAT.max;
  if (latLooksLikeLng && lngLooksLikeLat) {
    return { lat: lng, lng: lat, swapped: true };
  }
  return { lat, lng, swapped: false };
}

export function parseMapCoordinates(latRaw: string, lngRaw: string): ParsedMapCoordinates {
  const latTrim = latRaw.trim();
  const lngTrim = lngRaw.trim();
  if (!latTrim && !lngTrim) {
    return { ok: false, error: 'أدخل خط العرض وخط الطول معاً، أو اتركهما فارغين لإزالة الإحداثيات.' };
  }
  if (!latTrim || !lngTrim) {
    return { ok: false, error: 'أدخل خط العرض والطول معاً، أو اتركهما فارغين لإزالة الإحداثيات.' };
  }

  const latParsed = parseCoordToken(latTrim);
  const lngParsed = parseCoordToken(lngTrim);
  if (latParsed == null || lngParsed == null) {
    return { ok: false, error: 'إحداثيات غير صالحة — استخدم درجات عشرية مثل 21.5433 و 39.1728.' };
  }

  const latE7 = maybeFromE7Degrees(latParsed);
  const lngE7 = maybeFromE7Degrees(lngParsed);
  const swapped = maybeSwapKsaLatLng(latE7.value, lngE7.value);

  if (swapped.lat < -90 || swapped.lat > 90 || swapped.lng < -180 || swapped.lng > 180) {
    return {
      ok: false,
      error:
        'الإحداثيات خارج النطاق الجغرافي. خط العرض بين ‎-90 و90، وخط الطول بين ‎-180 و180 — مثال جدّة: 21.54 و 39.17.',
    };
  }

  return {
    ok: true,
    latitude: Number(swapped.lat.toFixed(8)),
    longitude: Number(swapped.lng.toFixed(8)),
    fromE7: latE7.fromE7 || lngE7.fromE7,
    swapped: swapped.swapped,
  };
}

export function mapCoordinateSaveError(raw: string): string {
  const msg = raw.trim();
  if (/numeric field/i.test(msg) || /overflow/i.test(msg)) {
    return 'قيمة الإحداثيات أكبر من سعة الحقل الرقمي. أدخل درجات عشرية (مثال: 21.54 و 39.17) وليس أرقاماً صحيحة طويلة.';
  }
  return msg;
}
