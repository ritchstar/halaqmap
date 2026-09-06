/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يضبط أيقونة المتجر ورأس store.halaqmap.com — لا يرث favicon حلاق ماب.
 */
import { STORE_PUBLIC_NAME_AR, STORE_SATELLITE_HOST } from '@/config/storeFront';

const STORE_ICON_VERSION = '20260906';

const STORE_ICON_HREFS = [
  `/icons/store-favicon.ico?v=${STORE_ICON_VERSION}`,
  `/icons/store-favicon-48.png?v=${STORE_ICON_VERSION}`,
  `/icons/store-favicon-96.png?v=${STORE_ICON_VERSION}`,
  `/icons/store-favicon-32.png?v=${STORE_ICON_VERSION}`,
  `/icons/store-apple-touch-icon.png?v=${STORE_ICON_VERSION}`,
] as const;

function setMeta(attr: 'name' | 'property', key: string, content: string): void {
  const el =
    document.head.querySelector(`meta[${attr}="${key}"]`) ??
    document.head.appendChild(document.createElement('meta'));
  el.setAttribute(attr, key);
  el.setAttribute('content', content);
}

export function applyStoreHeadSiteIdentity(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  if (window.location.hostname.toLowerCase() !== STORE_SATELLITE_HOST) return;

  document.head.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach((node) => {
    node.remove();
  });

  const ico = document.createElement('link');
  ico.rel = 'icon';
  ico.href = STORE_ICON_HREFS[0];
  ico.setAttribute('sizes', 'any');
  document.head.appendChild(ico);

  const shortcut = document.createElement('link');
  shortcut.rel = 'shortcut icon';
  shortcut.href = STORE_ICON_HREFS[0];
  document.head.appendChild(shortcut);

  const png48 = document.createElement('link');
  png48.rel = 'icon';
  png48.type = 'image/png';
  png48.href = STORE_ICON_HREFS[1];
  png48.setAttribute('sizes', '48x48');
  document.head.appendChild(png48);

  const png96 = document.createElement('link');
  png96.rel = 'icon';
  png96.type = 'image/png';
  png96.href = STORE_ICON_HREFS[2];
  png96.setAttribute('sizes', '96x96');
  document.head.appendChild(png96);

  const png32 = document.createElement('link');
  png32.rel = 'icon';
  png32.type = 'image/png';
  png32.href = STORE_ICON_HREFS[3];
  png32.setAttribute('sizes', '32x32');
  document.head.appendChild(png32);

  const apple = document.createElement('link');
  apple.rel = 'apple-touch-icon';
  apple.href = STORE_ICON_HREFS[4];
  apple.setAttribute('sizes', '180x180');
  document.head.appendChild(apple);

  setMeta('name', 'application-name', STORE_PUBLIC_NAME_AR);
  setMeta('name', 'apple-mobile-web-app-title', STORE_PUBLIC_NAME_AR);
  setMeta('property', 'og:site_name', STORE_PUBLIC_NAME_AR);
}
