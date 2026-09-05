/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * يتحقق أن روابط href الداخلية في صفحات فزعة الثابتة تشير لملفات موجودة في dist/.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

function walkHtml(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkHtml(p, acc);
    else if (name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

function hrefToFile(href) {
  if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
    return null;
  }
  let path = href.split('?')[0].split('#')[0];
  if (!path.startsWith('/')) return null;
  path = path.replace(/\/$/, '') || '/';
  if (path === '/') return join(DIST, 'index.html');
  return join(DIST, ...path.split('/').filter(Boolean), 'index.html');
}

const roots = ['need', 'near', 'occasions', 'nusuk', 'en/near'];
const htmlFiles = roots.flatMap((r) => walkHtml(join(DIST, r)));
const missing = new Map();
const hrefRe = /href="(\/[^"#?]+)"/g;

for (const file of htmlFiles) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(hrefRe)) {
    const href = match[1];
    const target = hrefToFile(href);
    if (!target || existsSync(target)) continue;
    if (!missing.has(href)) missing.set(href, new Set());
    missing.get(href).add(file.slice(ROOT.length + 1).replace(/\\/g, '/'));
  }
}

const errors = [];

if (htmlFiles.length === 0) {
  errors.push('no fazaa HTML under dist/ — run npm run build first');
}

for (const [href, sources] of missing.entries()) {
  errors.push(`${href} (from ${[...sources].slice(0, 2).join(', ')})`);
}

if (errors.length) {
  console.error('verify-fazaa-links failed:');
  for (const err of errors.slice(0, 80)) console.error(' -', err);
  if (errors.length > 80) console.error(` ... and ${errors.length - 80} more`);
  process.exit(1);
}

console.log(`verify-fazaa-links: ok (${htmlFiles.length} HTML files, 0 broken hrefs)`);
