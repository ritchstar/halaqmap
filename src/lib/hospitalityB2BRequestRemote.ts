function registrationApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || '')
    .trim()
    .replace(/\/$/, '');
}

export function hospitalityB2BRequestEndpoint(): string {
  const origin = registrationApiOrigin();
  if (!origin) return '/api/public-hospitality-b2b-request';
  return `${origin}/api/public-hospitality-b2b-request`;
}

export type HospitalityFacilityType = 'hotel' | 'furnished_apartments' | 'guest_house';

export type HospitalityB2BRequestInput = {
  facilityName: string;
  facilityType: HospitalityFacilityType;
  receptionBannersCount: number;
  roomsBannersCount: number;
  shippingCity: string;
  shippingDistrict: string;
  shippingRecipientName: string;
  shippingPhone: string;
  shippingGoogleMapsUrl: string;
  website?: string;
};

export type HospitalityB2BRequestResult =
  | { ok: true; requestId: string | null }
  | { ok: false; error: string };

export async function submitHospitalityB2BRequest(
  input: HospitalityB2BRequestInput,
): Promise<HospitalityB2BRequestResult> {
  try {
    const res = await fetch(hospitalityB2BRequestEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
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
    return { ok: false, error: 'Network error' };
  }
}
