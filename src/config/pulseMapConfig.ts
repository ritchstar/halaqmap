/**
 * Pulse Map — إعدادات الرادار الجديد (slot-based).
 */

/** المرحلة 1: slots + نبضات ملونة + HUD — بدون بيانات حية ولا خطوط ربط */
export const PULSE_MAP_PHASE = 1 as const;

export const PULSE_MAP_ROUTE = '/radar';

export const PULSE_MAP_CONFIG = {
  phase: PULSE_MAP_PHASE,
  apiPath: '/api/public-pulse-map',
  pollMs: 25_000,
  pageTitleAr: 'خريطة النبض — المرحلة 1 · حلاق ماب',
  heroTitleAr: 'المرحلة 1 — نواة خريطة النبض',
  heroSubtitleAr:
    'Slots ثابتة جنوب المملكة، نبضان بالألوان فقط (طلب · ربط)، بدون نص على الخريطة ولا GPS خام.',
  phaseBadgeAr: 'المرحلة 1',
  phaseHintAr: 'نواة — slots مُ calibrate + عرض توضيحي للألوان',
  pilotLabelAr: 'Pilot: الباحة · عسير · جازان · نجران',
  onDemandTaglineAr:
    'الظهور عند الطلب — الصالون يظهر حين يبحث زبون قريب.',
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
