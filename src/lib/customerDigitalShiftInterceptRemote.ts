import { getOrCreateGuestClientId } from '@/lib/customerPrivateChatServerRemote';

function resolveBaseUrl(): string {
  const override = (import.meta.env.VITE_CUSTOMER_DIGITAL_SHIFT_INTERCEPT_URL as string | undefined)?.trim();
  if (override) return override.replace(/\/$/, '');
  return '/api/customer-digital-shift-intercept';
}

export type CustomerDigitalShiftInterceptInput = {
  conversationId: string;
  guestClientId?: string;
  barberId?: string;
  email?: string;
};

export async function customerDigitalShiftInterceptRemote(
  input: CustomerDigitalShiftInterceptInput,
): Promise<
  | {
      ok: true;
      replied: boolean;
      reason?: string;
      trigger?: string;
    }
  | { ok: false; error: string }
> {
  const conversationId = input.conversationId.trim();
  if (!conversationId) return { ok: false, error: 'Missing conversationId' };

  const payload: Record<string, string> = { conversationId };
  const guestClientId = (input.guestClientId || getOrCreateGuestClientId()).trim();
  if (guestClientId) payload.guestClientId = guestClientId;
  const barberId = String(input.barberId ?? '').trim();
  const email = String(input.email ?? '').trim();
  if (barberId && email) {
    payload.barberId = barberId;
    payload.email = email;
  }

  try {
    const res = await fetch(resolveBaseUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      replied?: boolean;
      reason?: string;
      trigger?: string;
      error?: string;
    };
    if (!res.ok) return { ok: false, error: json.error || `HTTP ${res.status}` };
    return {
      ok: true,
      replied: json.replied === true,
      reason: json.reason,
      trigger: json.trigger,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}
