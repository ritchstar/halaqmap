import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { buildInclusiveCareSnapshotFromBarberRow } from './inclusiveCareBarberSnapshot.js';
import { verifyBarberPortalMagicToken } from './barberPortalMagicToken.js';
import { getBarberPortalSessionSecret, mintBarberPortalSessionToken } from './barberPortalAuth.js';
import { resolveSalonMemberRole, type SalonMemberRole } from './salonMemberAuth.js';

const MAGIC_ERROR_AR: Record<string, string> = {
  missing_token: 'الرابط ناقص أو غير صالح.',
  malformed: 'الرابط غير صالح.',
  bad_signature: 'الرابط غير موثوق أو مُلاعَب.',
  bad_payload: 'الرابط غير صالح.',
  expired: 'انتهت صلاحية الرابط. اطلب بريداً جديداً أو سجّل الدخول يدوياً.',
};

function tierAllowsDashboard(tierRaw: string): boolean {
  const t = String(tierRaw || '').toLowerCase();
  return t === 'gold' || t === 'diamond';
}

export type MagicConsumeBarberPayload = {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  rating_invite_token: string;
  member_number: number | null;
  inclusiveCare: ReturnType<typeof buildInclusiveCareSnapshotFromBarberRow>;
};

export type MagicConsumeSuccess = {
  ok: true;
  barber_session_token: string | null;
  salon_role: SalonMemberRole | null;
  barber: MagicConsumeBarberPayload;
};

export type MagicConsumeFailure = {
  ok: false;
  status: number;
  error: string;
  code?: string;
};

export async function consumeBarberPortalMagicToken(
  supabase: SupabaseClient,
  tokenRaw: string,
  secret: string,
): Promise<MagicConsumeSuccess | MagicConsumeFailure> {
  const token = String(tokenRaw ?? '').trim();
  const verified = verifyBarberPortalMagicToken(token, secret);
  if (verified.ok === false) {
    return {
      ok: false,
      status: 401,
      error: MAGIC_ERROR_AR[verified.reason] || 'الرابط غير صالح.',
      code: verified.reason,
    };
  }

  const selectCols =
    'id, name, email, phone, tier, rating_invite_token, member_number, is_active, inclusive_care_offered, inclusive_care_price_sar, inclusive_care_public_visible, inclusive_care_restrict_days, inclusive_care_days, inclusive_care_customer_note';

  const { data: row, error: loadErr } = await supabase
    .from('barbers')
    .select(selectCols)
    .eq('id', verified.barberId)
    .maybeSingle();

  if (loadErr) {
    return { ok: false, status: 500, error: loadErr.message || 'Lookup failed' };
  }
  if (!row) {
    return { ok: false, status: 404, error: 'الحساب غير موجود.' };
  }

  const b = row as {
    id: string;
    name: string;
    email: string;
    phone: string;
    tier: string;
    rating_invite_token: string | null;
    member_number: number | null;
    is_active: boolean | null;
    inclusive_care_offered?: boolean | null;
    inclusive_care_price_sar?: unknown;
    inclusive_care_public_visible?: boolean | null;
    inclusive_care_restrict_days?: boolean | null;
    inclusive_care_days?: unknown;
    inclusive_care_customer_note?: string | null;
  };

  const rowEmail = String(b.email ?? '').trim().toLowerCase();
  if (!rowEmail || rowEmail !== verified.email) {
    return { ok: false, status: 403, error: 'البريد لا يطابق هذا الرابط.' };
  }
  if (b.is_active === false) {
    return { ok: false, status: 403, error: 'الحساب غير مفعّل.' };
  }
  if (!tierAllowsDashboard(String(b.tier ?? ''))) {
    return {
      ok: false,
      status: 403,
      error: 'باقتك البرونزية لا تتضمن لوحة التحكم الإلكترونية. رقِ للذهبي أو الماسي للوصول.',
      code: 'TIER_BRONZE_NO_DASHBOARD',
    };
  }

  const sessionSecret = getBarberPortalSessionSecret();
  const barberSessionToken = sessionSecret
    ? mintBarberPortalSessionToken(String(b.id), String(b.email ?? ''), sessionSecret)
    : null;

  const salonRole = await resolveSalonMemberRole(supabase, String(b.id), String(b.email ?? ''));

  const { error: insErr } = await supabase.from('barber_portal_magic_redemptions').insert({
    jti: verified.jti,
    barber_id: verified.barberId,
  });

  if (insErr) {
    const msg = insErr.message || '';
    if (msg.includes('duplicate') || msg.includes('unique') || insErr.code === '23505') {
      return {
        ok: false,
        status: 410,
        error: 'تم استخدام هذا الرابط مسبقاً. استخدم رابطاً جديداً من أحدث بريد أو سجّل الدخول يدوياً.',
        code: 'magic_already_used',
      };
    }
    return { ok: false, status: 500, error: insErr.message || 'تعذر تسجيل الدخول السريع.' };
  }

  return {
    ok: true,
    barber_session_token: barberSessionToken,
    salon_role: salonRole,
    barber: {
      id: String(b.id),
      name: String(b.name ?? ''),
      email: String(b.email ?? ''),
      phone: String(b.phone ?? ''),
      tier: String(b.tier ?? 'bronze'),
      rating_invite_token: b.rating_invite_token != null ? String(b.rating_invite_token) : '',
      member_number:
        b.member_number != null && Number.isFinite(Number(b.member_number))
          ? Math.floor(Number(b.member_number))
          : null,
      inclusiveCare: buildInclusiveCareSnapshotFromBarberRow(b),
    },
  };
}
