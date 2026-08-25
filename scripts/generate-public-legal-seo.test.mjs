/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * تشغيل: node scripts/generate-public-legal-seo.test.mjs
 */
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLIC_LEGAL_PAGES } from './data/publicLegalSeoPages.mjs';
import { markdownLiteToHtml } from './lib/markdownLiteHtml.mjs';
import { renderPublicLegalPage, writePublicLegalPages } from './generate-public-legal-seo.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

assert.equal(PUBLIC_LEGAL_PAGES.length, 3);
assert.deepEqual(
  PUBLIC_LEGAL_PAGES.map((p) => p.path),
  ['/about', '/terms', '/privacy-policy'],
);

for (const page of PUBLIC_LEGAL_PAGES) {
  const html = renderPublicLegalPage(page);
  assert.match(html, new RegExp(`<link rel="canonical" href="https://www.halaqmap.com${page.path}"`));
  assert.match(html, /<meta name="robots" content="index, follow"/);
  assert.doesNotMatch(html, /canonical" href="https:\/\/www\.halaqmap\.com\/"/);
  assert.doesNotMatch(html, /<title>اقرب حلاق/);
  assert.match(html, new RegExp(`<h1>${page.h1Ar}</h1>`));
  assert.match(html, /lang="ar-SA"/);
  assert.match(html, /dir="rtl"/);
}

const terms = renderPublicLegalPage(PUBLIC_LEGAL_PAGES.find((p) => p.id === 'terms'));
assert.match(terms, /شروط الاستخدام/);
assert.match(terms, /لا تعمل بصفة وسيط تجاري/);
assert.doesNotMatch(terms, /store_wedding_live|store_occasion_card/);

const about = renderPublicLegalPage(PUBLIC_LEGAL_PAGES.find((p) => p.id === 'about'));
assert.match(about, /من نحن/);
assert.match(about, /نظام الاستجابة الذكية/);

const privacy = renderPublicLegalPage(PUBLIC_LEGAL_PAGES.find((p) => p.id === 'privacy-policy'));
assert.match(privacy, /سياسة خصوصية المستخدم/);
assert.match(privacy, /دون الاحتفاظ بها كسجل تاريخي/);

assert.match(markdownLiteToHtml('مرحباً **حلاق ماب**'), /<strong>حلاق ماب<\/strong>/);

const tmp = mkdtempSync(join(tmpdir(), 'hm-legal-seo-'));
try {
  writePublicLegalPages(tmp);
  const termsFile = readFileSync(join(tmp, 'terms', 'index.html'), 'utf8');
  assert.match(termsFile, /https:\/\/www\.halaqmap\.com\/terms/);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

const vercel = readFileSync(join(root, 'vercel.json'), 'utf8');
assert.doesNotMatch(vercel, /"source": "\/terms",\s*"destination": "\/index\.html"/);
assert.doesNotMatch(vercel, /"source": "\/about",\s*"destination": "\/index\.html"/);
assert.doesNotMatch(vercel, /"source": "\/privacy-policy",\s*"destination": "\/index\.html"/);

const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
assert.match(app, /StaticSeoRedirect path="\/terms"/);
assert.match(app, /StaticSeoRedirect path="\/about"/);
assert.match(app, /StaticSeoRedirect path="\/privacy-policy"/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeWeddingLive['"]/);

const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
assert.match(indexHtml, /path === '\/terms'/);
assert.match(indexHtml, /path === '\/about'/);
assert.match(indexHtml, /path === '\/privacy-policy'/);

const geoGen = readFileSync(join(root, 'scripts/generate-near-geo-seo.mjs'), 'utf8');
assert.match(geoGen, /neighborhood'\) return '0\.4'/);
assert.match(geoGen, /city'\) return '0\.92'/);
assert.match(geoGen, /sitemapChangefreq/);

const pagesSitemap = readFileSync(join(root, 'public/sitemap-pages.xml'), 'utf8');
assert.match(pagesSitemap, /www.halaqmap.com\/terms/);
assert.match(pagesSitemap, /<priority>0.8<\/priority>/);

const pkg = readFileSync(join(root, 'package.json'), 'utf8');
assert.match(pkg, /generate-public-legal-seo\.mjs/);

console.log('generate-public-legal-seo: ok');
