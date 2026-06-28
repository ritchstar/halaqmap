import { ROUTE_PATHS } from '@/lib/index';

/** توقيت فتح استقبال الطلبات (Asia/Riyadh) — يُضبط في Vercel: `VITE_PARTNER_ORDER_RECEPTION_OPENS_AT` */
export const PARTNER_ORDER_RECEPTION_OPENS_AT_ISO =
  (import.meta.env.VITE_PARTNER_ORDER_RECEPTION_OPENS_AT as string | undefined)?.trim() ||
  '2026-06-30T09:00:00+03:00';

export const PARTNER_ORDER_RECEPTION_BANNER_ENABLED =
  import.meta.env.VITE_PARTNER_ORDER_RECEPTION_BANNER_ENABLED !== 'false';

const RIYADH_TZ = 'Asia/Riyadh';

/** مسارات تُعرض عليها الحملة — مسار الشركاء التسويقي فقط */
const BANNER_ROUTE_PREFIXES = [
  ROUTE_PATHS.BARBERS_LANDING,
  ROUTE_PATHS.PARTNERS_B2B_LANDING,
  ROUTE_PATHS.PARTNER_INTEREST,
  ROUTE_PATHS.REGISTER,
  ROUTE_PATHS.REGISTER_SUCCESS,
  ROUTE_PATHS.PAYMENT,
  ROUTE_PATHS.PARTNER_WHY,
  ROUTE_PATHS.PARTNER_STORY,
  ROUTE_PATHS.PARTNER_TUTORIALS,
  ROUTE_PATHS.PARTNER_SALES_OFFICE,
  ROUTE_PATHS.PARTNERS_BANNERS_PREVIEW,
  ROUTE_PATHS.LANDING_PARTNERS_PREVIEW,
  '/for-barbers',
  '/register',
  '/payment',
] as const;

const BANNER_ROUTE_EXCLUDES = [
  ROUTE_PATHS.SHOP_OPEN_STATUS,
  ROUTE_PATHS.SHOP_OPEN_ROTATE,
  ROUTE_PATHS.SHOP_OPEN_ROTATE_CONFIRM,
  ROUTE_PATHS.BARBER_PORTAL_ENTER,
  ROUTE_PATHS.BARBER_DASHBOARD,
] as const;

function normalizePath(pathname: string): string {
  const raw = pathname.replace(/\/+$/, '') || '/';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

export function isPartnerOrderReceptionBannerRoute(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (BANNER_ROUTE_EXCLUDES.some((p) => path === p || path.startsWith(`${p}/`))) {
    return false;
  }
  return BANNER_ROUTE_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
}

function parseOpensAtMs(iso: string): number | null {
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : null;
}

/** بداية اليوم في الرياض (UTC ms) */
function riyadhDayStartMs(date: Date): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: RIYADH_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const y = parts.find((p) => p.type === 'year')?.value ?? '1970';
  const m = parts.find((p) => p.type === 'month')?.value ?? '01';
  const d = parts.find((p) => p.type === 'day')?.value ?? '01';
  return Date.parse(`${y}-${m}-${d}T00:00:00+03:00`);
}

export function getPartnerOrderReceptionDaysUntilOpen(now = new Date()): number | null {
  const opensMs = parseOpensAtMs(PARTNER_ORDER_RECEPTION_OPENS_AT_ISO);
  if (opensMs == null) return null;
  const diff = riyadhDayStartMs(new Date(opensMs)) - riyadhDayStartMs(now);
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

export function formatPartnerOrderReceptionCountdownAr(daysUntil: number): string {
  if (daysUntil <= 0) return 'قريباً جداً';
  if (daysUntil === 1) return 'خلال يوم واحد';
  if (daysUntil === 2) return 'خلال يومين';
  return `خلال ${daysUntil.toLocaleString('ar-SA')} أيام`;
}

export function shouldShowPartnerOrderReceptionBanner(
  pathname: string,
  now = new Date(),
): boolean {
  if (!PARTNER_ORDER_RECEPTION_BANNER_ENABLED) return false;
  if (!isPartnerOrderReceptionBannerRoute(pathname)) return false;
  const opensMs = parseOpensAtMs(PARTNER_ORDER_RECEPTION_OPENS_AT_ISO);
  if (opensMs == null) return false;
  return now.getTime() < opensMs;
}

export function buildPartnerOrderReceptionMarqueeSegments(daysUntil: number): readonly string[] {
  const countdown = formatPartnerOrderReceptionCountdownAr(daysUntil);
  return [
    `استقبال طلبات رخصة النفاذ يبدأ ${countdown}`,
    'سنُعلِن الرسمي عن موعد البدء حفاظاً على حق المهتمين المبكرين',
    'سجّل اهتمامك الآن — نُبلّغك فور فتح الباب',
    'مسار الشركاء · حلاق ماب',
  ] as const;
}
