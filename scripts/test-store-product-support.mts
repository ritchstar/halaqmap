/**
 * أدلة التشغيل والتسويق: مسارات، خمس تبويبات، عزل المنتجات، بلا استيراد من App.
 * تشغيل: npx tsx scripts/test-store-product-support.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_CAFE_SUPPORT,
  STORE_GROCERS_SUPPORT,
  STORE_HALLS_SUPPORT,
  STORE_HALANA_SUPPORT,
  STORE_KITCHEN_SUPPORT,
  STORE_LOUNGE_SUPPORT,
  STORE_PRODUCE_SUPPORT,
  STORE_PRODUCT_SUPPORT_GUIDES,
  STORE_PRODUCT_SUPPORT_TAB_IDS,
  STORE_RESTAURANT_SUPPORT,
  storeProductSupportByPath,
} from '../src/config/storeProductSupport.ts';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const landingKitchen = readFileSync(join(root, 'src/pages/store/StoreKitchenLandingPage.tsx'), 'utf8');
const landingGrocers = readFileSync(join(root, 'src/pages/store/StoreGrocersLandingPage.tsx'), 'utf8');
const landingHalls = readFileSync(join(root, 'src/pages/store/StoreWeddingLandingPage.tsx'), 'utf8');

assert.equal(ROUTE_PATHS.STORE_KITCHEN_SUPPORT, '/store/kitchen/support');
assert.equal(ROUTE_PATHS.STORE_GROCERS_SUPPORT, '/store/grocers/support');
assert.equal(ROUTE_PATHS.STORE_PRODUCE_SUPPORT, '/store/produce/support');
assert.equal(ROUTE_PATHS.STORE_RESTAURANT_SUPPORT, '/store/restaurant/support');
assert.equal(ROUTE_PATHS.STORE_CAFE_SUPPORT, '/store/cafe/support');
assert.equal(ROUTE_PATHS.STORE_LOUNGE_SUPPORT, '/store/lounge/support');
assert.equal(ROUTE_PATHS.STORE_HALLS_SUPPORT, '/store/halls/support');
assert.equal(ROUTE_PATHS.STORE_HALANA_SUPPORT, '/store/halana/support');

assert.deepEqual([...STORE_PRODUCT_SUPPORT_TAB_IDS], ['activate', 'identity', 'orders', 'qr', 'neighborhood']);

const guides = [
  STORE_KITCHEN_SUPPORT,
  STORE_GROCERS_SUPPORT,
  STORE_PRODUCE_SUPPORT,
  STORE_RESTAURANT_SUPPORT,
  STORE_CAFE_SUPPORT,
  STORE_LOUNGE_SUPPORT,
  STORE_HALLS_SUPPORT,
  STORE_HALANA_SUPPORT,
];
assert.equal(Object.keys(STORE_PRODUCT_SUPPORT_GUIDES).length, 8);
for (const guide of guides) {
  assert.deepEqual(guide.tabs.map((tab) => tab.id), [...STORE_PRODUCT_SUPPORT_TAB_IDS]);
  if (guide.id !== 'halana') {
    assert.equal(guide.tabs[0].titleAr, 'بعد الشراء');
  }
}

assert.equal(storeProductSupportByPath('/store/kitchen/support'), STORE_KITCHEN_SUPPORT);
assert.equal(storeProductSupportByPath('/store/halls/support'), STORE_HALLS_SUPPORT);
assert.equal(storeProductSupportByPath('/store/kitchen'), null);

function blob(guide: (typeof guides)[number]): string {
  return JSON.stringify(guide);
}

assert.doesNotMatch(blob(STORE_KITCHEN_SUPPORT), /تمويناتا1|مطعمنا1|كافينا1|خضارنا1|لاونجا1|كاردي8/);
assert.doesNotMatch(blob(STORE_GROCERS_SUPPORT), /مطعمنا1|كافينا1|طبختنا1|خضارنا1|لاونجا1|كاردي8|افراحي1/);
assert.doesNotMatch(blob(STORE_PRODUCE_SUPPORT), /تمويناتا1|مطعمنا1|كافينا1|طبختنا1|لاونجا1|كاردي8/);
assert.match(STORE_PRODUCE_SUPPORT.titleAr, /خطة التشغيل والتسويق/);
assert.match(STORE_PRODUCE_SUPPORT.leadAr, /26-12-103276978/);
assert.match(blob(STORE_PRODUCE_SUPPORT), /تعال/);
assert.match(blob(STORE_PRODUCE_SUPPORT), /كيلومتر واحد/);
assert.doesNotMatch(blob(STORE_PRODUCE_SUPPORT), /تجربة|799|1250|ميسر/);
assert.match(readFileSync(join(root, 'src/pages/store/StoreProduceLandingPage.tsx'), 'utf8'), /STORE_PRODUCE_SUPPORT/);
assert.doesNotMatch(blob(STORE_RESTAURANT_SUPPORT), /تمويناتا1|كافينا1|طبختنا1|خضارنا1|لاونجا1|كاردي8/);
assert.doesNotMatch(blob(STORE_CAFE_SUPPORT), /تمويناتا1|مطعمنا1|طبختنا1|خضارنا1|لاونجا1|كاردي8/);
assert.doesNotMatch(blob(STORE_LOUNGE_SUPPORT), /تمويناتا1|مطعمنا1|كافينا1|طبختنا1|خضارنا1|كاردي8|افراحي1/);
assert.match(blob(STORE_HALLS_SUPPORT), /افراحي1/);
assert.match(blob(STORE_HALLS_SUPPORT), /اجواء1/);
assert.doesNotMatch(blob(STORE_HALLS_SUPPORT), /كاردي8|12 و29 و59|999/);
assert.match(STORE_HALLS_SUPPORT.leadAr, /ثمانمائة وتسعة وتسعون/);
assert.doesNotMatch(blob(STORE_HALANA_SUPPORT), /تمويناتا1|مطعمنا1|كافينا1|طبختنا1|خضارنا1|لاونجا1|كاردي8|افراحي1/);
assert.equal(STORE_HALANA_SUPPORT.landingPath, ROUTE_PATHS.STORE_HALANA);

assert.doesNotMatch(app, /storeProductSupport/);
assert.match(app, /StoreProductSupportPage/);
assert.match(app, /STORE_KITCHEN_SUPPORT/);
assert.match(app, /STORE_HALLS_SUPPORT/);
assert.match(app, /STORE_HALANA_SUPPORT/);
assert.doesNotMatch(app, /storeHalanaLive/);

assert.match(landingKitchen, /STORE_KITCHEN_SUPPORT/);
assert.match(landingGrocers, /STORE_GROCERS_SUPPORT/);
assert.match(landingHalls, /STORE_HALLS_SUPPORT/);

const desks = [
  ['src/components/store/StoreKitchenDesk.tsx', 'STORE_KITCHEN_SUPPORT'],
  ['src/components/store/StoreGrocersDesk.tsx', 'STORE_GROCERS_SUPPORT'],
  ['src/components/store/StoreProduceDesk.tsx', 'STORE_PRODUCE_SUPPORT'],
  ['src/components/store/StoreRestaurantDesk.tsx', 'STORE_RESTAURANT_SUPPORT'],
  ['src/components/store/StoreCafeDesk.tsx', 'STORE_CAFE_SUPPORT'],
  ['src/components/store/StoreLoungeHostPanel.tsx', 'STORE_LOUNGE_SUPPORT'],
  ['src/components/store/StoreWeddingHostPanel.tsx', 'STORE_HALLS_SUPPORT'],
  ['src/components/store/StoreEventHostPanel.tsx', 'STORE_HALLS_SUPPORT'],
  ['src/pages/store/StoreHalanaShopPage.tsx', 'STORE_HALANA_SUPPORT'],
] as const;
for (const [rel, token] of desks) {
  const src = readFileSync(join(root, rel), 'utf8');
  assert.match(src, /StoreDeskGuideLink/);
  assert.match(src, new RegExp(token));
}

console.log('test-store-product-support: ok');
