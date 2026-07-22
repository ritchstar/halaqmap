/**
 * مصدر الحقيقة الجغرافي لشركاء التجربة البرونزي:
 * إحداثيات `bronze_trial_applications` تُفرَض على `barbers` عند التفعيل/التجهيز.
 * يمنع انزياح الموقع بعد إعادة التقاط GPS في التسجيل الرسمي.
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

export type BronzeTrialGeoRow = {
  applicationId: string;
  salonName: string;
  latitude: number;
  longitude: number;
  cityAr: string | null;
  districtAr: string | null;
  regionAr: string | null;
  addressLine: string;
};

export async function loadApprovedBronzeTrialGeoByEmail(
  supabase: SupabaseClient,
  email: string | null | undefined,
): Promise<BronzeTrialGeoRow | null> {
  const e = String(email ?? '')
    .trim()
    .toLowerCase();
  if (!e.includes('@')) return null;

  const { data } = await supabase
    .from('bronze_trial_applications')
    .select('id, salon_name, latitude, longitude, city_ar, district_ar, region_ar, status')
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

  return {
    applicationId: String(data.id),
    salonName: String(data.salon_name ?? '').trim() || 'صالون',
    latitude: lat,
    longitude: lng,
    cityAr: city,
    districtAr: district,
    regionAr: region,
    addressLine,
  };
}

/**
 * يفرض إحداثيات طلب التجربة الموافق عليه على سجل الحلاق.
 * يُستدعى بعد التجهيز/التفعيل حتى لا يبقى موقع التسجيل الثاني.
 */
export async function applyApprovedBronzeTrialGeoToBarber(
  supabase: SupabaseClient,
  input: { barberId: string; email?: string | null },
): Promise<
  | { ok: true; applied: boolean; geo?: BronzeTrialGeoRow }
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

  const geo = await loadApprovedBronzeTrialGeoByEmail(supabase, email);
  if (!geo) return { ok: true, applied: false };

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('barbers')
    .update({
      latitude: geo.latitude,
      longitude: geo.longitude,
      city: geo.cityAr,
      address: geo.addressLine,
      updated_at: now,
    })
    .eq('id', barberId);

  if (error) return { ok: false, error: error.message };
  return { ok: true, applied: true, geo };
}
