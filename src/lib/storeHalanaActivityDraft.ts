/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مسودة رحلة العميلة على جهازها — بلا حفظ لدى المنصة.
 */

export type HalanaOccasionId = 'all' | 'hospitality' | 'gift' | 'occasion' | 'daily' | 'custom';

export type HalanaActivityDraft = {
  occasion: HalanaOccasionId;
  refWorkId: string;
  refWorkCaption: string;
  refWorkSrc: string;
  sweetType: string;
  fillings: string;
  selectedFlavors: string[];
};

export const HALANA_OCCASIONS: ReadonlyArray<{ id: HalanaOccasionId; labelAr: string; keywords: string[] }> = [
  { id: 'all', labelAr: 'عرض الكل', keywords: [] },
  { id: 'hospitality', labelAr: 'ضيافة', keywords: ['ضياف', 'قهو', 'ضيوف', 'مجلس'] },
  { id: 'gift', labelAr: 'هدية', keywords: ['هد', 'إهد', 'هدية', 'تغليف'] },
  { id: 'occasion', labelAr: 'مناسبة', keywords: ['مناسب', 'عرس', 'زف', 'عيد', 'احتف'] },
  { id: 'daily', labelAr: 'طلب يومي', keywords: ['يوم', 'سريع', 'جاهز', 'عصر'] },
  { id: 'custom', labelAr: 'تصميم خاص', keywords: ['خاص', 'مخص', 'تصميم', 'حسب'] },
];

export const HALANA_OCCASION_IDS: readonly HalanaOccasionId[] = HALANA_OCCASIONS.map((item) => item.id);

const HALANA_OCCASION_ID_SET = new Set<string>(HALANA_OCCASION_IDS);

export function defaultHalanaOccasionsVisible(): HalanaOccasionId[] {
  return [...HALANA_OCCASION_IDS];
}

export function parseHalanaOccasionsVisible(raw: unknown): HalanaOccasionId[] | null {
  if (raw === undefined || raw === null) return null;
  if (Array.isArray(raw)) {
    const ids = raw
      .map((item) => String(item || '').trim())
      .filter((id): id is HalanaOccasionId => HALANA_OCCASION_ID_SET.has(id));
    return ids.length > 0 ? ids : null;
  }
  const text = String(raw || '').trim();
  if (!text) return null;
  const ids = text
    .split(/[,|\s]+/)
    .map((item) => item.trim())
    .filter((id): id is HalanaOccasionId => HALANA_OCCASION_ID_SET.has(id));
  return ids.length > 0 ? ids : null;
}

export function resolveHalanaVisibleOccasions(raw: unknown): ReadonlyArray<(typeof HALANA_OCCASIONS)[number]> {
  const parsed = parseHalanaOccasionsVisible(raw);
  if (!parsed) return HALANA_OCCASIONS;
  const visible = new Set(parsed);
  const filtered = HALANA_OCCASIONS.filter((item) => visible.has(item.id));
  return filtered.length > 0 ? filtered : HALANA_OCCASIONS;
}

export function serializeHalanaOccasionsVisible(ids: readonly HalanaOccasionId[]): string {
  const unique = HALANA_OCCASION_IDS.filter((id) => ids.includes(id));
  if (unique.length >= HALANA_OCCASION_IDS.length) return '';
  return unique.join(',');
}

const DRAFT_PREFIX = 'halana-activity-draft:';

export function emptyHalanaActivityDraft(): HalanaActivityDraft {
  return {
    occasion: 'all',
    refWorkId: '',
    refWorkCaption: '',
    refWorkSrc: '',
    sweetType: '',
    fillings: '',
    selectedFlavors: [],
  };
}

function draftKey(token: string): string {
  return `${DRAFT_PREFIX}${token.trim()}`;
}

export function loadHalanaActivityDraft(token: string): HalanaActivityDraft {
  if (typeof sessionStorage === 'undefined') return emptyHalanaActivityDraft();
  try {
    const raw = sessionStorage.getItem(draftKey(token));
    if (!raw) return emptyHalanaActivityDraft();
    const parsed = JSON.parse(raw) as Partial<HalanaActivityDraft>;
    return {
      ...emptyHalanaActivityDraft(),
      ...parsed,
      selectedFlavors: Array.isArray(parsed.selectedFlavors)
        ? parsed.selectedFlavors.map((item) => String(item || '').trim()).filter(Boolean)
        : [],
    };
  } catch {
    return emptyHalanaActivityDraft();
  }
}

export function saveHalanaActivityDraft(token: string, patch: Partial<HalanaActivityDraft>): HalanaActivityDraft {
  const next = { ...loadHalanaActivityDraft(token), ...patch };
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(draftKey(token), JSON.stringify(next));
  }
  return next;
}

export function clearHalanaActivityDraft(token: string): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(draftKey(token));
  }
}

export function matchesHalanaOccasion(text: string, occasion: HalanaOccasionId): boolean {
  if (occasion === 'all') return true;
  const meta = HALANA_OCCASIONS.find((item) => item.id === occasion);
  if (!meta || meta.keywords.length === 0) return true;
  const hay = text.toLowerCase();
  return meta.keywords.some((word) => hay.includes(word));
}

export function parseReadyLine(line: string): { title: string; detail: string } {
  const trimmed = line.trim();
  const dash = trimmed.match(/^(.+?)\s*[—–-]\s*(.+)$/);
  if (dash) return { title: dash[1].trim(), detail: dash[2].trim() };
  return { title: trimmed, detail: '' };
}
