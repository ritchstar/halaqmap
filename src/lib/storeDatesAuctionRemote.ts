/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import type { AuctionLot } from '@/lib/storeShopAuction';

const DATES_AUCTION_API_PATH = '/api/public-store-dates-auction';
const LIVE_API_HOSTS = new Set(['www.halaqmap.com', 'halaqmap.com', 'store.halaqmap.com']);

function configuredApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || import.meta.env.VITE_API_BASE_URL || '')
    .trim()
    .replace(/\/$/, '')
    .replace(/\/api$/i, '');
}

export function storeDatesAuctionEndpoint(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (LIVE_API_HOSTS.has(host)) return DATES_AUCTION_API_PATH;
  }
  const origin = configuredApiOrigin();
  if (origin && !/\.vercel\.app$/i.test(origin)) return `${origin}${DATES_AUCTION_API_PATH}`;
  return DATES_AUCTION_API_PATH;
}

async function postAction(body: Record<string, unknown>): Promise<{ ok: boolean; error?: string; [k: string]: unknown }> {
  try {
    const res = await fetch(storeDatesAuctionEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: unknown };
    if (!res.ok || data.ok !== true) {
      return { ok: false, error: String(data.error || 'تعذّر إتمام الطلب') };
    }
    return { ok: true, ...(data as Record<string, unknown>) };
  } catch {
    return { ok: false, error: 'تعذّر الاتصال. أعد المحاولة.' };
  }
}

export async function fetchDatesAuctionPublic(token: string, viewerPhone = '') {
  try {
    const qs = new URLSearchParams({ token });
    if (viewerPhone) qs.set('viewerPhone', viewerPhone);
    const res = await fetch(`${storeDatesAuctionEndpoint()}?${qs.toString()}`);
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: unknown };
    if (!res.ok || data.ok !== true) {
      return { ok: false as const, error: String(data.error || 'تعذّر التحميل') };
    }
    return { ok: true as const, ...(data as Record<string, unknown>) };
  } catch {
    return postAction({ action: 'get_public', token, viewerPhone });
  }
}

export async function fetchDatesAuctionDesk(token: string) {
  return postAction({ action: 'get_desk', token });
}

export async function createDatesAuctionLot(token: string, lot: Partial<AuctionLot>) {
  return postAction({ action: 'create_lot', token, ...lot });
}

export async function openDatesAuctionLot(token: string, lotId: string) {
  return postAction({ action: 'open_lot', token, lotId });
}

export async function closeDatesAuctionLot(token: string, lotId: string) {
  return postAction({ action: 'close_lot', token, lotId });
}

export async function addDatesAuctionBid(
  token: string,
  input: { lotId: string; name: string; phone: string; amount: number },
) {
  return postAction({ action: 'add_bid', token, ...input });
}
