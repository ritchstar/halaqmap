/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { getSupabaseClient } from '@/integrations/supabase/client';

const REDEEM_ENDPOINT = String(
  import.meta.env.VITE_LISTING_LICENSE_REDEEM_URL || '/api/listing-license-redeem',
).trim();
const BALANCE_ENDPOINT = String(
  import.meta.env.VITE_LISTING_LICENSE_BALANCE_URL || '/api/listing-license-balance',
).trim();

function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  return headers;
}

export type ListingLicenseBalance = {
  hasActiveListing: boolean;
  listingDaysRemaining: number;
  validUntil: string | null;
  activeTier: string | null;
  isTrial?: boolean;
};

function mapListingSummaryRow(row: unknown): ListingLicenseBalance | null {
  const r = (Array.isArray(row) ? row[0] : row) as {
    has_active_listing?: boolean;
    listing_days_remaining?: number;
    valid_until?: string | null;
    active_tier?: string | null;
  } | null;
  if (!r) return null;
  return {
    hasActiveListing: r.has_active_listing === true,
    listingDaysRemaining: Number(r.listing_days_remaining ?? 0),
    validUntil: r.valid_until ?? null,
    activeTier: r.active_tier ?? null,
    isTrial: false,
  };
}

/** احتياط عند تعذّر `/api/listing-license-balance` — نفس RPC `barber_listing_summary`. */
async function fetchListingBalanceViaSupabaseRpc(
  barberId: string,
): Promise<ListingLicenseBalance | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client.rpc('barber_listing_summary', {
    p_barber_id: barberId,
  });
  if (error) return null;
  return mapListingSummaryRow(data);
}

export async function fetchListingLicenseBalanceRemote(input: {
  barberId: string;
  email: string;
}): Promise<{ ok: true; balance: ListingLicenseBalance } | { ok: false; error: string }> {
  const rpcBalance = await fetchListingBalanceViaSupabaseRpc(input.barberId);
  if (rpcBalance) return { ok: true, balance: rpcBalance };

  try {
    const resp = await fetch(BALANCE_ENDPOINT, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({ barberId: input.barberId, email: input.email }),
    });
    const json = (await resp.json().catch(() => ({}))) as ListingLicenseBalance & {
      ok?: boolean;
      error?: string;
    };
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: json.error || `http_${resp.status}` };
    }
    return {
      ok: true,
      balance: {
        hasActiveListing: json.hasActiveListing === true,
        listingDaysRemaining: Number(json.listingDaysRemaining ?? 0),
        validUntil: json.validUntil ?? null,
        activeTier: json.activeTier ?? null,
        isTrial: json.isTrial === true,
      },
    };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function redeemListingLicenseRemote(input: {
  barberId: string;
  email: string;
  code: string;
}): Promise<
  | {
      ok: true;
      listingDaysRemaining: number;
      validUntil: string;
      tier: string;
    }
  | { ok: false; error: string }
> {
  try {
    const resp = await fetch(REDEEM_ENDPOINT, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        barberId: input.barberId,
        email: input.email,
        code: input.code,
      }),
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      listingDaysRemaining?: number;
      validUntil?: string;
      tier?: string;
    };
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: json.error || `http_${resp.status}` };
    }
    return {
      ok: true,
      listingDaysRemaining: Number(json.listingDaysRemaining ?? 0),
      validUntil: String(json.validUntil ?? ''),
      tier: String(json.tier ?? 'bronze'),
    };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
