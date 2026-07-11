export const PRESENCE_PERSONAS = ['anon', 'barber', 'admin', 'ambassador'] as const;
export type PresencePersona = (typeof PRESENCE_PERSONAS)[number];

export const ROUTE_BUCKETS = ['map', 'partner', 'admin', 'ambassador', 'public', 'other'] as const;
export type RouteBucket = (typeof ROUTE_BUCKETS)[number];

export const PRESENCE_ONLINE_WINDOW_MS = 3 * 60 * 1000;
