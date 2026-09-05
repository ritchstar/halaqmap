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
  fazaaMeasurementTagHtml,
  NEAR_SEARCH_KEYWORDS_META,
  nearSearchPhrasesCss,
} from './lib/platformBrandIdentity.mjs';
import { FAZAA_MARKETING_FOOTER_AR } from './lib/fazaaCitySeoBranches.mjs';
import { hreflangLinksForArPath, languageSwitchForArPath } from './lib/fazaaEnNearPages.mjs';
import {
  featuredPartnersCss,
  featuredPartnerKeywords,
  featuredPartnerOgImage,
  featuredPartnersForPlace,
  featuredPartnersJsonLd,
  featuredPartnersMetaBlurb,
  featuredPartnerSitemapImages,
  featuredPartnersSectionHtml,
} from './data/fazaaFeaturedPartners.mjs';
import {
  exportFazaaCityMarketingJsonList,
  getFazaaCityMarketing,
} from './data/fazaaCityMarketingCopy.mjs';
import { expandGeoNearLegacyRedirects } from './lib/geoNearLegacyRedirects.mjs';
import { renderLegacyRedirect } from './lib/seoLegacyRedirectHtml.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REGISTRY_PATH = join(ROOT, 'src', 'config', 'geoNearRegistry.json');
const NEIGHBORHOODS_PATH = join(ROOT, 'src', 'config', 'geoNearNeighborhoods.json');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://www.halaqmap.com';
const HOME_INQUIRE_HREF = `${ORIGIN}/#/`;
const SEARCH_FROM_HERE_CTA = 'ابحث من موقعك';
const SIBLING_LIMIT = 12;

function inquireCtaHtml() {
  return `<p class="cta-wrap"><a class="cta cta-home" href="${HOME_INQUIRE_HREF}">${SEARCH_FROM_HERE_CTA}</a></p>`;
}

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
  if (node.kind === 'city' && (node.slug === 'makkah' || node.slug === 'madinah')) return '0.98';
  if (node.kind === 'city' && (node.slug === 'riyadh' || node.slug === 'jeddah')) return '0.96';
  if (node.kind === 'city') return '0.92';
  if (node.kind === 'neighborhood' && node.slug === 'hittin') return '0.55';
  if (node.kind === 'neighborhood') return '0.4';
  if (node.kind === 'direction') return '0.35';
  return '0.5';
}

function sitemapChangefreq(node) {
  if (!node || node.kind === 'city') return 'weekly';
  return 'monthly';
}

/** أحياء واجهة فخامة — عنوان يطابق نية «أقرب حلاق من موقعي» */
const PREMIUM_NEAR_ME_NEIGHBORHOODS = new Set(['hittin']);

function neighborhoodSeoCopy(node, city) {
  if (PREMIUM_NEAR_ME_NEIGHBORHOODS.has(node.slug) && city) {
    return {
      title: `أقرب حلاق من موقعي في ${node.nameAr} | ${city.nameAr} | حلاق ماب`,
      description: `أقرب حلاق من موقعي في حي ${node.nameAr} بالرياض — حلاق رجالي قريب، صالون راقٍ ضمن نطاقك عبر فزعة حلاق ماب. ابدأ الاستعلام أو تصفّح مفتوح الآن وحلاق منزلي وحلاق أطفال.`,
      h1: `أقرب حلاق من موقعي في ${node.nameAr}`,
    };
  }
  return null;
}

function buildFaqs(node, city) {
  const place = node.kind === 'neighborhood' && city ? `حي ${node.nameAr} في ${city.nameAr}` : node.nameAr;
  return [
    {
      q: `كيف أجد أقرب حلاق في ${place}؟`,
      a: `اضغط «ابحث من موقعك» للانتقال فوراً إلى صفحة الاستعلام. اسمح للموقع بمعرفة مكانك ليظهر أقرب الخيارات المتاحة الآن.`,
    },
  ];
}

