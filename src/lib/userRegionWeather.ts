import {
  DEFAULT_KSA_CITY_ID,
  KSA_CITIES_GEO,
  USER_COORDS_SESSION_KEY,
  type KsaCityGeo,
} from '@/config/ksaCitiesGeo';

export type UserCoords = { lat: number; lng: number };

export type UserRegion = {
  city: KsaCityGeo;
  coords: UserCoords;
  fromDevice: boolean;
};

const weatherCache = new Map<string, { temp: number; at: number }>();
const CACHE_MS = 15 * 60_000;

function haversineKm(a: UserCoords, b: UserCoords): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function findNearestKsaCity(lat: number, lng: number): KsaCityGeo {
  let best = KSA_CITIES_GEO[0];
  let bestDist = Infinity;
  for (const city of KSA_CITIES_GEO) {
    const dist = haversineKm({ lat, lng }, { lat: city.lat, lng: city.lng });
    if (dist < bestDist) {
      bestDist = dist;
      best = city;
    }
  }
  return best;
}

export function getDefaultKsaCity(): KsaCityGeo {
  return KSA_CITIES_GEO.find((c) => c.id === DEFAULT_KSA_CITY_ID) ?? KSA_CITIES_GEO[0];
}

export function readStoredUserCoords(): UserCoords | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(USER_COORDS_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserCoords;
    if (!Number.isFinite(parsed.lat) || !Number.isFinite(parsed.lng)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function storeUserCoords(coords: UserCoords): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(USER_COORDS_SESSION_KEY, JSON.stringify(coords));
    window.dispatchEvent(new CustomEvent('halaqmap:user-coords', { detail: coords }));
  } catch {
    /* ignore quota */
  }
}

export function resolveUserRegion(coords: UserCoords | null, fromDevice: boolean): UserRegion {
  if (coords) {
    return { city: findNearestKsaCity(coords.lat, coords.lng), coords, fromDevice };
  }
  const fallback = getDefaultKsaCity();
  return {
    city: fallback,
    coords: { lat: fallback.lat, lng: fallback.lng },
    fromDevice: false,
  };
}

export async function fetchTemperatureCelsius(lat: number, lng: number): Promise<number | null> {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.temp;

  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lng));
    url.searchParams.set('current', 'temperature_2m');
    url.searchParams.set('timezone', 'Asia/Riyadh');

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = (await res.json()) as { current?: { temperature_2m?: number } };
    const temp = data.current?.temperature_2m;
    if (typeof temp !== 'number' || !Number.isFinite(temp)) return null;
    const rounded = Math.round(temp);
    weatherCache.set(key, { temp: rounded, at: Date.now() });
    return rounded;
  } catch {
    return null;
  }
}

export function formatRiyadhMonthAr(now = new Date()): string {
  return new Intl.DateTimeFormat('ar-SA', {
    timeZone: 'Asia/Riyadh',
    month: 'long',
  }).format(now);
}

export function tempColor(temp: number): string {
  if (temp <= 22) return '#7dd3fc';
  if (temp <= 28) return '#6ee7b7';
  if (temp <= 32) return '#fde68a';
  if (temp <= 36) return '#fb923c';
  return '#f87171';
}
