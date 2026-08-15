/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * صفحات فزعة الإنجليزية — محور + الرياض + مكة فقط.
 * نية صادقة: إيجاد حلاق من الموقع، ليست بوابة سياحة.
 */
import { ORIGIN } from './platformBrandIdentity.mjs';
import { FAZAA_EN_NEAR_PHRASES } from './fazaaSearchPhrases.mjs';

export const FAZAA_EN_NEAR_CTA = 'Search from your location';
export const FAZAA_EN_NEAR_FOOTER =
  '© HalaqMap — Search from your location for a nearby barber.';
export const HOME_INQUIRE_HREF = `${ORIGIN}/#/`;

function uniqueCsv(parts) {
  const seen = new Set();
  const out = [];
  for (const raw of parts) {
    const p = String(raw || '').trim();
    if (!p || seen.has(p)) continue;
    seen.add(p);
    out.push(p);
  }
  return out.join(', ');
}

export function normalizeSeoPath(path) {
  const raw = String(path || '').trim();
  if (!raw) return '/';
  const noOrigin = raw.replace(/^https?:\/\/[^/]+/i, '');
  const withSlash = noOrigin.startsWith('/') ? noOrigin : `/${noOrigin}`;
  if (withSlash.length > 1 && withSlash.endsWith('/')) return withSlash.slice(0, -1);
  return withSlash;
}

/** محور + مدينتان فقط — لا أحياء إنجليزية في هذه المرحلة */
export const FAZAA_EN_NEAR_PAGES = [
  {
    id: 'hub',
    enPath: '/en/near',
    arPath: '/near',
    citySlug: null,
    nameEn: 'Saudi Arabia',
    nameAr: 'السعودية',
    title: 'Find a barber in Saudi Arabia · Search from your location | HalaqMap',
    h1: 'Find a barber in Saudi Arabia',
    description:
      'Search from your location for a nearby barber in Saudi Arabia. Instant inquiry from HalaqMap — no filters to pick first.',
    keywords: uniqueCsv([
      ...FAZAA_EN_NEAR_PHRASES,
      'barber in Saudi Arabia',
      'barber shop Saudi Arabia',
      'haircut Saudi Arabia',
    ]),
    lead:
      'Looking for a barber near you in Saudi Arabia? Tap Search from your location. We show what fits where you are now.',
    faq: {
      q: 'How do I find a barber near me in Saudi Arabia?',
      a: 'Tap Search from your location and allow the site to use your place. HalaqMap is a software inquiry: you contact the salon directly.',
    },
    placeType: 'Country',
    lat: 23.8859,
    lng: 45.0792,
    priority: '0.86',
  },
  {
    id: 'riyadh',
    enPath: '/en/near/riyadh',
    arPath: '/near/riyadh',
    citySlug: 'riyadh',
    nameEn: 'Riyadh',
    nameAr: 'الرياض',
    title: 'Barber near me in Riyadh | HalaqMap',
    h1: 'Find a barber in Riyadh',
    description:
      'Search from your location for a barber near you in Riyadh. Instant inquiry from HalaqMap — no filters to pick first.',
    keywords: uniqueCsv([
      ...FAZAA_EN_NEAR_PHRASES,
      'barber near me Riyadh',
      'barber shop Riyadh',
      'barbershop Riyadh',
      'nearest barber Riyadh',
      'haircut Riyadh',
    ]),
    lead:
      'Looking for a barber near you in Riyadh? Tap Search from your location. We show nearby options that fit where you are now.',
    faq: {
      q: 'How do I find a barber near me in Riyadh?',
      a: 'Open this page and tap Search from your location. Allow location access to see nearby options, then contact the salon directly.',
    },
    placeType: 'City',
    lat: 24.7136,
    lng: 46.6753,
    priority: '0.84',
  },
  {
    id: 'makkah',
    enPath: '/en/near/makkah',
    arPath: '/near/makkah',
    citySlug: 'makkah',
    nameEn: 'Makkah',
    nameAr: 'مكة',
    aliasesEn: ['Mecca'],
    title: 'Barber near me in Makkah | HalaqMap',
    h1: 'Find a barber in Makkah',
    description:
      'Search from your location for a nearby barber in Makkah. For a Hajj or Umrah haircut (Halq or Taqsir), start the inquiry from where you are. HalaqMap is a software search, not a salon.',
    keywords: uniqueCsv([
      ...FAZAA_EN_NEAR_PHRASES,
      'barber near me Makkah',
      'barber Makkah',
      'barber Mecca',
      'haircut Makkah',
      'Hajj haircut',
      'Umrah haircut',
      'Halq',
      'Taqsir',
      'nearest barber Makkah',
    ]),
    lead:
      'Looking for a barber near you in Makkah? Tap Search from your location. If you need a Hajj or Umrah haircut (Halq is a full shave, Taqsir is shortening), start the inquiry from where you are. HalaqMap does not give religious rulings.',
    faq: {
      q: 'Can I use this for a Hajj or Umrah haircut in Makkah?',
      a: 'Yes — start the inquiry from your location. Halq is a full shave and Taqsir is shortening. HalaqMap does not give religious rulings; choose what your own reference requires.',
    },
    placeType: 'City',
    lat: 21.3891,
    lng: 39.8579,
    priority: '0.88',
  },
];

export function findEnNearPageByArPath(arPath) {
  const path = normalizeSeoPath(arPath);
  return FAZAA_EN_NEAR_PAGES.find((p) => p.arPath === path) || null;
}

export function findEnNearPageByEnPath(enPath) {
  const path = normalizeSeoPath(enPath);
  return FAZAA_EN_NEAR_PAGES.find((p) => p.enPath === path) || null;
}

export function hreflangLinksHtml(arPath, enPath) {
  const ar = `${ORIGIN}${normalizeSeoPath(arPath)}`;
  const en = `${ORIGIN}${normalizeSeoPath(enPath)}`;
  return `  <link rel="alternate" hreflang="ar-SA" href="${ar}" />
  <link rel="alternate" hreflang="en" href="${en}" />
  <link rel="alternate" hreflang="x-default" href="${ar}" />`;
}

export function hreflangLinksForArPath(arPath) {
  const page = findEnNearPageByArPath(arPath);
  return page ? hreflangLinksHtml(page.arPath, page.enPath) : '';
}

export function languageSwitchHtml({ href, label, ariaLabel }) {
  return `<p class="lang-switch"><a href="${href}" hreflang="${
    label === 'English' ? 'en' : 'ar-SA'
  }" lang="${label === 'English' ? 'en' : 'ar'}" aria-label="${ariaLabel}">${label}</a></p>`;
}

export function languageSwitchForArPath(arPath) {
  const page = findEnNearPageByArPath(arPath);
  if (!page) return '';
  return languageSwitchHtml({
    href: page.enPath,
    label: 'English',
    ariaLabel: `English page — ${page.h1}`,
  });
}

export function languageSwitchForEnPage(page) {
  return languageSwitchHtml({
    href: page.arPath,
    label: 'العربية',
    ariaLabel: `الصفحة العربية — ${page.nameAr}`,
  });
}
