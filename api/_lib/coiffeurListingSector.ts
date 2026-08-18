/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * قطاع الإدراج والعزل بين حلاق ماب وكوافير ماب — منطق خادم فقط.
 */

export const MENS_LISTING_SECTOR = 'mens_barber' as const;
export const COIFFEUR_LISTING_SECTOR = 'coiffeur_women' as const;

export type ListingSector = typeof MENS_LISTING_SECTOR | typeof COIFFEUR_LISTING_SECTOR;

export const COIFFEUR_INDEPENDENTS_CATEGORY = 'مستقلات تجميل' as const;

export const COIFFEUR_REGISTRATION_CATEGORIES = [
  'كوافير نسائي',
  'مشغل تجميل',
  'سبا ومساج',
  'مكياج وسهرات',
  'عناية أظافر',
  'عناية بشرة',
  COIFFEUR_INDEPENDENTS_CATEGORY,
  'زيارة منزلية',
] as const;

const COIFFEUR_CATEGORY_SET = new Set<string>(COIFFEUR_REGISTRATION_CATEGORIES);

const COIFFEUR_ONLY_CATEGORIES = new Set<string>(
  COIFFEUR_REGISTRATION_CATEGORIES.filter((c) => c !== 'زيارة منزلية'),
);

export const COIFFEUR_INTENT_CATEGORY: Record<string, string | null> = {
  near_open: null,
  coiffeur: 'كوافير نسائي',
  beauty_salon: 'مشغل تجميل',
  spa: 'سبا ومساج',
  makeup: 'مكياج وسهرات',
  nails: 'عناية أظافر',
  skin: 'عناية بشرة',
  independents: COIFFEUR_INDEPENDENTS_CATEGORY,
};

export function normalizeListingSector(raw: unknown): ListingSector {
  return raw === COIFFEUR_LISTING_SECTOR ? COIFFEUR_LISTING_SECTOR : MENS_LISTING_SECTOR;
}

export function isCoiffeurWomenListing(row: { listing_sector?: unknown; sector?: unknown }): boolean {
  return row.listing_sector === COIFFEUR_LISTING_SECTOR || row.sector === COIFFEUR_LISTING_SECTOR;
}

export function listingMatchesCoiffeurIntent(input: {
  specialties: readonly string[];
  intent: string;
  openForCustomers: boolean;
}): boolean {
  const intent = String(input.intent || 'near_open').trim().toLowerCase();
  if (intent === 'near_open' || !intent) {
    return input.openForCustomers;
  }
  const category = COIFFEUR_INTENT_CATEGORY[intent];
  if (!category) return true;
  return input.specialties.includes(category);
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
}

export type ListingSectorValidationResult =
  | { ok: true; listingSector: ListingSector }
  | { ok: false; error: string; code: string };

export function validateRegistrationListingSector(
  payload: Record<string, unknown>,
): ListingSectorValidationResult {
  const listingSector = normalizeListingSector(payload.listingSector);
  const categories = Array.isArray(payload.categories)
    ? payload.categories.filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
    : [];
  const specialtyTrack = String(payload.specialtyTrack ?? 'general').trim();

  if (listingSector === COIFFEUR_LISTING_SECTOR) {
    if (payload.childrenSpecialist === true || payload.mensGroomingCenter === true) {
      return {
        ok: false,
        error: 'مسار كوافير ماب لا يقبل تخصص أطفال أو مراكز العناية بالرجل.',
        code: 'invalid_coiffeur_specialty_track',
      };
    }
    if (specialtyTrack === 'children' || specialtyTrack === 'mens_grooming_center') {
      return {
        ok: false,
        error: 'مسار كوافير ماب يستخدم تصنيفات المشغل النسائي فقط.',
        code: 'invalid_coiffeur_specialty_track',
      };
    }
    if (categories.length === 0) {
      return {
        ok: false,
        error: 'اختاري نوع خدمة واحداً على الأقل للمشغل النسائي.',
        code: 'missing_coiffeur_categories',
      };
    }
    if (categories.some((c) => !COIFFEUR_CATEGORY_SET.has(c))) {
      return {
        ok: false,
        error: 'تصنيف غير صالح لمسار كوافير ماب.',
        code: 'invalid_coiffeur_categories',
      };
    }
    return { ok: true, listingSector };
  }

  if (categories.some((c) => COIFFEUR_ONLY_CATEGORIES.has(c))) {
    return {
      ok: false,
      error: 'تصنيف كوافير ماب لا يُدرَج في بحث حلاق ماب للرجال.',
      code: 'coiffeur_category_on_mens_sector',
    };
  }

  return { ok: true, listingSector };
}
