import type { SupabaseClient } from '@supabase/supabase-js';
import {
  extractBarberPortalSessionToken,
  getBarberPortalSessionSecret,
  verifyBarberPortalSessionToken,
} from './barberPortalAuth.js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeEmail(raw: string): string {
  return String(raw || '').trim().toLowerCase();
}

/**
 * يتحقق من هوية الحلاق لمسارات لوحة التحكم:
 * 1) توكن الجلسة الموقّع (مفضّل)
 * 2) barberId + email متطابقان مع صف barbers (نفس نمط listing-license-balance)
 */
export async function resolveBarberPortalBookingActor(
  request: Request,
  input: { barberId?: unknown; email?: unknown },
  supabase: SupabaseClient,
): Promise<
  | { ok: true; barberId: string; email: string }
  | { ok: false; error: string; status: number }
> {
  const barberId = String(input.barberId ?? '').trim();
  const email = normalizeEmail(String(input.email ?? ''));
  if (!UUID_RE.test(barberId) || !email.includes('@')) {
    return { ok: false, error: 'Missing or invalid barberId/email', status: 400 };
  }

  const sessionSecret = getBarberPortalSessionSecret();
  if (sessionSecret) {
    const verified = verifyBarberPortalSessionToken(
      extractBarberPortalSessionToken(request),
      sessionSecret,
    );
    if (verified.ok && verified.barberId === barberId && verified.email === email) {
      return { ok: true, barberId, email };
    }
  }

  const { data: row, error } = await supabase
    .from('barbers')
    .select('id, email, is_active')
    .eq('id', barberId)
    .maybeSingle();

  if (error || !row) {
    return { ok: false, error: 'Barber not found', status: 404 };
  }

  const rowEmail = normalizeEmail(String(row.email ?? ''));
  if (!rowEmail || rowEmail !== email) {
    return { ok: false, error: 'Email does not match this barber account', status: 403 };
  }

  if (row.is_active === false) {
    return { ok: false, error: 'Barber inactive', status: 409 };
  }

  return { ok: true, barberId, email };
}