function placeLabelAr(node) {
  if (node?.slug === 'makkah' || node?.city_slug === 'makkah') {
    return `${node.nameAr} 🕋`;
  }
  if (node?.slug === 'madinah' || node?.city_slug === 'madinah') {
    return `${node.nameAr} 🕌`;
  }
  return node.nameAr;
}

function linkList(items) {
  return items
    .map((c) => {
      let label = `أقرب حلاق في ${escapeHtml(c.nameAr)}`;
      if (c.slug === 'makkah') label = `أقرب حلاق في ${escapeHtml(c.nameAr)} 🕋`;
      if (c.slug === 'madinah') label = `أقرب حلاق في ${escapeHtml(c.nameAr)} 🕌`;
      return `<li><a href="${escapeHtml(nodePath(c))}">${label}</a></li>`;
    })
    .join('\n');
}

function jsonLdGraph({ node, path, city, directions, neighborhoods, faqs, pageName, pagePartners = [], ogImage = null }) {
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
      ...(ogImage
        ? { primaryImageOfPage: { '@type': 'ImageObject', contentUrl: ogImage, url: ogImage } }
        : {}),
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

  const shops = featuredPartnersJsonLd(pagePartners, { pageUrl });
  if (shops.length > 0) graph.push(...shops);

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

function renderPage({ node, nodes, isHub = false }) {
  if (isHub) {
    const cities = nodes.filter((n) => n.kind === 'city').sort((a, b) => b.priority - a.priority);
    // دليل مدن/أحياء — لا يزاحم /need/near-me على «حلاق قريب مني / من موقعك».
    const title = 'أقرب حلاق حسب المدينة والحي | حلاق ماب';
    const description =
      'اختر مدينتك أو حيك ثم اعثر على أقرب حلاق رجالي. صفحات الرياض وجدة ومكة والمدينة وأكثر. بلا تطبيق وبلا حساب.';
    const canonical = `${ORIGIN}/near`;
    const cityLinks = linkList(cities);
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
      h1: 'أقرب حلاق حسب المدينة والحي',
      bodyInner: `
        <p class="lead">اختر المدينة أو الحي، ثم ابحث عن أقرب حلاق رجالي حولك.</p>
        ${inquireCtaHtml()}
        <section>
          <h2>مدن يمكن البحث منها</h2>
          <ul class="grid">${cityLinks}</ul>
        </section>
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
  const premiumCopy =
    node.kind === 'neighborhood' && city ? neighborhoodSeoCopy(node, city) : null;
  const partnerCitySlug = node.kind === 'city' ? node.slug : city?.slug || null;
  const partnerNeighSlug = node.kind === 'neighborhood' ? node.slug : null;
  const pagePartners = partnerCitySlug
    ? featuredPartnersForPlace(partnerCitySlug, partnerNeighSlug)
    : [];
  const partnerBlurb = partnerCitySlug
    ? featuredPartnersMetaBlurb(partnerCitySlug, partnerNeighSlug, node.nameAr)
    : '';
  const partnerKeywords = partnerCitySlug
    ? featuredPartnerKeywords(partnerCitySlug, partnerNeighSlug)
    : '';
  const partnerSection = partnerCitySlug
    ? featuredPartnersSectionHtml({
        citySlug: partnerCitySlug,
        neighborhoodSlug: partnerNeighSlug,
        placeNameAr: node.nameAr,
      })
    : '';
  const ogImage = partnerCitySlug
    ? featuredPartnerOgImage(partnerCitySlug, partnerNeighSlug)
    : null;

  const title = cityMarketing
    ? cityMarketing.title
    : premiumCopy
      ? premiumCopy.title
      : node.kind === 'neighborhood' && city
        ? pagePartners.length > 0
          ? `اقرب حلاق في ${node.nameAr} · شركاء حلاق ماب | ${city.nameAr} | حلاق ماب`
          : `اقرب حلاق في ${node.nameAr} · حلاق قريب | ${city.nameAr} | حلاق ماب`
        : `اقرب حلاق في ${node.nameAr} · حلاق قريب | حلاق ماب`;
  const baseDescription = cityMarketing
    ? cityMarketing.description
    : premiumCopy
      ? premiumCopy.description
      : node.kind === 'neighborhood' && city
        ? `اقرب حلاق وحلاق قريب في حي ${node.nameAr} بمدينة ${city.nameAr} — حلاق قريب مني، حلاق قريب من موقعي، صالون قريب عبر فزعة حلاق ماب.`
        : `اقرب حلاق وحلاق قريب في ${node.nameAr} — حلاق قريب مني، حلاق قريب من موقعي، صالون قريب عبر فزعة حلاق ماب.`;
  const description = partnerBlurb ? `${baseDescription} ${partnerBlurb}` : baseDescription;
  const canonical = absoluteUrl(path);

  const crumbs = [
    `<a href="${ORIGIN}/">الرئيسية</a>`,
    `<a href="/near">أقرب حلاق</a>`,
  ];
  if (city && node.kind !== 'city') {
    crumbs.push(`<a href="${escapeHtml(nodePath(city))}">${escapeHtml(city.nameAr)}</a>`);
  }
  crumbs.push(`<span>${escapeHtml(placeLabelAr(node))}</span>`);

  let childBlock = '';
  if (node.kind === 'city' && neighborhoods.length > 0) {
    childBlock = `<section>
        <h2>أحياء ${escapeHtml(placeLabelAr(node))}</h2>
        <ul class="grid">${linkList(neighborhoods)}</ul>
      </section>`;
  } else if (node.kind === 'neighborhood' && city) {
    const siblings = childrenOf(nodes, city.slug, 'neighborhood')
      .filter((n) => n.slug !== node.slug)
      .slice(0, SIBLING_LIMIT);
    childBlock =
      siblings.length > 0
        ? `<section>
        <h2>أحياء في ${escapeHtml(city.nameAr)}</h2>
        <ul class="grid">${linkList(siblings)}</ul>
      </section>`
        : '';
  }

  const pageFaqs = faqs;

  const faqHtml = pageFaqs
    .map(
      (f) => `
      <details>
        <summary>${escapeHtml(f.q)}</summary>
        <p>${escapeHtml(f.a)}</p>
      </details>`,
    )
    .join('\n');

  const placeForLead =
    node.kind === 'neighborhood' && city
      ? `حي ${node.nameAr} في ${city.nameAr}`
      : node.nameAr;
  const lead = `<p class="lead">تبحث عن أقرب حلاق في <strong>${escapeHtml(placeForLead)}</strong>؟ اضغط «ابحث من موقعك» للانتقال فوراً إلى صفحة الاستعلام — نعرض ما يناسب مكانك الآن دون قوائم أو مسارات.</p>`;

  const pageH1 = cityMarketing
    ? cityMarketing.h1
    : premiumCopy?.h1 || `اقرب حلاق في ${node.nameAr} · حلاق قريب`;

  const keywordsMeta = [NEAR_SEARCH_KEYWORDS_META, cityMarketing?.keywords_extra, partnerKeywords]
    .filter(Boolean)
    .join(', ');

  return htmlShell({
    title,
    description,
    canonical,
    h1: pageH1,
    keywords: keywordsMeta,
    bodyInner: `
      <nav class="crumbs" aria-label="مسار التنقل">${crumbs.join(' <span aria-hidden="true">/</span> ')}</nav>
      ${lead}
      ${inquireCtaHtml()}
      ${partnerSection}
      ${childBlock}
      <section>
        <h2>سؤال واحد</h2>
        ${faqHtml}
      </section>
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
      faqs: pageFaqs,
      pageName: pageH1,
      pagePartners,
      ogImage,
    }),
    ogImage,
  });
}

