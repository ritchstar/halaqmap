/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قراءة صفحة الحي بلا إسقاط الرابط عند فشل نبضة لاحقة.
 */
export type StoreLivePublicGate = 'loading' | 'ok' | 'expired' | 'missing';

export function nextStoreLivePublicGate(
  current: StoreLivePublicGate,
  result: { ok?: boolean; expired?: boolean; payload?: unknown },
): { gate: StoreLivePublicGate; applyPayload: boolean } {
  if (result.expired === true) return { gate: 'expired', applyPayload: false };
  const good = result.ok === true && !!result.payload && typeof result.payload === 'object';
  if (good) return { gate: 'ok', applyPayload: true };
  if (current === 'ok' || current === 'expired') return { gate: current, applyPayload: false };
  return { gate: 'missing', applyPayload: false };
}

export async function fetchStoreLivePublicGet(
  endpoint: string,
  token: string,
  role: string,
): Promise<{ ok: boolean; expired?: boolean; payload?: unknown; error?: string; [k: string]: unknown }> {
  try {
    const q = new URLSearchParams({ token, role });
    const res = await fetch(`${endpoint}?${q.toString()}`);
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok || data.ok !== true) {
      return { ok: false, error: typeof data.error === 'string' ? data.error : 'تعذّر قراءة الصفحة.', ...data };
    }
    return { ok: true, ...data };
  } catch {
    return { ok: false, error: 'تعذّر الاتصال. أعد المحاولة.' };
  }
}
