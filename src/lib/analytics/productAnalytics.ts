import posthog from 'posthog-js';
import type { RouteBucket } from '@/config/platformPresence';

const DEFAULT_HOST = 'https://eu.i.posthog.com';
const OWN_ROOT_DOMAIN = 'halaqmap.com';
const STASHED_REFERRER_KEY = 'hm_ph_ext_referrer';
const STASHED_LANDING_SEARCH_KEY = 'hm_ph_landing_search';

let initialized = false;

export function isProductAnalyticsEnabled(): boolean {
  return Boolean(String(import.meta.env.VITE_POSTHOG_KEY || '').trim());
}

function hostnameOf(value: string): string | null {
  const raw = String(value || '').trim();
  if (!raw || raw === '$direct') return null;
  try {
    if (raw.includes('://')) return new URL(raw).hostname.toLowerCase();
    // bare domain like "halaqmap.com"
    return raw.replace(/^www\./i, '').toLowerCase().split('/')[0] || null;
  } catch {
    return null;
  }
}

function isOwnHostname(hostname: string | null): boolean {
  if (!hostname) return false;
  const h = hostname.toLowerCase().replace(/^www\./, '');
  return h === OWN_ROOT_DOMAIN || h.endsWith(`.${OWN_ROOT_DOMAIN}`);
}

function isOwnReferrerValue(value: unknown): boolean {
  if (typeof value !== 'string' || !value.trim() || value === '$direct') return false;
  const host = hostnameOf(value);
  if (host) return isOwnHostname(host);
  return /halaqmap\.com/i.test(value);
}

function readStashedExternalReferrer(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const v = sessionStorage.getItem(STASHED_REFERRER_KEY)?.trim() || '';
    if (!v || isOwnReferrerValue(v)) return null;
    return v;
  } catch {
    return null;
  }
}

function clearStashedReferrer(): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.removeItem(STASHED_REFERRER_KEY);
    sessionStorage.removeItem(STASHED_LANDING_SEARCH_KEY);
  } catch {
    /* ignore */
  }
}

/** Cookie parent domain for www + partners + apex continuity. */
function resolveCookieDomain(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const host = window.location.hostname.toLowerCase();
  if (host === OWN_ROOT_DOMAIN || host.endsWith(`.${OWN_ROOT_DOMAIN}`)) {
    return `.${OWN_ROOT_DOMAIN}`;
  }
  return undefined;
}

/**
 * Prevent apex→www (or internal hard navigations) from poisoning $initial_referrer
 * as "https://halaqmap.com". Prefer stashed external referrer when present.
 */
function sanitizeAnalyticsProperties(
  properties: Record<string, unknown>,
): Record<string, unknown> {
  const stashed = readStashedExternalReferrer();
  const pairKeys: Array<[string, string]> = [
    ['$referrer', '$referring_domain'],
    ['$initial_referrer', '$initial_referring_domain'],
  ];

  for (const [refKey, domainKey] of pairKeys) {
    const current = properties[refKey];
    if (!isOwnReferrerValue(current)) continue;
    if (stashed) {
      properties[refKey] = stashed;
      try {
        properties[domainKey] = new URL(stashed).hostname;
      } catch {
        properties[domainKey] = hostnameOf(stashed) || '$direct';
      }
    } else {
      properties[refKey] = '$direct';
      properties[domainKey] = '$direct';
    }
  }

  return properties;
}

