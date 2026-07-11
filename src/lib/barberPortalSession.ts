/**
 * barberPortalSession — ربط جلسة الحلاق (barberAuth) مع Supabase اختيارياً.
 *
 * ليس دمج بوابات: لا يغيّر مسارات الدخول ولا يوحّد واجهات الشريك.
 * يوفّر فقط قراءة/حفظ barberAuth، وربط Supabase عند توفر كلمة مرور الحساب،
 * وتسجيل خروج متسق للوحة التحكم ومجتمع ماب.
 */
import { getSupabaseClient } from '@/integrations/supabase/client';
import { ROUTE_PATHS } from '@/lib';
import type { BarberPortalSession } from '@/lib/barberPortalLoginRemote';

const BARBER_AUTH_KEY = 'barberAuth';

const ALLOWED_REDIRECT_PREFIXES = ['/partners/', '/barber/'] as const;

export type SupabaseAuthSessionPayload = {
  access_token: string;
  refresh_token: string;
};

export function isBarberLoggedIn(): boolean {
  return readBarberAuthSession() != null;
}

export function readBarberAuthSession(): BarberPortalSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BARBER_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BarberPortalSession> & { loggedIn?: boolean };
    if (!parsed?.id || !parsed?.email || !parsed?.name) return null;
    return parsed as BarberPortalSession;
  } catch {
    return null;
  }
}

export function persistBarberAuthSession(session: BarberPortalSession): void {
  window.localStorage.setItem(
    BARBER_AUTH_KEY,
    JSON.stringify({
      ...session,
      loggedIn: true,
    }),
  );
}

export async function establishSupabaseSessionForPartner(input: {
  email: string;
  password: string;
  authSession?: SupabaseAuthSessionPayload | null;
}): Promise<{ ok: true } | { ok: false }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false };

  if (input.authSession?.access_token && input.authSession.refresh_token) {
    const { error } = await client.auth.setSession({
      access_token: input.authSession.access_token,
      refresh_token: input.authSession.refresh_token,
    });
    return error ? { ok: false } : { ok: true };
  }

  const { error } = await client.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password,
  });
  return error ? { ok: false } : { ok: true };
}

/** يزيل barberAuth ويُنهي جلسة Supabase في المتصفح (لوحة التحكم + مجتمع ماب). */
export async function clearBarberLinkedSession(): Promise<void> {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(BARBER_AUTH_KEY);
  }
  void import('@/lib/analytics/productAnalytics').then((m) => m.resetAnalyticsUser());
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut().catch(() => undefined);
  }
}

/** @deprecated استخدم clearBarberLinkedSession */
export const clearPartnerPortalSession = clearBarberLinkedSession;

export function resolveSafePartnerRedirect(next: string | null | undefined): string {
  const raw = (next || '').trim();
  if (!raw.startsWith('/') || raw.startsWith('//')) {
    return ROUTE_PATHS.BARBER_DASHBOARD;
  }
  if (!ALLOWED_REDIRECT_PREFIXES.some((prefix) => raw.startsWith(prefix))) {
    return ROUTE_PATHS.BARBER_DASHBOARD;
  }
  return raw;
}

export function buildBarberLoginUrl(next?: string): string {
  const raw = (next || ROUTE_PATHS.BARBER_DASHBOARD).trim();
  const safe = resolveSafePartnerRedirect(raw);
  return `${ROUTE_PATHS.BARBER_LOGIN}?next=${encodeURIComponent(safe)}`;
}

/** @deprecated استخدم buildBarberLoginUrl */
export const buildPartnerLoginUrl = buildBarberLoginUrl;
