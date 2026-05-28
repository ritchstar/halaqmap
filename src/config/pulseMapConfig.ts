/**
 * Pulse Map — إعدادات الرادار الجديد (slot-based).
 */

/** المرحلة 1 — خطوة 1: رسم المملكة فقط */
export const PULSE_MAP_PHASE = 1 as const;

export const PULSE_MAP_ROUTE = '/radar';

export const PULSE_MAP_CONFIG = {
  phase: PULSE_MAP_PHASE,
  showPulses: false,
  apiPath: '/api/public-pulse-map',
  pollMs: 25_000,
  pageTitleAr: 'خريطة النبض — خطوة 1 · حلاق ماب',
  heroTitleAr: 'خطوة 1 — رسم المملكة العربية السعودية',
  heroSubtitleAr:
    'حدود إدارية من `Natural Earth` (50m) — إسقاط equirectangular من الأعلى، بدون مدن ولا نبضات.',
  phaseBadgeAr: 'خطوة 1',
  phaseHintAr: 'رسم المملكة — جاهز لإضافة مواقع المدن لاحقاً',
  pilotLabelAr: 'المملكة العربية السعودية',
  onDemandTaglineAr: 'الطبقة التالية: مواقع المدن الرئيسية',
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
