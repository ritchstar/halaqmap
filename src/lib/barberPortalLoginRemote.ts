import { SubscriptionTier } from '@/lib';
import type { BarberPortalInclusiveCareSnapshot } from '@/lib/barberInclusiveCareRemote';

const DEFAULT_ENDPOINT = '/api/barber-portal-login';
const DEFAULT_REFRESH_ENDPOINT = '/api/barber-portal-session-refresh';

function endpoint(): string {
  return String(import.meta.env.VITE_BARBER_PORTAL_LOGIN_URL || DEFAULT_ENDPOINT).trim();
}

function refreshEndpoint(): string {
  return String(import.meta.env.VITE_BARBER_PORTAL_SESSION_REFRESH_URL || DEFAULT_REFRESH_ENDPOINT).trim();
}

function readStoredBarberSessionToken(): string {
  try {
    const raw = localStorage.getItem('barberAuth');
    if (!raw) return '';
    const parsed = JSON.parse(raw) as { barberSessionToken?: unknown };
    return String(parsed.barberSessionToken ?? '').trim();
  } catch {
    return '';
  }
}

function baseHeaders(opts?: { includeSessionToken?: boolean }): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  if (opts?.includeSessionToken !== false) {
    const token = readStoredBarberSessionToken();
    if (token) headers['x-barber-portal-session'] = token;
  }
  return headers;
}

function tierFromDb(t: string | null | undefined): SubscriptionTier {
  const v = String(t || '').toLowerCase();
  if (v === 'gold') return SubscriptionTier.GOLD;
  if (v === 'diamond') return SubscriptionTier.DIAMOND;
  return SubscriptionTier.BRONZE;
}

export type BarberPortalSession = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subscription: SubscriptionTier;
  ratingInviteToken: string;
  /** رقم عضوية ثابت على المنصة (بعد تشغيل migration member_number) */
  memberNumber: number | null;
  /** إعدادات خدمة كبار السن والمرضى وذوي الاحتياجات (من قاعدة البيانات) */
  inclusiveCare?: BarberPortalInclusiveCareSnapshot;
  /** توكن جلسة موقّع يستخدمه API لحماية مسارات البوابة الحساسة */
  barberSessionToken?: string;
};

export async function barberPortalLoginRemote(input: {
  email: string;
  password: string;
}): Promise<{ ok: true; session: BarberPortalSession } | { ok: false; error: string; code?: string }> {
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار تسجيل الدخول غير مضبوط.' };

  try {
    const response = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders({ includeSessionToken: false }),
      body: JSON.stringify({
        email: input.email.trim(),
        password: input.password,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
      barber_session_token?: string | null;
      barber?: {
        id: string;
        name: string;
        email: string;
        phone: string;
        tier: string;
        rating_invite_token?: string;
        member_number?: number | null;
        inclusiveCare?: BarberPortalInclusiveCareSnapshot;
      };
    };
    if (!response.ok) {
      const code = typeof payload.code === 'string' && payload.code.trim() ? payload.code.trim() : undefined;
      return {
        ok: false,
        error: payload.error || `HTTP ${response.status}`,
        ...(code ? { code } : {}),
      };
    }
    const b = payload.barber;
    if (!b?.id) {
      return { ok: false, error: 'استجابة غير صالحة من الخادم.' };
    }
    const mn = b.member_number;
    const memberNumber =
      mn != null && Number.isFinite(Number(mn)) ? Math.floor(Number(mn)) : null;
    const barberSessionToken = String(payload.barber_session_token ?? '').trim();
    return {
      ok: true,
      session: {
        id: b.id,
        name: b.name,
        email: b.email,
        phone: b.phone || '',
        subscription: tierFromDb(b.tier),
        ratingInviteToken: String(b.rating_invite_token ?? ''),
        memberNumber,
        inclusiveCare: b.inclusiveCare,
        barberSessionToken,
      },
    };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم. تحقق من الشبكة أو من إعدادات النشر.' };
  }
}

/**
 * يحدّث اسم الصالون والباقة وغيرها من قاعدة البيانات بعد تعديل الإدارة،
 * دون إجبار الحلاق على تسجيل الخروج (يُستدعى من لوحة التحكم عند التحميل).
 */
export async function refreshBarberPortalSessionRemote(input: {
  barberId: string;
  email: string;
}): Promise<{ ok: true; session: BarberPortalSession } | { ok: false; error: string; code?: string }> {
  const ep = refreshEndpoint();
  if (!ep) return { ok: false, error: 'مسار تحديث الجلسة غير مضبوط.' };

  try {
    const response = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        barberId: input.barberId.trim(),
        email: input.email.trim(),
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
      barber_session_token?: string | null;
      barber?: {
        id: string;
        name: string;
        email: string;
        phone: string;
        tier: string;
        rating_invite_token?: string;
        member_number?: number | null;
        inclusiveCare?: BarberPortalInclusiveCareSnapshot;
      };
    };
    if (!response.ok) {
      const code = typeof payload.code === 'string' && payload.code.trim() ? payload.code.trim() : undefined;
      return {
        ok: false,
        error: payload.error || `HTTP ${response.status}`,
        ...(code ? { code } : {}),
      };
    }
    const b = payload.barber;
    if (!b?.id) {
      return { ok: false, error: 'استجابة غير صالحة من الخادم.' };
    }
    const mn = b.member_number;
    const memberNumber =
      mn != null && Number.isFinite(Number(mn)) ? Math.floor(Number(mn)) : null;
    const barberSessionToken = String(payload.barber_session_token ?? '').trim() || readStoredBarberSessionToken();
    return {
      ok: true,
      session: {
        id: b.id,
        name: b.name,
        email: b.email,
        phone: b.phone || '',
        subscription: tierFromDb(b.tier),
        ratingInviteToken: String(b.rating_invite_token ?? ''),
        memberNumber,
        inclusiveCare: b.inclusiveCare,
        barberSessionToken,
      },
    };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بخدمة تحديث الجلسة.' };
  }
}
