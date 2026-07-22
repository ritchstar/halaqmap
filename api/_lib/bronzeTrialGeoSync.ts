/**
 * مصدر الحقيقة لشركاء التجربة البرونزي:
 * بيانات `bronze_trial_applications` (اسم، جوال، واتساب، صور، إحداثيات)
 * تُفرَض على `barbers` عند التفعيل — لا يُسمح لانزياح التسجيل الثاني بتغييرها.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseCoord(raw: unknown): number | null {
  if (raw == null || raw === '') return null;
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return null;
  if (n === 0) return null;
  return n;
}

export type BronzeTrialProfileRow = {
  applicationId: string;
  salonName: string;
  phone: string;
  whatsapp: string;
  latitude: number;
  longitude: number;
  cityAr: string | null;
  districtAr: string | null;
  regionAr: string | null;
  addressLine: string;
  photoExteriorSignUrl: string | null;
  photoExterior2Url: string | null;
  photoInterior1Url: string | null;
  photoInterior2Url: string | null;
};

export async function loadApprovedBronzeTrialProfileByEmail(
  supabase: SupabaseClient,
  email: string | null | undefined,
): Promise<BronzeTrialProfileRow | null> {
  const e = String(email ?? '')
    .trim()
    .toLowerCase();
  if (!e.includes('@')) return null;

  const { data } = await supabase
    .from('bronze_trial_applications')
    .select(
      'id, salon_name, phone, whatsapp, latitude, longitude, city_ar, district_ar, region_ar, status, photo_exterior_sign_url, photo_exterior_2_url, photo_interior_1_url, photo_interior_2_url',
    )
    .ilike('email', e)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data?.id) return null;
  const lat = parseCoord(data.latitude);
  const lng = parseCoord(data.longitude);
  if (lat == null || lng == null) return null;

  const district = String(data.district_ar ?? '').trim() || null;
  const city = String(data.city_ar ?? '').trim() || null;
  const region = String(data.region_ar ?? '').trim() || null;
  const parts = [district, city, region].filter(Boolean);
  const addressLine = parts.length ? parts.join(' — ') : 'غير محدد';
  const phone = String(data.phone ?? '').trim();
  const whatsapp = String(data.whatsapp ?? '').trim() || phone;

  return {
    applicationId: String(data.id),
    salonName: String(data.salon_name ?? '').trim() || 'صالون',
    phone: phone || '0500000000',
    whatsapp: whatsapp || phone || '0500000000',
    latitude: lat,
    longitude: lng,
    cityAr: city,
    districtAr: district,
    regionAr: region,
    addressLine,
    photoExteriorSignUrl: String(data.photo_exterior_sign_url ?? '').trim() || null,
    photoExterior2Url: String(data.photo_exterior_2_url ?? '').trim() || null,
    photoInterior1Url: String(data.photo_interior_1_url ?? '').trim() || null,
    photoInterior2Url: String(data.photo_interior_2_url ?? '').trim() || null,
  };
}

/** توافق خلفي مع الاستدعاءات القديمة */
export async function loadApprovedBronzeTrialGeoByEmail(
  supabase: SupabaseClient,
  email: string | null | undefined,
): Promise<BronzeTrialProfileRow | null> {
  return loadApprovedBronzeTrialProfileByEmail(supabase, email);
}

/**
 * يفرض هوية وموقع وصور طلب التجربة المعتمد على سجل الحلاق.
 */
export async function applyApprovedBronzeTrialGeoToBarber(
  supabase: SupabaseClient,
  input: { barberId: string; email?: string | null },
): Promise<
  | { ok: true; applied: boolean; geo?: BronzeTrialProfileRow }
  | { ok: false; error: string }
