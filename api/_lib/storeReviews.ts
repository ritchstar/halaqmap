/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحقق تقييمات المتجر: نجوم وتعليق. لا كاردي8.
 */
export const STORE_REVIEWS_TABLE = 'store_reviews' as const;
export const STORE_REVIEWS_COMMENT_MIN = 8 as const;
export const STORE_REVIEWS_COMMENT_MAX = 600 as const;

export type StoreReviewStatus = 'published' | 'hidden';

export type StoreReviewPublic = {
  id: string;
  stars: number;
  comment: string;
  displayName: string;
  createdAt: string;
};

export type StoreReviewAdmin = StoreReviewPublic & {
  status: StoreReviewStatus;
  unseen: boolean;
};

function clip(raw: unknown, max: number): string {
  return String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function parseReviewStars(raw: unknown): number | null {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 5) return null;
  return n;
}

export function parseReviewComment(raw: unknown): string | null {
  const comment = clip(raw, STORE_REVIEWS_COMMENT_MAX);
  if (comment.length < STORE_REVIEWS_COMMENT_MIN) return null;
  if (/https?:\/\//i.test(comment)) return null;
  return comment;
}

export function parseReviewDisplayName(raw: unknown): string {
  return clip(raw, 40).replace(/[0-9]/g, '');
}

export function parseStoreReviewBody(body: Record<string, unknown>):
  | { ok: true; stars: number; comment: string; displayName: string }
  | { ok: false; error: string } {
  const stars = parseReviewStars(body.stars);
  if (!stars) return { ok: false, error: 'اختر عدد النجوم.' };
  const comment = parseReviewComment(body.comment);
  if (!comment) return { ok: false, error: 'اكتب تعليقاً واضحاً لا يقل عن ثمانية أحرف.' };
  return { ok: true, stars, comment, displayName: parseReviewDisplayName(body.displayName) };
}

export function publicReviewFromRow(row: {
  id: string;
  stars: number;
  comment: string;
  display_name?: string | null;
  created_at: string;
}): StoreReviewPublic {
  return {
    id: String(row.id),
    stars: Number(row.stars),
    comment: String(row.comment || ''),
    displayName: String(row.display_name || '').trim(),
    createdAt: String(row.created_at || ''),
  };
}

export function adminReviewFromRow(row: {
  id: string;
  stars: number;
  comment: string;
  display_name?: string | null;
  created_at: string;
  status?: string | null;
  admin_seen_at?: string | null;
}): StoreReviewAdmin {
  return {
    ...publicReviewFromRow(row),
    status: row.status === 'hidden' ? 'hidden' : 'published',
    unseen: !row.admin_seen_at,
  };
}
