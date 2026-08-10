/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بطاقة تواصل ماب المفضلة — تُحفظ محلياً على جهاز العميل فقط (بلا صور شخصية).
 */
export type MapContactCardFavorite = {
  v: 1;
  alias: string;
  templateId: string;
  message: string;
  cityId: string;
  iconId: string;
  /** رقم واتساب الصالون المفضّل (اختياري) — محلي فقط */
  favoriteBarberPhone?: string;
  savedAt: string;
};

const STORAGE_KEY = 'halaqmap_map_contact_card_favorite_v1';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export function loadMapContactCardFavorite(): MapContactCardFavorite | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.v !== 1) return null;
    const alias = typeof parsed.alias === 'string' ? parsed.alias.slice(0, 40) : '';
    const templateId = typeof parsed.templateId === 'string' ? parsed.templateId : '';
    const message = typeof parsed.message === 'string' ? parsed.message.slice(0, 180) : '';
    const cityId = typeof parsed.cityId === 'string' ? parsed.cityId : '';
    const iconId = typeof parsed.iconId === 'string' ? parsed.iconId : '';
    if (!alias || !message || !cityId || !iconId) return null;
    const phone =
      typeof parsed.favoriteBarberPhone === 'string'
        ? parsed.favoriteBarberPhone.slice(0, 20)
        : undefined;
    const savedAt =
      typeof parsed.savedAt === 'string' ? parsed.savedAt : new Date().toISOString();
    return {
      v: 1,
      alias,
      templateId,
      message,
      cityId,
      iconId,
      favoriteBarberPhone: phone || undefined,
      savedAt,
    };
  } catch {
    return null;
  }
}

export function saveMapContactCardFavorite(
  card: Omit<MapContactCardFavorite, 'v' | 'savedAt'> & { savedAt?: string },
): MapContactCardFavorite {
  const next: MapContactCardFavorite = {
    v: 1,
    alias: card.alias.trim().slice(0, 40) || 'زائر ماب',
    templateId: card.templateId,
    message: card.message.trim().slice(0, 180),
    cityId: card.cityId,
    iconId: card.iconId,
    favoriteBarberPhone: card.favoriteBarberPhone?.trim().slice(0, 20) || undefined,
    savedAt: card.savedAt ?? new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearMapContactCardFavorite(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
