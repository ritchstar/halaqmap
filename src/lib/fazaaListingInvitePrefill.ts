/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * استنتاج مدينة وأحياء الدعوة من عنوان الصالون في بطاقة الشريك.
 */
import { PLATFORM_COVERED_CITIES, resolvePlatformCity } from '@/config/platformCoveredCities';
import { GEO_NEAR_NODES } from '@/config/geoNearRegistry';

export function foldArabicPlace(value: string): string {
  return String(value || '')
    .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '')
    .toLowerCase();
}

export type FazaaInviteScopeHint = {
  citySlug: string;
  cityNameAr: string;
  neighborhoodSlugs: string[];
  areaLabelAr: string;
};

export function inferFazaaInviteScope(rawCity: string): FazaaInviteScopeHint {
  const text = String(rawCity || '').trim();
  const folded = foldArabicPlace(text);
  const fromCity = resolvePlatformCity(text);

  const matched = GEO_NEAR_NODES.filter((node) => {
    if (node.kind !== 'neighborhood') return false;
    const names = [node.nameAr, ...(node.aliasesAr ?? [])];
    return names.some((name) => {
      const key = foldArabicPlace(name);
      return key.length >= 4 && folded.includes(key);
    });
  });
  const unique = [...new Map(matched.map((node) => [node.slug, node])).values()];

  const citySlug = fromCity?.id || unique[0]?.parentSlugs[0] || '';
  const city =
    PLATFORM_COVERED_CITIES.find((item) => item.id === citySlug) || fromCity || null;
  const inCity = unique.filter((node) => !city || node.parentSlugs[0] === city.id);
  const areaCore = inCity.map((node) => node.nameAr).join(' و');

  return {
    citySlug: city?.id || '',
    cityNameAr: city?.nameAr || '',
    neighborhoodSlugs: inCity.map((node) => node.slug),
    areaLabelAr: areaCore ? (areaCore.startsWith('حي') ? areaCore : `حي ${areaCore}`) : '',
  };
}