function htmlShell({ title, description, canonical, h1, bodyInner, jsonLd, keywords, ogImage }) {
  const keywordsMeta = keywords || NEAR_SEARCH_KEYWORDS_META;
  const shareImage = ogImage || BRAND_LOGO_ABS;
  const arPath = canonical.replace(ORIGIN, '');
  const hreflangHtml = hreflangLinksForArPath(arPath);
  const langSwitchHtml = languageSwitchForArPath(arPath);
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
${hreflangHtml ? `${hreflangHtml}\n` : ''}  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${escapeHtml(shareImage)}" />
  <meta property="og:image:alt" content="${escapeHtml(title)}" />
  <meta property="og:locale" content="ar_SA" />
${hreflangHtml ? `  <meta property="og:locale:alternate" content="en_US" />\n` : ''}  <meta property="og:site_name" content="${BRAND_SITE_NAME}" />
  <meta name="application-name" content="${BRAND_SITE_NAME}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(shareImage)}" />
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
    .cta-wrap { margin: 1.35rem 0 1.75rem; }
    .cta { display:inline-block; background: linear-gradient(135deg,#0d9488,#0891b2); color:#041016; font-weight:800; padding:.85rem 1.25rem; border-radius:12px; text-decoration:none; }
    .cta-home { display:block; width:100%; text-align:center; padding:1.05rem 1.25rem; font-size:1.15rem; }
    details { border:1px solid var(--line); border-radius:12px; padding:.75rem 1rem; margin:.55rem 0; background:rgba(12,26,46,.7); }
    summary { cursor:pointer; font-weight:700; }
    footer { margin-top:2.5rem; padding-top:1rem; border-top:1px solid var(--line); color:var(--muted); font-size:.85rem; }
    .lang-switch { margin:.65rem 0 0; }
    .lang-switch a { color:var(--accent); }
${featuredPartnersCss()}
  </style>
${fazaaMeasurementTagHtml()}
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
      ${langSwitchHtml}
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

  const urlEntries = [{ loc: `${ORIGIN}/near`, priority: '0.9', changefreq: 'weekly', images: [] }];
  for (const node of nodes) {
    const path = nodePath(node);
    const html = renderPage({ node, nodes, isHub: false });
    writeFileDeep(join(DIST, ...path.split('/').filter(Boolean), 'index.html'), html);
    const city = node.kind === 'city' ? node : findCity(nodes, node.parentSlugs[0]);
    const citySlug = node.kind === 'city' ? node.slug : city?.slug || null;
    const neighSlug = node.kind === 'neighborhood' ? node.slug : null;
    urlEntries.push({
      loc: absoluteUrl(path),
      priority: sitemapPriority(node),
      changefreq: sitemapChangefreq(node),
      images: citySlug ? featuredPartnerSitemapImages(citySlug, neighSlug) : [],
    });
  }

  const lastmod = new Date().toISOString().slice(0, 10);
  const sitemapGeo = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries
  .map((u) => {
    const imageXml = (u.images || [])
      .map(
        (img) => `    <image:image>
      <image:loc>${escapeHtml(img.loc)}</image:loc>
      <image:title>${escapeHtml(img.title)}</image:title>
    </image:image>`,
      )
      .join('\n');
    return `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq || 'weekly'}</changefreq>
    <priority>${u.priority}</priority>${imageXml ? `\n${imageXml}` : ''}
  </url>`;
  })
  .join('\n')}
</urlset>
`;
  writeFileDeep(join(DIST, 'sitemap-geo.xml'), sitemapGeo);
  writeFileDeep(
    join(DIST, 'near', 'city-marketing.json'),
    `${JSON.stringify(exportFazaaCityMarketingJsonList(), null, 2)}\n`,
  );

  const knownPaths = new Set(urlEntries.map((entry) => entry.loc.replace(ORIGIN, '')));
  const legacyRedirects = expandGeoNearLegacyRedirects(nodes);
  for (const { from, to } of legacyRedirects) {
    if (!knownPaths.has(to)) {
      throw new Error(`legacy near redirect target missing: ${to}`);
    }
    writeFileDeep(join(DIST, ...from.split('/').filter(Boolean), 'index.html'), renderLegacyRedirect(to));
  }

  const neighCount = nodes.filter((n) => n.kind === 'neighborhood').length;
  console.log(
    `[generate-near-geo-seo] wrote ${urlEntries.length} geo URLs (${neighCount} neighborhoods) + ${legacyRedirects.length} legacy redirects under dist/near`,
  );
}

main();
