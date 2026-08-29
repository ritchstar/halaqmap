/**
 * سماء تمويناتا1 وخضارنا1: عزل الصور والمراحل، بلا قاعات.
 * تشغيل: npx tsx scripts/test-store-shop-sky.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_GROCERS_MARKETING_FRAMES, STORE_PRODUCE_MARKETING_FRAMES } from '../src/config/storeMarketingReels.ts';
import { storeShopSkyBank, storeShopSkyFrames } from '../src/config/storeShopSky.ts';
import {
  shopSkyFrameIsHallPanorama,
  storeShopSkyImageOpacity,
  storeShopSkyIntervalMs,
  storeShopSkySources,
  storeShopSkyVeilOpacity,
} from '../src/lib/storeShopSky.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const grocersPage = readFileSync(join(root, 'src/pages/store/StoreGrocersShopPage.tsx'), 'utf8');
const producePage = readFileSync(join(root, 'src/pages/store/StoreProduceShopPage.tsx'), 'utf8');
const restaurantPage = readFileSync(join(root, 'src/pages/store/StoreRestaurantShopPage.tsx'), 'utf8');
const cafePage = readFileSync(join(root, 'src/pages/store/StoreCafeShopPage.tsx'), 'utf8');
const kitchenPage = readFileSync(join(root, 'src/pages/store/StoreKitchenShopPage.tsx'), 'utf8');
const loungePage = readFileSync(join(root, 'src/pages/store/StoreLoungeHallPage.tsx'), 'utf8');
const weddingPage = readFileSync(join(root, 'src/pages/store/StoreWeddingHallPage.tsx'), 'utf8');
const eventPage = readFileSync(join(root, 'src/pages/store/StoreEventHallPage.tsx'), 'utf8');
const sky = readFileSync(join(root, 'src/components/store/StoreShopSky.tsx'), 'utf8');

assert.doesNotMatch(app, /from ['"]@\/config\/storeShopSky['"]/);
assert.doesNotMatch(app, /from ['"]@\/lib\/storeShopSky['"]/);
assert.doesNotMatch(app, /from ['"]@\/components\/store\/StoreShopSky['"]/);

assert.match(grocersPage, /sky="grocers"/);
assert.match(producePage, /sky="produce"/);
assert.doesNotMatch(grocersPage, /sky="produce"/);
assert.doesNotMatch(producePage, /sky="grocers"/);
assert.doesNotMatch(restaurantPage, /sky=/);
assert.doesNotMatch(cafePage, /sky=/);
assert.doesNotMatch(kitchenPage, /sky=/);
assert.doesNotMatch(loungePage, /sky=/);
assert.doesNotMatch(weddingPage, /sky=/);
assert.doesNotMatch(eventPage, /sky=/);

assert.match(sky, /prefers-reduced-motion/);
assert.match(sky, /pointer-events-none/);
assert.doesNotMatch(sky, /STORE_LIVE_PANORAMAS/);
assert.doesNotMatch(sky, /geolocation|getCurrentPosition|fetchTemperatureCelsius/);

const grocersFajr = storeShopSkyFrames('grocers', 'fajr');
const produceFajr = storeShopSkyFrames('produce', 'fajr');
assert.equal(grocersFajr.length, 4);
assert.equal(produceFajr.length, 4);
assert.deepEqual([...storeShopSkyBank('grocers')], [...STORE_GROCERS_MARKETING_FRAMES]);
assert.deepEqual([...storeShopSkyBank('produce')], [...STORE_PRODUCE_MARKETING_FRAMES]);
for (const src of grocersFajr) {
  assert.ok(src.includes('/grocers'), src);
  assert.ok(!src.includes('/produce/'), src);
  assert.equal(shopSkyFrameIsHallPanorama(src), false);
}
for (const src of produceFajr) {
  assert.ok(src.includes('/produce'), src);
  assert.ok(!src.includes('/grocers/'), src);
  assert.equal(shopSkyFrameIsHallPanorama(src), false);
}

for (const phase of ['fajr', 'dhuhr', 'ghuroob', 'layl'] as const) {
  const grocers = storeShopSkySources('grocers', phase);
  const produce = storeShopSkySources('produce', phase);
  assert.ok(grocers.every((src) => !shopSkyFrameIsHallPanorama(src)));
  assert.ok(produce.every((src) => !shopSkyFrameIsHallPanorama(src)));
  assert.ok(storeShopSkyVeilOpacity('desk', phase) > storeShopSkyVeilOpacity('shop', phase));
}

assert.ok(storeShopSkyImageOpacity('shop') > storeShopSkyImageOpacity('desk'));
assert.ok(storeShopSkyIntervalMs('desk') > storeShopSkyIntervalMs('shop'));
assert.equal(shopSkyFrameIsHallPanorama('/images/store/live/pano-01-gold.jpg'), true);

console.log('store-shop-sky: ok');
