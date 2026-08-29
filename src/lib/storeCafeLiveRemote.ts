/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { fetchStoreLivePublicGet } from '@/lib/storeLivePublicRead';

const CAFE_LIVE_API_PATH = '/api/public-store-cafe-live';
const LIVE_API_HOSTS = new Set(['www.halaqmap.com', 'halaqmap.com', 'store.halaqmap.com']);

function configuredApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || import.meta.env.VITE_API_BASE_URL || '')
    .trim()
    .replace(/\/$/, '')
    .replace(/\/api$/i, '');
}

export function storeCafeLiveEndpoint(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (LIVE_API_HOSTS.has(host)) return CAFE_LIVE_API_PATH;
  }
  const origin = configuredApiOrigin();
  if (origin && !/\.vercel\.app$/i.test(origin)) return `${origin}${CAFE_LIVE_API_PATH}`;
  return CAFE_LIVE_API_PATH;
}

function payErrorAr(status: number, raw: unknown): string {
  if (typeof raw === 'string' && raw.trim() && !/^HTTP \d+/.test(raw.trim())) return raw.trim();
  if (status === 404) return 'تعذر الوصول لمسار التحصيل. حدّث الصفحة ثم أعد المحاولة من المتجر.';
  if (status === 403 || status === 429) return 'رُفض الطلب مؤقتاً. حدّث الصفحة ثم أعد المحاولة.';
  return 'تعذر إنشاء طلب الدفع. أعد المحاولة.';
}

async function postAction(body: Record<string, unknown>): Promise<{ ok: boolean; error?: string; [k: string]: unknown }> {
  try {
    const res = await fetch(storeCafeLiveEndpoint(), {
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

export async function createCafeLivePending(input: Record<string, unknown>) {
  return postAction({ action: 'create_pending', ...input });
}

export async function activateCafeLive(token: string, paymentId: string) {
  return postAction({ action: 'activate_paid', token, paymentId });
}

export async function syncCafeLive(token: string) {
  return postAction({ action: 'sync_paid', token });
}

export async function fetchCafeLivePay(token: string) {
  return postAction({ action: 'get_public', token, role: 'pay' });
}

export type CafeLiveRole = 'shop' | 'desk' | 'display' | 'guest' | 'host';

export async function fetchCafeLivePublic(token: string, role: CafeLiveRole) {
  return fetchStoreLivePublicGet(storeCafeLiveEndpoint(), token, role);
}

export async function addCafeLiveOrder(token: string, order: Record<string, unknown>) {
  return postAction({ action: 'add_order', token, order });
}

export async function saveCafeLiveHost(input: Record<string, unknown>) {
  return postAction({ action: 'save_host', ...input });
}

export async function addCafeLiveChat(token: string, chat: Record<string, unknown>) {
  return postAction({ action: 'add_chat', token, chat });
}

export async function addCafeLiveBlessing(input: Record<string, unknown>) {
  return postAction({ action: 'add_blessing', ...input });
}
