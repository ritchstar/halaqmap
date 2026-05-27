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
    if (!parsed || (!parsed.email && !parsed.id)) return null;
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

export async function clearPartnerPortalSession(): Promise<void> {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(BARBER_AUTH_KEY);
  }
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut().catch(() => undefined);
  }
}

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

export function buildPartnerLoginUrl(next?: string): string {
  if (!next?.trim()) return ROUTE_PATHS.BARBER_LOGIN;
  return `${ROUTE_PATHS.BARBER_LOGIN}?next=${encodeURIComponent(next)}`;
}
