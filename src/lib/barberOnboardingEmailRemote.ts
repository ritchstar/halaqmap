import { SubscriptionTier } from '@/lib';

const ONBOARDING_EMAIL_API = '/api/send-barber-onboarding';

function getEndpoint(): string {
  return String(import.meta.env.VITE_BARBER_ONBOARDING_EMAIL_URL || ONBOARDING_EMAIL_API).trim();
}

function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  return headers;
}

export async function sendBarberOnboardingEmailRemote(input: {
  barberName: string;
  barberEmail: string;
  tier?: SubscriptionTier | string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const endpoint = getEndpoint();
  if (!endpoint) return { ok: false, error: 'لم يتم ضبط مسار API للإرسال البريدي.' };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        mode: 'single',
        barberName: input.barberName,
        barberEmail: input.barberEmail,
        tier: input.tier ?? null,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      return { ok: false, error: payload.error || `HTTP ${response.status}` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بخدمة الإرسال البريدي.' };
  }
}

export async function sendOnboardingEmailsForActiveBarbersRemote(
  limit = 200
): Promise<{ ok: true; attempted: number; sent: number; failed: number } | { ok: false; error: string }> {
  const endpoint = getEndpoint();
  if (!endpoint) return { ok: false, error: 'لم يتم ضبط مسار API للإرسال البريدي.' };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        mode: 'bulk_active',
        limit,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      attempted?: number;
      sent?: number;
      failed?: number;
      error?: string;
    };
    if (!response.ok) {
      return { ok: false, error: payload.error || `HTTP ${response.status}` };
    }
    return {
      ok: true,
      attempted: Number(payload.attempted) || 0,
      sent: Number(payload.sent) || 0,
      failed: Number(payload.failed) || 0,
    };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بخدمة الإرسال البريدي.' };
  }
}
