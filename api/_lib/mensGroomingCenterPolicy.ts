/** مراكز العناية بالرجل — ماسي + مكتب خاص (مرآة لـ src/config/mensGroomingCenterPolicy.ts). */

export const MENS_GROOMING_CENTER_CATEGORY_AR = 'مركز العناية بالرجل';
export const MENS_GROOMING_MANDATORY_HAIRCUT_AR = 'حلاقة رجالي';
export const MENS_GROOMING_CENTER_MAX_BANNER_LINES = 8;

export function canEnableMensGroomingCenterTier(tier: string | null | undefined): boolean {
  return String(tier ?? '').trim().toLowerCase() === 'diamond';
}

export function normalizeGroomingCenterBannerLines(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((line) => String(line ?? '').trim())
    .filter(Boolean)
    .slice(0, MENS_GROOMING_CENTER_MAX_BANNER_LINES);
}

export function resolveMensGroomingCenterFlag(input: {
  requested: boolean;
  tier: string | null | undefined;
  hasMensHaircutInSpecialties: boolean;
  digitalShiftEnabled?: boolean;
}): boolean {
  if (!input.requested || !input.hasMensHaircutInSpecialties) return false;
  if (input.digitalShiftEnabled !== true) return false;
  return canEnableMensGroomingCenterTier(input.tier);
}
