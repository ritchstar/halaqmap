import { getSupabaseClient } from '@/integrations/supabase/client';

export type BookingSecurityLogRow = {
  id: string;
  created_at: string;
  severity: string;
  event_code: string;
  message: string | null;
  barber_id: string | null;
  detail: Record<string, unknown> | null;
};

export async function fetchAdminBookingSecurityLogRemote(): Promise<
  { ok: true; rows: BookingSecurityLogRow[] } | { ok: false; error: string }
> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ' };
  const { data, error } = await client
    .from('platform_booking_security_log')
    .select('id, created_at, severity, event_code, message, barber_id, detail')
    .order('created_at', { ascending: false })
    .limit(40);
  if (error) return { ok: false, error: error.message || 'فشل تحميل سجل الأمان' };
  const rows = (data ?? []).map((r) => ({
    id: String((r as { id: unknown }).id),
    created_at: String((r as { created_at: unknown }).created_at),
    severity: String((r as { severity: unknown }).severity ?? ''),
    event_code: String((r as { event_code: unknown }).event_code ?? ''),
    message: (r as { message: unknown }).message != null ? String((r as { message: unknown }).message) : null,
    barber_id: (r as { barber_id: unknown }).barber_id != null ? String((r as { barber_id: unknown }).barber_id) : null,
    detail:
      (r as { detail: unknown }).detail && typeof (r as { detail: unknown }).detail === 'object'
        ? ((r as { detail: Record<string, unknown> }).detail as Record<string, unknown>)
        : null,
  }));
  return { ok: true, rows };
}
