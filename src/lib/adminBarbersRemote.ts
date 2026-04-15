import { getSupabaseClient } from '@/integrations/supabase/client';
import { SubscriptionRequest, SubscriptionTier } from '@/lib/index';

export type AdminBarberRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string | null;
  tier: SubscriptionTier;
  is_active: boolean;
  is_verified: boolean;
};

function tierFromDb(t: string | null): SubscriptionTier {
  if (t === 'gold') return SubscriptionTier.GOLD;
  if (t === 'diamond') return SubscriptionTier.DIAMOND;
  return SubscriptionTier.BRONZE;
}

export async function listBarbersForAdmin(): Promise<AdminBarberRow[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('barbers')
    .select('id, name, email, phone, city, tier, is_active, is_verified')
    .order('created_at', { ascending: false });

  if (error || !data) {
    if (import.meta.env.DEV) console.warn('[halaqmap] listBarbersForAdmin:', error?.message);
    return [];
  }

  return (data as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    city: row.city != null ? String(row.city) : null,
    tier: tierFromDb(row.tier != null ? String(row.tier) : null),
    is_active: Boolean(row.is_active),
    is_verified: Boolean(row.is_verified),
  }));
}

export async function setBarberActiveRemote(
  barberId: string,
  isActive: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ' };

  const { error } = await client.from('barbers').update({ is_active: isActive }).eq('id', barberId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteBarberRemote(
  barberId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ' };

  const { error } = await client.from('barbers').delete().eq('id', barberId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function findDuplicateBarbersByContact(
  email: string,
  phone: string
): Promise<AdminBarberRow[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  const emailTrim = email.trim();
  const phoneTrim = phone.trim();
  if (!emailTrim && !phoneTrim) return [];

  let query = client.from('barbers').select('id, name, email, phone, city, tier, is_active, is_verified');
  if (emailTrim && phoneTrim) {
    query = query.or(`email.eq.${emailTrim},phone.eq.${phoneTrim}`);
  } else if (emailTrim) {
    query = query.eq('email', emailTrim);
  } else {
    query = query.eq('phone', phoneTrim);
  }
  const { data, error } = await query.limit(20);
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    city: row.city != null ? String(row.city) : null,
    tier: tierFromDb(row.tier != null ? String(row.tier) : null),
    is_active: Boolean(row.is_active),
    is_verified: Boolean(row.is_verified),
  }));
}

export async function upsertBarberFromApprovedRequest(
  request: SubscriptionRequest
): Promise<{ ok: true; barberId: string } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ' };

  const row = {
    name: request.barberName.trim() || 'صالون بدون اسم',
    email: request.email.trim(),
    phone: request.phone.trim(),
    latitude: Number.isFinite(request.location?.lat) ? request.location.lat : null,
    longitude: Number.isFinite(request.location?.lng) ? request.location.lng : null,
    address: request.location?.address?.trim() || 'غير محدد',
    city: request.location?.address?.trim() || null,
    tier: request.tier,
    is_active: true,
    is_verified: true,
    cover_image:
      request.registrationAttachmentUrls?.shopExterior ||
      request.shopImages?.[0] ||
      null,
    profile_image:
      request.registrationAttachmentUrls?.shopInterior ||
      request.shopImages?.[1] ||
      request.shopImages?.[0] ||
      null,
    specialties: request.categories?.length ? request.categories : null,
  };

  // البريد unique؛ upsert يضمن ظهور المقبول في تبويب الحلاقين مباشرة.
  const { data, error } = await client
    .from('barbers')
    .upsert(row, { onConflict: 'email' })
    .select('id')
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? 'فشل upsert للحلاق' };
  return { ok: true, barberId: String((data as { id: string }).id) };
}
