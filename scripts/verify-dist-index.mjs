/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * Post-build guard: Vercel (and CI) must ship dist/index.html with build markers
 * and asset query strings from vite.config.ts — catches mis-ordered plugins or stale configs.
 * Also guards sitemap*.xml so GSC never receives SPA/HTML instead of XML.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const errors = [];
if (!html.includes('name="halaqmap-build-commit"')) {
  errors.push('missing meta halaqmap-build-commit');
}
if (!html.includes('name="domain-verification"')) {
  errors.push('missing meta domain-verification');
}
const dvMatch = html.match(/name="domain-verification"\s+content="([^"]+)"/);
if (!dvMatch?.[1]?.startsWith('05f735e4039c7d290a5f41d188fdc799')) {
  errors.push('domain-verification content mismatch');
}
const headOpen = html.indexOf('<head>');
const dvPos = html.indexOf('name="domain-verification"');
const buildPos = html.indexOf('name="halaqmap-build-commit"');
if (headOpen >= 0 && dvPos >= 0 && buildPos >= 0 && dvPos > buildPos) {
  errors.push('domain-verification must appear before halaqmap-build-commit in head');
}
if (!/\/assets\/[^"']+\.(js|css)\?v=/.test(html)) {
  errors.push('missing ?v= on /assets/*.js or *.css');
}
if (!html.includes('og:site_name" content="حلاق ماب | HALAQ MAP"')) {
  errors.push('www index.html missing Halaq Map og:site_name');
}

const coiffeurShare = join(dist, 'coiffeur-index.html');
if (!existsSync(coiffeurShare)) {
  errors.push('missing coiffeur-index.html');
} else {
  const coiffeurHtml = readFileSync(coiffeurShare, 'utf8');
  if (!coiffeurHtml.includes('og:site_name" content="كوافير ماب"')) {
    errors.push('coiffeur-index.html missing og:site_name كوافير ماب');
  }
  if (!coiffeurHtml.includes('"@type":"WebSite"')) {
    errors.push('coiffeur-index.html missing WebSite json-ld');
  }
  if (!coiffeurHtml.includes('"name":"كوافير ماب"') && !coiffeurHtml.includes('"name": "كوافير ماب"')) {
    errors.push('coiffeur-index.html missing WebSite name كوافير ماب');
  }
  if (!coiffeurHtml.includes('"url":"https://coiffeur.halaqmap.com"') && !coiffeurHtml.includes('"url": "https://coiffeur.halaqmap.com"')) {
    errors.push('coiffeur-index.html missing WebSite url coiffeur.halaqmap.com');
  }
  if (/og:site_name" content="حلاق ماب/.test(coiffeurHtml)) {
    errors.push('coiffeur-index.html must not keep Halaq Map site_name');
  }
  if (!/\/assets\/[^"']+\.(js|css)\?v=/.test(coiffeurHtml)) {
    errors.push('coiffeur-index.html missing ?v= on /assets/*.js or *.css');
  }
}

for (const name of ['sitemap.xml', 'sitemap-pages.xml', 'sitemap-geo.xml', 'sitemap-en.xml', 'sitemap-summi.xml', 'sitemap-store.xml']) {
  const path = join(dist, name);
  if (!existsSync(path)) {
    errors.push(`missing ${name}`);
    continue;
  }
  const body = readFileSync(path, 'utf8').trimStart();
  if (!body.startsWith('<?xml')) {
    errors.push(`${name} is not XML (starts with HTML/other — GSC will reject)`);
  }
  if (/<!DOCTYPE html|<html[\s>]/i.test(body.slice(0, 400))) {
    errors.push(`${name} looks like HTML`);
  }
  if (name === 'sitemap.xml' && !body.includes('sitemap-geo.xml')) {
    errors.push('sitemap.xml index must reference sitemap-geo.xml');
  }
  if (name === 'sitemap.xml' && !body.includes('sitemap-en.xml')) {
    errors.push('sitemap.xml index must reference sitemap-en.xml');
  }
  if (name === 'sitemap.xml' && !body.includes('sitemap-summi.xml')) {
    errors.push('sitemap.xml index must reference sitemap-summi.xml');
  }
  if (name === 'sitemap.xml' && !body.includes('sitemap-store.xml')) {
    errors.push('sitemap.xml index must reference sitemap-store.xml');
  }
  if (name === 'sitemap-store.xml' && !body.includes('store.halaqmap.com/store')) {
    errors.push('sitemap-store.xml missing store.halaqmap.com/store');
  }
  if (name === 'sitemap-store.xml' && !body.includes('store.halaqmap.com/store/try')) {
    errors.push('sitemap-store.xml missing store.halaqmap.com/store/try');
  }
  if (name === 'sitemap-summi.xml' && !body.includes('coiffeur.halaqmap.com/summi')) {
    errors.push('sitemap-summi.xml missing coiffeur.halaqmap.com/summi URLs');
  }
  if (name === 'sitemap-geo.xml' && !body.includes('/near')) {
    errors.push('sitemap-geo.xml missing /near URLs');
  }
  if (name === 'sitemap-en.xml' && !body.includes('/en/near')) {
    errors.push('sitemap-en.xml missing /en/near URLs');
  }
}

for (const rel of ['en/near/index.html', 'en/near/riyadh/index.html', 'en/near/makkah/index.html']) {
  const path = join(dist, rel);
  if (!existsSync(path)) {
    errors.push(`missing ${rel}`);
    continue;
  }
  const body = readFileSync(path, 'utf8');
  if (!body.includes('lang="en"')) {
    errors.push(`${rel} must be lang=en`);
  }
  if (!/Find a barber/i.test(body)) {
    errors.push(`${rel} missing Find a barber heading`);
  }
  if (/Saudi tourism|Visit Saudi/i.test(body)) {
    errors.push(`${rel} must not target tourism keywords`);
  }
}

for (const rel of ['summi/index.html', 'summi/near-me/index.html', 'summi/beauty-salon/index.html']) {
  const path = join(dist, rel);
  if (!existsSync(path)) {
    errors.push(`missing ${rel}`);
    continue;
  }
  const body = readFileSync(path, 'utf8');
  if (!body.includes('lang="ar-SA"')) {
    errors.push(`${rel} must be lang=ar-SA`);
  }
  if (!body.includes('ابحثي من موقعك')) {
    errors.push(`${rel} missing Coiffeur inquire CTA`);
  }
  if (/أقرب حلاق|barber near me/i.test(body)) {
    errors.push(`${rel} must stay isolated from mens Fazaa keywords`);
  }
  if (!body.includes('og:site_name" content="كوافير ماب"')) {
    errors.push(`${rel} missing og:site_name كوافير ماب`);
  }
  if (!body.includes('"@type":"WebSite"')) {
    errors.push(`${rel} missing WebSite json-ld`);
  }
  if (!body.includes('"name":"كوافير ماب"') && !body.includes('"name": "كوافير ماب"')) {
    errors.push(`${rel} missing WebSite name كوافير ماب`);
  }
  if (!body.includes('https://coiffeur.halaqmap.com')) {
    errors.push(`${rel} missing coiffeur origin in json-ld`);
  }
}

for (const spec of [
  { rel: 'terms/index.html', canonical: 'https://www.halaqmap.com/terms', heading: 'شروط الاستخدام' },
  { rel: 'about/index.html', canonical: 'https://www.halaqmap.com/about', heading: 'من نحن' },
  { rel: 'privacy-policy/index.html', canonical: 'https://www.halaqmap.com/privacy-policy', heading: 'سياسة خصوصية المستخدم' },
]) {
  const path = join(dist, spec.rel);
  if (!existsSync(path)) {
    errors.push(`missing ${spec.rel}`);
    continue;
  }
  const body = readFileSync(path, 'utf8');
  if (!body.includes(`<link rel="canonical" href="${spec.canonical}"`)) {
    errors.push(`${spec.rel} missing unique canonical`);
  }
  if (body.includes('canonical" href="https://www.halaqmap.com/"')) {
    errors.push(`${spec.rel} must not canonize the homepage`);
  }
  if (body.includes('<title>اقرب حلاق')) {
    errors.push(`${spec.rel} must not reuse homepage title`);
  }
  if (!body.includes(`<h1>${spec.heading}</h1>`)) {
    errors.push(`${spec.rel} missing heading`);
  }
}

const storeQr = join(dist, 'store-qr.html');
if (!existsSync(storeQr)) {
  errors.push('missing store-qr.html');
} else {
  const qrHtml = readFileSync(storeQr, 'utf8');
  if (!qrHtml.includes('https://store.halaqmap.com/store')) {
    errors.push('store-qr.html must encode the store landing without hash');
  }
  if (qrHtml.includes('https://store.halaqmap.com/#/store')) {
    errors.push('store-qr.html must not use a hash store URL');
  }
  if (!qrHtml.includes('متجر خريطة الحل')) {
    errors.push('store-qr.html must use store shop name');
  }
}

const storeShare = join(dist, 'store-index.html');
if (!existsSync(storeShare)) {
  errors.push('missing store-index.html');
} else {
  const storeHtml = readFileSync(storeShare, 'utf8');
  if (!storeHtml.includes('store.halaqmap.com')) {
    errors.push('store-index.html must point og tags at store.halaqmap.com');
  }
  if (!storeHtml.includes('متجر خريطة الحل')) {
    errors.push('store-index.html must use store shop name');
  }
  if (!storeHtml.includes('OnlineStore')) {
    errors.push('store-index.html missing OnlineStore json-ld');
  }
  if (storeHtml.includes('اقرب حلاق · حلاق قريب | حلاق ماب')) {
    errors.push('store-index.html must not keep Halaq Map share title');
  }
  if (!/\/assets\/[^"']+\.(js|css)\?v=/.test(storeHtml)) {
    errors.push('store-index.html missing ?v= on /assets/*.js or *.css');
  }
}

if (errors.length) {
  console.error('verify-dist-index failed:', errors.join('; '));
  process.exit(1);
}
console.log('verify-dist-index: ok (index + sitemaps)');
