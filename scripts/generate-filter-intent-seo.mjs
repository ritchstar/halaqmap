/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * يولّد dist/need/index.html + dist/need/{slug}/index.html — فزعات حسب الحاجة.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FILTER_INTENT_PAGES as PAGES } from './data/filterIntentLandingPages.mjs';
import {
  BRAND_SITE_NAME,
  brandHeaderCss,
  brandHeaderHtml,
  brandIconLinks,
  brandPageTypeCss,
  fazaaMeasurementTagHtml,
  nearSearchPhrasesCss,
} from './lib/platformBrandIdentity.mjs';
import { FAZAA_MARKETING_FOOTER_AR } from './lib/fazaaCitySeoBranches.mjs';
import {
  needPromoCss,
  needPromoHtml,
  needPromoShareMeta,
  syncNeedPromoImage,
} from './lib/needLandingPromo.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://www.halaqmap.com';
const HUB = '/need';
const JSON_OUT = join(ROOT, 'src', 'config', 'filterIntentLandingPages.json');

/** يُزامن JSON المستخدم في الواجهة مع مصدر الصفحات */
function syncLandingPagesJson() {
  writeFileSync(
    JSON_OUT,
    `${JSON.stringify({ version: 1, pages: PAGES }, null, 2)}\n`,
    'utf8',
  );
}

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
${needPromoShareMeta({ origin: ORIGIN, title })}
  <meta property="og:locale" content="ar_SA" />
  <meta property="og:site_name" content="${BRAND_SITE_NAME}" />
  <meta name="application-name" content="${BRAND_SITE_NAME}" />
${brandIconLinks()}
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>
${brandHeaderCss()}
${nearSearchPhrasesCss()}
${needPromoCss()}
    :root { color-scheme: dark; --card:#0c1a2e; --text:#e8eef7; --muted:#94a3b8; --accent:#2dd4bf; --line:rgba(45,212,191,.25); }
    * { box-sizing: border-box; }
${brandPageTypeCss()}
    .wrap { max-width: 44rem; margin: 0 auto; padding: 1.5rem 1.15rem 3rem; }
    .note { color:var(--muted); font-size:.95rem; }
    .crumbs { font-size:.9rem; color:var(--muted); margin-bottom:1rem; }
    .crumbs a { color:var(--accent); }
    .grid { list-style:none; padding:0; margin:1rem 0; display:grid; gap:.65rem; }
    .grid a { display:block; padding:.85rem 1rem; border:1px solid var(--line); border-radius:12px; background:var(--card); color:var(--text); text-decoration:none; font-weight:600; }
    .cta { display:inline-block; background: linear-gradient(135deg,#0d9488,#0891b2); color:#041016; font-weight:800; padding:.9rem 1.3rem; border-radius:12px; text-decoration:none; }
    .chip { display:inline-block; margin:.2rem .35rem .2rem 0; padding:.25rem .65rem; border-radius:999px; border:1px solid var(--line); color:var(--muted); font-size:.85rem; }
    .card { border:1px solid var(--line); border-radius:14px; background:var(--card); padding:1rem 1.1rem; margin:1rem 0; }
    footer { margin-top:2.5rem; padding-top:1rem; border-top:1px solid var(--line); color:var(--muted); font-size:.85rem; }
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
    </footer>
  </div>
</body>
</html>`;
}

const VISITOR_FAQ = [
  {
    name: 'كيف أجد حلاقاً قريباً؟',
    text: 'اضغط «ابحث من موقعك» واسمح بالمكان مرة واحدة. تظهر الصالونات القريبة للتواصل والاتجاه.',
  },
  {
    name: 'هل أحتاج تطبيقاً أو حساباً؟',
    text: 'لا. البحث مجاني بلا تطبيق وبلا تسجيل.',
  },
  {
    name: 'ماذا أرى بعد البحث؟',
    text: 'تظهر الصالونات القريبة بالاسم والصور ورقم التواصل، وزر يفتح الخرائط للوصول إليها.',
  },
];

function visitorFaqJsonLd() {
  return {
    '@type': 'FAQPage',
    mainEntity: VISITOR_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.name,
      acceptedAnswer: { '@type': 'Answer', text: item.text },
    })),
  };
}

function visitorFaqHtml() {
  return `<section>
      <h2>أسئلة سريعة</h2>
      ${VISITOR_FAQ.map(
        (item) => `<details>
        <summary>${escapeHtml(item.name)}</summary>
        <p>${escapeHtml(item.text)}</p>
      </details>`,
      ).join('\n      ')}
    </section>`;
}

function renderHub() {
  const title = 'اقرب حلاق من موقعك | حلاق ماب';
  const description =
    'ابحث من موقعك عن أقرب حلاق رجالي. اضغط البحث واسمح بالمكان — تظهر الصالونات القريبة للتواصل والاتجاه. بلا تطبيق وبلا حساب.';
  const canonical = `${ORIGIN}${HUB}`;
  const links = PAGES.map(
    (p) => `<li><a href="${HUB}/${p.slug}">${escapeHtml(p.h1)}</a></li>`,
  ).join('\n');
  const jsonLd = {
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
        itemListElement: PAGES.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: p.h1,
          url: `${ORIGIN}${HUB}/${p.slug}`,
        })),
      },
      visitorFaqJsonLd(),
    ],
  };
  return htmlShell({
    title,
    description,
    canonical,
    h1: 'اقرب حلاق من موقعك',
    bodyInner: `
      <p class="lead">تبحث عن أقرب حلاق؟ اضغط البحث واسمح بالمكان.</p>
      ${needPromoHtml({ origin: ORIGIN })}
      <ul class="grid">${links}</ul>
      ${visitorFaqHtml()}
    `,
    jsonLd,
  });
}

function renderPage(page) {
  const path = `${HUB}/${page.slug}`;
  const canonical = `${ORIGIN}${path}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: page.title,
        url: canonical,
        inLanguage: 'ar-SA',
        description: page.description,
        isPartOf: { '@type': 'WebApplication', name: 'حلاق ماب', url: `${ORIGIN}/` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'حلاق ماب', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'أقرب حلاق', item: `${ORIGIN}${HUB}` },
          { '@type': 'ListItem', position: 3, name: page.h1, item: canonical },
        ],
      },
      visitorFaqJsonLd(),
    ],
  };
  return htmlShell({
    title: page.title,
    description: page.description,
    canonical,
    h1: page.h1,
    bodyInner: `
      <nav class="crumbs"><a href="${ORIGIN}/">الرئيسية</a> / <a href="${HUB}">أقرب حلاق</a> / <span>${escapeHtml(page.h1)}</span></nav>
      <p class="lead">${escapeHtml(page.lead)}</p>
      ${needPromoHtml({ origin: ORIGIN, slug: page.slug, fetchPriority: 'high' })}
      <p class="note">${escapeHtml(page.body)}</p>
      ${visitorFaqHtml()}
    `,
    jsonLd,
  });
}

function main() {
  syncNeedPromoImage(DIST);
  syncLandingPagesJson();
  writeFileDeep(join(DIST, 'need', 'index.html'), renderHub());
  for (const page of PAGES) {
    writeFileDeep(join(DIST, 'need', page.slug, 'index.html'), renderPage(page));
  }
  console.log(`[generate-filter-intent-seo] synced JSON + wrote hub + ${PAGES.length} pages under dist/need`);
}

main();
