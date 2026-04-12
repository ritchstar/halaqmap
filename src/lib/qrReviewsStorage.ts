import type { Review } from '@/lib/index';
import { mockReviews } from '@/data/index';

const STORAGE_KEY = 'halaqmap_qr_reviews_v1';

export type StoredQrReview = Review & {
  viaQrInvite: true;
  /** false = مخفي عن بطاقة الصالون العامة */
  isPublished?: boolean;
  /** يُرتَّب في الأعلى عند العرض */
  isHighlighted?: boolean;
};

function readStored(): StoredQrReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as StoredQrReview[]) : [];
  } catch {
    return [];
  }
}

function writeStored(rows: StoredQrReview[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new CustomEvent('halaqmap-qr-reviews'));
}

export function appendQrReview(review: StoredQrReview): void {
  const all = readStored();
  all.push(review);
  writeStored(all);
}

export function getStoredQrReviewsForBarber(barberId: string): StoredQrReview[] {
  return readStored().filter((r) => r.barberId === barberId);
}

export function updateStoredQrReview(
  id: string,
  patch: Partial<Pick<StoredQrReview, 'isPublished' | 'isHighlighted'>>,
): void {
  const all = readStored();
  const i = all.findIndex((r) => r.id === id);
  if (i === -1) return;
  all[i] = { ...all[i], ...patch };
  writeStored(all);
}

export function isReviewPublished(r: Review): boolean {
  return r.isPublished !== false;
}

/** دمج التقييمات الثابتة مع المخزنة محلياً — للعرض العام */
export function getMergedReviewsForBarber(barberId: string): Review[] {
  const staticPart = mockReviews.filter((r) => r.barberId === barberId && isReviewPublished(r));
  const dynamicPart = readStored().filter((r) => r.barberId === barberId && isReviewPublished(r));
  const combined = [...staticPart, ...dynamicPart];
  combined.sort((a, b) => {
    const ah = (a as StoredQrReview).isHighlighted ? 1 : 0;
    const bh = (b as StoredQrReview).isHighlighted ? 1 : 0;
    if (bh !== ah) return bh - ah;
    return (b.date || '').localeCompare(a.date || '');
  });
  return combined;
}

/** كل التقييمات (لإدارة الحلاق) بما فيها المخفية */
export function getAllMergedReviewsForBarberManage(barberId: string): Review[] {
  const staticPart = mockReviews.filter((r) => r.barberId === barberId);
  const dynamicPart = readStored().filter((r) => r.barberId === barberId);
  const byId = new Map<string, Review>();
  for (const r of staticPart) byId.set(r.id, r);
  for (const r of dynamicPart) byId.set(r.id, r);
  return Array.from(byId.values()).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}
