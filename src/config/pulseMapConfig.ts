/**
 * Pulse Map — إعدادات الرادار الجديد (slot-based).
 */

/** المرحلة 1 — خطوة 2: رسم المملكة + مواقع المدن */
export const PULSE_MAP_PHASE = 1 as const;

export const PULSE_MAP_ROUTE = '/radar';

export const PULSE_MAP_CONFIG = {
  phase: PULSE_MAP_PHASE,
  showCities: true,
  showPulses: false,
  apiPath: '/api/public-pulse-map',
  pollMs: 25_000,
  pageTitleAr: 'خريطة النبض — خطوة 2 · حلاق ماب',
  heroTitleAr: 'خطوة 2 — المملكة ومواقع المدن',
  heroSubtitleAr:
    'حدود `Natural Earth` + مواقع المدن من `PLATFORM_COVERED_CITIES` (WGS-84) — بدون نبضات بعد.',
  phaseBadgeAr: 'خطوة 2',
  phaseHintAr: 'مواقع المدن — جاهز لطبقة النبض لاحقاً',
  pilotLabelAr: 'المملكة العربية السعودية',
  onDemandTaglineAr: 'الطبقة التالية: نبض الطلب والربط',
  legendDemandAr: 'نبض طلب',
  legendLinkAr: 'نبض ربط',
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
