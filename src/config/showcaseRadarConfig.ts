/**
 * Showcase Radar — ما نعرضه وما نحجبه في صفحة المعاينة العامة.
 * منفصل عن Platform Radar الإداري (غرفة القيادة).
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
  pageTitleAr: 'معاينة نظام الرصد الذكي — حلاق ماب',
  heroTitleAr: 'شاهد نظام الرصد الذكي يعمل',
  heroSubtitleAr:
    'خريطة حية لنبض الطلب الجغرافي على المملكة — الظهور عند الطلب، لا إشغال دائم.',
  onDemandTaglineAr:
    'الظهور عند الطلب · On-Demand Visibility — الصالون يظهر حين يبحث زبون قريب.',
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
