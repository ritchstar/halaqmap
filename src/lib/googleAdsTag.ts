import {
  GOOGLE_ADS_CONVERSION_ID,
  GOOGLE_ADS_PAGE_VIEW_CONVERSION_SEND_TO,
  GOOGLE_ANALYTICS_MEASUREMENT_ID,
} from '@/config/googleAdsTag';

export type GoogleAdsTrackedEvent = {
  id: string;
  at: string;
  name: string;
  path?: string;
  detail?: string;
};

const EVENT_LOG_KEY = 'halaqmap.googleAdsTag.events.v1';
const EVENT_LOG_CAP = 80;
const PAGE_CONV_SESSION_KEY = 'halaqmap.googleAds.pageViewConversion.v1';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isGoogleAdsTagLoaded(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof window.gtag === 'function' && Array.isArray(window.dataLayer);
}

export function readGoogleAdsEventLog(): GoogleAdsTrackedEvent[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EVENT_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is GoogleAdsTrackedEvent =>
        Boolean(row) &&
        typeof row === 'object' &&
        typeof (row as GoogleAdsTrackedEvent).id === 'string' &&
        typeof (row as GoogleAdsTrackedEvent).at === 'string' &&
        typeof (row as GoogleAdsTrackedEvent).name === 'string',
    );
  } catch {
    return [];
  }
}

function appendEvent(entry: Omit<GoogleAdsTrackedEvent, 'id' | 'at'>): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const next: GoogleAdsTrackedEvent = {
      id: uid(),
      at: new Date().toISOString(),
      ...entry,
    };
    const prev = readGoogleAdsEventLog();
    const merged = [next, ...prev].slice(0, EVENT_LOG_CAP);
    localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('halaqmap:google-ads-event', { detail: next }));
  } catch {
    /* private mode / quota */
  }
}

export function clearGoogleAdsEventLog(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(EVENT_LOG_KEY);
    window.dispatchEvent(new CustomEvent('halaqmap:google-ads-event-cleared'));
  } catch {
    /* ignore */
  }
}

/**
 * إرسال إحالة ناجحة (`conversion`) إلى Google Ads.
 * `sendTo` يجب أن يكون بالشكل `AW-…/LABEL` لإجراء «مشاهدة صفحة».
 */
export function trackGoogleAdsConversion(opts: {
  sendTo: string;
  value?: number;
  currency?: string;
  detail?: string;
}): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  const sendTo = opts.sendTo.trim();
  if (!sendTo.startsWith('AW-')) return;
  try {
    const payload: Record<string, unknown> = { send_to: sendTo };
    if (opts.value != null) payload.value = opts.value;
    if (opts.currency) payload.currency = opts.currency;
    window.gtag('event', 'conversion', payload);
    appendEvent({
      name: 'conversion',
      path: typeof window.location.hash === 'string' ? window.location.hash.replace(/^#/, '') : undefined,
      detail: opts.detail || sendTo,
    });
  } catch {
    /* ignore */
  }
}

/** مرة واحدة لكل مسار في الجلسة — يكفي لتحقق Ads دون إغراق الأحداث. */
function firePageViewConversionOnce(path: string): void {
  const sendTo = GOOGLE_ADS_PAGE_VIEW_CONVERSION_SEND_TO;
  if (!sendTo || !sendTo.includes('/')) return;
  if (typeof sessionStorage === 'undefined') return;
  try {
    const key = `${PAGE_CONV_SESSION_KEY}:${path}`;
    if (sessionStorage.getItem(key) === '1') return;
    sessionStorage.setItem(key, '1');
    trackGoogleAdsConversion({
      sendTo,
      value: 1,
      currency: 'SAR',
      detail: `page_view_conversion:${path}`,
    });
  } catch {
    /* ignore */
  }
}

/** إرسال مشاهدة صفحة لـ SPA (HashRouter) — Analytics + Ads. */
export function trackGoogleAdsPageView(path: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  const pagePath = path.startsWith('/') ? path : `/${path}`;
  try {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: typeof document !== 'undefined' ? document.title : undefined,
      send_to: [GOOGLE_ANALYTICS_MEASUREMENT_ID, GOOGLE_ADS_CONVERSION_ID],
    });
    appendEvent({ name: 'page_view', path: pagePath });
    firePageViewConversionOnce(pagePath);
  } catch {
    /* ignore */
  }
}

/**
 * إرسال حدث تحويل/تفاعل مخصّص إلى Google Ads.
 * استخدم `sendTo` الكامل مثل `AW-18240041811/XXXX` عند توفر تسمية التحويل.
 */
export function trackGoogleAdsEvent(
  eventName: string,
  opts?: { sendTo?: string; value?: number; currency?: string; detail?: string },
): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  const payload: Record<string, unknown> = {
    send_to: opts?.sendTo || GOOGLE_ADS_CONVERSION_ID,
  };
  if (opts?.value != null) payload.value = opts.value;
  if (opts?.currency) payload.currency = opts.currency;
  try {
    window.gtag('event', eventName, payload);
    appendEvent({
      name: eventName,
      path: typeof window.location.hash === 'string' ? window.location.hash.replace(/^#/, '') : undefined,
      detail: opts?.detail,
    });
  } catch {
    /* ignore */
  }
}

export function getGoogleAdsTagSnapshot(): {
  loaded: boolean;
  conversionId: string;
  analyticsId: string;
  pageViewSendTo: string;
  dataLayerSize: number;
  eventCount: number;
  lastEventAt: string | null;
} {
  const events = readGoogleAdsEventLog();
  return {
    loaded: isGoogleAdsTagLoaded(),
    conversionId: GOOGLE_ADS_CONVERSION_ID,
    analyticsId: GOOGLE_ANALYTICS_MEASUREMENT_ID,
    pageViewSendTo: GOOGLE_ADS_PAGE_VIEW_CONVERSION_SEND_TO,
    dataLayerSize: Array.isArray(window.dataLayer) ? window.dataLayer.length : 0,
    eventCount: events.length,
    lastEventAt: events[0]?.at ?? null,
  };
}
