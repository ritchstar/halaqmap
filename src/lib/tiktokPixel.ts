/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { TIKTOK_PIXEL_CURRENCY, TIKTOK_PIXEL_ID, TIKTOK_PIXEL_SCRIPT_SRC } from '@/config/tiktokPixel';

export type TikTokTrackedEvent = {
  id: string;
  at: string;
  name: string;
  path?: string;
  detail?: string;
};

const EVENT_LOG_KEY = 'halaqmap.tiktokPixel.events.v1';
const EVENT_LOG_CAP = 80;
const PAYMENT_DEDUP_KEY_PREFIX = 'halaqmap.tiktok.completePayment.v1:';
const CHECKOUT_DEDUP_KEY_PREFIX = 'halaqmap.tiktok.initiateCheckout.v1:';
const REGISTER_DEDUP_KEY_PREFIX = 'halaqmap.tiktok.completeRegistration.v1:';

type TikTokTrackFn = (event: string, payload?: Record<string, unknown>, options?: Record<string, unknown>) => void;

type TikTokQueue = {
  page?: () => void;
  track?: TikTokTrackFn;
  load?: (pixelId: string, options?: Record<string, unknown>) => void;
  push?: unknown;
  methods?: string[];
  setAndDefer?: (target: TikTokQueue, method: string) => void;
  instance?: (pixelId: string) => TikTokQueue;
  _i?: Record<string, unknown>;
  _t?: Record<string, number>;
  _o?: Record<string, unknown>;
};

declare global {
  interface Window {
    TikTokAnalyticsObject?: string;
    ttq?: TikTokQueue;
    __hmTtqBooted?: boolean;
    __hmTtqScheduled?: boolean;
  }
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isTikTokPixelConfigured(): boolean {
  return /^[A-Za-z0-9]{6,40}$/.test(TIKTOK_PIXEL_ID);
}

export function isTikTokPixelLoaded(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof window.ttq?.track === 'function';
}

export function readTikTokEventLog(): TikTokTrackedEvent[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EVENT_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is TikTokTrackedEvent =>
        Boolean(row) &&
        typeof row === 'object' &&
        typeof (row as TikTokTrackedEvent).id === 'string' &&
        typeof (row as TikTokTrackedEvent).at === 'string' &&
        typeof (row as TikTokTrackedEvent).name === 'string',
    );
  } catch {
    return [];
  }
}

function appendEvent(entry: Omit<TikTokTrackedEvent, 'id' | 'at'>): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const next: TikTokTrackedEvent = {
      id: uid(),
      at: new Date().toISOString(),
      ...entry,
    };
    const prev = readTikTokEventLog();
    localStorage.setItem(EVENT_LOG_KEY, JSON.stringify([next, ...prev].slice(0, EVENT_LOG_CAP)));
    window.dispatchEvent(new CustomEvent('halaqmap:tiktok-pixel-event', { detail: next }));
  } catch {
    /* private mode / quota */
  }
}

export function clearTikTokEventLog(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(EVENT_LOG_KEY);
    window.dispatchEvent(new CustomEvent('halaqmap:tiktok-pixel-event-cleared'));
  } catch {
    /* ignore */
  }
}

function currentPath(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return typeof window.location.hash === 'string' ? window.location.hash.replace(/^#/, '') : undefined;
}

function hasFlag(key: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function markFlag(key: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, '1');
  } catch {
    /* private mode / quota */
  }
}

