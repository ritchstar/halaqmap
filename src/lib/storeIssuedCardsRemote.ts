/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
function apiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || '')
    .trim()
    .replace(/\/$/, '');
}

export function storeIssuedCardsEndpoint(): string {
  const origin = apiOrigin();
  if (!origin) return '/api/public-store-issued-cards';
  return `${origin}/api/public-store-issued-cards`;
}

export type StoreIssuedPublicResult =
  | {
      ok: true;
      kind: 'bereavement' | 'paid_invite';
      status: string;
      card?: Record<string, unknown>;
      priceHalalas?: number;
      templateId?: string;
    }
  | { ok: false; error: string };

async function postAction(
  body: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string; [k: string]: unknown }> {
  try {
    const res = await fetch(storeIssuedCardsEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: unknown };
    if (!res.ok || data.ok !== true) {
      return { ok: false, error: typeof data.error === 'string' ? data.error : `HTTP ${res.status}` };
    }
    return { ok: true, ...data };
  } catch {
    return { ok: false, error: 'تعذّر الاتصال. أعد المحاولة.' };
  }
}

export async function sendBereavementOtp(phone: string) {
  return postAction({ action: 'send_otp', phone });
}

export async function publishBereavementNotice(input: Record<string, unknown>) {
  return postAction({ action: 'publish_bereavement', ...input, attestation: true });
}

export async function updateBereavementNotice(input: Record<string, unknown>) {
  return postAction({ action: 'update_bereavement', ...input });
}

export async function revokeIssuedCard(token: string, adminKey: string) {
  return postAction({ action: 'revoke', token, adminKey });
}

export async function reportIssuedCard(token: string, note: string) {
  return postAction({ action: 'report', token, note });
}

export async function createPaidInvitePending(input: Record<string, unknown>) {
  return postAction({ action: 'create_paid_pending', ...input });
}

export async function activatePaidInvite(token: string, paymentId: string) {
  return postAction({ action: 'activate_paid', token, paymentId });
}

export async function fetchIssuedCardPublic(token: string): Promise<StoreIssuedPublicResult> {
  try {
    const res = await fetch(
      `${storeIssuedCardsEndpoint()}?token=${encodeURIComponent(token)}`,
      { method: 'GET', cache: 'no-store' },
    );
    const data = (await res.json().catch(() => ({}))) as StoreIssuedPublicResult & { error?: string };
    if (!res.ok || data.ok !== true) {
      return { ok: false, error: typeof data.error === 'string' ? data.error : 'الرابط غير موجود' };
    }
    return data;
  } catch {
    return { ok: false, error: 'تعذّر فتح الرابط.' };
  }
}
