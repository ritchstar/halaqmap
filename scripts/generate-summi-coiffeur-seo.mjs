/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يولّد صفحات سمي تحت dist/summi/** وملف sitemap-summi.xml
 * محور + ثماني نوايا — بلا أحياء وبلا بيانات شركاء.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brandIconLinks, brandPageTypeCss, fazaaMeasurementTagHtml } from './lib/platformBrandIdentity.mjs';
import {
  SUMMI_BRAND_AR,
  SUMMI_CORE_AR,
  SUMMI_CTA_AR,
  SUMMI_FREE_AR,
  SUMMI_HONESTY_AR,
  SUMMI_HUB,
  SUMMI_HUB_PATH,
  SUMMI_INTENT_PAGES,
  SUMMI_LOGO_ABS,
  SUMMI_ORIGIN,
  SUMMI_PROGRAM_AR,
  summiInquireHref,
} from './lib/summiCoiffeurPages.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const JSON_OUT = join(__dirname, '..', 'src', 'config', 'summiCoiffeurPages.json');

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function writeFileDeep(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf8');
}

function syncPagesJson() {
  writeFileSync(
    JSON_OUT,
    `${JSON.stringify(
      {
        version: 1,
        hub: SUMMI_HUB,
        pages: SUMMI_INTENT_PAGES.map((p) => ({
          slug: p.slug,
          intentId: p.intentId,
          path: p.path,
          h1: p.h1,
        })),
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
}

function headerHtml() {
  return `    <header class="brand summi-header">
      <a class="brand-mark" href="${SUMMI_ORIGIN}/#/coiffeur" aria-label="${SUMMI_BRAND_AR}">
        <img src="/images/coiffeur-map-logo-seal-256.webp" width="56" height="56" alt="${SUMMI_BRAND_AR}" decoding="async" fetchpriority="high" />
      </a>
      <a class="brand-lockup" href="${SUMMI_ORIGIN}/#/coiffeur" aria-label="${SUMMI_BRAND_AR}">
        <span class="brand-ar">${SUMMI_BRAND_AR}</span>
        <span class="summi-sub">${SUMMI_PROGRAM_AR} · بحث من موقعك عن مشغل نسائي</span>
      </a>
    </header>
    <nav class="summi-shortcuts" aria-label="ابدئي البحث">
      <a class="summi-chip summi-chip-primary" href="${summiInquireHref('near_open')}">${SUMMI_CTA_AR}</a>
    </nav>`;
}

function headerCss() {
  return `    header.brand { display:flex; align-items:center; gap:.9rem; margin-bottom:.85rem; }
    header.brand img { width:56px; height:56px; border-radius:16px; object-fit:cover; box-shadow:0 0 0 2px rgba(244,212,192,.45), 0 10px 28px rgba(201,139,150,.28); }
    .brand-lockup { display:flex; flex-direction:column; gap:.12rem; text-decoration:none; line-height:1.12; }
    .brand-ar {
      font-family: "Segoe UI", Tahoma, "Noto Naskh Arabic", sans-serif;
      font-weight:800;
      font-size:1.7rem;
      background: linear-gradient(105deg,#f7efe8 0%,#f4d4c0 42%,#e8b4a2 120%);
      -webkit-background-clip:text;
      background-clip:text;
      color:transparent;
    }
    .summi-sub { font-weight:600; font-size:.8rem; color:#e8cfc4; }
    .summi-shortcuts { display:flex; flex-wrap:wrap; gap:.45rem; margin:0 0 1.35rem; }
    .summi-chip {
      display:inline-block; padding:.4rem .75rem; border-radius:999px;
      border:1px solid rgba(244,212,192,.35); background:rgba(42,18,24,.65);
      color:#f7efe8; text-decoration:none; font-weight:700; font-size:.82rem;
    }
    .summi-chip-primary {
      background: linear-gradient(135deg,#e8b4a2,#c98b96);
      color:#2a1218; border-color:transparent;
    }`;
}

function inquireCtaHtml(intentId) {
  return `<p class="cta-wrap"><a class="cta" href="${summiInquireHref(intentId)}">${escapeHtml(
    SUMMI_CTA_AR,
  )}</a></p>`;
}

function siblingLinksHtml(currentSlug) {
  const items = SUMMI_INTENT_PAGES.filter((p) => p.slug !== currentSlug).map(
    (p) => `<li><a href="${escapeHtml(p.path)}">${escapeHtml(p.h1)}</a></li>`,
  );
  if (currentSlug) {
    items.unshift(`<li><a href="${SUMMI_HUB_PATH}">${escapeHtml(SUMMI_HUB.h1)}</a></li>`);
  }
  return `<section>
        <h2>نوايا أخرى</h2>
        <ul class="grid">${items.join('\n')}</ul>
      </section>`;
}

function htmlShell({ title, description, canonical, h1, bodyInner, jsonLd }) {
  return `<!DOCTYPE html>
<html lang="ar-SA" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${SUMMI_LOGO_ABS}" />
  <meta property="og:locale" content="ar_SA" />
  <meta property="og:site_name" content="${SUMMI_BRAND_AR}" />
  <meta name="application-name" content="${SUMMI_BRAND_AR}" />
${brandIconLinks()}
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>
${headerCss()}
${brandPageTypeCss('linear-gradient(180deg,#14080e,#2a1218 55%,#14080e)')}
    :root { color-scheme: dark; --card:#2a1218; --text:#f7efe8; --muted:#e8cfc4; --accent:#f4d4c0; --line:rgba(244,212,192,.28); }
    * { box-sizing: border-box; }
    .wrap { max-width: 44rem; margin: 0 auto; padding: 1.5rem 1.15rem 3rem; }
    .note { color:var(--muted); font-size:.95rem; }
    .crumbs { font-size:.9rem; color:var(--muted); margin-bottom:1rem; }
    .crumbs a { color:var(--accent); }
    .grid { list-style:none; padding:0; margin:1rem 0; display:grid; gap:.65rem; }
    .grid a { display:block; padding:.85rem 1rem; border:1px solid var(--line); border-radius:12px; background:var(--card); color:var(--text); text-decoration:none; font-weight:600; }
    .cta-wrap { margin: 1.35rem 0 1.75rem; }
    .cta { display:block; width:100%; text-align:center; background: linear-gradient(135deg,#e8b4a2,#c98b96); color:#2a1218; font-weight:800; padding:1.05rem 1.25rem; border-radius:12px; text-decoration:none; font-size:1.15rem; }
    details { border:1px solid var(--line); border-radius:12px; padding:.75rem 1rem; margin:.55rem 0; background:rgba(42,18,24,.7); }
    summary { cursor:pointer; font-weight:700; }
    footer { margin-top:2.5rem; padding-top:1rem; border-top:1px solid var(--line); color:var(--muted); font-size:.85rem; }
  </style>
${fazaaMeasurementTagHtml()}
</head>
<body>
  <div class="wrap">
${headerHtml()}
    <main>
      <h1>${escapeHtml(h1)}</h1>
      ${bodyInner}
    </main>
    <footer>
      <p>${SUMMI_BRAND_AR} سطح قطاعي تابع لمنصة ${SUMMI_CORE_AR}.</p>
      <p>${escapeHtml(SUMMI_FREE_AR)}</p>
    </footer>
  </div>
</body>
</html>`;
}

function renderHub() {
  const canonical = `${SUMMI_ORIGIN}${SUMMI_HUB_PATH}`;
  const links = SUMMI_INTENT_PAGES.map(
    (p) => `<li><a href="${p.path}">${escapeHtml(p.h1)}</a></li>`,
  ).join('\n');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: SUMMI_HUB.title,
        url: canonical,
        inLanguage: 'ar-SA',
        description: SUMMI_HUB.description,
        isPartOf: { '@type': 'WebApplication', name: SUMMI_BRAND_AR, url: `${SUMMI_ORIGIN}/#/coiffeur` },
      },
      {
        '@type': 'ItemList',
        itemListElement: SUMMI_INTENT_PAGES.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: p.h1,
          url: `${SUMMI_ORIGIN}${p.path}`,
        })),
      },
    ],
  };
  return htmlShell({
    title: SUMMI_HUB.title,
    description: SUMMI_HUB.description,
    canonical,
    h1: SUMMI_HUB.h1,
    jsonLd,
    bodyInner: `
      <p class="lead">${escapeHtml(SUMMI_HUB.lead)}</p>
      ${inquireCtaHtml('near_open')}
      <p class="note">${escapeHtml(SUMMI_HONESTY_AR)}</p>
      <ul class="grid">${links}</ul>
    `,
  });
}

function renderPage(page) {
  const canonical = `${SUMMI_ORIGIN}${page.path}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: page.title,
        url: canonical,
        inLanguage: 'ar-SA',
        description: page.description,
        isPartOf: { '@type': 'WebApplication', name: SUMMI_BRAND_AR, url: `${SUMMI_ORIGIN}/#/coiffeur` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SUMMI_BRAND_AR, item: `${SUMMI_ORIGIN}/#/coiffeur` },
          { '@type': 'ListItem', position: 2, name: SUMMI_PROGRAM_AR, item: `${SUMMI_ORIGIN}${SUMMI_HUB_PATH}` },
          { '@type': 'ListItem', position: 3, name: page.h1, item: canonical },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `كيف أبحث عن ${page.h1}؟`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `اضغطي «${SUMMI_CTA_AR}» واسمحي بالموقع مرة واحدة. ${SUMMI_HONESTY_AR}`,
            },
          },
          {
            '@type': 'Question',
            name: 'هل أحتاج تطبيقاً أو حساباً؟',
            acceptedAnswer: {
              '@type': 'Answer',
              text: SUMMI_FREE_AR,
            },
          },
        ],
      },
    ],
  };
  return htmlShell({
    title: page.title,
    description: page.description,
    canonical,
    h1: page.h1,
    jsonLd,
    bodyInner: `
      <nav class="crumbs"><a href="${SUMMI_HUB_PATH}">${SUMMI_PROGRAM_AR}</a> / <span>${escapeHtml(page.h1)}</span></nav>
      <p class="lead">${escapeHtml(page.lead)}</p>
      ${inquireCtaHtml(page.intentId)}
      <p class="note">${escapeHtml(SUMMI_HONESTY_AR)}</p>
      ${siblingLinksHtml(page.slug)}
      <section>
        <h2>سؤال واحد</h2>
        <details>
          <summary>كيف أبدأ من موقعي؟</summary>
          <p>اضغطي «${escapeHtml(SUMMI_CTA_AR)}» ثم اسمحي بالموقع. نعرض المشاغل المفعّلة في محيطك فقط.</p>
        </details>
      </section>
    `,
  });
}

function main() {
  syncPagesJson();
  const lastmod = new Date().toISOString().slice(0, 10);
  writeFileDeep(join(DIST, 'summi', 'index.html'), renderHub());
  const urlEntries = [{ loc: `${SUMMI_ORIGIN}${SUMMI_HUB_PATH}`, priority: '0.9' }];

  for (const page of SUMMI_INTENT_PAGES) {
    writeFileDeep(join(DIST, 'summi', page.slug, 'index.html'), renderPage(page));
    urlEntries.push({ loc: `${SUMMI_ORIGIN}${page.path}`, priority: '0.82' });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
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
  writeFileDeep(join(DIST, 'sitemap-summi.xml'), sitemap);
  console.log(
    `[generate-summi-coiffeur-seo] wrote hub + ${SUMMI_INTENT_PAGES.length} pages under dist/summi + sitemap-summi.xml`,
  );
}

main();
