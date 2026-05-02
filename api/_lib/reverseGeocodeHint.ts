/**
 * تلميح حي/مدينة من إحداثيات (اختياري) — OpenStreetMap Nominatim.
 * الاستخدام خفيف فقط مع debounce من الواجهة؛ راجع سياسة الاستخدام العادل لـ OSM.
 */
export type ReverseGeocodeHint = {
  districtName: string | null;
  cityName: string | null;
};

function pickDistrict(addr: Record<string, string>): string {
  const keys = [
    'neighbourhood',
    'suburb',
    'quarter',
    'city_district',
    'hamlet',
    'village',
    'town',
  ] as const;
  for (const k of keys) {
    const v = addr[k];
    if (v && String(v).trim()) return String(v).trim();
  }
  return '';
}

function pickCity(addr: Record<string, string>): string {
  const v = addr.city || addr.municipality || addr.state || addr.county || '';
  return v ? String(v).trim() : '';
}

export async function reverseGeocodeDistrictHint(
  lat: number,
  lng: number,
  timeoutMs = 2800,
): Promise<ReverseGeocodeHint | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('format', 'json');
  url.searchParams.set('zoom', '14');
  url.searchParams.set('accept-language', 'ar,en');

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'HalaqMap/1.0 (https://halaqmap.com; search-activity-tracker)',
        Accept: 'application/json',
      },
      signal: ac.signal,
    });
    if (!res.ok) return null;
    const j = (await res.json().catch(() => null)) as { address?: Record<string, string> } | null;
    const addr = j?.address && typeof j.address === 'object' ? j.address : {};
    const dRaw = pickDistrict(addr);
    const cRaw = pickCity(addr);
    const districtName = dRaw ? dRaw.slice(0, 200) : null;
    const cityName = cRaw ? cRaw.slice(0, 200) : null;
    if (!districtName && !cityName) return null;
    return { districtName, cityName };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}
