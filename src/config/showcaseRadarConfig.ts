/**
 * Showcase Radar — ما نعرضه وما نحجبه في صفحة المعاينة العامة.
 * منفصل عن منصة المتابعة الإدارية الداخلية.
 */

export type ShowcaseRadarMode = 'live' | 'curated';
export type ShowcaseBarberAnchorsMode = 'off' | 'city_cluster';

export const SHOWCASE_RADAR_ROUTE = '/radar';

export const SHOWCASE_RADAR_CONFIG = {
  /** live = بيانات مُ anonymized من الخادم · curated = عرض مُ curate عند فراغ البيانات */
  mode: 'live' as ShowcaseRadarMode,
  pollMs: 30_000,
  showTacticalSweep: true,
  showBarberAnchors: 'city_cluster' as ShowcaseBarberAnchorsMode,
  showCoordinatesOnMap: false,
  showOpsPanel: false,
  showInspectorHud: false,
  showFounderControls: false,
  soundDefault: false,
  pulseMaxVisible: 24,
  pulseMaxAgeMinutes: 120,
  stats: ['cities', 'pulses', 'activeSalons'] as const,
  pageTitleAr: 'معاينة الربط الحي — حلاق ماب',
  heroTitleAr: 'شاهد الربط الحي يعمل',
  heroSubtitleAr:
    'عرض حي لحركة الطلب والتفاعل على مستوى المملكة — ظهور عند الطلب، لا إشغال دائم.',
  onDemandTaglineAr:
    'مستخدم يستعلم · حلاق متوفر — والصالون يظهر حين يصدر طلب مناسب.',
  userPulseHintAr: 'نبض مستخدم — باحث عن خدمة في المدينة.',
  barberLinkHintAr: 'حلاق متوفر — تم التواصل معه من مستخدم عبر المنصة.',
  apiPath: '/api/public-radar-showcase',
} as const;

export const SHOWCASE_RADAR_STAT_LABELS: Record<
  (typeof SHOWCASE_RADAR_CONFIG.stats)[number],
  string
> = {
  cities: 'مدن',
  pulses: 'نبضات',
  activeSalons: 'صالونات نشطة',
};
