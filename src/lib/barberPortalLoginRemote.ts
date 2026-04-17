import { SubscriptionTier } from '@/lib';

const DEFAULT_ENDPOINT = '/api/barber-portal-login';

function endpoint(): string {
  return String(import.meta.env.VITE_BARBER_PORTAL_LOGIN_URL || DEFAULT_ENDPOINT).trim();
}

function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
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
};

export async function barberPortalLoginRemote(input: {
  email: string;
  password: string;
}): Promise<{ ok: true; session: BarberPortalSession } | { ok: false; error: string }> {
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار تسجيل الدخول غير مضبوط.' };

  try {
    const response = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        email: input.email.trim(),
        password: input.password,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      barber?: {
        id: string;
        name: string;
        email: string;
        phone: string;
        tier: string;
        rating_invite_token?: string;
      };
    };
    if (!response.ok) {
      return { ok: false, error: payload.error || `HTTP ${response.status}` };
    }
    const b = payload.barber;
    if (!b?.id) {
      return { ok: false, error: 'استجابة غير صالحة من الخادم.' };
    }
    return {
      ok: true,
      session: {
        id: b.id,
        name: b.name,
        email: b.email,
        phone: b.phone || '',
        subscription: tierFromDb(b.tier),
        ratingInviteToken: String(b.rating_invite_token ?? ''),
      },
    };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم. تحقق من الشبكة أو من إعدادات النشر.' };
  }
}
