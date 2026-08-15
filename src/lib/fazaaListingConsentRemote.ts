/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { FAZAA_LISTING_CONSENT_VERSION } from '@/config/fazaaListingConsentCopy';

export type FazaaListingConsentPreview = {
  status: 'pending' | 'accepted' | 'declined' | 'revoked' | 'expired';
  consentVersion: string;
  salonName: string;
  cityNameAr: string;
  areaLabelAr: string;
  neighborhoodSlugs: string[];
  specialtyHintAr: string;
  bannerPreviewUrl: string | null;
  expiresAt: string;
  clauses: string[];
};

function endpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  return `${base || ''}/api/public-fazaa-listing-consent`;
}

export async function fetchFazaaListingConsentPreview(
  token: string,
): Promise<{ ok: true; preview: FazaaListingConsentPreview } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${endpoint()}?c=${encodeURIComponent(token)}`);
    const json = (await res.json()) as { ok?: boolean; preview?: FazaaListingConsentPreview; error?: string };
    if (!res.ok || !json.ok || !json.preview) return { ok: false, error: json.error || `http_${res.status}` };
    return { ok: true, preview: json.preview };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function submitFazaaListingConsent(input: {
  token: string;
  action: 'accept' | 'decline';
  accepted?: boolean;
}): Promise<{ ok: true; status: string } | { ok: false; error: string }> {
  try {
    const res = await fetch(endpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        c: input.token,
        action: input.action,
        accepted: input.accepted === true,
        consentVersion: FAZAA_LISTING_CONSENT_VERSION,
      }),
    });
    const json = (await res.json()) as { ok?: boolean; status?: string; error?: string };
    if (!res.ok || !json.ok) return { ok: false, error: json.error || `http_${res.status}` };
    return { ok: true, status: json.status || input.action };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
