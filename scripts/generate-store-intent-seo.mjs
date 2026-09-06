/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * يولّد dist/need/store/index.html + dist/need/{slug}/index.html — نية بحث منتجات المتجر.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_INTENT_HUB, STORE_INTENT_PAGES } from './data/storeIntentLandingPages.mjs';
import {
  BRAND_ICON_VERSION,
  BRAND_LOGO_ABS,
  BRAND_LOGO_PATH,
  BRAND_LOGO_PATH_2X,
  BRAND_SITE_NAME,
  brandIconLinks,
  brandPageTypeCss,
  fazaaMeasurementTagHtml,
} from './lib/platformBrandIdentity.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const STORE_INTENT_ORIGIN = 'https://www.halaqmap.com';
export const STORE_INTENT_HUB_PATH = '/need/store';
const STORE_ORIGIN = 'https://store.halaqmap.com';

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function writeFileDeep(root, filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf8');
}

function storeHeaderHtml() {
  return `    <header class="brand store-header">
      <a class="brand-mark" href="${STORE_ORIGIN}/store" aria-label="خريطة الحل — المتجر">
        <img src="${BRAND_LOGO_PATH}?v=${BRAND_ICON_VERSION}" srcset="${BRAND_LOGO_PATH}?v=${BRAND_ICON_VERSION} 1x, ${BRAND_LOGO_PATH_2X}?v=${BRAND_ICON_VERSION} 2x" width="56" height="56" alt="خريطة الحل" decoding="async" fetchpriority="high" />
      </a>
      <a class="brand-lockup" href="${STORE_ORIGIN}/store" aria-label="متجر خريطة الحل">
        <span class="brand-ar">خريطة الحل</span>
        <span class="brand-en" dir="ltr">HALAQ MAP STORE</span>
        <span class="store-sub">حلول أعمال · منتج واحد لكل صفحة</span>
      </a>
    </header>
    <nav class="store-shortcuts" aria-label="روابط المتجر">
      <a class="store-chip store-chip-primary" href="${STORE_ORIGIN}/store">متجر خريطة الحل</a>
      <a class="store-chip" href="${STORE_INTENT_HUB_PATH}">كل الحلول</a>
    </nav>`;
}

function storeHeaderCss() {
  return `    header.store-header { display:flex; align-items:center; gap:.9rem; margin-bottom:.85rem; }
    header.store-header img { width:56px; height:56px; border-radius:16px; object-fit:cover; box-shadow:0 0 0 2px rgba(251,191,36,.35), 0 10px 28px rgba(120,53,15,.25); }
    .brand-lockup { display:flex; flex-direction:column; gap:.12rem; text-decoration:none; line-height:1.12; }
    .brand-ar {
      font-family: "Segoe UI", Tahoma, "Noto Naskh Arabic", sans-serif;
      font-weight:700; font-size:1.65rem; letter-spacing:-0.01em;
      background: linear-gradient(105deg,#fde68a 0%,#fbbf24 45%,#f59e0b 120%);
      -webkit-background-clip:text; background-clip:text; color:transparent;
    }
    .brand-en { font-family: system-ui, sans-serif; font-weight:800; font-size:.68rem; letter-spacing:.18em; color:#fcd34d; text-transform:uppercase; }
    .store-sub { font-family: "Segoe UI", Tahoma, sans-serif; font-weight:600; font-size:.8rem; color:#94a3b8; }
    .store-shortcuts { display:flex; flex-wrap:wrap; gap:.45rem; margin:0 0 1.35rem; }
    .store-chip {
      display:inline-block; padding:.4rem .75rem; border-radius:999px;
      border:1px solid rgba(251,191,36,.28); background:rgba(30,20,8,.55);
      color:#fde68a; text-decoration:none; font-weight:700; font-size:.82rem;
    }
    .store-chip:hover { border-color:#fbbf24; color:#fff; }
    .store-chip-primary { background: linear-gradient(135deg,#d97706,#b45309); color:#1c1204; border-color:transparent; }`;
}

