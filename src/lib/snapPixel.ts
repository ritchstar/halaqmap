/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { SNAP_PIXEL_ID, SNAP_PIXEL_SCRIPT_SRC } from '@/config/snapPixel';

export type SnapTrackedEvent = {
  id: string;
  at: string;
  name: string;
  path?: string;
};

const EVENT_LOG_KEY = 'halaqmap.snapPixel.events.v1';
const EVENT_LOG_CAP = 80;

type SnaptrFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    snaptr?: SnaptrFn;
    __hmSnapBooted?: boolean;
    __hmSnapScheduled?: boolean;
  }
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isSnapPixelConfigured(): boolean {
  return /^[0-9a-f-]{36}$/i.test(SNAP_PIXEL_ID);
}

export function isSnapPixelLoaded(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof window.snaptr === 'function';
}

export function isSnapStoreViewContentPath(path: string): boolean {
  const pagePath = path.startsWith('/') ? path : `/${path}`;
  if (pagePath === '/store' || pagePath.startsWith('/store/')) return true;
  return /^\/(g|r|c|k|v|h|w|e|l)\//.test(pagePath);
}

function appendEvent(entry: Omit<SnapTrackedEvent, 'id' | 'at'>): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const next: SnapTrackedEvent = {
      id: uid(),
      at: new Date().toISOString(),
      ...entry,
    };
    const prev = readSnapEventLog();
    localStorage.setItem(EVENT_LOG_KEY, JSON.stringify([next, ...prev].slice(0, EVENT_LOG_CAP)));
  } catch {
    /* private mode / quota */
  }
}

export function readSnapEventLog(): SnapTrackedEvent[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EVENT_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is SnapTrackedEvent =>
        Boolean(row) &&
        typeof row === 'object' &&
        typeof (row as SnapTrackedEvent).id === 'string' &&
        typeof (row as SnapTrackedEvent).at === 'string' &&
        typeof (row as SnapTrackedEvent).name === 'string',
    );
  } catch {
    return [];
  }
}

function installSnapStub(): SnaptrFn | undefined {
  if (typeof window === 'undefined') return undefined;
  if (window.snaptr) return window.snaptr;
  const queue: unknown[] = [];
  const snaptr = ((...args: unknown[]) => {
    const fn = snaptr as SnaptrFn & { handleRequest?: SnaptrFn; queue: unknown[] };
    if (fn.handleRequest) fn.handleRequest(...args);
    else fn.queue.push(args);
  }) as SnaptrFn & { handleRequest?: SnaptrFn; queue: unknown[] };
  snaptr.queue = queue;
  window.snaptr = snaptr;
  return snaptr;
}

function bootSnapPixelNow(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!isSnapPixelConfigured()) return;
  if (window.__hmSnapBooted) return;
  window.__hmSnapBooted = true;

  installSnapStub();
  if (document.querySelector(`script[src="${SNAP_PIXEL_SCRIPT_SRC}"]`)) {
    try {
      window.snaptr?.('init', SNAP_PIXEL_ID);
    } catch {
      /* ignore */
    }
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = SNAP_PIXEL_SCRIPT_SRC;
  script.onload = () => {
    try {
      window.snaptr?.('init', SNAP_PIXEL_ID);
    } catch {
      /* ignore */
    }
  };
  document.head.appendChild(script);
}

/** يحمّل بكسل سناب بعد idle — بلا `user_email` ولا أحداث شراء وهمية. */
export function initSnapPixel(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!isSnapPixelConfigured()) return;
  if (window.__hmSnapScheduled || window.__hmSnapBooted) {
    bootSnapPixelNow();
    return;
  }
  window.__hmSnapScheduled = true;
  installSnapStub();

  const schedule = () => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => bootSnapPixelNow(), { timeout: 8000 });
    } else {
      window.setTimeout(bootSnapPixelNow, 5000);
    }
  };

  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
}

export function trackSnapPageView(path?: string): void {
  if (typeof window === 'undefined') return;
  initSnapPixel();
  if (!window.snaptr) return;
  const pagePath = path?.startsWith('/') ? path : path ? `/${path}` : undefined;
  try {
    window.snaptr('track', 'PAGE_VIEW');
    appendEvent({ name: 'PAGE_VIEW', path: pagePath });
  } catch {
    /* ignore */
  }
}

/** محتوى متجر/منتج — بلا سعر وهمي. */
export function trackSnapViewContent(path: string): void {
  if (typeof window === 'undefined') return;
  initSnapPixel();
  if (!window.snaptr) return;
  const pagePath = path.startsWith('/') ? path : `/${path}`;
  try {
    window.snaptr('track', 'VIEW_CONTENT', {
      item_ids: [pagePath],
    });
    appendEvent({ name: 'VIEW_CONTENT', path: pagePath });
  } catch {
    /* ignore */
  }
}

export function getSnapPixelSnapshot(): {
  configured: boolean;
  loaded: boolean;
  pixelId: string;
  eventCount: number;
  lastEventAt: string | null;
} {
  const events = readSnapEventLog();
  return {
    configured: isSnapPixelConfigured(),
    loaded: isSnapPixelLoaded(),
    pixelId: SNAP_PIXEL_ID,
    eventCount: events.length,
    lastEventAt: events[0]?.at ?? null,
  };
}
