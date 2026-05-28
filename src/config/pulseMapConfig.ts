/**
 * Pulse Map — إعدادات الرادار الجديد (slot-based).
 */

/** المرحلة 2 — ربط حي: نبضة واحدة لكل مدينة */
export const PULSE_MAP_PHASE = 2 as const;

export const PULSE_MAP_ROUTE = '/radar';

export const PULSE_MAP_CONFIG = {
  phase: PULSE_MAP_PHASE,
  showCities: true,
  showPulses: true,
  apiPath: '/api/public-pulse-map',
  pollMs: 25_000,
  pageTitleAr: 'خريطة النبض — ربط حي · حلاق ماب',
  heroTitleAr: 'خريطة النبض — ربط حي',
  phaseBadgeAr: 'ربط حي',
  phaseHintAr: 'نبضة/مدينة — أي نشاط حديث يكفي',
  pilotLabelAr: 'المملكة العربية السعودية',
  legendDemandAr: 'نبض مستخدم',
  legendLinkAr: 'نبض حلاق',
} as const;

export const PULSE_MAP_COLORS = {
  demand: {
    fill: '#f59e0b',
    glow: 'rgba(251,191,36,0.55)',
    ring: 'rgba(254,243,199,0.35)',
  },
  link: {
    fill: '#14b8a6',
    glow: 'rgba(20,184,166,0.5)',
    ring: 'rgba(204,251,241,0.3)',
  },
} as const;
