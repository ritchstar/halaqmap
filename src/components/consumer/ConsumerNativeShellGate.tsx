/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * داخل غلاف Capacitor للمستخدم: يمنع مسارات الشريك/الدفع ويفتحها في Safari.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
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

    void StatusBar.setStyle({ style: Style.Dark }).catch(() => undefined);
    void StatusBar.setBackgroundColor({ color: '#0A4F4A' }).catch(() => undefined);

    const sub = CapApp.addListener('appUrlOpen', (event) => {
      const url = String(event.url || '').trim();
      if (!url) return;
      try {
        const parsed = new URL(url);
        const hashPath = pathFromHash(parsed.hash);
        if (isConsumerAppExternalPath(hashPath)) {
          void openConsumerExternalUrl(url);
          return;
        }
        // روابط عميقة داخل النطاق — حوّل الهاش داخل الغلاف
        if (parsed.hash) {
          window.location.hash = parsed.hash.replace(/^#/, '#');
        }
      } catch {
        /* ignore malformed */
      }
    });

    return () => {
      void sub.then((h) => h.remove());
    };
  }, []);

  useEffect(() => {
    if (!isConsumerNativeShell()) return;
    const pathWithSearch = `${location.pathname}${location.search || ''}`;
    void breakOutConsumerExternalPath(pathWithSearch);
  }, [location.pathname, location.search]);

  return null;
}
