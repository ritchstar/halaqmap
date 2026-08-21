/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
function apiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || '')
    .trim()
    .replace(/\/$/, '');
}

export function storeWeddingLiveEndpoint(): string {
  const origin = apiOrigin();
  if (!origin) return '/api/public-store-wedding-live';
  return `${origin}/api/public-store-wedding-live`;
}

async function postAction(body: Record<string, unknown>): Promise<{ ok: boolean; error?: string; [k: string]: unknown }> {
  try {
    const res = await fetch(storeWeddingLiveEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: unknown };
    if (!res.ok || data.ok !== true) {
      return { ok: false, error: typeof data.error === 'string' ? data.error : `HTTP ${res.status}` };
    }
    return { ok: true, ...data };
  } catch {
    return { ok: false, error: 'تعذّر الاتصال. أعد المحاولة.' };
  }
}

export async function createWeddingLivePending(input: Record<string, unknown>) {
  return postAction({ action: 'create_pending', ...input });
}

export async function activateWeddingLive(token: string, paymentId: string) {
  return postAction({ action: 'activate_paid', token, paymentId });
}

export async function syncWeddingLive(token: string) {
  return postAction({ action: 'sync_paid', token });
}

export async function fetchWeddingLivePay(token: string) {
  return postAction({ action: 'get_public', token, role: 'pay' });
}

export async function fetchWeddingLivePublic(token: string, role: 'display' | 'guest' | 'host') {
  return postAction({ action: 'get_public', token, role });
}

export async function addWeddingLiveBlessing(input: Record<string, unknown>) {
  return postAction({ action: 'add_blessing', ...input });
}

export async function saveWeddingLiveHost(input: Record<string, unknown>) {
  return postAction({ action: 'save_host', ...input });
}
