/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
const PATH = '/api/public-store-trial';

async function readJson(res: Response): Promise<Record<string, unknown>> {
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

export async function enterStoreGeneralTrial(
  body: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'enter', ...body }),
    });
    const data = await readJson(res);
    if (!res.ok || data.ok === false) {
      return { ok: false, error: typeof data.error === 'string' ? data.error : 'تعذر إرسال الطلب.' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'تعذر الاتصال.' };
  }
}

export async function confirmStoreGeneralTrial(token: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'confirm', token }),
    });
    const data = await readJson(res);
    if (!res.ok || data.ok === false) {
      return { ok: false, error: typeof data.error === 'string' ? data.error : 'تعذر تأكيد البريد.' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'تعذر الاتصال.' };
  }
}
