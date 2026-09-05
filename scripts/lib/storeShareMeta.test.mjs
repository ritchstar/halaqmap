/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  STORE_SHARE_META,
  applyStoreShareMeta,
  isStoreShareHost,
  isStoreSharePath,
} from './storeShareMeta.mjs';

test('وسم مشاركة المتجر لا يذكر أقرب حلاق', () => {
  assert.match(STORE_SHARE_META.title, /خريطة الحل/);
  assert.match(STORE_SHARE_META.title, /halaqmap/);
  assert.match(STORE_SHARE_META.description, /خريطة الحل/);
  assert.equal(STORE_SHARE_META.url, 'https://store.halaqmap.com/store');
  assert.equal(STORE_SHARE_META.description.includes('اقرب حلاق'), false);
  assert.equal(STORE_SHARE_META.image.includes('store.halaqmap.com'), true);
  assert.equal(isStoreShareHost('store.halaqmap.com'), true);
  assert.equal(isStoreShareHost('www.halaqmap.com'), false);
  assert.equal(isStoreSharePath('/'), true);
  assert.equal(isStoreSharePath('/store/affiliates/enter'), true);
  assert.equal(isStoreSharePath('/near/riyadh'), false);
});

test('تحويل HTML يستبدل وسم حلاق ماب بوسم المتجر', () => {
  const html = `<!doctype html><html><head>
    <title>اقرب حلاق · حلاق قريب | حلاق ماب</title>
    <meta name="description" content="اقرب حلاق، حلاق قريب مني" />
    <meta name="author" content="حلاق ماب" />
    <link rel="canonical" href="https://www.halaqmap.com/" />
    <meta property="og:title" content="اقرب حلاق · حلاق قريب | حلاق ماب" />
    <meta
      property="og:description"
      content="اقرب حلاق، حلاق قريب مني، ومفتوح الآن — استعلام لحظي من حلاق ماب واتصل بالصالون المناسب."
    />
    <meta property="og:url" content="https://www.halaqmap.com/" />
    <meta property="og:image" content="https://www.halaqmap.com/images/halaqmap_logo_refined.png" />
    <meta property="og:image:alt" content="حلاق ماب | HALAQ MAP" />
    <meta property="og:site_name" content="حلاق ماب | HALAQ MAP" />
    <meta name="twitter:title" content="اقرب حلاق · حلاق قريب | حلاق ماب" />
    <meta name="twitter:description" content="اقرب حلاق" />
    <meta name="twitter:image" content="https://www.halaqmap.com/images/halaqmap_logo_refined.png" />
  </head><body></body></html>`;
  const next = applyStoreShareMeta(html);
  assert.match(next, /og:title" content="خريطة الحل — halaqmap"/);
  assert.match(next, /OnlineStore/);
  assert.match(next, /<noscript><h1>خريطة الحل<\/h1><\/noscript>/);
  assert.equal(next.includes('"name": "حلاق ماب"'), false);
  assert.match(next, /store\.halaqmap\.com\/images\/halaqmap-store-mark-radar-square-1200x1200\.png/);
  assert.equal(next.includes('اقرب حلاق · حلاق قريب | حلاق ماب'), false);
  assert.match(next, /افراحي1/);
});
