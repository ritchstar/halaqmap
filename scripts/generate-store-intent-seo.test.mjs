/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * node scripts/generate-store-intent-seo.test.mjs
 */
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { STORE_INTENT_PAGES } from './data/storeIntentLandingPages.mjs';
import {
  buildStoreIntentSitemapXml,
  renderStoreIntentHub,
  renderStoreIntentPage,
  writeStoreIntentSeo,
} from './generate-store-intent-seo.mjs';

assert.equal(STORE_INTENT_PAGES.length, 12);

const wedding = STORE_INTENT_PAGES[0];
const html = renderStoreIntentPage(wedding);
assert.match(html, /<h1>دعوة زفاف رقمية تفتح إلى قاعة حفل حيّة<\/h1>/);
assert.match(html, /meta name="robots" content="index, follow"/);
assert.match(html, /899 ر\.س/);
assert.match(html, /RSVP/);
assert.doesNotMatch(html, /اجواء1/);
assert.match(html, /https:\/\/store\.halaqmap\.com\/store\/wedding\/read/);
assert.match(html, /"@type":"FAQPage"/);

const coiffeur = STORE_INTENT_PAGES.find((p) => p.slug === 'salon-women-visibility');
const coiffeurHtml = renderStoreIntentPage(coiffeur);
assert.match(coiffeurHtml, /meta name="robots" content="noindex, follow"/);
assert.match(coiffeurHtml, /https:\/\/coiffeur\.halaqmap\.com/);

const sitemap = buildStoreIntentSitemapXml();
assert.match(sitemap, /need\/store<\/loc>/);
assert.match(sitemap, /need\/wedding-invite-digital<\/loc>/);
assert.doesNotMatch(sitemap, /salon-women-visibility/);

const hub = renderStoreIntentHub();
assert.match(hub, /حلول أعمال متجر خريطة الحل/);
assert.match(hub, /need\/store/);

const tmp = mkdtempSync(join(tmpdir(), 'hm-store-intent-'));
try {
  writeStoreIntentSeo(tmp);
  assert.match(
    readFileSync(join(tmp, 'need', 'store', 'index.html'), 'utf8'),
    /حلول أعمال/,
  );
  assert.match(
    readFileSync(join(tmp, 'need', 'digital-invite-card', 'index.html'), 'utf8'),
    /12 و29 و59/,
  );
  assert.match(readFileSync(join(tmp, 'sitemap-store-intent.xml'), 'utf8'), /<\?xml/);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

console.log('[generate-store-intent-seo.test] ok');
