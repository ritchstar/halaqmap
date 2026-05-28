/** Shared Pulse Map wire types (client mirror in src/modules/pulse-map/types.ts). */
export type PulseMapMode = 'live' | 'curated' | 'phase1' | 'demo';

export type PulseMapKind = 'demand' | 'link';

export type PulseMapPulse = {
  id: string;
  kind: PulseMapKind;
  slotId: string;
  createdAt: string;
};

export type PulseMapLink = {
  id: string;
  fromSlotId: string;
  toSlotId: string;
};

export type PulseMapStats = {
  demandCount: number;
  linkCount: number;
  slotsActive: number;
};

export type PulseMapAdminCitySignal = {
  slotId: string;
  nameAr: string;
  demand: boolean;
  link: boolean;
  latestAt: string | null;
};

export type PulseMapAdminInsight = {
  windowMinutes: number;
  raw: {
    searches: number;
    conversations: number;
    bookings: number;
  };
  citySignals: PulseMapAdminCitySignal[];
};

export type PulseMapPayload = {
  ok: true;
  phase: number;
  mode: PulseMapMode;
  collectedAt: string;
  pilotRegions: readonly string[];
  slots: readonly {
    id: string;
    nameAr: string;
    region: string;
    x: number;
    y: number;
  }[];
  pulses: PulseMapPulse[];
  links: PulseMapLink[];
  stats: PulseMapStats;
  admin?: PulseMapAdminInsight;
};
