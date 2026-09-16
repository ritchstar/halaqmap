/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { isPartnerAppFinancialPath } from '@/config/partnerAppShell';
import { getSiteOrigin } from '@/config/siteOrigin';
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
    // لا نعتمد referrer وحدها — Custom Tab قد يحمل android-app:// ويُظهر الشريط بالخطأ.
    return standalone || iosStandalone;
  } catch {
    return false;
  }
}

/** رابط مطلق لمسار HashRouter — يفضّل أصل المنصة العام (www) للخروج من الغلاف. */
export function buildAbsoluteAppHashUrl(pathWithSearch: string): string {
  const origin =
    typeof window !== 'undefined'
      ? getSiteOrigin() || window.location.origin.replace(/\/$/, '')
      : 'https://www.halaqmap.com';
  const raw = pathWithSearch.startsWith('/') ? pathWithSearch : `/${pathWithSearch}`;
  return `${origin.replace(/\/$/, '')}/#${raw}`;
}

function clickSchemeOrUrl(href: string): boolean {
  try {
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.rel = 'noopener noreferrer';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return true;
  } catch {
    return false;
  }
}

/**
 * يفتح رابطاً في متصفح خارجي حقيقي من داخل PWA/TWA.
 *
 * لا تستخدم `intent://https://www.halaqmap.com/...` — Digital Asset Links تعيد
 * فتح تطبيق الصالون نفسه فيبدو أن الصفحة «تعود لنفسها».
 * على أندرويد نستخدم `googlechrome://navigate` لفرض Chrome الكامل.
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
      const encoded = encodeURIComponent(absolute);
      // 1) Chrome الكامل — يتجاوز ربط TWA لنفس النطاق
      if (clickSchemeOrUrl(`googlechrome://navigate?url=${encoded}`)) {
        return true;
      }
      // 2) Intent يفتح تطبيق Chrome صراحةً بمخطط googlechrome (لا https على النطاق المرتبط)
      const chromeIntent =
        `intent://navigate?url=${encoded}` +
        `#Intent;scheme=googlechrome;package=com.android.chrome;` +
        `S.browser_fallback_url=${encoded};end`;
      if (clickSchemeOrUrl(chromeIntent)) {
        return true;
      }
      return false;
    }

    const opened = window.open(absolute, '_blank', 'noopener,noreferrer');
    if (opened) {
      try {
        opened.opener = null;
      } catch {
        /* ignore */
      }
      return true;
    }

    return clickSchemeOrUrl(absolute);
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
