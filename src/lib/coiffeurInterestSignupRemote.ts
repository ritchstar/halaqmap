/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
function registrationApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || '')
    .trim()
    .replace(/\/$/, '');
}

export function coiffeurInterestSignupEndpoint(): string {
  const origin = registrationApiOrigin();
  if (!origin) return '/api/coiffeur-interest-signup';
  return `${origin}/api/coiffeur-interest-signup`;
}

export type CoiffeurInterestSignupResult =
  | { ok: true; alreadyRegistered: boolean }
  | { ok: false; error: string };

export async function submitCoiffeurInterestSignup(input: {
  email: string;
  consentFollowUpdates: boolean;
  displayName?: string;
  role?: string;
  intentId?: string;
  source?: string;
  phone?: string;
  website?: string;
}): Promise<CoiffeurInterestSignupResult> {
  try {
    const res = await fetch(coiffeurInterestSignupEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: input.email.trim(),
        consentFollowUpdates: input.consentFollowUpdates === true,
        displayName: input.displayName ?? '',
        role: input.role ?? '',
        intentId: input.intentId ?? '',
        source: input.source ?? '',
        phone: input.phone ?? '',
        website: input.website ?? '',
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      alreadyRegistered?: boolean;
      error?: string;
    };
    if (!res.ok) return { ok: false, error: String(data.error || `HTTP ${res.status}`) };
    if (data.ok === true) return { ok: true, alreadyRegistered: Boolean(data.alreadyRegistered) };
    return { ok: false, error: 'Unexpected response' };
  } catch {
    return { ok: false, error: 'Network error' };
  }
}