function installTtqStub(): TikTokQueue | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  if (window.ttq?.track) return window.ttq;

  const t = 'ttq';
  window.TikTokAnalyticsObject = t;
  const ttq = (window.ttq = window.ttq || ([] as unknown as TikTokQueue));

  ttq.methods = [
    'page',
    'track',
    'identify',
    'instances',
    'debug',
    'on',
    'off',
    'once',
    'ready',
    'alias',
    'group',
    'enableCookie',
    'disableCookie',
    'holdConsent',
    'revokeConsent',
    'grantConsent',
  ];
  ttq.setAndDefer = function setAndDefer(target, method) {
    (target as Record<string, unknown>)[method] = function deferredTikTokCall(...args: unknown[]) {
      (target as unknown as unknown[][]).push([method, ...args]);
    };
  };
  for (const method of ttq.methods) {
    ttq.setAndDefer(ttq, method);
  }
  ttq.instance = function instance(pixelId: string) {
    const bucket = ((ttq._i ||= {})[pixelId] ||= []) as TikTokQueue;
    for (const method of ttq.methods || []) {
      ttq.setAndDefer?.(bucket, method);
    }
    return bucket;
  };
  ttq.load = function load(pixelId: string, options?: Record<string, unknown>) {
    const src = TIKTOK_PIXEL_SCRIPT_SRC;
    ttq._i = ttq._i || {};
    ttq._i[pixelId] = ttq._i[pixelId] || [];
    (ttq._i[pixelId] as { _u?: string })._u = src;
    ttq._t = ttq._t || {};
    ttq._t[pixelId] = Date.now();
    ttq._o = ttq._o || {};
    ttq._o[pixelId] = options || {};
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = `${src}?sdkid=${encodeURIComponent(pixelId)}&lib=${t}`;
    const first = document.getElementsByTagName('script')[0];
    first?.parentNode?.insertBefore(script, first);
  };

  window.ttq = ttq;
  return ttq;
}

function bootTikTokPixelNow(): void {
  if (typeof window === 'undefined') return;
  if (!isTikTokPixelConfigured()) return;
  if (window.__hmTtqBooted) return;
  window.__hmTtqBooted = true;
  const ttq = installTtqStub();
  if (!ttq?.load) return;
  ttq.load(TIKTOK_PIXEL_ID);
}

/**
 * يحمّل بكسل تيك توك بعد أول paint (idle) حتى لا ينافس FCP — مثل `gtag`.
 * آمن عند التكرار؛ لا يفعل شيئاً إن لم يُضبط المعرّف.
 */
export function initTikTokPixel(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!isTikTokPixelConfigured()) return;
  if (window.__hmTtqScheduled || window.__hmTtqBooted) {
    bootTikTokPixelNow();
    return;
  }
  window.__hmTtqScheduled = true;
  installTtqStub();

  const schedule = () => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => bootTikTokPixelNow(), { timeout: 8000 });
    } else {
      window.setTimeout(bootTikTokPixelNow, 5000);
    }
  };

  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
}

function listingItemName(tier?: string, digitalShiftAddon?: boolean): string {
  const t = (tier || '').trim().toLowerCase();
  if (t === 'diamond' && digitalShiftAddon) return 'ماسي + مناوبة';
  if (t === 'diamond') return 'ماسي';
  if (t === 'gold') return 'ذهبي';
  return 'برونزي';
}

function listingContentId(tier?: string, digitalShiftAddon?: boolean): string {
  const t = (tier || 'bronze').trim().toLowerCase() || 'bronze';
  return `listing_license_${t}${digitalShiftAddon ? '_shift' : ''}`;
}

/** مشاهدة صفحة في مسار الـ SPA (HashRouter). */
export function trackTikTokPageView(path: string): void {
  if (typeof window === 'undefined') return;
  initTikTokPixel();
  if (!window.ttq?.page) return;
  const pagePath = path.startsWith('/') ? path : `/${path}`;
  try {
    window.ttq.page();
    appendEvent({ name: 'PageView', path: pagePath });
  } catch {
    /* ignore */
  }
}

/**
 * إحالة وسيطة: طلب تسجيل صالون قُبل حفظه (قبل الدفع).
 * لا تُرسل بريد أو هاتف (نظام حماية البيانات الشخصية).
 */
export function trackTikTokCompleteRegistration(input: {
  orderId: string;
  tier?: string;
}): boolean {
  if (typeof window === 'undefined') return false;
  initTikTokPixel();
  const orderId = input.orderId.trim();
  if (!orderId) return false;
  const flagKey = `${REGISTER_DEDUP_KEY_PREFIX}${orderId}`;
  if (hasFlag(flagKey)) return false;
  if (!window.ttq?.track) return false;

  markFlag(flagKey);
  const contentId = listingContentId(input.tier);
  try {
    window.ttq.track(
      'CompleteRegistration',
      {
        content_id: contentId,
        content_type: 'product',
        content_name: listingItemName(input.tier),
      },
      { event_id: `reg:${orderId}` },
    );
    appendEvent({
      name: 'CompleteRegistration',
      path: currentPath(),
      detail: `${orderId} · ${contentId}`,
    });
    return true;
  } catch {
    return false;
  }
}

