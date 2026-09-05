/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { GEO_NEAR_LEGACY_REDIRECTS_MANUAL } from '../lib/geoNearLegacyRedirects.mjs';
import {
  FAZAA_EN_NEAR_PAGES,
  findEnNearPageByArPath,
  findEnNearPageByEnPath,
  hreflangLinksForArPath,
  hreflangLinksHtml,
  normalizeSeoPath,
} from './fazaaEnNearPages.mjs';

test('المحور الإنجليزي مدينة الرياض ومكة فقط', () => {
  assert.deepEqual(
    FAZAA_EN_NEAR_PAGES.map((p) => p.id),
    ['hub', 'riyadh', 'makkah'],
  );
  for (const page of FAZAA_EN_NEAR_PAGES) {
    assert.match(page.enPath, /^\/en\/near/);
    assert.match(page.arPath, /^\/near/);
    assert.equal(page.title.includes('tourism'), false);
    assert.equal(page.title.includes('Visit Saudi'), false);
    assert.match(page.h1, /barber/i);
  }
});

test('hreflang يربط كل صفحة إنجليزية بأختها العربية', () => {
  const hub = findEnNearPageByArPath('/near/');
  assert.equal(hub?.enPath, '/en/near');
  assert.equal(findEnNearPageByEnPath('/en/near/makkah/')?.arPath, '/near/makkah');
  const tags = hreflangLinksHtml('/near/riyadh', '/en/near/riyadh');
  assert.match(tags, /hreflang="ar-SA"[^>]+\/near\/riyadh/);
  assert.match(tags, /hreflang="en"[^>]+\/en\/near\/riyadh/);
  assert.match(tags, /hreflang="x-default"[^>]+\/near\/riyadh/);
  assert.equal(hreflangLinksForArPath('/near/jeddah'), '');
  assert.equal(normalizeSeoPath('https://www.halaqmap.com/near/'), '/near');
});

test('تهجئة المعذر القديمة تُحوَّل والهاش يخرج إلى /near', () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
  const vercel = readFileSync(join(root, 'vercel.json'), 'utf8');
  assert.match(app, /StaticSeoRedirect path="\/near\/:city\/:slug"/);
  assert.equal(GEO_NEAR_LEGACY_REDIRECTS_MANUAL.some((row) => row.from === '/near/riyadh/maathar'), true);
  assert.equal(GEO_NEAR_LEGACY_REDIRECTS_MANUAL.every((row) => row.to === '/near/riyadh/maather' || row.to === '/near/riyadh/hittin'), true);
  assert.match(vercel, /\/near\/riyadh\/maathar/);
  assert.match(vercel, /\/near\/riyadh\/maather/);
});
