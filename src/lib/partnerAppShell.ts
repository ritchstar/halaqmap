/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { isPartnerAppFinancialPath } from '@/config/partnerAppShell';
import { ROUTE_PATHS } from '@/lib/routePaths';

const EXTERNAL_BREAKOUT_GUARD_PREFIX = 'hm-partner-external-breakout:';

function breakoutGuardKey(url: string): string {
  return `${EXTERNAL_BREAKOUT_GUARD_PREFIX}${url.trim().slice(0, 240)}`;
}

/** هل سبق محاولة فتح هذا الرابط في متصفح خارجي في هذه الجلسة؟ */
export function wasExternalBreakoutAttempted(url: string): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  try {
    return sessionStorage.getItem(breakoutGuardKey(url)) === '1';
  } catch {
    return false;
  }
}

function markExternalBreakoutAttempted(url: string): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(breakoutGuardKey(url), '1');
  } catch {
    /* ignore */
  }
}

/** هل الواجهة تعمل كـ PWA مثبت أو غلاف TWA؟ */
export function isPartnerAppShell(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches;
    const iosStandalone =
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    // لا نعتمد referrer وحدها — Custom Tab قد يحمل android-app:// ويُظهر شريط «افتح في المتصفح» بالخطأ.
    return standalone || iosStandalone;
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

    markExternalBreakoutAttempted(absolute);

    const ua = navigator.userAgent || '';
    if (/android/i.test(ua)) {
      const parsed = new URL(absolute);
      const hashPart = parsed.hash ? parsed.hash.replace(/^#/, '') : '';
      const hostPath = hashPart
        ? `${parsed.host}${parsed.pathname || '/'}${parsed.search}#${hashPart}`
        : `${parsed.host}${parsed.pathname || '/'}${parsed.search}`;
      const fallback = encodeURIComponent(absolute);
      const intent =
        `intent://${hostPath}#Intent;scheme=https;action=android.intent.action.VIEW;` +
        `package=com.android.chrome;S.browser_fallback_url=${fallback};end`;
      // location.href موثوق لفتح Chrome من TWA؛ الحارس يمنع الحلقة (لا فتح تلقائي عند التحميل).
      window.location.href = intent;
      return true;
    }

    const opened = window.open(absolute, '_blank', 'noopener,noreferrer');
    // لا نستخدم location.assign داخل الغلاف — يُعيد تحميل نفس WebView ويُسبب حلقة لا نهائية.
    return Boolean(opened);
  } catch {
    return false;
  }
}

/**
 * @deprecated لا يُستدعى تلقائياً عند تحميل الصفحة — يُفتح المتصفح الخارجي من
 * زر صريح فقط (PartnerExternalCheckoutGate) لتجنّب حلقة إعادة التحميل في TWA.
 */
export function breakOutFinancialPathToBrowser(pathnameWithSearch: string): boolean {
  if (!isPartnerAppShell()) return false;
  const pathOnly = pathnameWithSearch.split('?')[0] || '';
  if (!isPartnerAppFinancialPath(pathOnly)) return false;
  const absolute = buildAbsoluteAppHashUrl(pathnameWithSearch);
  if (wasExternalBreakoutAttempted(absolute)) return false;
  return openInExternalBrowser(absolute);
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
