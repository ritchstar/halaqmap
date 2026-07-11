import type { PresencePersona, RouteBucket } from '@/config/platformPresence';

const STORAGE_KEY = 'hm-presence-key-v1';
const HEARTBEAT_MS = 75_000;
const ENDPOINT = '/api/presence-heartbeat';

function randomKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '');
  }
  return `hm${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`;
}

export function getOrCreatePresenceKey(): string {
  if (typeof window === 'undefined') return randomKey();
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY)?.trim();
    if (existing && existing.length >= 16 && existing.length <= 64) return existing;
    const next = randomKey().slice(0, 64);
    window.localStorage.setItem(STORAGE_KEY, next);
    return next;
  } catch {
    return randomKey();
  }
}

export type PresencePulseContext = {
  persona: PresencePersona;
  routeBucket: RouteBucket;
  barberId?: string;
  email?: string;
  adminAccessToken?: string;
  barberPortalSessionToken?: string;
};

let lastPulseAt = 0;
let inFlight = false;

export async function sendPresenceHeartbeat(ctx: PresencePulseContext): Promise<void> {
  if (typeof window === 'undefined') return;
  if (document.visibilityState !== 'visible') return;
  if (inFlight) return;
  const now = Date.now();
  if (now - lastPulseAt < 20_000) return;

  inFlight = true;
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (ctx.persona === 'admin' && ctx.adminAccessToken?.trim()) {
      headers.Authorization = `Bearer ${ctx.adminAccessToken.trim()}`;
      const url = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
      if (url) headers['x-client-supabase-url'] = url;
    }
    if (ctx.persona === 'barber' && ctx.barberPortalSessionToken?.trim()) {
      headers['x-barber-portal-session'] = ctx.barberPortalSessionToken.trim();
    }

    const body: Record<string, string> = {
      presence_key: getOrCreatePresenceKey(),
      persona: ctx.persona,
      route_bucket: ctx.routeBucket,
    };
    if (ctx.persona === 'barber' && ctx.barberId && ctx.email) {
      body.barber_id = ctx.barberId;
      body.email = ctx.email;
    }

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      keepalive: true,
    });
    if (res.ok) lastPulseAt = Date.now();
  } catch {
    // silent — presence is best-effort
  } finally {
    inFlight = false;
  }
}

export function startPresenceHeartbeatLoop(
  getContext: () => PresencePulseContext | null,
): () => void {
  if (typeof window === 'undefined') return () => {};

  const tick = () => {
    if (document.visibilityState !== 'visible') return;
    const ctx = getContext();
    if (!ctx) return;
    void sendPresenceHeartbeat(ctx);
  };

  tick();
  const id = window.setInterval(tick, HEARTBEAT_MS);
  const onVis = () => {
    if (document.visibilityState === 'visible') tick();
  };
  document.addEventListener('visibilitychange', onVis);

  return () => {
    window.clearInterval(id);
    document.removeEventListener('visibilitychange', onVis);
  };
}
