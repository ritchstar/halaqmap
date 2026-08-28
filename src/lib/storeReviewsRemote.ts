/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
const PATH = '/api/public-store-reviews';

export type StoreReviewPublic = {
  id: string;
  stars: number;
  comment: string;
  displayName: string;
  createdAt: string;
};

async function readJson(res: Response): Promise<Record<string, unknown>> {
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

export async function fetchStoreReviews(): Promise<StoreReviewPublic[]> {
  try {
    const res = await fetch(PATH, { method: 'GET' });
    const data = await readJson(res);
    if (!res.ok || data.ok !== true || !Array.isArray(data.rows)) return [];
    return data.rows as StoreReviewPublic[];
  } catch {
    return [];
  }
}

export async function submitStoreReview(body: {
  stars: number;
  comment: string;
  displayName?: string;
  company_url_hp?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await readJson(res);
    if (!res.ok || data.ok !== true) {
      return { ok: false, error: typeof data.error === 'string' ? data.error : 'تعذر حفظ التقييم.' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'تعذّر الاتصال. أعد المحاولة.' };
  }
}
