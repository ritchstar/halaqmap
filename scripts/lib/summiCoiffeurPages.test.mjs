/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  SUMMI_HUB,
  SUMMI_HUB_PATH,
  SUMMI_INTENT_PAGES,
  SUMMI_ORIGIN,
  findSummiPageBySlug,
  normalizeSummiPath,
  summiInquireHref,
  summiIntentBySlug,
} from './summiCoiffeurPages.mjs';

const EXPECTED_INTENTS = [
  'near_open',
  'coiffeur',
  'beauty_salon',
  'spa',
  'makeup',
  'nails',
  'skin',
  'independents',
];

test('سمي: محور وثماني نوايا فقط بلا مدن', () => {
  assert.equal(SUMMI_HUB.path, '/summi');
  assert.equal(SUMMI_INTENT_PAGES.length, 8);
  assert.deepEqual(
    SUMMI_INTENT_PAGES.map((p) => p.intentId),
    EXPECTED_INTENTS,
  );
  for (const page of SUMMI_INTENT_PAGES) {
    assert.match(page.path, /^\/summi\//);
    assert.equal(page.path.includes('/near/'), false);
    assert.equal(page.path.includes('/need/'), false);
  }
});

test('سمي: لا كلمات رجال ولا وعد تغطية ولا أعداد', () => {
  const blob = [SUMMI_HUB, ...SUMMI_INTENT_PAGES]
    .map((p) => `${p.title} ${p.h1} ${p.description} ${p.lead}`)
    .join('\n');
  assert.equal(/أقرب حلاق|حلاق قريب|barber near me/i.test(blob), false);
  assert.equal(/\d+\s*(مشغل|صالون|شريكة)/.test(blob), false);
  assert.equal(/أكبر منصة|تغطية كاملة|كل المدن/.test(blob), false);
  assert.match(SUMMI_HUB.title, /كوافير ماب/);
  assert.equal(/نية البحث|سمي من كوافير/.test(blob), false);
});

test('سمي: زر الاستعلام على نطاق كوافير ماب', () => {
  assert.equal(summiInquireHref('beauty_salon'), `${SUMMI_ORIGIN}/#/coiffeur/need?intent=beauty_salon`);
  assert.equal(summiInquireHref(''), `${SUMMI_ORIGIN}/#/coiffeur/need`);
  assert.equal(findSummiPageBySlug('spa')?.intentId, 'spa');
  assert.equal(summiIntentBySlug('near-me'), 'near_open');
  assert.equal(normalizeSummiPath(`${SUMMI_ORIGIN}/summi/nails/`), '/summi/nails');
  assert.equal(SUMMI_HUB_PATH, '/summi');
});
