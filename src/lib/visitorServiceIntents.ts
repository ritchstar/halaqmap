import type { FilterState } from '@/lib/index';

export type VisitorServiceIntentId =
  | 'near_open'
  | 'home_visit'
  | 'elderly_care'
  | 'groom_prep'
  | 'children_specialist'
  | 'mens_grooming'
  | 'top_rated';

export type VisitorServiceIntentDef = {
  id: VisitorServiceIntentId;
  label: string;
  shortLabel: string;
  emoji: string;
};

export const VISITOR_SERVICE_INTENTS: VisitorServiceIntentDef[] = [
  { id: 'near_open', label: 'مفتوح الآن قريباً', shortLabel: 'مفتوح الآن', emoji: '🟢' },
  { id: 'home_visit', label: 'خدمة منزلية', shortLabel: 'منزلي', emoji: '🏠' },
  { id: 'elderly_care', label: 'كبار السن والاحتياجات', shortLabel: 'كبار سن', emoji: '♿' },
  { id: 'groom_prep', label: 'تجهيز عريس', shortLabel: 'عريس', emoji: '👔' },
  { id: 'children_specialist', label: 'متخصص أطفال', shortLabel: 'أطفال', emoji: '👦' },
  { id: 'mens_grooming', label: 'مركز عناية رجل', shortLabel: 'عناية رجل', emoji: '✦' },
  { id: 'top_rated', label: 'تقييم 4.5+', shortLabel: 'الأعلى تقييماً', emoji: '⭐' },
];

/** ترتيب عدسة الجوال — أساس (3) ثم تخصّص (4) بلا تمرير */
export const VISITOR_MOBILE_QUERY_PRIMARY_IDS = [
  'near_open',
  'home_visit',
  'top_rated',
] as const satisfies readonly VisitorServiceIntentId[];

export const VISITOR_MOBILE_QUERY_REFINE_IDS = [
  'elderly_care',
  'groom_prep',
  'children_specialist',
  'mens_grooming',
] as const satisfies readonly VisitorServiceIntentId[];

const DEFAULT_MAX_KM = 1;

function baseFilters(maxDistance = DEFAULT_MAX_KM): FilterState {
  return {
    maxDistance,
    tiers: [],
    openNow: false,
    minRating: 0,
    categories: [],
    childrenSpecialistOnly: false,
    mensGroomingCenterOnly: false,
  };
}

export function applyVisitorServiceIntent(
  intentId: VisitorServiceIntentId,
  currentMaxDistance = DEFAULT_MAX_KM,
): FilterState {
  const maxDistance = Math.max(1, Math.min(10, Math.trunc(currentMaxDistance) || DEFAULT_MAX_KM));
  switch (intentId) {
    case 'near_open':
      return { ...baseFilters(maxDistance), openNow: true };
    case 'home_visit':
      return { ...baseFilters(maxDistance), categories: ['زيارة منزلية'] };
    case 'elderly_care':
      return { ...baseFilters(maxDistance), categories: ['احتياجات خاصة'] };
    case 'groom_prep':
      return { ...baseFilters(maxDistance), categories: ['تجهيز عريس'] };
    case 'children_specialist':
      return { ...baseFilters(maxDistance), childrenSpecialistOnly: true };
    case 'mens_grooming':
      return { ...baseFilters(maxDistance), mensGroomingCenterOnly: true };
    case 'top_rated':
      return { ...baseFilters(maxDistance), minRating: 4.5 };
    default:
      return { ...baseFilters(maxDistance), openNow: true };
  }
}

export function detectVisitorServiceIntent(filters: FilterState): VisitorServiceIntentId | null {
  if (filters.mensGroomingCenterOnly) return 'mens_grooming';
  if (filters.childrenSpecialistOnly) return 'children_specialist';
  if (filters.minRating >= 4.5 && filters.categories.length === 0 && !filters.openNow) return 'top_rated';
  if (filters.categories.includes('تجهيز عريس')) return 'groom_prep';
  if (filters.categories.includes('زيارة منزلية')) return 'home_visit';
  if (filters.categories.includes('احتياجات خاصة')) return 'elderly_care';
  if (filters.openNow && filters.categories.length === 0 && filters.minRating === 0 && !filters.childrenSpecialistOnly && !filters.mensGroomingCenterOnly) {
    return 'near_open';
  }
  return null;
}

export function defaultVisitorFilters(): FilterState {
  return applyVisitorServiceIntent('near_open');
}
