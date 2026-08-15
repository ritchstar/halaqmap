/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * شركاء ذهبيون يُبرزون في صفحات فزعة لمدنهم وأحيائهم — أسماء وأماكن عامة فقط.
 * لا تُدرج هنا جوالات أو بريد أو أرقام عضوية.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ORIGIN } from '../lib/platformBrandIdentity.mjs';

const CONSENTED_PATH = join(dirname(fileURLToPath(import.meta.url)), 'fazaaFeaturedPartners.consented.json');

/** المصدر الوحيد للنشر على صفحات فزعة: موافقات صريحة مصدَّرة عند البناء. */
export function loadConsentedFeaturedPartners() {
  try {
    if (!existsSync(CONSENTED_PATH)) return [];
    const raw = JSON.parse(readFileSync(CONSENTED_PATH, 'utf8'));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * @typedef {{
 *   nameAr: string,
 *   citySlug: string,
 *   cityNameAr: string,
 *   neighborhoodSlugs: string[],
 *   areaLabelAr: string,
 *   specialtyHintAr: string,
 *   phrases: string[],
 *   bannerUrl?: string,
 *   bannerAltAr?: string,
 * }} FazaaFeaturedPartner
 *
 * @typedef {{ url: string, alt: string }} FazaaFeaturedBanner
 */

/**
 * شركاء ذهبيون مفعّلون — يُحدَّث عند انضمام صالونات جديدة للواجهة.
 * `bannerUrl` يجب أن يكون رابط HTTPS عاماً لصورة الغلاف/البنر (يفضّل 1200×630).
 * اتركه فارغاً حتى تعتمد الصورة من لوحة الشريك — لا تُختلق روابط.
 */
export const FAZAA_FEATURED_PARTNERS = [
  {
    nameAr: 'صالون هنا عنايتي',
    citySlug: 'khamis-mushait',
    cityNameAr: 'خميس مشيط',
    neighborhoodSlugs: ['rawnah'],
    areaLabelAr: 'حي الرونة',
    specialtyHintAr: 'حلاقة رجالي · تقليدية · أطفال · زيارة منزلية',
    bannerUrl: '',
    bannerAltAr: 'صالون هنا عنايتي — حلاقة رجالي في حي الرونة، خميس مشيط',
    phrases: [
      'صالون هنا عنايتي خميس مشيط',
      'حلاق الرونة خميس مشيط',
      'اقرب حلاق حي الرونة',
      'اقرب حلاق الرونه خميس مشيط',
      'حلاق رجالي الرونة',
    ],
  },
  {
    nameAr: 'أسطورة الريان',
    citySlug: 'riyadh',
    cityNameAr: 'الرياض',
    neighborhoodSlugs: ['narjis'],
    areaLabelAr: 'حي النرجس',
    specialtyHintAr: 'حلاقة رجالي · أطفال · زيارة منزلية',
    bannerUrl: '',
    bannerAltAr: 'صالون أسطورة الريان — حلاقة رجالي في حي النرجس، الرياض',
    phrases: [
      'أسطورة الريان النرجس',
      'حلاق النرجس أسطورة الريان',
      'اقرب حلاق حي النرجس أسطورة الريان',
      'صالون أسطورة الريان الرياض',
    ],
  },
  {
    nameAr: 'لمسة سلوان',
    citySlug: 'riyadh',
    cityNameAr: 'الرياض',
    neighborhoodSlugs: ['narjis'],
    areaLabelAr: 'حي النرجس',
    specialtyHintAr: 'حلاقة رجالي',
    bannerUrl: '',
    bannerAltAr: 'صالون لمسة سلوان — حلاقة رجالي في حي النرجس، الرياض',
    phrases: [
      'لمسة سلوان النرجس',
      'حلاق النرجس لمسة سلوان',
      'اقرب حلاق حي النرجس لمسة سلوان',
      'صالون لمسة سلوان الرياض',
    ],
  },
  {
    nameAr: 'رسام النجوم VIP',
    citySlug: 'riyadh',
    cityNameAr: 'الرياض',
    neighborhoodSlugs: ['munsiyah', 'qurtubah'],
    areaLabelAr: 'حي المونسية وقرطبة',
    specialtyHintAr: 'حلاقة رجالي · أطفال · زيارة منزلية · 24 ساعة',
    bannerUrl: '',
    bannerAltAr: 'صالون رسام النجوم — حلاقة رجالي في حي المونسية وقرطبة، الرياض',
    phrases: [
      'رسام النجوم VIP المونسية',
      'حلاق المونسية رسام النجوم',
      'اقرب حلاق قرطبة رسام النجوم',
      'حلاق طريق الأمير محمد بن سلمان',
      'صالون رسام النجوم الرياض',
    ],
  },
  {
    nameAr: 'صالون حلا VIP للحلاقة الرجالية',
    citySlug: 'makkah',
    cityNameAr: 'مكة',
    neighborhoodSlugs: ['sharaye'],
    areaLabelAr: 'الشرائع — شمال مكة',
    specialtyHintAr: 'حلاقة رجالي · تقليدية · أطفال',
    bannerUrl: '',
    bannerAltAr: 'صالون حلا VIP — حلاقة رجالي في الشرائع، مكة',
    phrases: [
      'صالون حلا VIP مكة',
      'حلاق الشرائع مكة',
      'اقرب حلاق الشرائع حلا VIP',
      'حلاق رجالي مكة حلا VIP',
    ],
  },
  {
    nameAr: 'صالون إيبيكس آند بليد',
    citySlug: 'jeddah',
    cityNameAr: 'جدة',
    neighborhoodSlugs: ['sulaymaniyah'],
    areaLabelAr: 'حي السليمانية',
    specialtyHintAr: 'حلاقة رجالي · لحية · أطفال · عناية بالبشرة · 24 ساعة',
    bannerUrl: '',
    bannerAltAr: 'صالون إيبيكس آند بليد — حلاقة رجالي في حي السليمانية، جدة',
    phrases: [
      'صالون إيبيكس آند بليد جدة',
      'حلاق السليمانية جدة',
      'اقرب حلاق حي السليمانية جدة',
      'حلاق شارع عبدالقدوس الأنصاري',
      'Apex and Blade جدة',
    ],
  },
  {
    nameAr: 'ROUTE 77 Barbershop',
    citySlug: 'qatif',
    cityNameAr: 'القطيف',
    neighborhoodSlugs: ['tarut'],
    areaLabelAr: 'تاروت',
    specialtyHintAr: 'حلاقة رجالي · تقليدية · أطفال · احتياجات خاصة',
    bannerUrl: '',
    bannerAltAr: 'صالون ROUTE 77 — حلاقة رجالي في تاروت، القطيف',
    phrases: [
      'ROUTE 77 Barbershop القطيف',
      'حلاق تاروت ROUTE 77',
      'اقرب حلاق تاروت القطيف',
      'حلاق شارع طلحة بن مالك تاروت',
      'صالون ROUTE 77 تاروت',
    ],
  },
];

export function featuredPartnersForPlace(citySlug, neighborhoodSlug = null) {
  return loadConsentedFeaturedPartners().filter((p) => {
    if (p.citySlug !== citySlug) return false;
    if (!neighborhoodSlug) return true;
    return Array.isArray(p.neighborhoodSlugs) && p.neighborhoodSlugs.includes(neighborhoodSlug);
  });
}

export function isSafeHttpsBannerUrl(raw) {
  const value = String(raw || '').trim();
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function resolveFeaturedPartnerBanner(partner) {
  if (!partner || !isSafeHttpsBannerUrl(partner.bannerUrl)) return null;
  const alt =
    String(partner.bannerAltAr || '').trim() ||
    `${partner.nameAr} — ${partner.specialtyHintAr} في ${partner.areaLabelAr}، ${partner.cityNameAr}`;
  return { url: String(partner.bannerUrl).trim(), alt };
}

export function featuredPartnerBanners(partners) {
  return (partners || []).map(resolveFeaturedPartnerBanner).filter(Boolean);
}

/** og:image فقط في صفحة حي عندما يوجد بنر واحد مطابق. */
export function pickFeaturedPartnerOgImage(partners, { neighborhoodPage } = {}) {
  if (!neighborhoodPage) return null;
  const banners = featuredPartnerBanners(partners);
  return banners.length === 1 ? banners[0].url : null;
}

export function featuredPartnerOgImage(citySlug, neighborhoodSlug = null) {
  return pickFeaturedPartnerOgImage(featuredPartnersForPlace(citySlug, neighborhoodSlug), {
    neighborhoodPage: Boolean(neighborhoodSlug),
  });
}

export function featuredPartnerSitemapImages(citySlug, neighborhoodSlug = null) {
  const partners = featuredPartnersForPlace(citySlug, neighborhoodSlug);
  const banners = featuredPartnerBanners(partners);
  if (!neighborhoodSlug && banners.length !== 1) return [];
  if (neighborhoodSlug && banners.length === 0) return [];
  return banners.map((banner) => ({ loc: banner.url, title: banner.alt }));
}

export function featuredPartnersJsonLd(partners, { pageUrl }) {
  return (partners || []).map((partner, index) => {
    const banner = resolveFeaturedPartnerBanner(partner);
    const node = {
      '@type': 'BarberShop',
      '@id': `${pageUrl}#partner-${index + 1}`,
      name: partner.nameAr,
      url: featuredPartnerQueryHref(partner),
      areaServed: {
        '@type': 'Place',
        name: `${partner.areaLabelAr}، ${partner.cityNameAr}`,
      },
    };
    if (banner) node.image = banner.url;
    return node;
  });
}

export function featuredPartnerKeywords(citySlug, neighborhoodSlug = null) {
  return featuredPartnersForPlace(citySlug, neighborhoodSlug)
    .flatMap((p) => p.phrases)
    .join(', ');
}

export function featuredPartnerQueryHref(partner) {
  const near = [partner.citySlug, partner.neighborhoodSlugs[0]].filter(Boolean).join('/');
  return `${ORIGIN}/#/?near=${encodeURIComponent(near)}`;
}

/**
 * بطاقات شركاء ذهبية — تظهر في صفحة المدينة أو الحي المطابق.
 * البنر يظهر في صفحة الحي دائماً إن وُجد، وفي صفحة المدينة فقط إن كان شريكاً واحداً ببنر.
 */
export function featuredPartnersSectionHtml({ citySlug, neighborhoodSlug = null, placeNameAr }) {
  const partners = featuredPartnersForPlace(citySlug, neighborhoodSlug);
  if (partners.length === 0) return '';

  const banners = featuredPartnerBanners(partners);
  const showBanners = Boolean(neighborhoodSlug) || banners.length === 1;
  const heroIndex = showBanners ? partners.findIndex((p) => resolveFeaturedPartnerBanner(p)) : -1;
  const scope = neighborhoodSlug ? `حي ${placeNameAr}` : placeNameAr;
  const cards = partners
    .map((p, index) => {
      const chips = p.phrases
        .slice(0, 4)
        .map((ph) => `<li><span class="phrase-chip">${escapeHtml(ph)}</span></li>`)
        .join('\n');
      const banner = showBanners ? resolveFeaturedPartnerBanner(p) : null;
      const isHero = index === heroIndex;
      const figure = banner
        ? `<figure class="partner-gold-banner">
        <img src="${escapeHtml(banner.url)}" alt="${escapeHtml(banner.alt)}" width="1200" height="630" ${isHero ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />
      </figure>`
        : '';
      return `<article class="partner-gold${isHero ? ' is-hero' : ''}">
        ${figure}
        <p class="partner-gold-kicker">شريك ذهبي على حلاق ماب</p>
        <h3>${escapeHtml(p.nameAr)}</h3>
        <p class="note">${escapeHtml(p.areaLabelAr)} · ${escapeHtml(p.cityNameAr)}</p>
        <p>${escapeHtml(p.specialtyHintAr)}</p>
        <ul class="phrase-grid partner-gold-phrases">${chips}</ul>
        <p class="cta-wrap"><a class="cta" href="${escapeHtml(featuredPartnerQueryHref(p))}">ابدأ الاستعلام حول ${escapeHtml(p.areaLabelAr)}</a></p>
      </article>`;
    })
    .join('\n');

  return `<section class="partner-gold-wrap" aria-label="شركاء حلاق ماب في ${escapeHtml(scope)}">
      <h2>شركاء حلاق ماب في ${escapeHtml(scope)}</h2>
      <p class="note">صالونات ذهبية مفعّلة في هذا النطاق — اذكر اسم الحي أو الصالون في بحثك، ثم ابدأ فزعة الاستعلام لخيارات حيّة ضمن البيانات المتاحة.</p>
      ${cards}
    </section>`;
}

export function featuredPartnersCss() {
  return `
    .partner-gold-wrap { margin: 1.35rem 0; }
    .partner-gold {
      border: 1px solid rgba(251,191,36,.4);
      border-radius: 14px;
      background: linear-gradient(180deg, rgba(120,53,15,.28), rgba(12,26,46,.85));
      padding: 1rem 1.1rem;
      margin: .85rem 0;
    }
    .partner-gold-kicker { color: #fbbf24; font-size: .8rem; font-weight: 800; margin: 0 0 .35rem; }
    .partner-gold h3 { margin: 0 0 .35rem; font-size: 1.15rem; color: #fef3c7; }
    .partner-gold-phrases { margin: .65rem 0 .35rem; }
    .partner-gold-banner { margin: 0 0 .75rem; border-radius: 10px; overflow: hidden; }
    .partner-gold-banner img {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 1200 / 630;
      object-fit: cover;
      background: #0c1a2e;
    }
  `;
}

/** وصف قصير يُلحق بـ meta الحي/المدينة عند وجود شركاء */
export function featuredPartnersMetaBlurb(citySlug, neighborhoodSlug, placeNameAr) {
  const partners = featuredPartnersForPlace(citySlug, neighborhoodSlug);
  if (partners.length === 0) return '';
  const names = partners.map((p) => p.nameAr).join('، ');
  return `شركاء حلاق ماب في ${placeNameAr}: ${names}.`;
}
