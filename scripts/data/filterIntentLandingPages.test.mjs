/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FILTER_INTENT_PAGES } from './filterIntentLandingPages.mjs';

const LEAK_RE =
  /صيغ تقود|فزعة استعلام|يُطبَّق فلتر|نية البحث|حسب حاجتك عبر فزعات|ابدأ الاستعلام/;

test('صفحات /need الظاهرة تستقبل الباحث ولا تكشف الخطة', () => {
  assert.ok(FILTER_INTENT_PAGES.length >= 8);
  for (const page of FILTER_INTENT_PAGES) {
    const visible = `${page.title} ${page.h1} ${page.description} ${page.lead} ${page.body}`;
    assert.equal(LEAK_RE.test(visible), false, page.slug);
    assert.match(page.description, /ابحث من موقعك|اضغط البحث/);
    assert.match(page.lead, /تبحث|تحتاج/);
    assert.match(page.body, /ابحث من موقعك/);
  }
});

test('صفحات القرب تطابق عبارات الظهور العالي دون تزاحم دليل المدن', () => {
  const nearMe = FILTER_INTENT_PAGES.find((page) => page.slug === 'near-me');
  const openNow = FILTER_INTENT_PAGES.find((page) => page.slug === 'open-now');
  assert.ok(nearMe);
  assert.ok(openNow);
  assert.match(nearMe.title, /حلاق قريب مني/);
  assert.match(nearMe.h1, /حلاق قريب مني/);
  assert.match(nearMe.description, /حلاق قريب مني/);
  assert.match(openNow.title, /حلاق مفتوح الآن قريب مني/);
  assert.match(openNow.h1, /حلاق مفتوح الآن قريب مني/);
  assert.match(openNow.description, /مفتوح الآن/);
});
