export type PulseMapMode = 'live' | 'curated' | 'phase1' | 'demo';

export type PulseMapKind = 'demand' | 'link';

export type PulseMapSlot = {
  id: string;
  nameAr: string;
  region: string;
  x: number;
  y: number;
};

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

export type PulseMapPayload = {
  ok: true;
  phase: number;
  mode: PulseMapMode;
  collectedAt: string;
  pilotRegions: readonly string[];
  slots: PulseMapSlot[];
  pulses: PulseMapPulse[];
  links: PulseMapLink[];
  stats: {
    demandCount: number;
    linkCount: number;
    slotsActive: number;
  };
  admin?: PulseMapAdminInsight;
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

export type PlacedPulse = PulseMapPulse & {
  x: number;
  y: number;
};

export type PlacedLink = PulseMapLink & {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
