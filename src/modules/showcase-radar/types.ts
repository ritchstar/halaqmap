import type { ShowcaseRadarMode } from '@/config/showcaseRadarConfig';

export type ShowcaseRadarPulse = {
  id: string;
  kind: 'demand' | 'salon_cluster';
  lat: number;
  lng: number;
  cityAr: string;
  districtAr?: string;
  createdAt: string;
  labelAr: string;
};

export type ShowcaseRadarPayload = {
  ok: true;
  mode: ShowcaseRadarMode;
  collectedAt: string;
  stats: {
    citiesCovered: number;
    pulsesVisible: number;
    activeSalonsApprox: number;
  };
  citySignals: { cityAr: string; pulseCount24h: number }[];
  pulses: ShowcaseRadarPulse[];
  onDemandTaglineAr: string;
};

export type ShowcasePlacedPulse = ShowcaseRadarPulse & {
  left: number;
  top: number;
  ageMs: number;
};
