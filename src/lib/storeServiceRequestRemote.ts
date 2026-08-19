/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
function registrationApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || '')
    .trim()
    .replace(/\/$/, '');
}

export function storeServiceRequestEndpoint(): string {
  const origin = registrationApiOrigin();
  if (!origin) return '/api/public-store-service-request';
  return `${origin}/api/public-store-service-request`;
}

export type StoreServiceRequestInput = {
  applicantName: string;
  entityName?: string;
  freelanceWorkDoc?: string;
  email: string;
  phone: string;
  whatsapp: string;
  requestBody: string;
  consentStudyReply: boolean;
  website?: string;
  source?: string;
};

export type StoreServiceRequestResult =
  | { ok: true; requestId: string | null }
  | { ok: false; error: string };

export async function submitStoreServiceRequest(
  input: StoreServiceRequestInput,
): Promise<StoreServiceRequestResult> {
  try {
    const res = await fetch(storeServiceRequestEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicantName: input.applicantName,
        entityName: input.entityName ?? '',
        freelanceWorkDoc: input.freelanceWorkDoc ?? '',
        email: input.email,
        phone: input.phone,
        whatsapp: input.whatsapp,
        requestBody: input.requestBody,
        consentStudyReply: input.consentStudyReply === true,
        website: input.website ?? '',
        source: input.source ?? '',
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      requestId?: unknown;
      error?: unknown;
      hint?: unknown;
    };
    if (!res.ok || data.ok !== true) {
      const msg = typeof data.error === 'string' ? data.error : `HTTP ${res.status}`;
      const hint = typeof data.hint === 'string' ? data.hint : '';
      return { ok: false, error: hint ? `${msg} — ${hint}` : msg };
    }
    return { ok: true, requestId: typeof data.requestId === 'string' ? data.requestId : null };
  } catch {
    return { ok: false, error: 'تعذّر الاتصال. أعد المحاولة.' };
  }
}