/** بدء الدفع لرخصة الإدراج (ليس شحن محفظة المناوب). */
export function trackTikTokInitiateCheckout(input: {
  contentId?: string;
  value?: number;
  currency?: string;
  dedupeKey?: string;
}): boolean {
  if (typeof window === 'undefined') return false;
  initTikTokPixel();
  const dedupeKey = (input.dedupeKey || 'checkout').trim() || 'checkout';
  const flagKey = `${CHECKOUT_DEDUP_KEY_PREFIX}${dedupeKey}`;
  if (hasFlag(flagKey)) return false;
  if (!window.ttq?.track) return false;

  markFlag(flagKey);
  const payload: Record<string, unknown> = {
    content_id: input.contentId || 'listing_license',
    content_type: 'product',
  };
  if (input.value != null && Number.isFinite(input.value) && input.value > 0) {
    payload.value = input.value;
    payload.currency = (input.currency || TIKTOK_PIXEL_CURRENCY).trim() || TIKTOK_PIXEL_CURRENCY;
  }
  try {
    window.ttq.track('InitiateCheckout', payload, { event_id: `chk:${dedupeKey}` });
    appendEvent({
      name: 'InitiateCheckout',
      path: currentPath(),
      detail: String(payload.content_id),
    });
    return true;
  } catch {
    return false;
  }
}

export type TikTokCompletePaymentInput = {
  transactionId: string;
  value: number;
  currency?: string;
  tier?: string;
  qty?: number;
  digitalShiftAddon?: boolean;
};

/**
 * التحويل المعتمد: دفع ناجح لرخصة إدراج (ليس شحن محفظة).
 * `event_id` = رقم العملية حتى لا تُحتسب مرتين عند إعادة تحميل صفحة النجاح.
 */
export function trackTikTokCompletePayment(input: TikTokCompletePaymentInput): boolean {
  if (typeof window === 'undefined') return false;
  initTikTokPixel();
  const transactionId = input.transactionId.trim();
  if (!transactionId || transactionId.toLowerCase() === 'paid') return false;
  const value = Number(input.value);
  if (!Number.isFinite(value) || value <= 0) return false;
  const flagKey = `${PAYMENT_DEDUP_KEY_PREFIX}${transactionId}`;
  if (hasFlag(flagKey)) return false;
  if (!window.ttq?.track) return false;

  const currency = (input.currency || TIKTOK_PIXEL_CURRENCY).trim() || TIKTOK_PIXEL_CURRENCY;
  const qty = Math.max(1, Number.isFinite(input.qty) ? Math.trunc(Number(input.qty)) : 1);
  const contentId = listingContentId(input.tier, input.digitalShiftAddon);
  const contentName = listingItemName(input.tier, input.digitalShiftAddon);

  markFlag(flagKey);
  try {
    window.ttq.track(
      'CompletePayment',
      {
        contents: [
          {
            content_id: contentId,
            content_type: 'product',
            content_name: contentName,
            quantity: qty,
            price: value,
          },
        ],
        value,
        currency,
      },
      { event_id: transactionId },
    );
    appendEvent({
      name: 'CompletePayment',
      path: currentPath(),
      detail: `${transactionId} · ${value} ${currency} · ${contentName}`,
    });
    return true;
  } catch {
    return false;
  }
}

/** حدث اختبار من لوحة الإدارة — لا يُحسب تحويلاً مالياً. */
export function trackTikTokAdminPing(): boolean {
  if (typeof window === 'undefined') return false;
  initTikTokPixel();
  if (!window.ttq?.track) return false;
  try {
    window.ttq.track('ClickButton', {
      content_name: 'admin_pixel_ping',
      content_id: 'admin_pixel_ping',
    });
    appendEvent({ name: 'ClickButton', path: currentPath(), detail: 'admin_pixel_ping' });
    return true;
  } catch {
    return false;
  }
}

export function getTikTokPixelSnapshot(): {
  configured: boolean;
  loaded: boolean;
  pixelId: string;
  eventCount: number;
  lastEventAt: string | null;
} {
  const events = readTikTokEventLog();
  return {
    configured: isTikTokPixelConfigured(),
    loaded: isTikTokPixelLoaded(),
    pixelId: TIKTOK_PIXEL_ID,
    eventCount: events.length,
    lastEventAt: events[0]?.at ?? null,
  };
}
