import {
  normalizeGroomingCenterBannerLines,
  resolveMensGroomingCenterFlag,
} from './mensGroomingCenterPolicy.js';

const MENS_HAIRCUT_LABELS = new Set(['حلاقة رجالي', 'حلاقة رجالية', 'رجالي']);

function hasMensHaircutInSpecialties(raw: unknown): boolean {
  if (!Array.isArray(raw)) return false;
  return raw.some((item) => {
    const label = String(item ?? '').trim();
    return MENS_HAIRCUT_LABELS.has(label) || label.includes('حلاقة رجال');
  });
}

export type MensGroomingCenterBarberSnapshot = {
  mensGroomingCenter: boolean;
  groomingCenterBannerLines: string[];
};

export function buildMensGroomingCenterSnapshotFromBarberRow(row: {
  specialties?: unknown;
  mens_grooming_center?: boolean | null;
  grooming_center_banner_lines?: unknown;
  tier?: string | null;
}): MensGroomingCenterBarberSnapshot {
  const groomingCenterBannerLines = normalizeGroomingCenterBannerLines(row.grooming_center_banner_lines);
  const mensGroomingCenter = resolveMensGroomingCenterFlag({
    requested: row.mens_grooming_center === true,
    tier: row.tier,
    hasMensHaircutInSpecialties:
      hasMensHaircutInSpecialties(row.specialties) ||
      groomingCenterBannerLines.some(
        (line) => line === 'حلاقة رجالي' || line.includes('حلاقة رجال'),
      ),
  });
  return {
    mensGroomingCenter,
    groomingCenterBannerLines: mensGroomingCenter ? groomingCenterBannerLines : [],
  };
}
