/**
 * تسجيل اهتمام مسبق (بريد فقط) — يُنفَّذ عبر `/api/interest-signup` على الخادم.
 * عند فصل الواجهة عن Vercel استخدم `VITE_REGISTRATION_API_ORIGIN` كما في مسار التسجيل.
 */
function registrationApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || '')
    .trim()
    .replace(/\/$/, '');
}

export function interestSignupEndpoint(): string {
  const origin = registrationApiOrigin();
  if (!origin) return '/api/interest-signup';
  return `${origin}/api/interest-signup`;
}

export type InterestSignupResult =
  | { ok: true; alreadyRegistered: boolean }
  | { ok: false; error: string };

export async function submitBarberInterestSignup(input: {
  email: string;
  consentFollowUpdates: boolean;
  /** حقل فخ للبوتات — يجب أن يبقى فارغاً */
  website?: string;
}): Promise<InterestSignupResult> {
  try {
    const res = await fetch(interestSignupEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: input.email.trim(),
        consentFollowUpdates: input.consentFollowUpdates === true,
        website: input.website ?? '',
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      alreadyRegistered?: boolean;
      error?: string;
    };
    if (!res.ok) {
      return { ok: false, error: String(data.error || `HTTP ${res.status}`) };
    }
    if (data.ok === true) {
      return { ok: true, alreadyRegistered: Boolean(data.alreadyRegistered) };
    }
    return { ok: false, error: 'Unexpected response' };
  } catch {
    return { ok: false, error: 'Network error' };
  }
}
