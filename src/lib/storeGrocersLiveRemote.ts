/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { fetchStoreLivePublicGet } from '@/lib/storeLivePublicRead';

const GROCERS_LIVE_API_PATH = '/api/public-store-grocers-live';
const LIVE_API_HOSTS = new Set(['www.halaqmap.com', 'halaqmap.com', 'store.halaqmap.com']);

function configuredApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || import.meta.env.VITE_API_BASE_URL || '')
    .trim()
    .replace(/\/$/, '')
    .replace(/\/api$/i, '');
}

export function storeGrocersLiveEndpoint(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (LIVE_API_HOSTS.has(host)) return GROCERS_LIVE_API_PATH;
  }
  const origin = configuredApiOrigin();
  if (origin && !/\.vercel\.app$/i.test(origin)) return `${origin}${GROCERS_LIVE_API_PATH}`;
  return GROCERS_LIVE_API_PATH;
}

function payErrorAr(status: number, raw: unknown): string {
  if (typeof raw === 'string' && raw.trim() && !/^HTTP \d+/.test(raw.trim())) return raw.trim();
  if (status === 404) return 'تعذر الوصول لمسار التحصيل. حدّث الصفحة ثم أعد المحاولة من المتجر.';
  if (status === 403 || status === 429) return 'رُفض الطلب مؤقتاً. حدّث الصفحة ثم أعد المحاولة.';
  return 'تعذر إنشاء طلب الدفع. أعد المحاولة.';
}

async function postAction(body: Record<string, unknown>): Promise<{ ok: boolean; error?: string; [k: string]: unknown }> {
  try {
    const res = await fetch(storeGrocersLiveEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: unknown };
    if (!res.ok || data.ok !== true) {
      return { ok: false, error: payErrorAr(res.status, data.error) };
    }
    return { ok: true, ...(data as Record<string, unknown>) };
  } catch {
    return { ok: false, error: 'تعذّر الاتصال. أعد المحاولة.' };
  }
}

export async function createGrocersLivePending(input: Record<string, unknown>) {
  return postAction({ action: 'create_pending', ...input });
}

export async function activateGrocersLive(token: string, paymentId: string) {
  return postAction({ action: 'activate_paid', token, paymentId });
}

export async function syncGrocersLive(token: string) {
  return postAction({ action: 'sync_paid', token });
}

export async function fetchGrocersLivePay(token: string) {
  return postAction({ action: 'get_public', token, role: 'pay' });
}

export async function fetchGrocersLivePublic(token: string, role: 'shop' | 'desk') {
  return fetchStoreLivePublicGet(storeGrocersLiveEndpoint(), token, role);
}

export async function addGrocersLiveOrder(token: string, order: Record<string, unknown>) {
  return postAction({ action: 'add_order', token, order });
}

export async function saveGrocersLiveHost(input: Record<string, unknown>) {
  return postAction({ action: 'save_host', ...input });
}

export async function addGrocersLiveChat(token: string, chat: Record<string, unknown>) {
  return postAction({ action: 'add_chat', token, chat });
}
