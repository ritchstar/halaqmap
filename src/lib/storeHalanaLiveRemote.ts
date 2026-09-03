/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
const PATH = '/api/public-store-halana-live';

async function readJson(res: Response): Promise<Record<string, unknown>> {
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

export async function fetchHalanaPublic(token: string, role: 'shop' | 'desk'): Promise<{
  ok: boolean;
  expired?: boolean;
  error?: string;
  payload?: unknown;
}> {
  try {
    const res = await fetch(`${PATH}?token=${encodeURIComponent(token)}&role=${role}`);
    const data = await readJson(res);
    if (!res.ok || data.ok !== true) {
      return { ok: false, error: typeof data.error === 'string' ? data.error : 'تعذر قراءة الصفحة.' };
    }
    if (data.expired === true) {
      return { ok: false, expired: true, error: 'انتهت مدة التشغيل. أعد الشراء على نفس الصفحة.' };
    }
    return { ok: true, payload: data.payload };
  } catch {
    return { ok: false, error: 'تعذر الاتصال.' };
  }
}

export async function postHalanaAction(body: Record<string, unknown>) {
  try {
    const res = await fetch(PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await readJson(res);
    if (!res.ok || data.ok === false) {
      return { ok: false, error: typeof data.error === 'string' ? data.error : 'تعذر تنفيذ الإجراء.' };
    }
    return { ok: true, requestId: typeof data.requestId === 'string' ? data.requestId : '', ...data };
  } catch {
    return { ok: false, error: 'تعذر الاتصال.' };
  }
}

export async function createHalanaLivePending(input: Record<string, unknown>) {
  return postHalanaAction({ action: 'create_pending', ...input });
}

export async function activateHalanaLive(token: string, paymentId: string) {
  return postHalanaAction({ action: 'activate_paid', token, paymentId });
}

export async function syncHalanaLive(token: string) {
  return postHalanaAction({ action: 'sync_paid', token });
}

export async function fetchHalanaLivePay(token: string) {
  return postHalanaAction({ action: 'get_public', token, role: 'pay' });
}

export async function fetchHalanaPay(token: string, requestId: string) {
  try {
    const res = await fetch(
      `${PATH}?token=${encodeURIComponent(token)}&role=shop&requestId=${encodeURIComponent(requestId)}`,
    );
    const data = await readJson(res);
    if (!res.ok || data.ok !== true || !data.pay || typeof data.pay !== 'object') {
      return { ok: false, error: typeof data.error === 'string' ? data.error : 'تعذر قراءة تعليمات التحويل.' };
    }
    return { ok: true, pay: data.pay as Record<string, unknown> };
  } catch {
    return { ok: false, error: 'تعذر الاتصال.' };
  }
}