export function initProductAnalytics(): void {
  if (typeof window === 'undefined' || initialized) return;
  const key = String(import.meta.env.VITE_POSTHOG_KEY || '').trim();
  if (!key) return;
  const host = String(import.meta.env.VITE_POSTHOG_HOST || '').trim() || DEFAULT_HOST;
  const cookieDomain = resolveCookieDomain();

  posthog.init(key, {
    api_host: host,
    ui_host: 'https://eu.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false, // HashRouter — نلتقط يدوياً
    capture_pageleave: true,
    disable_session_recording: true,
    persistence: 'localStorage+cookie',
    cross_subdomain_cookie: true,
    secure_cookie: window.location.protocol === 'https:',
    ...(cookieDomain ? { cookie_domain: cookieDomain } : {}),
    save_referrer: true,
    sanitize_properties: (props) => sanitizeAnalyticsProperties(props as Record<string, unknown>),
    loaded: (ph) => {
      const stashed = readStashedExternalReferrer();
      if (stashed) {
        try {
          ph.register_once({
            $initial_referrer: stashed,
            $initial_referring_domain: new URL(stashed).hostname,
          });
        } catch {
          ph.register_once({ $initial_referrer: stashed, $initial_referring_domain: '$direct' });
        }
        clearStashedReferrer();
      }
    },
  });
  initialized = true;
}

export function classifyRouteBucketSafe(
  pathname: string,
  isAdminPath: (p: string) => boolean,
): RouteBucket {
  const path = (pathname || '/').trim() || '/';
  if (isAdminPath(path)) return 'admin';
  if (path.startsWith('/ambassadors')) return 'ambassador';
  if (path.startsWith('/barber') || path.startsWith('/partners')) return 'partner';
  if (path === '/' || path.startsWith('/map') || path.startsWith('/rate') || path.startsWith('/pulse')) {
    return 'map';
  }
  if (
    path.startsWith('/about') ||
    path.startsWith('/terms') ||
    path.startsWith('/privacy') ||
    path.startsWith('/landing') ||
    path.startsWith('/preview')
  ) {
    return 'public';
  }
  return 'other';
}

export function trackPageView(pathname: string, routeBucket: RouteBucket): void {
  if (!initialized || !isProductAnalyticsEnabled()) return;
  const props: Record<string, string> = {
    route_bucket: routeBucket,
  };
  if (routeBucket === 'admin') {
    props.path = '/admin';
    // لا ترسل مسار الأدمن الكامل
    props.$current_url = `${window.location.origin}/#/admin`;
  } else {
    props.path = pathname;
    props.$current_url = `${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;
  }
  posthog.capture('$pageview', props);
}

export function identifyAnalyticsUser(
  distinctId: string,
  properties?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (!initialized || !isProductAnalyticsEnabled() || !distinctId.trim()) return;
  const clean: Record<string, string | number | boolean> = {};
  if (properties) {
    for (const [k, v] of Object.entries(properties)) {
      if (v === undefined || v === null) continue;
      if (/email|phone|iban|password|token/i.test(k)) continue;
      clean[k] = v;
    }
  }
  posthog.identify(distinctId.trim(), clean);
}

export function resetAnalyticsUser(): void {
  if (!initialized || !isProductAnalyticsEnabled()) return;
  posthog.reset();
}

export function trackProductEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (!initialized || !isProductAnalyticsEnabled() || !event.trim()) return;
  const clean: Record<string, string | number | boolean> = {};
  if (properties) {
    for (const [k, v] of Object.entries(properties)) {
      if (v === undefined || v === null) continue;
      if (/email|phone|iban|password|token|lat|lng|latitude|longitude/i.test(k)) continue;
      clean[k] = v;
    }
  }
  posthog.capture(event.trim(), clean);
}

export const ProductEvents = {
  bookingCreated: (props?: { barberId?: string }) =>
    trackProductEvent('booking_created', { barber_id: props?.barberId }),
  paymentCompleted: (props?: { tier?: string; amount?: number }) =>
    trackProductEvent('payment_completed', { tier: props?.tier, amount: props?.amount }),
  partnerLogin: (props?: { tier?: string }) =>
    trackProductEvent('partner_login', { tier: props?.tier }),
  ambassadorApplicationSubmitted: () => trackProductEvent('ambassador_application_submitted'),
  hospitalityRequestStarted: () => trackProductEvent('hospitality_request_started'),
} as const;
