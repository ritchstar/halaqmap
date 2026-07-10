const DRAFT_KEY = 'halaqmap-semat-card-draft';

export type SematCardDraft = {
  publicId: string;
  displayName: string;
  hairPreset: string;
  hairDetail: string;
  beardStyle: string;
  notes: string;
  /** اسم الملف فقط — الصورة تبقى في ذاكرة الجلسة الحالية */
  referenceImageName: string | null;
  createdAt: string;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

/** معرّف عام مؤقت للمعاينة — يُستبدل بمعرّف خادم بعد الدفع. */
export function createSematPreviewPublicId(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return `pv_${out}`;
}

export function readSematDraft(): SematCardDraft | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SematCardDraft;
    if (!parsed?.publicId || !parsed?.displayName) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function storeSematDraft(draft: SematCardDraft): void {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearSematDraft(): void {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(DRAFT_KEY);
}
