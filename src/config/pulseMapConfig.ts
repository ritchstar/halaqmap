/**
 * Pulse Map — إعدادات الرادار الجديد (slot-based).
 */

/** المرحلة 1 — خطوة 3: نبضان تجريبيان */
export const PULSE_MAP_PHASE = 1 as const;

export const PULSE_MAP_ROUTE = '/radar';

export const PULSE_MAP_CONFIG = {
  phase: PULSE_MAP_PHASE,
  showCities: true,
  showPulses: true,
  apiPath: '/api/public-pulse-map',
  pollMs: 25_000,
  pageTitleAr: 'خريطة النبض — خطوة 3 · حلاق ماب',
  heroTitleAr: 'خطوة 3 — نبض المستخدم ونبض الحلاق',
  heroSubtitleAr:
    'نبضان تجريبيان على مواقع المدن — ذهبي للمستخدم، أخضر مائي للحلاق — تمهيداً للربط الحي لاحقاً.',
  phaseBadgeAr: 'خطوة 3',
  phaseHintAr: 'عرض تجريبي — جاهز للربط ببيانات `Supabase`',
  pilotLabelAr: 'المملكة العربية السعودية',
  onDemandTaglineAr: 'الطبقة التالية: ربط البيانات الحية',
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
