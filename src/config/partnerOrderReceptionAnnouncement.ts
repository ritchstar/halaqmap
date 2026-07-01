import { isPartnerBannerRoute } from '@/config/partnerBannerRoutes';
import { PARTNER_PLATFORM_INSPECTION_BANNER_ENABLED } from '@/config/partnerPlatformInspectionBanner';

/** توقيت فتح استقبال الطلبات (Asia/Riyadh) — يُضبط في Vercel: `VITE_PARTNER_ORDER_RECEPTION_OPENS_AT` */
export const PARTNER_ORDER_RECEPTION_OPENS_AT_ISO =
  (import.meta.env.VITE_PARTNER_ORDER_RECEPTION_OPENS_AT as string | undefined)?.trim() ||
  '2026-06-30T09:00:00+03:00';

export const PARTNER_ORDER_RECEPTION_BANNER_ENABLED =
  import.meta.env.VITE_PARTNER_ORDER_RECEPTION_BANNER_ENABLED !== 'false';

const RIYADH_TZ = 'Asia/Riyadh';

export { isPartnerBannerRoute as isPartnerOrderReceptionBannerRoute };

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
  if (PARTNER_PLATFORM_INSPECTION_BANNER_ENABLED && PARTNER_ORDER_RECEPTION_BANNER_ENABLED) return false;
  if (!PARTNER_ORDER_RECEPTION_BANNER_ENABLED) return false;
  if (!isPartnerBannerRoute(pathname)) return false;
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
