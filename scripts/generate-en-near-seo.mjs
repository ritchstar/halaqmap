/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يولّد صفحات فزعة الإنجليزية تحت dist/en/near/** وملف sitemap-en.xml
 * محور + الرياض + مكة فقط — بدون أحياء وبدون بيانات شركاء.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BRAND_LOGO_ABS,
  BRAND_NAME_AR,
  BRAND_NAME_EN,
  BRAND_SITE_NAME,
  ORIGIN,
  brandHeaderCss,
  brandHeaderHtml,
  brandIconLinks,
  brandPageTypeCss,
  fazaaMeasurementTagHtml,
  nearSearchPhrasesCss,
} from './lib/platformBrandIdentity.mjs';
import {
  FAZAA_EN_NEAR_CTA,
  FAZAA_EN_NEAR_FOOTER,
  FAZAA_EN_NEAR_PAGES,
  HOME_INQUIRE_HREF,
  hreflangLinksHtml,
  languageSwitchForEnPage,
} from './lib/fazaaEnNearPages.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inquireCtaHtml() {
  return `<p class="cta-wrap"><a class="cta cta-home" href="${HOME_INQUIRE_HREF}">${escapeHtml(
    FAZAA_EN_NEAR_CTA,
  )}</a></p>`;
}

function siblingLinksHtml(page) {
  const items = FAZAA_EN_NEAR_PAGES.filter((p) => p.id !== page.id).map((p) => {
    const label = p.citySlug ? `Find a barber in ${p.nameEn}` : p.h1;
    return `<li><a href="${escapeHtml(p.enPath)}">${escapeHtml(label)}</a></li>`;
  });
  items.push(
    `<li><a href="${escapeHtml(page.arPath)}" hreflang="ar-SA" lang="ar">Arabic page — ${escapeHtml(
      page.nameAr,
    )}</a></li>`,
  );
  const heading = page.citySlug ? 'Related pages' : 'Start in a city';
  return `<section>
        <h2>${heading}</h2>
        <ul class="grid">${items.join('\n')}</ul>
      </section>`;
}

function jsonLdGraph(page) {
  const pageUrl = `${ORIGIN}${page.enPath}`;
  const placeId = `${pageUrl}#place`;
  const place = {
    '@type': page.placeType,
    '@id': placeId,
    name: page.nameEn,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: page.lat,
      longitude: page.lng,
    },
  };
  if (page.placeType === 'Country') {
    place.alternateName = 'KSA';
  }
  if (Array.isArray(page.aliasesEn) && page.aliasesEn.length > 0) {
    place.alternateName = page.aliasesEn;
  }

  const crumbs = [
    { name: 'HalaqMap', item: `${ORIGIN}/` },
    { name: 'Find a barber', item: `${ORIGIN}/en/near` },
  ];
  if (page.citySlug) {
    crumbs.push({ name: page.nameEn, item: pageUrl });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${ORIGIN}/#organization`,
        name: BRAND_NAME_AR,
        alternateName: BRAND_NAME_EN,
        url: `${ORIGIN}/`,
      },
      {
        '@type': 'WebApplication',
        '@id': `${ORIGIN}/#webapp`,
        name: BRAND_NAME_AR,
        alternateName: BRAND_NAME_EN,
        url: `${ORIGIN}/`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        inLanguage: ['ar-SA', 'en'],
        provider: { '@id': `${ORIGIN}/#organization` },
        description:
          'A software inquiry that helps you find a nearby barber from your location in Saudi Arabia.',
      },
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#page`,
        name: page.h1,
        url: pageUrl,
        inLanguage: 'en',
        isPartOf: { '@id': `${ORIGIN}/#webapp` },
        about: { '@id': placeId },
        spatialCoverage: { '@id': placeId },
        description: page.description,
        mainEntity: { '@id': `${ORIGIN}/#webapp` },
      },
      place,
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: crumbs.map((b, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: b.name,
          item: b.item,
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: page.faq.q,
            acceptedAnswer: { '@type': 'Answer', text: page.faq.a },
          },
        ],
      },
    ],
  };
}

function crumbsHtml(page) {
  const parts = [
    `<a href="${ORIGIN}/">HalaqMap</a>`,
    page.citySlug
      ? `<a href="/en/near">Find a barber</a>`
      : `<span>Find a barber</span>`,
  ];
  if (page.citySlug) {
    parts.push(`<span>${escapeHtml(page.nameEn)}</span>`);
  }
  return `<nav class="crumbs" aria-label="Breadcrumb">${parts.join(
    ' <span aria-hidden="true">/</span> ',
  )}</nav>`;
}

function renderPage(page) {
  const canonical = `${ORIGIN}${page.enPath}`;
  const shareImage = BRAND_LOGO_ABS;
  const jsonLd = jsonLdGraph(page);
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}" />
  <meta name="keywords" content="${escapeHtml(page.keywords)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
${hreflangLinksHtml(page.arPath, page.enPath)}
  <meta property="og:title" content="${escapeHtml(page.title)}" />
  <meta property="og:description" content="${escapeHtml(page.description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${escapeHtml(shareImage)}" />
  <meta property="og:image:alt" content="${escapeHtml(page.title)}" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:locale:alternate" content="ar_SA" />
  <meta property="og:site_name" content="${BRAND_SITE_NAME}" />
  <meta name="application-name" content="${BRAND_SITE_NAME}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(page.title)}" />
  <meta name="twitter:description" content="${escapeHtml(page.description)}" />
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
  </style>
${fazaaMeasurementTagHtml()}
</head>
<body>
  <div class="wrap">
${brandHeaderHtml({ lang: 'en' })}
    <main>
      <h1>${escapeHtml(page.h1)}</h1>
      ${crumbsHtml(page)}
      <p class="lead">${escapeHtml(page.lead)}</p>
      ${inquireCtaHtml()}
      ${siblingLinksHtml(page)}
      <section>
        <h2>One question</h2>
        <details>
          <summary>${escapeHtml(page.faq.q)}</summary>
          <p>${escapeHtml(page.faq.a)}</p>
        </details>
      </section>
    </main>
    <footer>
      <p>${escapeHtml(FAZAA_EN_NEAR_FOOTER)}</p>
      ${languageSwitchForEnPage(page)}
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

function main() {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urlEntries = [];

  for (const page of FAZAA_EN_NEAR_PAGES) {
    const html = renderPage(page);
    writeFileDeep(join(DIST, ...page.enPath.split('/').filter(Boolean), 'index.html'), html);
    urlEntries.push({ loc: `${ORIGIN}${page.enPath}`, priority: page.priority, ar: page.arPath });
  }

  const sitemapEn = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${u.loc}" />
    <xhtml:link rel="alternate" hreflang="ar-SA" href="${ORIGIN}${u.ar}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}${u.ar}" />
  </url>`,
  )
  .join('\n')}
</urlset>
`;
  writeFileDeep(join(DIST, 'sitemap-en.xml'), sitemapEn);
  console.log(
    `[generate-en-near-seo] wrote ${urlEntries.length} English URLs under dist/en/near + sitemap-en.xml`,
  );
}

main();