function listItems(items) {
  return `<ul class="bullets">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function faqHtml(faq) {
  return `<section class="card faq" aria-labelledby="faq-heading">
      <h2 id="faq-heading">أسئلة شائعة</h2>
      <dl>${faq
        .map(
          (row) => `<div class="faq-row">
          <dt>${escapeHtml(row.q)}</dt>
          <dd>${escapeHtml(row.a)}</dd>
        </div>`,
        )
        .join('')}</dl>
    </section>`;
}

export function renderStoreIntentPage(page, { distRoot } = {}) {
  const path = `/need/${page.slug}`;
  const canonical = `${STORE_INTENT_ORIGIN}${path}`;
  const indexable = page.indexable !== false;
  const robots = indexable ? 'index, follow' : 'noindex, follow';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: page.title,
        url: canonical,
        inLanguage: 'ar-SA',
        description: page.description,
        about: page.product,
        isPartOf: { '@type': 'WebSite', name: 'خريطة الحل', url: STORE_ORIGIN },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'خريطة الحل', item: `${STORE_INTENT_ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'حلول الأعمال', item: `${STORE_INTENT_ORIGIN}${STORE_INTENT_HUB_PATH}` },
          { '@type': 'ListItem', position: 3, name: page.h1, item: canonical },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faq.map((row) => ({
          '@type': 'Question',
          name: row.q,
          acceptedAnswer: { '@type': 'Answer', text: row.a },
        })),
      },
    ],
  };

  const bodyInner = `
      <nav class="crumbs"><a href="${STORE_INTENT_ORIGIN}/">الرئيسية</a> / <a href="${STORE_INTENT_HUB_PATH}">حلول الأعمال</a> / <span>${escapeHtml(page.product)}</span></nav>
      <p class="product-tag">${escapeHtml(page.product)}</p>
      <p class="lead">${escapeHtml(page.problem)}</p>
      <section class="card">
        <h2>كيف يساعدك ${escapeHtml(page.product)}</h2>
        <p>${escapeHtml(page.solution)}</p>
      </section>
      <section class="card">
        <h2>ما الذي تحصل عليه</h2>
        ${listItems(page.benefits)}
      </section>
      <section class="card muted-card">
        <h2>ما لا نفعله في هذه الصفحة</h2>
        ${listItems(page.notThis)}
      </section>
      ${faqHtml(page.faq)}
      <p class="cta-wrap"><a class="cta" href="${escapeHtml(page.ctaUrl)}" rel="noopener">${escapeHtml(page.ctaText)}</a></p>
      <p class="keywords" aria-label="كلمات مفتاحية">${escapeHtml(page.keywords)}</p>
  `;

  return htmlShell({
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    canonical,
    robots,
    h1: page.h1,
    bodyInner,
    jsonLd,
  });
}

function htmlShell({ title, description, keywords, canonical, robots, h1, bodyInner, jsonLd }) {
  return `<!DOCTYPE html>
<html lang="ar-SA" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="keywords" content="${escapeHtml(keywords)}" />
  <meta name="robots" content="${robots}" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${BRAND_LOGO_ABS}" />
  <meta property="og:locale" content="ar_SA" />
  <meta property="og:site_name" content="${BRAND_SITE_NAME}" />
${brandIconLinks()}
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>
${storeHeaderCss()}
${brandPageTypeCss('linear-gradient(180deg,#120a04,#1a1208 55%,#0c0804)')}
    :root { color-scheme: dark; --card:#1a1208; --text:#f8fafc; --muted:#94a3b8; --accent:#fbbf24; --line:rgba(251,191,36,.22); }
    * { box-sizing: border-box; }
    .wrap { max-width: 44rem; margin: 0 auto; padding: 1.5rem 1.15rem 3rem; }
    .crumbs { font-size:.9rem; color:var(--muted); margin-bottom:1rem; }
    .crumbs a { color:var(--accent); }
    .product-tag { display:inline-block; margin:0 0 .75rem; padding:.25rem .7rem; border-radius:999px; border:1px solid var(--line); color:#fde68a; font-size:.85rem; font-weight:700; }
    .card { border:1px solid var(--line); border-radius:14px; background:var(--card); padding:1rem 1.1rem; margin:1rem 0; }
    .muted-card h2 { color:#cbd5e1; }
    .bullets { margin:.35rem 0 0; padding-right:1.2rem; }
    .bullets li { margin:.35rem 0; }
    .faq-row { margin:.85rem 0; }
    .faq-row dt { font-weight:700; color:#fde68a; margin-bottom:.25rem; }
    .faq-row dd { margin:0; color:var(--text); }
    .cta-wrap { margin:1.5rem 0 .75rem; }
    .cta { display:inline-block; background: linear-gradient(135deg,#d97706,#b45309); color:#1c1204; font-weight:800; padding:.9rem 1.3rem; border-radius:12px; text-decoration:none; }
    .grid { list-style:none; padding:0; margin:1rem 0; display:grid; gap:.65rem; }
    .grid a { display:block; padding:.85rem 1rem; border:1px solid var(--line); border-radius:12px; background:var(--card); color:var(--text); text-decoration:none; }
    .grid a strong { color:#fde68a; }
    footer { margin-top:2.5rem; padding-top:1rem; border-top:1px solid var(--line); color:var(--muted); font-size:.85rem; }
  </style>
${fazaaMeasurementTagHtml()}
</head>
<body>
  <div class="wrap">
${storeHeaderHtml()}
    <main>
      <h1>${escapeHtml(h1)}</h1>
      ${bodyInner}
    </main>
    <footer>
      <p>خريطة الحل — شريك تقني. تفاصيل الأسعار والباقات في صفحة المنتج المرتبطة أعلاه.</p>
    </footer>
  </div>
</body>
</html>`;
}

