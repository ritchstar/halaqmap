/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { getSupabaseClient } from '@/integrations/supabase/client';

export type CoiffeurInterestSignupRow = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  intentId: string;
  source: string;
  phone: string;
  createdAt: string;
  consent: boolean;
};

export type CoiffeurOpsListingRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  tier: string;
  isActive: boolean;
  isVerified: boolean;
  openForCustomers: boolean;
  specialties: string[];
  listingSector: string;
  createdAt: string;
  isTrial: boolean;
};

export type CoiffeurHubSeeded = {
  barberId: string;
  email: string;
  listingGranted?: boolean;
  listingError?: string;
  validUntil?: string;
};

export type CoiffeurHubPayload =
  | {
      ok: true;
      tableMissing: boolean;
      total: number;
      rows: CoiffeurInterestSignupRow[];
      hint?: string;
      listingsMissing?: boolean;
      listingsHint?: string;
      listingTotal: number;
      listings: CoiffeurOpsListingRow[];
      seeded?: CoiffeurHubSeeded;
    }
  | { ok: false; error: string; hint?: string };

function endpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  return `${base || ''}/api/admin-coiffeur-hub`;
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

function asPayload(json: CoiffeurHubPayload & { error?: string }, res: Response): CoiffeurHubPayload {
  if (!res.ok || json.ok === false) {
    return { ok: false, error: json.error || `http_${res.status}`, hint: json.hint };
  }
  return json;
}

export async function fetchAdminCoiffeurHub(): Promise<CoiffeurHubPayload> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'not_signed_in' };
  try {
    const res = await fetch(endpoint(), { headers });
    const json = (await res.json()) as CoiffeurHubPayload & { error?: string };
    return asPayload(json, res);
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function postAdminCoiffeurHub(body: {
  action: 'seed_trial' | 'patch_listing';
  barberId?: string;
  isActive?: boolean;
  openForCustomers?: boolean;
}): Promise<CoiffeurHubPayload> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'not_signed_in' };
  try {
    const res = await fetch(endpoint(), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as CoiffeurHubPayload & { error?: string };
    return asPayload(json, res);
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
