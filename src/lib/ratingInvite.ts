import type { Barber } from '@/lib/index';

/** بناء رابط دعوة التقييم من أصل الموقع (بريد، سيرفر، اختبارات) — متوافق مع HashRouter */
export function buildRatingInviteUrlStatic(siteOrigin: string, barberId: string, token: string): string {
  const base = siteOrigin.replace(/\/+$/, '');
  const hashPath = `/rate/${encodeURIComponent(barberId)}?t=${encodeURIComponent(token)}`;
  return `${base}/#${hashPath}`;
}

/** بناء رابط دعوة التقييم (متوافق مع HashRouter) */
export function buildRatingInviteUrl(barberId: string, token: string): string {
  if (typeof window === 'undefined') {
    return '';
  }
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const origin = window.location.origin;
  const hashPath = `/rate/${encodeURIComponent(barberId)}?t=${encodeURIComponent(token)}`;
  return `${origin}${path}#${hashPath}`;
}

export function validateRatingInviteToken(barber: Barber | undefined, token: string | null): boolean {
  if (!barber || !token || !barber.ratingInviteToken) return false;
  return barber.ratingInviteToken === token;
}
