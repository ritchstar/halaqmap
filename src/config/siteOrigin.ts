/** مطابق لـ ROUTE_PATHS.PAYMENT — يُعرَّف هنا لتفادي استيراد حلاق ماب/index من طبقة الإعدادات. */
const PARTNER_PAYMENT_PATH = '/partners/payment';
/** مطابق لـ ROUTE_PATHS.GROWTH_PITCH_DECK */
const GROWTH_PITCH_DECK_PATH = '/m/growth-pitch-deck';

/** أصل الموقع العام (روابط canonical و JSON-LD و OG). يُفضّل ضبط VITE_SITE_ORIGIN في الإنتاج. */
export function getSiteOrigin(): string {
  const raw = (
    (import.meta.env.VITE_SITE_ORIGIN as string | undefined) ||
    (import.meta.env.VITE_PUBLIC_APP_ORIGIN as string | undefined)
  )?.trim();
  if (raw) return raw.replace(/\/+$/, '');
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return 'https://www.halaqmap.com';
}

/** رابط HashRouter مطلق — للمشاركة والروابط بين النطاقات. */
export function buildAbsoluteHashRoute(path: string): string {
  const base = getSiteOrigin().replace(/\/+$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}/#${normalized}`;
}

/**
 * رابط مطلق لصفحة الدفع (HashRouter) — للبريد والمشاركة خارج التطبيق.
 * مثال: `https://halaqmap.com/#/partners/payment?tier=gold&requestId=HM-...`
 */
export function buildAbsolutePartnerPaymentUrl(opts: {
  tier: string;
  requestId: string;
  qty?: number;
  aiAddon?: boolean;
}): string {
  const base = getSiteOrigin().replace(/\/+$/, '');
  const q = new URLSearchParams();
  q.set('tier', opts.tier.trim().toLowerCase());
  const rid = opts.requestId.trim();
  if (rid) q.set('requestId', rid);
  if (opts.qty != null && Number.isFinite(opts.qty) && opts.qty > 1) {
    q.set('qty', String(Math.trunc(opts.qty)));
  }
  if (opts.aiAddon === true) {
    q.set('aiAddon', '1');
  }
  return `${base}/#${PARTNER_PAYMENT_PATH}?${q.toString()}`;
}

/**
 * رابط مطلق لعرض النمو (HashRouter) — للإحالة من غرفة القيادة وواتساب.
 * مثال: `https://www.halaqmap.com/#/m/growth-pitch-deck?src=cc`
 */
export function buildAbsoluteGrowthPitchDeckUrl(opts?: {
  src?: string;
  ref?: string;
}): string {
  const base = getSiteOrigin().replace(/\/+$/, '');
  const q = new URLSearchParams();
  if (opts?.src?.trim()) q.set('src', opts.src.trim());
  if (opts?.ref?.trim()) q.set('ref', opts.ref.trim());
  const qs = q.toString();
  return `${base}/#${GROWTH_PITCH_DECK_PATH}${qs ? `?${qs}` : ''}`;
}
