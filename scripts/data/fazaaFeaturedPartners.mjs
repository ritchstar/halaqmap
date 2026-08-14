/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * شركاء ذهبيون يُبرزون في صفحات فزعة لمدنهم وأحيائهم — أسماء وأماكن عامة فقط.
 * لا تُدرج هنا جوالات أو بريد أو أرقام عضوية.
 */
import { ORIGIN } from '../lib/platformBrandIdentity.mjs';

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
 * }} FazaaFeaturedPartner
 */

/** شركاء ذهبيون مفعّلون — يُحدَّث عند انضمام صالونات جديدة للواجهة */
export const FAZAA_FEATURED_PARTNERS = [
  {
    nameAr: 'صالون هنا عنايتي',
    citySlug: 'khamis-mushait',
    cityNameAr: 'خميس مشيط',
    neighborhoodSlugs: ['rawnah'],
    areaLabelAr: 'حي الرونة',
    specialtyHintAr: 'حلاقة رجالي · تقليدية · أطفال · زيارة منزلية',
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
  return FAZAA_FEATURED_PARTNERS.filter((p) => {
    if (p.citySlug !== citySlug) return false;
    if (!neighborhoodSlug) return true;
    return p.neighborhoodSlugs.includes(neighborhoodSlug);
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
 */
export function featuredPartnersSectionHtml({ citySlug, neighborhoodSlug = null, placeNameAr }) {
  const partners = featuredPartnersForPlace(citySlug, neighborhoodSlug);
  if (partners.length === 0) return '';

  const scope = neighborhoodSlug ? `حي ${placeNameAr}` : placeNameAr;
  const cards = partners
    .map((p) => {
      const chips = p.phrases
        .slice(0, 4)
        .map((ph) => `<li><span class="phrase-chip">${escapeHtml(ph)}</span></li>`)
        .join('\n');
      return `<article class="partner-gold">
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
  `;
}

/** وصف قصير يُلحق بـ meta الحي/المدينة عند وجود شركاء */
export function featuredPartnersMetaBlurb(citySlug, neighborhoodSlug, placeNameAr) {
  const partners = featuredPartnersForPlace(citySlug, neighborhoodSlug);
  if (partners.length === 0) return '';
  const names = partners.map((p) => p.nameAr).join('، ');
  return `شركاء حلاق ماب في ${placeNameAr}: ${names}.`;
}
