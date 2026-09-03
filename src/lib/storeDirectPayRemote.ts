/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
const PATH = '/api/public-store-direct-pay';

async function readJson(res: Response): Promise<Record<string, unknown>> {
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

export async function fetchDirectPay(input: {
  product: string;
  token: string;
  role: 'shop' | 'desk';
  requestRef?: string;
}) {
  try {
    const q = new URLSearchParams({
      product: input.product,
      token: input.token,
      role: input.role,
    });
    if (input.requestRef) q.set('requestRef', input.requestRef);
    const res = await fetch(`${PATH}?${q.toString()}`);
    const data = await readJson(res);
    if (!res.ok || data.ok !== true) {
      return { ok: false as const, error: typeof data.error === 'string' ? data.error : 'تعذر قراءة وسائل التحويل.' };
    }
    return { ok: true as const, data };
  } catch {
    return { ok: false as const, error: 'تعذر الاتصال.' };
  }
}

export async function postDirectPay(body: Record<string, unknown>) {
  try {
    const res = await fetch(PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await readJson(res);
    if (!res.ok || data.ok === false) {
      return { ok: false as const, error: typeof data.error === 'string' ? data.error : 'تعذر تنفيذ الإجراء.' };
    }
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: 'تعذر الاتصال.' };
  }
}
