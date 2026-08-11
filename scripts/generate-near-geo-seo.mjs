/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يولّد صفحات SEO ثابتة تحت dist/near/** وملف sitemap-geo.xml
 * من geoNearRegistry.json + geoNearNeighborhoods.json — يُشغَّل بعد vite build.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BRAND_LOGO_ABS,
  BRAND_SITE_NAME,
  brandHeaderCss,
  brandHeaderHtml,
  brandIconLinks,
  brandPageTypeCss,
  NEAR_SEARCH_KEYWORDS_META,
  nearSearchPhrasesCss,
  nearSearchPhrasesSectionHtml,
} from './lib/platformBrandIdentity.mjs';
import {
  FAZAA_MARKETING_FOOTER_AR,
  citySeoBranchesHtml,
} from './lib/fazaaCitySeoBranches.mjs';
import {
  cityPillarSectionsHtml,
  exportFazaaCityMarketingJsonList,
  getFazaaCityMarketing,
} from './data/fazaaCityMarketingCopy.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REGISTRY_PATH = join(ROOT, 'src', 'config', 'geoNearRegistry.json');
const NEIGHBORHOODS_PATH = join(ROOT, 'src', 'config', 'geoNearNeighborhoods.json');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://www.halaqmap.com';
const SIBLING_LIMIT = 12;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function nodePath(node) {
  return `/near/${[...node.parentSlugs, node.slug].join('/')}`;
}

function absoluteUrl(path) {
  return `${ORIGIN}${path}`;
}

function childrenOf(nodes, citySlug, kind = null) {
  return nodes
    .filter(
      (n) =>
        n.parentSlugs.length === 1 &&
        n.parentSlugs[0] === citySlug &&
        (kind == null || n.kind === kind),
    )
    .sort((a, b) => b.priority - a.priority);
}

function findCity(nodes, citySlug) {
  return nodes.find((n) => n.kind === 'city' && n.slug === citySlug) ?? null;
}

function placeType(kind) {
  if (kind === 'city') return 'City';
  if (kind === 'direction') return 'AdministrativeArea';
  return 'Place';
}

function sitemapPriority(node, isHub = false) {
  if (isHub) return '0.9';
  if (node.kind === 'city' && node.slug === 'makkah') return '0.95';
  if (node.kind === 'city') return '0.85';
  if (node.kind === 'neighborhood') return '0.75';
  if (node.kind === 'direction') return '0.65';
  return '0.7';
}

function buildFaqs(node, city) {
  if (node.kind === 'city') {
    const marketing = getFazaaCityMarketing(node.slug);
    if (Array.isArray(marketing?.faqs) && marketing.faqs.length > 0) {
      return marketing.faqs;
    }
  }
  const nameAr = node.nameAr;
  if (node.kind === 'neighborhood' && city) {
    return [
      {
        q: `كيف أجد أقرب حلاق من موقعي في حي ${nameAr} بمدينة ${city.nameAr}؟`,
        a: `افتح فزعة الاستعلام في حلاق ماب حول نطاق حي ${nameAr} في ${city.nameAr}. إن قلت أبي حلاق قريب أو عطني أقرب حلاق أو ابحث لي عن أقرب حلاق — تظهر لك الخيارات المناسبة من الشركاء المتاحين لحظة الاستعلام.`,
      },
      {
        q: `أين أجد صالون قريب أو حلاق منزلي قرب حي ${nameAr}؟`,
        a: `من صفحة الحي ابدأ الاستعلام، أو انتقل لتفرعات «حلاق منزلي ودليفري» و«حلاق أطفال» و«مفتوح الآن» ثم خصّص النطاق حول ${nameAr} في ${city.nameAr}.`,
      },
      {
        q: `هل أتصفّح أحياء أخرى في ${city.nameAr}؟`,
        a: `نعم — افتح صفحة ${city.nameAr} لاستكشاف الاتجاهات والأحياء، ثم ابدأ الاستعلام من الحي الأنسب لك.`,
      },
    ];
  }
  return [
    {
      q: `كيف أجد أقرب حلاق من موقعي في ${nameAr}؟`,
      a: `افتح فزعة الاستعلام في حلاق ماب وابدأ من موقعك أو ضمن نطاق ${nameAr}. صيغ مثل أبي حلاق قريب وعطني أقرب صالون من موقعي توصلك لخيارات الشركاء المتاحين لحظياً.`,
    },
    {
      q: `ما الحلول المتاحة في ${nameAr} عبر حلاق ماب؟`,
      a: `يمكنك بدء استعلام أقرب حلاق، أو صالون قريب، أو حلاق منزلي ودليفري، أو حلاق أطفال، أو مفتوح الآن و24 ساعة — كلها كتفرعات من صفحة ${nameAr}.`,
    },
    {
      q: `هل تغطي حلاق ماب ${nameAr} فقط؟`,
      a: `لا — تغطي مدناً سعودية متعددة. هذه الصفحة مخصّصة لنية البحث المحلي حول ${nameAr}، ويمكنك التنقّل لمدن وأحياء أخرى ثم بدء الاستعلام.`,
    },
  ];
}

function placeLabelAr(node) {
  if (node?.slug === 'makkah' || node?.city_slug === 'makkah') {
    return `${node.nameAr} 🕋`;
  }
  return node.nameAr;
}

function linkList(items) {
  return items
    .map((c) => {
      const label =
        c.slug === 'makkah' || c.parentSlugs?.includes?.('makkah')
          ? c.slug === 'makkah'
            ? `أقرب حلاق في ${escapeHtml(c.nameAr)} 🕋`
            : `أقرب حلاق في ${escapeHtml(c.nameAr)}`
          : `أقرب حلاق في ${escapeHtml(c.nameAr)}`;
      return `<li><a href="${escapeHtml(nodePath(c))}">${label}</a></li>`;
    })
    .join('\n');
}

function jsonLdGraph({ node, path, city, directions, neighborhoods, faqs, pageName }) {
  const pageUrl = absoluteUrl(path);
  const placeName = node.nameAr;
  const collectionName =
    pageName ||
    (node.kind === 'neighborhood' && city
      ? `أقرب حلاق في ${placeName} | ${city.nameAr}`
      : `أقرب حلاق في ${placeName}`);
  const breadcrumbItems = [
    { name: 'حلاق ماب', item: `${ORIGIN}/` },
    { name: 'أقرب حلاق', item: `${ORIGIN}/near` },
  ];
  if (city && node.kind !== 'city') {
    breadcrumbItems.push({ name: city.nameAr, item: absoluteUrl(nodePath(city)) });
  }
  breadcrumbItems.push({ name: placeName, item: pageUrl });

  const place = {
    '@type': placeType(node.kind),
    '@id': `${pageUrl}#place`,
    name: placeName,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: node.lat,
      longitude: node.lng,
    },
  };
  if (Array.isArray(node.aliasesAr) && node.aliasesAr.length > 0) {
    place.alternateName = node.aliasesAr;
  }
  if (city && node.kind !== 'city') {
    place.containedInPlace = {
      '@type': 'City',
      name: city.nameAr,
      url: absoluteUrl(nodePath(city)),
    };
  }

  const marketing = node.kind === 'city' ? getFazaaCityMarketing(node.slug) : null;
  const collectionDesc = marketing
    ? marketing.description
    : node.kind === 'neighborhood' && city
      ? `فزعة لحي ${placeName} في ${city.nameAr} من حلاق ماب لبدء استعلام أقرب حلاق.`
      : `فزعة جغرافية من حلاق ماب لمساعدتك على بدء استعلام أقرب حلاق في ${placeName}.`;

  const graph = [
    {
      '@type': 'Organization',
      '@id': `${ORIGIN}/#organization`,
      name: 'حلاق ماب',
      alternateName: 'HALAQ MAP',
      url: `${ORIGIN}/`,
    },
    {
      '@type': 'WebApplication',
      '@id': `${ORIGIN}/#webapp`,
      name: 'حلاق ماب',
      url: `${ORIGIN}/`,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      inLanguage: 'ar-SA',
      provider: { '@id': `${ORIGIN}/#organization` },
      description:
        'منصة رقمية ذكية للاستعلام عن الحلاق الأنسب عبر المعالجة والفلترة اللحظية داخل المملكة.',
      areaServed: marketing
        ? { '@type': 'City', name: placeName }
        : undefined,
    },
    {
      '@type': 'CollectionPage',
      '@id': `${pageUrl}#page`,
      name: collectionName,
      url: pageUrl,
      inLanguage: 'ar-SA',
      isPartOf: { '@id': `${ORIGIN}/#webapp` },
      about: { '@id': `${pageUrl}#place` },
      spatialCoverage: { '@id': `${pageUrl}#place` },
      description: collectionDesc,
      mainEntity: { '@id': `${ORIGIN}/#webapp` },
    },
    place,
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: breadcrumbItems.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        item: b.item,
      })),
    },
    {
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  const listItems = [...directions, ...neighborhoods];
  if (listItems.length > 0) {
    graph.push({
      '@type': 'ItemList',
      '@id': `${pageUrl}#children`,
      name: `مناطق ضمن ${placeName}`,
      itemListElement: listItems.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.nameAr,
        url: absoluteUrl(nodePath(c)),
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

function renderPage({ node, nodes, isHub = false }) {
  if (isHub) {
    const cities = nodes.filter((n) => n.kind === 'city').sort((a, b) => b.priority - a.priority);
    const topNeighborhoodCities = cities.slice(0, 8);
    // عنوان يبدأ بعبارات البحث التنافسية لـ «أقرب حلاق من موقعي»
    const title = 'اقرب حلاق رجالي من موقعي حسب المدينة | حلاق ماب';
    const description =
      'اقرب حلاق رجالي من موقعي، حلاق قريب مني، حلاق قريب من موقعي، مفتوح الآن و24 ساعة — اختر المدينة أو الحي وابدأ استعلاماً لحظياً من فزعة حلاق ماب.';
    const canonical = `${ORIGIN}/near`;
    const cityLinks = linkList(cities);
    const makkahFeature = `<section class="card" aria-label="عمود مكة">
          <h2>أقرب حلاق مكة 🕋 — صفحة مخصّصة</h2>
          <p class="lead">عمود فزعة لمكة 🕋: أقرب حلاق من موقعك، صالونات مفتوحة الآن، أحياء مثل العزيزية، وربط بمركز نسك الحج للحلق والتقصير.</p>
          <p class="cta-wrap"><a class="cta" href="/near/makkah">افتح أقرب حلاق في مكة 🕋</a></p>
        </section>`;
    const neighHint = topNeighborhoodCities
      .map(
        (c) =>
          `<li><a href="${escapeHtml(nodePath(c))}">أحياء ${escapeHtml(c.nameAr)} — تصفّح بالحي</a></li>`,
      )
      .join('\n');
    const graph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          name: title,
          url: canonical,
          inLanguage: 'ar-SA',
          description,
          isPartOf: { '@type': 'WebApplication', name: 'حلاق ماب', url: `${ORIGIN}/` },
        },
        {
          '@type': 'ItemList',
          itemListElement: cities.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.nameAr,
            url: absoluteUrl(nodePath(c)),
          })),
        },
      ],
    };
    return htmlShell({
      title,
      description,
      canonical,
      h1: 'اقرب حلاق رجالي من موقعي حسب المدينة والحي',
      bodyInner: `
        <p class="lead"><strong>اقرب حلاق رجالي من موقعك</strong> أو <strong>حلاق قريب مني</strong> حسب مدينتك وحيّك عبر <strong>حلاق ماب</strong> — فزعة بحث لحظي توصلك لخيارات قريبة تناسب طلبك.</p>
        <p class="note">اختر المدينة أدناه ثم اضغط «ابدأ الاستعلام». أو تصفّح أحياء الرياض وجدة ومكة والمدن الأخرى، أو انتقل لتفرعات الحلاق المنزلي والدليفري والأطفال.</p>
        ${makkahFeature}
        ${nearSearchPhrasesSectionHtml()}
        <p class="note"><a href="/near/makkah">أقرب حلاق مكة 🕋</a> · <a href="/nusuk">مركز نسك الحج — الحلق والتقصير للحجاج</a> · <a href="/need">ابحث حسب حاجتك — الفلاتر</a> · <a href="/occasions/eid-adha-shaving">عيد الأضحى — بعد الأضحية</a></p>
        <section>
          <h2>تصفّح بالأحياء — مدن رئيسية</h2>
          <ul class="grid">${neighHint}</ul>
        </section>
        <section>
          <h2>كل المدن</h2>
          <ul class="grid">${cityLinks}</ul>
        </section>
        <p class="cta-wrap"><a class="cta" href="${ORIGIN}/#/">ابدأ الاستعلام الآن</a></p>
      `,
      jsonLd: graph,
    });
  }

  const path = nodePath(node);
  const city = node.kind === 'city' ? node : findCity(nodes, node.parentSlugs[0]);
  const directions = node.kind === 'city' ? childrenOf(nodes, node.slug, 'direction') : [];
  const neighborhoods = node.kind === 'city' ? childrenOf(nodes, node.slug, 'neighborhood') : [];
  const faqs = buildFaqs(node, city);
  const cityMarketing =
    node.kind === 'city' ? getFazaaCityMarketing(node.slug) : null;
  const title = cityMarketing
    ? cityMarketing.title
    : node.kind === 'neighborhood' && city
      ? `أقرب حلاق من موقعي في ${node.nameAr} | ${city.nameAr} | حلاق ماب`
      : `أقرب حلاق من موقعي في ${node.nameAr} | حلاق ماب`;
  const description = cityMarketing
    ? cityMarketing.description
    : node.kind === 'neighborhood' && city
      ? `أفضل حلاقين بالقرب مني في حي ${node.nameAr} بمدينة ${city.nameAr} — أقرب حلاق من موقعي، صالون قريب، أقرب صالون حولي، حلاق منزلي عبر فزعة حلاق ماب.`
      : `أفضل حلاقين بالقرب مني في ${node.nameAr} — أقرب حلاق من موقعي، صالون قريب، أقرب صالون حولي، عطني أقرب صالون من موقعي، حلاق دليفري عبر فزعة حلاق ماب.`;
  const canonical = absoluteUrl(path);
  const cta = `${ORIGIN}/#/?near=${encodeURIComponent([...node.parentSlugs, node.slug].join('/'))}`;

  const crumbs = [
    `<a href="${ORIGIN}/">الرئيسية</a>`,
    `<a href="/near">أقرب حلاق</a>`,
  ];
  if (city && node.kind !== 'city') {
    crumbs.push(`<a href="${escapeHtml(nodePath(city))}">${escapeHtml(city.nameAr)}</a>`);
  }
  crumbs.push(`<span>${escapeHtml(placeLabelAr(node))}</span>`);

  let childBlock = '';
  if (node.kind === 'city') {
    const cityHeading = placeLabelAr(node);
    const parts = [];
    if (directions.length > 0) {
      parts.push(`<section>
        <h2>اتجاهات ضمن ${escapeHtml(cityHeading)}</h2>
        <ul class="grid">${linkList(directions)}</ul>
      </section>`);
    }
    if (neighborhoods.length > 0) {
      parts.push(`<section>
        <h2>أحياء ${escapeHtml(cityHeading)} — أقرب حلاق حسب الحي</h2>
        <p class="note">فزعات محلية من حلاق ماب لبدء الاستعلام حول الحي بما يوافق رغبتك.</p>
        <ul class="grid">${linkList(neighborhoods)}</ul>
      </section>`);
    }
    childBlock = parts.join('\n');
  } else if (node.kind === 'neighborhood' && city) {
    const siblings = childrenOf(nodes, city.slug, 'neighborhood')
      .filter((n) => n.slug !== node.slug)
      .slice(0, SIBLING_LIMIT);
    childBlock = `
      <p class="note">حي <strong>${escapeHtml(node.nameAr)}</strong> ضمن مدينة <a href="${escapeHtml(nodePath(city))}">${escapeHtml(placeLabelAr(city))}</a> — عد لصفحة المدينة لرؤية كل الأحياء والاتجاهات.</p>
      ${
        siblings.length > 0
          ? `<section>
        <h2>أحياء قريبة ضمن ${escapeHtml(city.nameAr)}</h2>
        <ul class="grid">${linkList(siblings)}</ul>
      </section>`
          : ''
      }
    `;
  } else if (city) {
    childBlock = `<p class="note">عد إلى صفحة <a href="${escapeHtml(nodePath(city))}">${escapeHtml(city.nameAr)}</a> لرؤية الاتجاهات والأحياء.</p>`;
  }

  const faqHtml = faqs
    .map(
      (f) => `
      <details>
        <summary>${escapeHtml(f.q)}</summary>
        <p>${escapeHtml(f.a)}</p>
      </details>`,
    )
    .join('\n');

  const isHajjCity =
    node.kind === 'city' && (node.slug === 'makkah' || node.slug === 'madinah');
  const isMakkahPillar = Boolean(cityMarketing?.pillar && node.slug === 'makkah');
  const nusukNote = isHajjCity
    ? `<p class="note"><a href="/nusuk">مركز نسك الحج — الحلق والتقصير</a> للحجاج والزوار في ${escapeHtml(node.nameAr)}.</p>`
    : '';

  const citySlugForBranches =
    node.kind === 'city' ? node.slug : city?.slug || undefined;
  const branches = isMakkahPillar
    ? ''
    : citySeoBranchesHtml({
        placeNameAr: node.nameAr,
        citySlug: citySlugForBranches,
        cityNameAr: city?.nameAr || node.nameAr,
        isNeighborhood: node.kind === 'neighborhood',
      });
  const pillarSections = isMakkahPillar
    ? cityPillarSectionsHtml({ marketing: cityMarketing })
    : '';

  const lead = isMakkahPillar
    ? `<p class="lead">${escapeHtml(cityMarketing.content_paragraph)}</p>
      <h2>${escapeHtml(cityMarketing.h2)}</h2>
      <p>ابدأ فزعة <strong>حلاق ماب</strong> لنطاق <strong>مكة</strong>: أقرب حلاق من موقعك، صالون قريب، مفتوح الآن، أو تصفّح الأحياء — ثم اتصل بالصالون مباشرة.</p>
      ${nusukNote}`
    : cityMarketing
      ? `<p class="lead">${escapeHtml(cityMarketing.content_paragraph)}</p>
      <h2>${escapeHtml(cityMarketing.h2)}</h2>
      <p>ابدأ من فزعة <strong>حلاق ماب</strong> في ${escapeHtml(node.nameAr)}: أقرب حلاق من موقعك، صالون قريب، أقرب صالون حولي، أو حلاق منزلي ودليفري — ثم اتصل بالصالون مباشرة.</p>
      ${nusukNote}`
      : node.kind === 'neighborhood' && city
        ? `<p class="lead">فزعة <strong>حلاق ماب</strong> لمن يبحث عن <strong>أقرب حلاق من موقعه</strong> في حي <strong>${escapeHtml(node.nameAr)}</strong> بمدينة <strong>${escapeHtml(city.nameAr)}</strong> — صالون قريب، أقرب صالون حولي، أو حلاق منزلي حسب طلبك.</p>
      <p>سواء قلت أبي حلاق قريب أو عطني أقرب حلاق أو ابحث لي عن أقرب حلاق — اضغط الزر أدناه لبدء الاستعلام حول نطاق حي ${escapeHtml(node.nameAr)}.</p>
      ${city?.slug === 'makkah' ? `<p class="note">عد إلى عمود <a href="/near/makkah">أقرب حلاق في مكة 🕋</a> لكل الأحياء والنسك.</p>` : ''}`
        : `<p class="lead">فزعة <strong>حلاق ماب</strong> لمن يبحث عن <strong>أقرب حلاق من موقعه</strong> في <strong>${escapeHtml(node.nameAr)}</strong> — أفضل حلاقين بالقرب منك، صالون قريب، أو حلول منزلية ودليفري.</p>
      <p>سواء قلت أبي حلاق قريب أو عطني أقرب صالون من موقعي أو ابحث لي عن أقرب حلاق — ابدأ الاستعلام حول نطاق ${escapeHtml(node.nameAr)} الآن.</p>
      ${nusukNote}`;

  const pageH1 = cityMarketing
    ? cityMarketing.h1
    : `أقرب حلاق من موقعي في ${node.nameAr}`;

  const keywordsMeta = cityMarketing?.keywords_extra
    ? `${NEAR_SEARCH_KEYWORDS_META}, ${cityMarketing.keywords_extra}`
    : NEAR_SEARCH_KEYWORDS_META;

  return htmlShell({
    title,
    description,
    canonical,
    h1: pageH1,
    keywords: keywordsMeta,
    bodyInner: `
      <nav class="crumbs" aria-label="مسار التنقل">${crumbs.join(' <span aria-hidden="true">/</span> ')}</nav>
      ${lead}
      ${pillarSections}
      ${branches}
      ${isMakkahPillar ? '' : nearSearchPhrasesSectionHtml({ compact: true })}
      <p class="cta-wrap"><a class="cta" href="${escapeHtml(cta)}">ابدأ الاستعلام — ${escapeHtml(node.nameAr)}</a></p>
      ${childBlock}
      <section>
        <h2>أسئلة شائعة</h2>
        ${faqHtml}
      </section>
      <p class="note"><a href="/near">كل المدن</a>${isMakkahPillar || city?.slug === 'makkah' ? ' · <a href="/nusuk">نسك الحج</a>' : ''} · <a href="${ORIGIN}/">الصفحة الرئيسية</a></p>
    `,
    jsonLd: jsonLdGraph({
      node,
      path,
      city,
      directions,
      neighborhoods:
        node.kind === 'neighborhood' && city
          ? childrenOf(nodes, city.slug, 'neighborhood')
              .filter((n) => n.slug !== node.slug)
              .slice(0, SIBLING_LIMIT)
          : neighborhoods,
      faqs,
      pageName: pageH1,
    }),
  });
}

function htmlShell({ title, description, canonical, h1, bodyInner, jsonLd, keywords }) {
  const keywordsMeta = keywords || NEAR_SEARCH_KEYWORDS_META;
  return `<!DOCTYPE html>
<html lang="ar-SA" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="keywords" content="${escapeHtml(keywordsMeta)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${BRAND_LOGO_ABS}" />
  <meta property="og:locale" content="ar_SA" />
  <meta property="og:site_name" content="${BRAND_SITE_NAME}" />
  <meta name="application-name" content="${BRAND_SITE_NAME}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${BRAND_LOGO_ABS}" />
${brandIconLinks()}
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>
${brandHeaderCss()}
${nearSearchPhrasesCss()}
    :root { color-scheme: dark; --bg:#061223; --card:#0c1a2e; --text:#e8eef7; --muted:#94a3b8; --accent:#2dd4bf; --line:rgba(45,212,191,.25); }
    * { box-sizing: border-box; }
${brandPageTypeCss()}
    .wrap { max-width: 44rem; margin: 0 auto; padding: 1.5rem 1.15rem 3rem; }
    .card { border:1px solid var(--line); border-radius:14px; background:var(--card); padding:1rem 1.1rem; margin:1rem 0; }
    .note { color:var(--muted); font-size:.95rem; }
    .crumbs { font-size:.9rem; color:var(--muted); margin-bottom:1rem; }
    .crumbs a { color:var(--accent); }
    .grid { list-style:none; padding:0; margin:1rem 0; display:grid; gap:.65rem; }
    .grid a { display:block; padding:.85rem 1rem; border:1px solid var(--line); border-radius:12px; background:var(--card); color:var(--text); text-decoration:none; font-weight:600; }
    .grid a:hover { border-color: var(--accent); }
    .cta-wrap { margin: 1.5rem 0; }
    .cta { display:inline-block; background: linear-gradient(135deg,#0d9488,#0891b2); color:#041016; font-weight:800; padding:.85rem 1.25rem; border-radius:12px; text-decoration:none; }
    details { border:1px solid var(--line); border-radius:12px; padding:.75rem 1rem; margin:.55rem 0; background:rgba(12,26,46,.7); }
    summary { cursor:pointer; font-weight:700; }
    footer { margin-top:2.5rem; padding-top:1rem; border-top:1px solid var(--line); color:var(--muted); font-size:.85rem; }
  </style>
</head>
<body>
  <div class="wrap">
${brandHeaderHtml()}
    <main>
      <h1>${escapeHtml(h1)}</h1>
      ${bodyInner}
    </main>
    <footer>
      <p>${FAZAA_MARKETING_FOOTER_AR}</p>
    </footer>
  </div>
</body>
</html>
`;
}

function writeFileDeep(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf8');
}

function loadAllNodes() {
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));
  let neighborhoods = { nodes: [] };
  try {
    neighborhoods = JSON.parse(readFileSync(NEIGHBORHOODS_PATH, 'utf8'));
  } catch {
    /* optional */
  }
  const nodes = [...(registry.nodes || []), ...(neighborhoods.nodes || [])];
  if (nodes.length === 0) {
    throw new Error('geo near registry empty');
  }
  return nodes;
}

function main() {
  const nodes = loadAllNodes();

  const hubHtml = renderPage({ node: null, nodes, isHub: true });
  writeFileDeep(join(DIST, 'near', 'index.html'), hubHtml);

  const urlEntries = [{ loc: `${ORIGIN}/near`, priority: '0.9' }];
  for (const node of nodes) {
    const path = nodePath(node);
    const html = renderPage({ node, nodes, isHub: false });
    writeFileDeep(join(DIST, ...path.split('/').filter(Boolean), 'index.html'), html);
    urlEntries.push({ loc: absoluteUrl(path), priority: sitemapPriority(node) });
  }

  const lastmod = new Date().toISOString().slice(0, 10);
  const sitemapGeo = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;
  writeFileDeep(join(DIST, 'sitemap-geo.xml'), sitemapGeo);
  writeFileDeep(
    join(DIST, 'near', 'city-marketing.json'),
    `${JSON.stringify(exportFazaaCityMarketingJsonList(), null, 2)}\n`,
  );

  const neighCount = nodes.filter((n) => n.kind === 'neighborhood').length;
  console.log(
    `[generate-near-geo-seo] wrote ${urlEntries.length} geo URLs (${neighCount} neighborhoods) under dist/near`,
  );
}

main();
