/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يضبط رأس كوافير ماب على النطاق الفرعي فقط.
 * لا تستورد coiffeurMapUmbrella من هنا — الإقلاع يسحب هذا الملف مبكراً.
 */

const COIFFEUR_SATELLITE_HOST = 'coiffeur.halaqmap.com';

export const COIFFEUR_SITE_NAME_AR = 'كوافير ماب';
export const COIFFEUR_SITE_ORIGIN = 'https://coiffeur.halaqmap.com';

const COIFFEUR_WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${COIFFEUR_SITE_ORIGIN}/#website`,
      name: COIFFEUR_SITE_NAME_AR,
      url: COIFFEUR_SITE_ORIGIN,
      inLanguage: 'ar-SA',
    },
  ],
};

function setMeta(attr: 'name' | 'property', key: string, content: string): void {
  const el =
    document.head.querySelector(`meta[${attr}="${key}"]`) ??
    document.head.appendChild(document.createElement('meta'));
  el.setAttribute(attr, key);
  el.setAttribute('content', content);
}

export function applyCoiffeurHeadSiteIdentity(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  if (window.location.hostname.toLowerCase() !== COIFFEUR_SATELLITE_HOST) return;

  setMeta('property', 'og:site_name', COIFFEUR_SITE_NAME_AR);
  setMeta('name', 'application-name', COIFFEUR_SITE_NAME_AR);
  setMeta('name', 'apple-mobile-web-app-title', COIFFEUR_SITE_NAME_AR);

  const canonical = document.head.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', `${COIFFEUR_SITE_ORIGIN}/`);
  setMeta('property', 'og:url', `${COIFFEUR_SITE_ORIGIN}/`);

  const payload = JSON.stringify(COIFFEUR_WEBSITE_JSON_LD);
  let script = document.head.querySelector('script[type="application/ld+json"]');
  if (!script) {
    script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    document.head.appendChild(script);
  }
  script.textContent = payload;
}
