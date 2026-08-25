/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يولّد dist/terms وdist/about وdist/privacy-policy بـ canonical مستقل عن الرئيسية.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PUBLIC_LEGAL_ORIGIN, PUBLIC_LEGAL_PAGES } from './data/publicLegalSeoPages.mjs';
import {
  BRAND_LOGO_ABS,
  BRAND_SITE_NAME,
  brandHeaderCss,
  brandHeaderHtml,
  brandIconLinks,
  brandPageTypeCss,
  fazaaMeasurementTagHtml,
} from './lib/platformBrandIdentity.mjs';
import { FAZAA_MARKETING_FOOTER_AR } from './lib/fazaaCitySeoBranches.mjs';
import { escapeHtml, markdownLiteToHtml } from './lib/markdownLiteHtml.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

export function writeFileDeep(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf8');
}

function legalNavHtml(currentPath) {
  const links = PUBLIC_LEGAL_PAGES.map((page) => {
    const href = page.path;
    const label =
      page.id === 'about' ? 'من نحن' : page.id === 'terms' ? 'شروط الاستخدام' : 'سياسة الخصوصية';
    if (page.path === currentPath) return `<span>${escapeHtml(label)}</span>`;
    return `<a href="${href}">${escapeHtml(label)}</a>`;
  });
  return `<nav class="crumbs" aria-label="صفحات المنصة"><a href="${PUBLIC_LEGAL_ORIGIN}/">الرئيسية</a> / ${links.join(' · ')}</nav>`;
}

export function renderPublicLegalPage(page) {
  const canonical = `${PUBLIC_LEGAL_ORIGIN}${page.path}`;
  const bodyInner = `
      ${legalNavHtml(page.path)}
      <p class="lead">${escapeHtml(page.descriptionAr)}</p>
      ${page.sections
        .map(
          (section) => `<article class="card">
        <h2>${escapeHtml(section.titleAr)}</h2>
        ${markdownLiteToHtml(section.bodyAr)}
      </article>`,
        )
        .join('\n')}
  `;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: page.titleAr,
        url: canonical,
        inLanguage: 'ar-SA',
        description: page.descriptionAr,
        isPartOf: { '@type': 'WebApplication', name: 'حلاق ماب', url: `${PUBLIC_LEGAL_ORIGIN}/` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'حلاق ماب', item: `${PUBLIC_LEGAL_ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: page.h1Ar, item: canonical },
        ],
      },
    ],
  };
  return `<!DOCTYPE html>
<html lang="ar-SA" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(page.titleAr)}</title>
  <meta name="description" content="${escapeHtml(page.descriptionAr)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta property="og:title" content="${escapeHtml(page.titleAr)}" />
  <meta property="og:description" content="${escapeHtml(page.descriptionAr)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${BRAND_LOGO_ABS}" />
  <meta property="og:locale" content="ar_SA" />
  <meta property="og:site_name" content="${BRAND_SITE_NAME}" />
  <meta name="application-name" content="${BRAND_SITE_NAME}" />
${brandIconLinks()}
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>
${brandHeaderCss()}
    :root { color-scheme: dark; --card:#0c1a2e; --text:#e8eef7; --muted:#94a3b8; --accent:#2dd4bf; --line:rgba(45,212,191,.25); }
    * { box-sizing: border-box; }
${brandPageTypeCss()}
    .wrap { max-width: 44rem; margin: 0 auto; padding: 1.5rem 1.15rem 3rem; }
    .lead { color:var(--muted); font-size:1.05rem; line-height:1.9; }
    .crumbs { font-size:.9rem; color:var(--muted); margin-bottom:1rem; }
    .crumbs a { color:var(--accent); }
    .card { border:1px solid var(--line); border-radius:14px; background:var(--card); padding:1rem 1.1rem; margin:1rem 0; }
    .card h2 { margin:0 0 .65rem; font-size:1.2rem; }
    .card p, .card li { color:var(--text); line-height:1.85; }
    .card ul { margin:.35rem 0; padding-inline-start:1.2rem; }
    footer { margin-top:2.5rem; padding-top:1rem; border-top:1px solid var(--line); color:var(--muted); font-size:.85rem; }
  </style>
${fazaaMeasurementTagHtml()}
</head>
<body>
  <div class="wrap">
${brandHeaderHtml()}
    <main>
      <h1>${escapeHtml(page.h1Ar)}</h1>
      ${bodyInner}
    </main>
    <footer>
      <p>${FAZAA_MARKETING_FOOTER_AR}</p>
    </footer>
  </div>
</body>
</html>`;
}

export function writePublicLegalPages(distRoot = DIST) {
  for (const page of PUBLIC_LEGAL_PAGES) {
    writeFileDeep(join(distRoot, ...page.distDir, 'index.html'), renderPublicLegalPage(page));
  }
}

function main() {
  writePublicLegalPages(DIST);
  console.log(
    `[generate-public-legal-seo] wrote ${PUBLIC_LEGAL_PAGES.map((p) => p.path).join(', ')}`,
  );
}

const isDirectRun = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) main();
