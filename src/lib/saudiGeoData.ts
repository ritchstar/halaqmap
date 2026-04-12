export type SaudiRegionLite = {
  region_id: number;
  capital_city_id: number;
  code: string;
  name_ar: string;
  name_en: string;
  population: number;
};

export type SaudiCityLite = {
  city_id: number;
  region_id: number;
  name_ar: string;
  name_en: string;
};

export type SaudiDistrictLite = {
  district_id: number;
  city_id: number;
  region_id: number;
  name_ar: string;
  name_en: string;
};

export type SaudiGeoBundle = {
  regions: SaudiRegionLite[];
  cities: SaudiCityLite[];
  districts: SaudiDistrictLite[];
};

let bundlePromise: Promise<SaudiGeoBundle> | null = null;

/** تحميل مرة واحدة (lazy) — ~1.1 MB gzip عبر الشبكة عند أول استخدام */
export function loadSaudiGeoLite(): Promise<SaudiGeoBundle> {
  if (!bundlePromise) {
    bundlePromise = Promise.all([
      import('@/data/saudi-geo/regions_lite.json'),
      import('@/data/saudi-geo/cities_lite.json'),
      import('@/data/saudi-geo/districts_lite.json'),
    ]).then(([regionsMod, citiesMod, districtsMod]) => ({
      regions: (regionsMod.default ?? regionsMod) as SaudiRegionLite[],
      cities: (citiesMod.default ?? citiesMod) as SaudiCityLite[],
      districts: (districtsMod.default ?? districtsMod) as SaudiDistrictLite[],
    }));
  }
  return bundlePromise;
}

export function sortArabicLabel(a: string, b: string): number {
  return a.localeCompare(b, 'ar');
}

export const OTHER_DISTRICT_VALUE = '__other__';
