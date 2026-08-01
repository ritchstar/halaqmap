/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { isPartnerAppFinancialPath } from '@/config/partnerAppShell';
import { ROUTE_PATHS } from '@/lib/routePaths';

/** هل الواجهة تعمل كـ PWA مثبت أو غلاف TWA؟ */
export function isPartnerAppShell(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches;
    const iosStandalone =
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const twaReferrer = document.referrer.startsWith('android-app://');
    return standalone || iosStandalone || twaReferrer;
  } catch {
    return false;
  }
}

/** رابط مطلق لمسار HashRouter */
export function buildAbsoluteAppHashUrl(pathWithSearch: string): string {
  const origin = window.location.origin.replace(/\/$/, '');
  const raw = pathWithSearch.startsWith('/') ? pathWithSearch : `/${pathWithSearch}`;
  return `${origin}/#${raw}`;
}

/**
 * يفتح رابطاً في المتصفح الخارجي (Chrome Intent على أندرويد، نافذة جديدة وإلا).
 * يُستخدم للدفع والرخص من داخل PWA/TWA.
 */
export function openInExternalBrowser(url: string): boolean {
  if (typeof window === 'undefined') return false;
  if (!isPartnerAppShell()) return false;

  const trimmed = url.trim();
  if (!trimmed) return false;

  try {
    const absolute = trimmed.startsWith('http')
      ? trimmed
      : buildAbsoluteAppHashUrl(trimmed.startsWith('#') ? trimmed.slice(1) : trimmed);

    const ua = navigator.userAgent || '';
    if (/android/i.test(ua)) {
      const parsed = new URL(absolute);
      const pathAndQuery = `${parsed.pathname}${parsed.search}`;
      const hash = parsed.hash || '';
      // ترميز # حتى لا يقطع Intent عند المسارات من نوع /#/partners/payment
      const hostPath = `${parsed.host}${pathAndQuery}${hash.replace(/^#/, '/%23')}`;
      const fallback = encodeURIComponent(absolute);
      const intent =
        `intent://${hostPath}#Intent;scheme=https;action=android.intent.action.VIEW;` +
        `S.browser_fallback_url=${fallback};end`;
      window.location.href = intent;
      return true;
    }

    const opened = window.open(absolute, '_blank', 'noopener,noreferrer');
    if (!opened) {
      window.location.assign(absolute);
    }
    return true;
  } catch {
    return false;
  }
}

/** إن كنا داخل الغلاف وعلى مسار مالي — افتح المتصفح الخارجي وأعد true */
export function breakOutFinancialPathToBrowser(pathnameWithSearch: string): boolean {
  if (!isPartnerAppShell()) return false;
  const pathOnly = pathnameWithSearch.split('?')[0] || '';
  if (!isPartnerAppFinancialPath(pathOnly)) return false;
  return openInExternalBrowser(buildAbsoluteAppHashUrl(pathnameWithSearch));
}

export function partnerAppLoginUrl(): string {
  return buildAbsoluteAppHashUrl(ROUTE_PATHS.BARBER_LOGIN);
}

export function partnerAppDashboardUrl(): string {
  return buildAbsoluteAppHashUrl(ROUTE_PATHS.BARBER_DASHBOARD);
}

export function partnerAppPaymentUrl(search = ''): string {
  const q = search && !search.startsWith('?') ? `?${search}` : search;
  return buildAbsoluteAppHashUrl(`${ROUTE_PATHS.PAYMENT}${q}`);
}
