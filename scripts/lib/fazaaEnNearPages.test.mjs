/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
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
