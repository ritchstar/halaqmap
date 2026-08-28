/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * اسم الموقع على نطاق كوافير ماب حتى لا يرث جوجل «حلاق ماب»
 * من رأس SPA المشترك. لا تُستورد مظلة كوافير ولا الشؤون القانونية.
 */
export const COIFFEUR_SITE_NAME_AR = 'كوافير ماب';
export const COIFFEUR_SITE_ORIGIN = 'https://coiffeur.halaqmap.com';
export const COIFFEUR_SATELLITE_HOST = 'coiffeur.halaqmap.com';

export const COIFFEUR_WEBSITE_JSON_LD = {
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

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function replaceNamedMeta(html, attr, key, content) {
  const re = new RegExp(`<meta\\s+[^>]*${attr}="${key}"[^>]*>`, 'i');
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

export function isCoiffeurSatelliteHost(host) {
  return (
    String(host || '')
      .trim()
      .toLowerCase()
      .split(':')[0] === COIFFEUR_SATELLITE_HOST
  );
}

export function isCoiffeurIdentityPath(pathname) {
  const path = String(pathname || '/')
    .split('?')[0]
    .replace(/\/+$/, '') || '/';
  return path === '/' || path === '/index.html';
}

export function applyCoiffeurSiteIdentity(html) {
  if (typeof html !== 'string' || !html.includes('<html')) {
    throw new Error('coiffeur site identity expects HTML');
  }
  let next = html;
  next = replaceNamedMeta(next, 'name', 'application-name', COIFFEUR_SITE_NAME_AR);
  next = replaceNamedMeta(next, 'name', 'apple-mobile-web-app-title', COIFFEUR_SITE_NAME_AR);
  next = next.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${escapeAttr(COIFFEUR_SITE_ORIGIN)}/" />`,
  );
  next = replaceNamedMeta(next, 'property', 'og:url', `${COIFFEUR_SITE_ORIGIN}/`);
  next = replaceNamedMeta(next, 'property', 'og:site_name', COIFFEUR_SITE_NAME_AR);
  const jsonLdTag = `<script type="application/ld+json">${JSON.stringify(COIFFEUR_WEBSITE_JSON_LD)}</script>`;
  if (/<script type="application\/ld\+json">[\s\S]*?<\/script>/i.test(next)) {
    next = next.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, jsonLdTag);
  } else {
    next = next.replace('</head>', `    ${jsonLdTag}\n  </head>`);
  }
  if (/og:site_name" content="حلاق ماب/.test(next)) {
    throw new Error('coiffeur identity HTML still carries Halaq Map site_name');
  }
  if (!next.includes(`"name":"${COIFFEUR_SITE_NAME_AR}"`) && !next.includes(`"name": "${COIFFEUR_SITE_NAME_AR}"`)) {
    throw new Error('coiffeur identity HTML missing WebSite name');
  }
  return next;
}
