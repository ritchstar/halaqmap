/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
const PATH = '/api/public-store-gift';

export type StoreGiftPublicState = {
  slotNo: number;
  slotCount: number;
  qualifiedCount: number;
  cap: number;
  accepting: boolean;
  exhausted: boolean;
  closed: boolean;
  nominees: { slotNo: number; givenName: string; productLabelAr: string }[];
};

async function readJson(res: Response): Promise<Record<string, unknown>> {
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

export async function fetchStoreGiftState(): Promise<StoreGiftPublicState | null> {
  try {
    const res = await fetch(PATH, { method: 'GET' });
    const data = await readJson(res);
    if (!res.ok || data.ok !== true) return null;
    return {
      slotNo: Number(data.slotNo || 1),
      slotCount: Number(data.slotCount || 5),
      qualifiedCount: Number(data.qualifiedCount || 0),
      cap: Number(data.cap || 50),
      accepting: data.accepting === true,
      exhausted: data.exhausted === true,
      closed: data.closed === true,
      nominees: Array.isArray(data.nominees)
        ? (data.nominees as StoreGiftPublicState['nominees'])
        : [],
    };
  } catch {
    return null;
  }
}

export async function enterStoreGift(body: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'enter', ...body }),
    });
    const data = await readJson(res);
    if (!res.ok || data.ok !== true) {
      return { ok: false, error: typeof data.error === 'string' ? data.error : 'تعذر حفظ المشاركة.' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'تعذّر الاتصال. أعد المحاولة.' };
  }
}

export async function confirmStoreGift(token: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'confirm', token }),
    });
    const data = await readJson(res);
    if (!res.ok || data.ok !== true) {
      return { ok: false, error: typeof data.error === 'string' ? data.error : 'تعذر تأكيد الرابط.' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'تعذّر الاتصال. أعد المحاولة.' };
  }
}
