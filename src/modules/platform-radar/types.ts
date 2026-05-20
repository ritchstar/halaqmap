import type { AdminStats } from '@/lib/index';

export type PlatformRadarSearchDistrict = {
  districtName: string;
  searchCount: number;
  topCity: string | null;
};

export type PlatformRadarRecruitmentAlert = {
  districtName: string;
  cityName: string | null;
  searchCount24h: number;
  approximateBarbers: number;
  label: string;
};

export type PlatformRadarBriefSlice = {
  searchDemandLine?: string;
  recruitmentAlertsLine?: string;
  topDistricts24h: PlatformRadarSearchDistrict[];
  recruitmentAlerts: PlatformRadarRecruitmentAlert[];
  logsScanned24h: number;
  failedPayments24h: number;
  pendingSubmissions24h: number;
  supabasePingMs: number | null;
  securityEvents7d: number;
};

export type PlatformRadarOpsPulse = {
  urgentCount24h: number;
  latestDigestSummary: string | null;
};

export type PlatformRadarSnapshot = {
  loadedAt: string;
  stats: AdminStats;
  brief: PlatformRadarBriefSlice | null;
  ops: PlatformRadarOpsPulse;
  pulseSignature: string;
};
