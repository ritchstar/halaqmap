import { SubscriptionTier } from '@/lib';

/** التصنيف المخزَّن في `specialties` لمسار مركز العناية بالرجل. */
export const MENS_GROOMING_CENTER_CATEGORY_AR = 'مركز العناية بالرجل' as const;

/** إلزامي في المسار — حلاقة رجالية. */
export const MENS_GROOMING_MANDATORY_HAIRCUT_AR = 'حلاقة رجالي' as const;

export const MENS_GROOMING_CENTER_MAX_BANNER_LINES = 8;
export const MENS_GROOMING_CENTER_MIN_BANNER_LINES = 2;

export const MENS_GROOMING_CENTER_DIAMOND_OFFICE_AR =
  'مسار «مراكز العناية بالرجل» متاح للباقة الماسية مع إضافة المكتب الخاص فقط — فلتر مستقل، بنر مميز، ولوحة تحكم لتسمية خدماتك وعرضها كما تعهد.';

export const MENS_GROOMING_CENTER_COMPLIANCE_AR =
  'أقرّ أن نشاطي يجمع خدمات الحلاقة والعناية والمساج ضمن الترخيص والاشتراطات البلدية والصحية المعتمدة — والمنصة شريك تقني لا تتحقق من الوثائق.';

export function canEnableMensGroomingCenter(input: {
  tier: SubscriptionTier | '' | string | null | undefined;
  digitalShiftAddon: boolean;
}): boolean {
  const isDiamond =
    input.tier === SubscriptionTier.DIAMOND || String(input.tier ?? '').toLowerCase() === 'diamond';
  return isDiamond && input.digitalShiftAddon === true;
}

export function normalizeGroomingCenterBannerLines(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const lines = raw
    .map((line) => String(line ?? '').trim())
    .filter(Boolean)
    .slice(0, MENS_GROOMING_CENTER_MAX_BANNER_LINES);
  return lines;
}

export function resolveRegistrationMensGroomingFields(input: {
  specialtyTrack: 'general' | 'children' | 'mens_grooming_center';
  tier: SubscriptionTier;
  digitalShiftAddon: boolean;
  groomingCenterBannerLines: string[];
}): {
  categories: string[];
  mensGroomingCenter: boolean;
  groomingCenterBannerLines: string[];
} {
  if (
    input.specialtyTrack !== 'mens_grooming_center' ||
    !canEnableMensGroomingCenter({ tier: input.tier, digitalShiftAddon: input.digitalShiftAddon })
  ) {
    return {
      categories: [],
      mensGroomingCenter: false,
      groomingCenterBannerLines: [],
    };
  }

  const bannerLines = normalizeGroomingCenterBannerLines(input.groomingCenterBannerLines);
  const withMandatory = bannerLines.some(
    (line) => line === MENS_GROOMING_MANDATORY_HAIRCUT_AR || line.includes('حلاقة رجال'),
  )
    ? bannerLines
    : [MENS_GROOMING_MANDATORY_HAIRCUT_AR, ...bannerLines].slice(0, MENS_GROOMING_CENTER_MAX_BANNER_LINES);

  return {
    categories: [MENS_GROOMING_MANDATORY_HAIRCUT_AR, MENS_GROOMING_CENTER_CATEGORY_AR],
    mensGroomingCenter: true,
    groomingCenterBannerLines: withMandatory,
  };
}

export function resolveMensGroomingCenterFlag(input: {
  requested: boolean;
  tier: string | null | undefined;
  hasMensHaircutInSpecialties: boolean;
  digitalShiftAddon?: boolean;
}): boolean {
  if (!input.requested || !input.hasMensHaircutInSpecialties) return false;
  return canEnableMensGroomingCenter({
    tier: input.tier ?? '',
    digitalShiftAddon: input.digitalShiftAddon === true,
  });
}
