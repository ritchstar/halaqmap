import { getSupabaseClient } from '@/integrations/supabase/client';
import { SubscriptionTier } from '@/lib/index';

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