export function renderStoreIntentHub(pages = STORE_INTENT_PAGES) {
  const canonical = `${STORE_INTENT_ORIGIN}${STORE_INTENT_HUB_PATH}`;
  const links = pages
    .map(
      (p) =>
        `<li><a href="/need/${p.slug}"><strong>${escapeHtml(p.product)}</strong> — ${escapeHtml(p.h1)}</a></li>`,
    )
    .join('\n');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: STORE_INTENT_HUB.title,
        url: canonical,
        inLanguage: 'ar-SA',
        description: STORE_INTENT_HUB.description,
        isPartOf: { '@type': 'WebSite', name: 'خريطة الحل', url: STORE_ORIGIN },
      },
      {
        '@type': 'ItemList',
        itemListElement: pages.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: p.product,
          url: `${STORE_INTENT_ORIGIN}/need/${p.slug}`,
        })),
      },
    ],
  };
  return htmlShell({
    title: STORE_INTENT_HUB.title,
    description: STORE_INTENT_HUB.description,
    keywords: 'حلول أعمال، متجر خريطة الحل، صفحات نية بحث',
    canonical,
    robots: 'index, follow',
    h1: STORE_INTENT_HUB.h1,
    bodyInner: `
      <p class="lead">${escapeHtml(STORE_INTENT_HUB.description)}</p>
      <ul class="grid">${links}</ul>
    `,
    jsonLd,
  });
}

export function buildStoreIntentSitemapXml(pages = STORE_INTENT_PAGES) {
  const urls = [
    { loc: `${STORE_INTENT_ORIGIN}${STORE_INTENT_HUB_PATH}`, priority: '0.88', changefreq: 'weekly' },
    ...pages
      .filter((p) => p.indexable !== false)
      .map((p) => ({
        loc: `${STORE_INTENT_ORIGIN}/need/${p.slug}`,
        priority: '0.84',
        changefreq: 'weekly',
      })),
  ];
  const body = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

export function writeStoreIntentSeo(distRoot) {
  writeFileDeep(distRoot, join(distRoot, 'need', 'store', 'index.html'), renderStoreIntentHub());
  for (const page of STORE_INTENT_PAGES) {
    writeFileDeep(
      distRoot,
      join(distRoot, 'need', page.slug, 'index.html'),
      renderStoreIntentPage(page, { distRoot }),
    );
  }
  writeFileDeep(distRoot, join(distRoot, 'sitemap-store-intent.xml'), buildStoreIntentSitemapXml());
}

function main() {
  const distRoot = join(__dirname, '..', 'dist');
  writeStoreIntentSeo(distRoot);
  const indexed = STORE_INTENT_PAGES.filter((p) => p.indexable !== false).length;
  console.log(
    `[generate-store-intent-seo] wrote hub + ${STORE_INTENT_PAGES.length} pages (${indexed} indexable) + sitemap-store-intent.xml`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
