import type { SupabaseClient } from '@supabase/supabase-js';

export type SalonMemberRole = 'owner' | 'operator';

export function normalizeSalonMemberEmail(raw: string): string {
  return String(raw || '').trim().toLowerCase();
}

export async function ensureSalonOwnerMember(
  supabase: SupabaseClient,
  barberId: string,
): Promise<void> {
  const id = String(barberId || '').trim();
  if (!id) return;
  const { error } = await supabase.rpc('ensure_salon_owner_member', { p_barber_id: id });
  if (error) {
    const { data: barber } = await supabase.from('barbers').select('email').eq('id', id).maybeSingle();
    const email = normalizeSalonMemberEmail(String(barber?.email ?? ''));
    if (!email) return;
    await supabase.from('salon_members').upsert(
      {
        barber_id: id,
        member_email: email,
        role: 'owner',
        can_watch: true,
        notify_push: true,
      },
      { onConflict: 'barber_id,member_email' },
    );
  }
}

export async function resolveSalonMemberRole(
  supabase: SupabaseClient,
  barberId: string,
  rawEmail: string,
): Promise<SalonMemberRole | null> {
  const id = String(barberId || '').trim();
  const email = normalizeSalonMemberEmail(rawEmail);
  if (!id || !email) return null;

  await ensureSalonOwnerMember(supabase, id);

  const { data: member } = await supabase
    .from('salon_members')
    .select('role, can_watch')
    .eq('barber_id', id)
    .eq('member_email', email)
    .maybeSingle();

  if (member?.role === 'owner' || member?.role === 'operator') {
    return member.role;
  }

  const { data: barber } = await supabase.from('barbers').select('email').eq('id', id).maybeSingle();
  if (barber && normalizeSalonMemberEmail(String(barber.email ?? '')) === email) {
    return 'owner';
  }

  return null;
}

export async function assertSalonOwnerWatchAccess(
  supabase: SupabaseClient,
  barberId: string,
  rawEmail: string,
): Promise<{ ok: true; role: SalonMemberRole } | { ok: false; status: number; message: string }> {
  const role = await resolveSalonMemberRole(supabase, barberId, rawEmail);
  if (!role) {
    return { ok: false, status: 403, message: 'ليس لديك صلاحية مراقبة هذا الصالون.' };
  }
  if (role !== 'owner') {
    return { ok: false, status: 403, message: 'غرفة المراقبة متاحة لصاحب الرخصة (المالك) فقط في هذه المرحلة.' };
  }
  return { ok: true, role };
}
