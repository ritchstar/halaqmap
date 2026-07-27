import { getSupabaseClient } from '@/integrations/supabase/client';

export type FounderCompBarberHit = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  tier: string | null;
  member_number: number | null;
  is_active: boolean | null;
  current_valid_until: string | null;
};

function endpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  if (base) return `${base}/api/admin-founder-comp-activate`;
  return '/api/admin-founder-comp-activate';
}

async function bearerToken(accessToken: string): Promise<string | null> {
  if (accessToken.trim()) return accessToken.trim();
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session?.access_token || null;
}

export async function adminFounderCompLookupRemote(input: {
  accessToken: string;
  query: string;
}): Promise<
  | { ok: true; barber: FounderCompBarberHit }
  | { ok: false; error: string; candidates?: FounderCompBarberHit[] }
> {
  const token = await bearerToken(input.accessToken);
  if (!token) return { ok: false, error: 'not_authenticated' };

  try {
    const url = `${endpoint()}?q=${encodeURIComponent(input.query.trim())}`;
    const resp = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      barber?: FounderCompBarberHit;
      candidates?: FounderCompBarberHit[];
    };
    if (!resp.ok || json.ok === false) {
      return {
        ok: false,
        error: json.error || `http_${resp.status}`,
        candidates: Array.isArray(json.candidates) ? json.candidates : undefined,
      };
    }
    if (!json.barber?.id) return { ok: false, error: 'barber_not_found' };
    return { ok: true, barber: json.barber };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function adminFounderCompActivateRemote(input: {
  accessToken: string;
  barberId: string;
  tier: 'bronze' | 'gold' | 'diamond';
  reason: string;
  lookupQuery?: string;
}): Promise<
  | {
      ok: true;
      barberId: string;
      tier: string;
      entitlementId: string;
      orderId: string;
      validUntil: string;
      listingDaysGranted: number;
      previousValidUntil: string | null;
    }
  | { ok: false; error: string; candidates?: FounderCompBarberHit[] }
> {
  const token = await bearerToken(input.accessToken);
  if (!token) return { ok: false, error: 'not_authenticated' };

  try {
    const resp = await fetch(endpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        barberId: input.barberId,
        tier: input.tier,
        reason: input.reason,
        lookupQuery: input.lookupQuery,
      }),
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      barberId?: string;
      tier?: string;
      entitlementId?: string;
      orderId?: string;
      validUntil?: string;
      listingDaysGranted?: number;
      previousValidUntil?: string | null;
      candidates?: FounderCompBarberHit[];
    };
    if (!resp.ok || json.ok === false) {
      return {
        ok: false,
        error: json.error || `http_${resp.status}`,
        candidates: Array.isArray(json.candidates) ? json.candidates : undefined,
      };
    }
    return {
      ok: true,
      barberId: String(json.barberId ?? input.barberId),
      tier: String(json.tier ?? input.tier),
      entitlementId: String(json.entitlementId ?? ''),
      orderId: String(json.orderId ?? ''),
      validUntil: String(json.validUntil ?? ''),
      listingDaysGranted: Number(json.listingDaysGranted ?? 90),
      previousValidUntil: json.previousValidUntil ?? null,
    };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
