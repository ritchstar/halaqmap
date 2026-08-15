/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { getSupabaseClient } from '@/integrations/supabase/client';

export type FazaaListingConsentAdminRow = {
  id: string;
  barberId: string;
  status: string;
  salonName: string;
  emailTo: string;
  citySlug: string;
  cityNameAr: string;
  neighborhoodSlugs: string[];
  areaLabelAr: string;
  bannerUrl: string;
  emailSentAt: string;
  expiresAt: string;
  acceptedAt: string;
  createdAt: string;
  createdBy: string;
};

export type FazaaListingCandidate = {
  id: string;
  name: string;
  email: string;
  city: string;
  tier: string;
  hasBanner: boolean;
};

export type FazaaListingAdminPayload =
  | {
      ok: true;
      tableMissing: boolean;
      total: number;
      consents: FazaaListingConsentAdminRow[];
      candidates: FazaaListingCandidate[];
      hint?: string;
    }
  | { ok: false; error: string };

function endpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  return `${base || ''}/api/admin-fazaa-listing-consents`;
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

export async function fetchAdminFazaaListing(q = ''): Promise<FazaaListingAdminPayload> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'not_signed_in' };
  try {
    const res = await fetch(`${endpoint()}?q=${encodeURIComponent(q)}`, { headers });
    const json = (await res.json()) as FazaaListingAdminPayload & { error?: string };
    if (!res.ok || json.ok === false) return { ok: false, error: json.error || `http_${res.status}` };
    return json;
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function postAdminFazaaListing(body: Record<string, unknown>): Promise<{ ok: true } | { ok: false; error: string }> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'not_signed_in' };
  try {
    const res = await fetch(endpoint(), { method: 'POST', headers, body: JSON.stringify(body) });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || json.ok === false) return { ok: false, error: json.error || `http_${res.status}` };
    return { ok: true };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
