/**
 * Pulse Map — إعدادات الرادار الجديد (slot-based).
 */
export const PULSE_MAP_ROUTE = '/radar';

export const PULSE_MAP_CONFIG = {
  apiPath: '/api/public-pulse-map',
  pollMs: 25_000,
  pageTitleAr: 'خريطة النبض الحي — حلاق ماب',
  heroTitleAr: 'نبض المنصة في جنوب المملكة',
  heroSubtitleAr:
    'إشارات حية بالألوان فقط — طلب مستخدم وربط حلاق — بدون إحداثيات خام على الخريطة.',
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
