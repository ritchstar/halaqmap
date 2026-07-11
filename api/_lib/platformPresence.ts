/**
 * Shared helpers for presence + live activity (no geo).
 */
export const PRESENCE_PERSONAS = ['anon', 'barber', 'admin', 'ambassador'] as const;
export type PresencePersona = (typeof PRESENCE_PERSONAS)[number];

export const ROUTE_BUCKETS = ['map', 'partner', 'admin', 'ambassador', 'public', 'other'] as const;
export type RouteBucket = (typeof ROUTE_BUCKETS)[number];

export const PRESENCE_ONLINE_WINDOW_MS = 3 * 60 * 1000;

export function isPresencePersona(v: unknown): v is PresencePersona {
  return typeof v === 'string' && (PRESENCE_PERSONAS as readonly string[]).includes(v);
}

export function isRouteBucket(v: unknown): v is RouteBucket {
  return typeof v === 'string' && (ROUTE_BUCKETS as readonly string[]).includes(v);
}

export function isPresenceKey(v: unknown): v is string {
  if (typeof v !== 'string') return false;
  const t = v.trim();
  return t.length >= 16 && t.length <= 64 && /^[a-zA-Z0-9_-]+$/.test(t);
}

export function isUuid(v: unknown): v is string {
  if (typeof v !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v.trim(),
  );
}
