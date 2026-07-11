import posthog from 'posthog-js';
import type { RouteBucket } from '@/config/platformPresence';

const DEFAULT_HOST = 'https://eu.i.posthog.com';

let initialized = false;

export function isProductAnalyticsEnabled(): boolean {
  return Boolean(String(import.meta.env.VITE_POSTHOG_KEY || '').trim());
}

export function initProductAnalytics(): void {
  if (typeof window === 'undefined' || initialized) return;
  const key = String(import.meta.env.VITE_POSTHOG_KEY || '').trim();
  if (!key) return;
  const host = String(import.meta.env.VITE_POSTHOG_HOST || '').trim() || DEFAULT_HOST;

  posthog.init(key, {
    api_host: host,
    person_profiles: 'identified_only',
    capture_pageview: false,
    capture_pageleave: true,
    disable_session_recording: true,
    persistence: 'localStorage+cookie',
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
  } else {
    props.path = pathname;
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
