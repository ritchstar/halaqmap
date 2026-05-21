import type { PlatformRadarMapPulse } from '@/modules/platform-radar/types';

export type PlatformRadarForcePulse = {
  id: string;
  lat: number;
  lng: number;
  createdAt: string;
  burstKey: string;
  suspicious?: boolean;
  label?: string;
};

export type PlatformRadarUserSearchEventPayload = {
  id?: string;
  kind?: string;
  lat?: number;
  lng?: number;
  createdAt?: string;
  label?: string;
  suspicious?: boolean;
  scopeType?: string;
};

export function parsePlatformRadarUserSearchPayload(raw: unknown): PlatformRadarUserSearchEventPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const nested =
    o.payload && typeof o.payload === 'object' ? (o.payload as Record<string, unknown>) : o;

  const lat = typeof nested.lat === 'number' ? nested.lat : Number(nested.lat ?? nested.user_lat);
  const lng = typeof nested.lng === 'number' ? nested.lng : Number(nested.lng ?? nested.user_lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const createdRaw = nested.createdAt ?? nested.created_at;

  return {
    id: nested.id != null ? String(nested.id) : undefined,
    kind: nested.kind != null ? String(nested.kind) : 'user_search',
    lat,
    lng,
    createdAt: createdRaw != null ? String(createdRaw) : new Date().toISOString(),
    label: nested.label != null ? String(nested.label) : undefined,
    suspicious: nested.suspicious === true,
    scopeType: nested.scopeType != null ? String(nested.scopeType) : undefined,
  };
}

export function userSearchEventToMapPulse(event: PlatformRadarUserSearchEventPayload): PlatformRadarMapPulse {
  const id = event.id?.trim() || `rt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    kind: 'user_search',
    lat: event.lat!,
    lng: event.lng!,
    createdAt: event.createdAt || new Date().toISOString(),
    label: event.label,
    suspicious: event.suspicious ?? false,
    scopeType: event.scopeType,
  };
}

/** Immediately render a glowing ripple at map coordinates (client-side or simulated). */
export function createForcePulse(
  lat: number,
  lng: number,
  partial?: Partial<Pick<PlatformRadarForcePulse, 'id' | 'label' | 'suspicious' | 'createdAt'>>,
): PlatformRadarForcePulse {
  const id = partial?.id ?? `force-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    lat,
    lng,
    createdAt: partial?.createdAt ?? new Date().toISOString(),
    burstKey: `${id}-${Date.now()}`,
    label: partial?.label,
    suspicious: partial?.suspicious,
  };
}

export const PLATFORM_RADAR_CHANNEL = 'platform_radar_channel';
export const PLATFORM_RADAR_USER_SEARCH_EVENT = 'user_search';

/** Riyadh metro — default founder simulation target */
export const PLATFORM_RADAR_SIM_LAT = 24.7136;
export const PLATFORM_RADAR_SIM_LNG = 46.6753;
