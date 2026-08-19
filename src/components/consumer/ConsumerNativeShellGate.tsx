/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * داخل غلاف Capacitor للمستخدم: يمنع مسارات الشريك/الدفع ويفتحها في Safari.
 * إضافات Capacitor تُحمَّل كسولة — لا تُسحب إلى إقلاع متصفح الجوال.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  breakOutConsumerExternalPath,
  isConsumerNativeShell,
  openConsumerExternalUrl,
} from '@/lib/consumerAppShell';
import { isConsumerAppExternalPath } from '@/config/consumerAppShell';

function pathFromHash(hash: string): string {
  const raw = (hash || '').replace(/^#/, '').split('?')[0]?.trim() || '/';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

export function ConsumerNativeShellGate() {
  const location = useLocation();

  useEffect(() => {
    if (!isConsumerNativeShell()) return;
    let cancelled = false;
    let removeListener: (() => void) | undefined;

    void (async () => {
      try {
        const [{ App: CapApp }, { StatusBar, Style }] = await Promise.all([
          import('@capacitor/app'),
          import('@capacitor/status-bar'),
        ]);
        if (cancelled) return;
        void StatusBar.setStyle({ style: Style.Dark }).catch(() => undefined);
        void StatusBar.setBackgroundColor({ color: '#0A4F4A' }).catch(() => undefined);
        const handle = await CapApp.addListener('appUrlOpen', (event) => {
          const url = String(event.url || '').trim();
          if (!url) return;
          try {
            const parsed = new URL(url);
            const hashPath = pathFromHash(parsed.hash);
            if (isConsumerAppExternalPath(hashPath)) {
              void openConsumerExternalUrl(url);
              return;
            }
            if (parsed.hash) {
              window.location.hash = parsed.hash.replace(/^#/, '#');
            }
          } catch {
            /* ignore malformed */
          }
        });
        if (cancelled) {
          void handle.remove();
          return;
        }
        removeListener = () => {
          void handle.remove();
        };
      } catch {
        /* غلاف أصلي بلا إضافات — لا تُسقط إقلاع الويب */
      }
    })();

    return () => {
      cancelled = true;
      removeListener?.();
    };
  }, []);

  useEffect(() => {
    if (!isConsumerNativeShell()) return;
    const pathWithSearch = `${location.pathname}${location.search || ''}`;
    void breakOutConsumerExternalPath(pathWithSearch);
  }, [location.pathname, location.search]);

  return null;
}
