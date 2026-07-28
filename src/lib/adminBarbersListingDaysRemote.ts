/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { getSupabaseClient } from '@/integrations/supabase/client';

export type AdminBarberListingDays = {
  hasActiveListing: boolean;
  listingDaysRemaining: number;
  validUntil: string | null;
  activeTier: string | null;
};

function endpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  if (base) return `${base}/api/admin-barbers-listing-days`;
  return '/api/admin-barbers-listing-days';
}

export async function adminBarbersListingDaysRemote(input: {
  accessToken: string;
  barberIds?: string[];
}): Promise<
  | { ok: true; daysByBarberId: Record<string, AdminBarberListingDays>; source: string }
  | { ok: false; error: string }
> {
  const client = getSupabaseClient();
  const token =
    input.accessToken.trim() ||
    (client ? (await client.auth.getSession()).data.session?.access_token : '') ||
    '';
  if (!token) return { ok: false, error: 'not_authenticated' };

  try {
    const qs =
      input.barberIds && input.barberIds.length > 0
        ? `?ids=${encodeURIComponent(input.barberIds.slice(0, 500).join(','))}`
        : '';
    const resp = await fetch(`${endpoint()}${qs}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      source?: string;
      daysByBarberId?: Record<string, AdminBarberListingDays>;
    };
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: json.error || `http_${resp.status}` };
    }
    return {
      ok: true,
      source: String(json.source || 'barber_listing_summary'),
      daysByBarberId: json.daysByBarberId && typeof json.daysByBarberId === 'object' ? json.daysByBarberId : {},
    };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
