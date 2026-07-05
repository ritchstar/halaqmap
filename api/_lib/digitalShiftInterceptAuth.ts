import type { SupabaseClient } from '@supabase/supabase-js';
import { isValidGuestClientId, getCustomerPrivateConversation } from './customerPrivateChatService.js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isShiftInterceptWorkerRequest(
  body: Record<string, unknown>,
  request: Request,
): boolean {
  if (body.worker !== true) return false;
  const auth = request.headers.get('authorization')?.trim() ?? '';
  const secret = (process.env.CRON_SECRET || '').trim();
  return Boolean(secret && auth === `Bearer ${secret}`);
}

/** يتحقق أن طالب الاعتراض يملك المحادثة — عميل ضيف أو حلاق صاحب الصالون. */
export async function assertShiftInterceptCaller(
  supabase: SupabaseClient,
  input: {
    conversationId: string;
    guestClientId?: string;
    barberId?: string;
    email?: string;
  },
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const conversationId = input.conversationId.trim();
  if (!UUID_RE.test(conversationId)) {
    return { ok: false, status: 400, error: 'Invalid conversationId' };
  }

  const guestClientId = String(input.guestClientId ?? '').trim();
  if (guestClientId && isValidGuestClientId(guestClientId)) {
    const conv = await getCustomerPrivateConversation(supabase, { guestClientId, conversationId });
    if (!conv.ok) return { ok: false, status: conv.status, error: conv.error };
    return { ok: true };
  }

  const barberId = String(input.barberId ?? '').trim();
  const email = String(input.email ?? '').trim().toLowerCase();
  if (UUID_RE.test(barberId) && email.includes('@')) {
    const { data: conv, error: convErr } = await supabase
      .from('private_conversations')
      .select('id, barber_id, barber_user_id')
      .eq('id', conversationId)
      .maybeSingle();
    if (convErr || !conv) {
      return { ok: false, status: 404, error: 'Conversation not found' };
    }

    const { data: barber, error: barberErr } = await supabase
      .from('barbers')
      .select('id, email, user_id')
      .eq('id', barberId)
      .maybeSingle();
    if (barberErr || !barber) {
      return { ok: false, status: 403, error: 'Forbidden' };
    }
    if (String(barber.email ?? '').trim().toLowerCase() !== email) {
      return { ok: false, status: 403, error: 'Forbidden' };
    }

    const convBarberId = String(conv.barber_id ?? '').trim();
    const barberUserId = String(barber.user_id ?? '').trim();
    const convBarberUserId = String(conv.barber_user_id ?? '').trim();
    if (convBarberId && convBarberId !== barberId) {
      return { ok: false, status: 403, error: 'Forbidden' };
    }
    if (!convBarberId && convBarberUserId && barberUserId && convBarberUserId !== barberUserId) {
      return { ok: false, status: 403, error: 'Forbidden' };
    }
    return { ok: true };
  }

  return { ok: false, status: 401, error: 'Unauthorized — guestClientId or barber credentials required' };
}
