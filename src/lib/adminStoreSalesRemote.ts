/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { getSupabaseClient } from '@/integrations/supabase/client';
import type { StoreSalesLedgerProduct } from '@/config/storeSalesLedger';

export type StoreSalesLedgerRow = {
  id: string;
  product: StoreSalesLedgerProduct;
  titleAr: string;
  buyerName: string;
  buyerEmail: string;
  subjectAr: string;
  packAr: string;
  voice: string;
  amountSar: number;
  status: string;
  paymentId: string;
  createdAt: string;
};

export type StoreSalesSummary = {
  id: StoreSalesLedgerProduct;
  titleAr: string;
  liveCount: number;
  paidCount: number;
  totalSar: number;
};

export type StoreSalesPayload =
  | { ok: true; product: string; rows: StoreSalesLedgerRow[]; summaries: StoreSalesSummary[] }
  | { ok: false; error: string };

function endpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  return `${base || ''}/api/admin-store-sales`;
}

async function authHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  const token = data.session?.access_token;
  if (!token?.trim()) return null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token.trim()}`,
  };
  const url = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (url) headers['x-client-supabase-url'] = url;
  return headers;
}

export async function fetchAdminStoreSales(product?: StoreSalesLedgerProduct): Promise<StoreSalesPayload> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'no_session' };
  const q = product ? `?product=${encodeURIComponent(product)}` : '';
  try {
    const res = await fetch(`${endpoint()}${q}`, { method: 'GET', headers });
    const json = (await res.json().catch(() => ({}))) as StoreSalesPayload & { error?: string };
    if (!res.ok || json.ok === false) return { ok: false, error: json.error || 'load_failed' };
    return json;
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
