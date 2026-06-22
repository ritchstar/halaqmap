import {
  DEFAULT_KSA_CITY_ID,
  KSA_CITIES_GEO,
  USER_COORDS_SESSION_KEY,
  findNearestKsaClockBarCity,
} from '@/config/ksaCitiesGeo';
import { nearestPlatformCity } from '@/config/platformCoveredCities';

export type UserCoords = { lat: number; lng: number };

export type UserRegionCity = {
  id: string;
  nameAr: string;
  lat: number;
  lng: number;
  baseTemp: number;
  /** هل المدينة ضمن الـ 10 في الشريط العلوي */
  inClockBar: boolean;
};

export type UserRegion = {
  city: UserRegionCity;
  coords: UserCoords;
  fromDevice: boolean;
};

const weatherCache = new Map<string, { temp: number; at: number }>();
const CACHE_MS = 15 * 60_000;

type ClockBarCity = (typeof KSA_CITIES_GEO)[number];

/** أقرب مدينة من الـ 10 في الشريط — للتوافق مع الاستدعاءات القديمة */
export function findNearestKsaCity(lat: number, lng: number): ClockBarCity {
  return findNearestKsaClockBarCity(lat, lng);
}

function toUserRegionCity(
  id: string,
  nameAr: string,
  lat: number,
  lng: number,
  barAnchor: ClockBarCity,
): UserRegionCity {
  return {
    id,
    nameAr,
    lat,
    lng,
    baseTemp: barAnchor.baseTemp,
    inClockBar: KSA_CITIES_GEO.some((city) => city.id === id),
  };
}

export function getDefaultKsaCity(): UserRegionCity {
  const fallback = KSA_CITIES_GEO.find((c) => c.id === DEFAULT_KSA_CITY_ID) ?? KSA_CITIES_GEO[0];
  return toUserRegionCity(fallback.id, fallback.nameAr, fallback.lat, fallback.lng, fallback);
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

export function clearStoredUserCoords(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(USER_COORDS_SESSION_KEY);
  } catch {
    /* ignore quota */
  }
}

export function resolveUserRegion(coords: UserCoords | null, fromDevice: boolean): UserRegion {
  if (coords) {
    const barAnchor = findNearestKsaClockBarCity(coords.lat, coords.lng);
    const platformCity = nearestPlatformCity(coords.lat, coords.lng);
    const city = platformCity
      ? toUserRegionCity(platformCity.id, platformCity.nameAr, platformCity.lat, platformCity.lng, barAnchor)
      : toUserRegionCity(barAnchor.id, barAnchor.nameAr, barAnchor.lat, barAnchor.lng, barAnchor);

    return { city, coords, fromDevice };
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