> {
  const barberId = String(input.barberId ?? '').trim();
  if (!UUID_RE.test(barberId)) return { ok: false, error: 'invalid_barber_id' };

  let email = String(input.email ?? '')
    .trim()
    .toLowerCase() || null;
  if (!email) {
    const { data: b } = await supabase.from('barbers').select('email').eq('id', barberId).maybeSingle();
    email = String((b as { email?: string | null } | null)?.email ?? '')
      .trim()
      .toLowerCase() || null;
  }

  const profile = await loadApprovedBronzeTrialProfileByEmail(supabase, email);
  if (!profile) return { ok: true, applied: false };

  const featured = [
    profile.photoExteriorSignUrl,
    profile.photoExterior2Url,
    profile.photoInterior1Url,
    profile.photoInterior2Url,
  ].filter((u): u is string => Boolean(u));

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    name: profile.salonName,
    phone: profile.phone,
    latitude: profile.latitude,
    longitude: profile.longitude,
    city: profile.cityAr,
    address: profile.addressLine,
    updated_at: now,
  };
  if (profile.photoExteriorSignUrl) patch.cover_image = profile.photoExteriorSignUrl;
  if (profile.photoInterior1Url || profile.photoExteriorSignUrl) {
    patch.profile_image = profile.photoInterior1Url || profile.photoExteriorSignUrl;
  }
  if (featured.length) patch.featured_images = featured;

  const { error } = await supabase.from('barbers').update(patch).eq('id', barberId);
  if (error) return { ok: false, error: error.message };
  return { ok: true, applied: true, geo: profile };
}

/**
 * لغير شركاء التجربة: فرض اسم/جوال/إحداثيات/ساعات من أحدث طلب تسجيل مرتبط.
 */
export async function applyRegistrationIdentityToBarber(
  supabase: SupabaseClient,
  input: { barberId: string; email?: string | null },
): Promise<{ ok: true; applied: boolean } | { ok: false; error: string }> {
  const barberId = String(input.barberId ?? '').trim();
  if (!UUID_RE.test(barberId)) return { ok: false, error: 'invalid_barber_id' };

  // إن وُجد طلب تجربة معتمد — لا تلمس الهوية من التسجيل
  const trial = await loadApprovedBronzeTrialProfileByEmail(supabase, input.email);
  if (trial) {
    const applied = await applyApprovedBronzeTrialGeoToBarber(supabase, input);
    if (!applied.ok) return applied;
    return { ok: true, applied: applied.applied };
  }

  let email = String(input.email ?? '')
    .trim()
    .toLowerCase() || null;
  if (!email) {
    const { data: b } = await supabase.from('barbers').select('email').eq('id', barberId).maybeSingle();
    email = String((b as { email?: string | null } | null)?.email ?? '')
      .trim()
      .toLowerCase() || null;
  }
  if (!email?.includes('@')) return { ok: true, applied: false };

  const { data: sub } = await supabase
    .from('registration_submissions')
    .select('payload')
    .or(`payload->>linkedBarberId.eq.${barberId},payload->>email.eq.${email}`)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  const payload =
    sub?.payload && typeof sub.payload === 'object' && !Array.isArray(sub.payload)
      ? (sub.payload as Record<string, unknown>)
      : null;
  if (!payload) return { ok: true, applied: false };

  const name = String(payload.barberName ?? payload.name ?? '').trim();
  const phone = String(payload.phone ?? '').trim();
  const loc =
    payload.location && typeof payload.location === 'object' && !Array.isArray(payload.location)
      ? (payload.location as Record<string, unknown>)
      : null;
  const lat = parseCoord(loc?.lat);
  const lng = parseCoord(loc?.lng);
  const address = String(loc?.address ?? '').trim();

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name) patch.name = name;
  if (phone) patch.phone = phone;
  if (lat != null && lng != null) {
    patch.latitude = lat;
    patch.longitude = lng;
  }
  if (address) patch.address = address;

  if (Object.keys(patch).length <= 1) return { ok: true, applied: false };

  const { error } = await supabase.from('barbers').update(patch).eq('id', barberId);
  if (error) return { ok: false, error: error.message };

  try {
    const { syncBarberWorkingHoursFromRegistrationPayload } = await import(
      './barberWorkingHoursSync.js'
    );
    await syncBarberWorkingHoursFromRegistrationPayload(supabase, barberId, payload);
  } catch {
    /* ignore */
  }

  return { ok: true, applied: true };
}
