import { PLATFORM_COVERED_CITIES } from '@/config/platformCoveredCities';

const SLUG_TO_CITY_AR = new Map<string, string>();

for (const city of PLATFORM_COVERED_CITIES) {
  SLUG_TO_CITY_AR.set(city.id.toLowerCase(), city.nameAr);
  for (const alias of city.aliases ?? []) {
    const key = alias
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF-]/g, '');
    if (key) SLUG_TO_CITY_AR.set(key, city.nameAr);
  }
}

/** Common export filename slugs (halaqmap_*_barbers_FINAL). */
const EXTRA_SLUGS: Record<string, string> = {
  alahsa: 'الأحساء',
  ahsa: 'الأحساء',
  alhasa: 'الأحساء',
  buraydah: 'بريدة',
  buraidah: 'بريدة',
  qassim: 'بريدة',
  eastern: 'الدمام',
  makkah: 'مكة',
  madinah: 'المدينة',
  riyadh: 'الرياض',
  jeddah: 'جدة',
  dammam: 'الدمام',
  khobar: 'الخبر',
  abha: 'أبها',
  tabuk: 'تبوك',
  hail: 'حائل',
  jazan: 'جازان',
  najran: 'نجران',
};

for (const [slug, nameAr] of Object.entries(EXTRA_SLUGS)) {
  SLUG_TO_CITY_AR.set(slug, nameAr);
}

function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Reads `halaqmap_<region>_barbers_FINAL_*.xlsx` (or similar) and returns default city Arabic name.
 */
export function inferDefaultCityFromProspectFilename(filename: string): string | undefined {
  const base = filename.replace(/\.[^.]+$/, '');
  const tagged = base.match(/halaqmap[_-]([a-z0-9_-]+)[_-]barbers/i);
  if (tagged?.[1]) {
    const city = SLUG_TO_CITY_AR.get(normalizeSlug(tagged[1]));
    if (city) return city;
  }

  for (const [slug, nameAr] of SLUG_TO_CITY_AR) {
    if (slug.length < 3) continue;
    if (base.toLowerCase().includes(slug)) return nameAr;
  }

  return undefined;
}
