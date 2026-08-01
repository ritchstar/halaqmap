/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

const TABLE = 'coverage_salon_nominations';
const BUCKET = 'registration-uploads';
const MAX_PHOTO_BYTES = 2.5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export type CoverageNominateInput = {
  salonName: string;
  contactPhone: string;
  latitude: number;
  longitude: number;
  insideSalonConfirmed: boolean;
  locationShared: boolean;
  photo?: { bytes: Uint8Array; contentType: string; fileName: string } | null;
  websiteHoneypot?: string;
};

function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+]/g, '').slice(0, 32);
}

function normalizeSalonName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').slice(0, 120);
}

function extForType(contentType: string): string {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  return 'jpg';
}

export async function submitCoverageSalonNomination(
  supabase: SupabaseClient,
  input: CoverageNominateInput,
): Promise<
  | { ok: true; id: string }
  | { ok: false; status: number; error: string }
> {
  if (String(input.websiteHoneypot ?? '').trim()) {
    return { ok: true, id: 'ignored' };
  }

  if (!input.insideSalonConfirmed || !input.locationShared) {
    return { ok: false, status: 400, error: 'location_and_inside_required' };
  }

  const salonName = normalizeSalonName(input.salonName);
  const contactPhone = normalizePhone(input.contactPhone);
  const { latitude, longitude } = input;

  if (salonName.length < 2) {
    return { ok: false, status: 400, error: 'invalid_salon_name' };
  }
  if (contactPhone.length < 8) {
    return { ok: false, status: 400, error: 'invalid_contact_phone' };
  }
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return { ok: false, status: 400, error: 'invalid_coordinates' };
  }

  let photoUrl: string | null = null;
  if (input.photo) {
    const { bytes, contentType, fileName } = input.photo;
    if (!ALLOWED_PHOTO_TYPES.has(contentType)) {
      return { ok: false, status: 400, error: 'invalid_photo_type' };
    }
    if (bytes.byteLength < 32 || bytes.byteLength > MAX_PHOTO_BYTES) {
      return { ok: false, status: 400, error: 'invalid_photo_size' };
    }
    const id = crypto.randomUUID();
    const path = `coverage-nominations/${id}/facade.${extForType(contentType)}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, bytes, {
      contentType,
      upsert: false,
      cacheControl: '3600',
    });
    if (upErr) {
      return { ok: false, status: 500, error: 'photo_upload_failed' };
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    photoUrl = data.publicUrl;
    void fileName;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      salon_name: salonName,
      contact_phone: contactPhone,
      latitude,
      longitude,
      photo_url: photoUrl,
      inside_salon_confirmed: true,
      location_shared: true,
      status: 'new',
    })
    .select('id')
    .single();

  if (error || !data?.id) {
    return { ok: false, status: 500, error: 'save_failed' };
  }

  return { ok: true, id: String(data.id) };
}
