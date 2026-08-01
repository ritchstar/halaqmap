/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */

function apiOrigin(): string {
  return String(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_REGISTRATION_API_ORIGIN || '')
    .trim()
    .replace(/\/$/, '');
}

export type CoverageNominatePayload = {
  salonName: string;
  contactPhone: string;
  latitude: number;
  longitude: number;
  photo?: File | null;
};

export async function submitCoverageSalonNomination(
  payload: CoverageNominatePayload,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const form = new FormData();
  form.set('salonName', payload.salonName.trim());
  form.set('contactPhone', payload.contactPhone.trim());
  form.set('latitude', String(payload.latitude));
  form.set('longitude', String(payload.longitude));
  form.set('insideSalon', 'true');
  form.set('locationShared', 'true');
  form.set('website', '');
  if (payload.photo && payload.photo.size > 0) {
    form.set('photo', payload.photo);
  }

  try {
    const res = await fetch(`${apiOrigin()}/api/coverage-salon-nominate`, {
      method: 'POST',
      body: form,
    });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; id?: string; error?: string };
    if (!res.ok || !json.ok) {
      return { ok: false, error: json.error || 'تعذّر إرسال الترشيح' };
    }
    return { ok: true, id: String(json.id ?? '') };
  } catch {
    return { ok: false, error: 'تعذّر الاتصال بالخادم' };
  }
}
