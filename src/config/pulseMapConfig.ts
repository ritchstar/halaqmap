/**
 * Pulse Map — إعدادات الربط الحي (slot-based).
 * المسمى العام: «نبض» — لا «رصد» (امتثال وتجنّب سوء الفهم).
 */
import { SMART_RESPONSE_SYSTEM_LABEL_AR } from '@/config/onDemandVisibilityDoctrine';

/** المرحلة 2 — ربط حي: نبضة واحدة لكل مدينة */
export const PULSE_MAP_PHASE = 2 as const;

export const PULSE_MAP_ROUTE = '/radar';

/** إخلاء مسؤولية — يُعرض فوق الخريطة في الواجهة العامة */
export const PULSE_MAP_PUBLIC_DISCLAIMER_AR =
  'النبض يعرض نشاطاً تشغيلياً مجهّلاً على مستوى المدينة — لا يتتبع أشخاصاً ولا يُظهر مواقعاً دقيقة للمستخدمين.';

/** ربط النبض بعقيدة المنتج */
export const PULSE_MAP_DOCTRINE_LINE_AR =
  `مرتبط بـ${SMART_RESPONSE_SYSTEM_LABEL_AR} (\`On-Demand Visibility\`) — الظهور عند الطلب، لا إشغالاً دائماً للخريطة.`;

export const PULSE_MAP_LINK_LABEL_AR = 'خريطة النبض التشغيلية';

export const PULSE_MAP_CONFIG = {
  phase: PULSE_MAP_PHASE,
  showCities: true,
  showPulses: true,
  apiPath: '/api/public-pulse-map',
  pollMs: 25_000,
  pageTitleAr: 'خريطة النبض · Halaq Map',
  heroTitleAr: 'خريطة النبض التشغيلية',
  titleAr: 'خريطة النبض',
  subtitleAr: 'نشاط مجهّل على مستوى المدن — المملكة العربية السعودية',
  subtitleEn: 'Halaq Map Platform',
  phaseBadgeAr: 'نبض تشغيلي',
  phaseHintAr: 'نبضة لكل مدينة — استعلام أو تفاعل شريك (بدون أسماء صالونات)',
  pilotLabelAr: 'المملكة العربية السعودية',
  legendDemandAr: 'نبض استعلام',
  legendLinkAr: 'نبض تفاعل شريك',
  mapAriaLabelAr: 'خريطة النبض — Halaq Map — المملكة العربية السعودية',
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
