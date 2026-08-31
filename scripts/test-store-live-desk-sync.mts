/**
 * فحص جنائي سباعي: ثبات حقول لوحات الكاشير والمضيف.
 * تشغيل: npx tsx scripts/test-store-live-desk-sync.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  liveHostText,
  mergeDeskPollState,
  shouldHoldDeskPoll,
} from '../src/lib/storeLiveDeskSync.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const pages = [
  'src/pages/store/StoreRestaurantShopPage.tsx',
  'src/pages/store/StoreGrocersShopPage.tsx',
  'src/pages/store/StoreCafeShopPage.tsx',
  'src/pages/store/StoreKitchenShopPage.tsx',
  'src/pages/store/StoreProduceShopPage.tsx',
  'src/pages/store/StoreLoungeHallPage.tsx',
  'src/pages/store/StoreWeddingHallPage.tsx',
  'src/pages/store/StoreEventHallPage.tsx',
] as const;

const apis = [
  'api/public-store-restaurant-live.ts',
  'api/public-store-grocers-live.ts',
  'api/public-store-cafe-live.ts',
  'api/public-store-kitchen-live.ts',
  'api/public-store-produce-live.ts',
  'api/public-store-lounge-live.ts',
  'api/public-store-wedding-live.ts',
  'api/public-store-event-live.ts',
] as const;

assert.equal(liveHostText('', 'مطعم السدرة'), '');
assert.equal(liveHostText('مطبخي', 'مطعم السدرة'), 'مطبخي');
assert.equal(liveHostText(undefined, 'مطعم السدرة'), 'مطعم السدرة');
assert.equal(liveHostText(null, 'مطعم السدرة'), 'مطعم السدرة');

const current = {
  host: { shopName: 'مطبخي' },
  shelf: [{ id: 'a', inStock: false }],
  orders: [{ id: 'old' }],
  orderArchive: [{ id: 'done-1' }],
};
const incoming = {
  host: { shopName: 'مطعم السدرة' },
  shelf: [{ id: 'b', inStock: true }],
  orders: [{ id: 'new' }],
  orderArchive: [],
};
const held = mergeDeskPollState(current, incoming, true);
assert.deepEqual(held.host, current.host);
assert.deepEqual(held.shelf, current.shelf);
assert.deepEqual(held.orders, [{ id: 'new' }, { id: 'old' }]);
assert.deepEqual(held.orderArchive, current.orderArchive);
assert.deepEqual(mergeDeskPollState(current, incoming, false), incoming);

assert.equal(shouldHoldDeskPoll(true, 0, 10_000), true);
assert.equal(shouldHoldDeskPoll(false, 9_000, 8_000), true);
assert.equal(shouldHoldDeskPoll(false, 7_000, 8_000), false);

for (const rel of pages) {
  const src = readFileSync(join(root, rel), 'utf8');
  assert.match(src, /useStoreLiveDeskSync/, rel);
  assert.match(src, /scheduleSave/, rel);
  assert.match(src, /liveHostText/, rel);
  assert.match(src, /applyPoll/, rel);
  assert.doesNotMatch(src, /void save\w+LiveHost/, rel);
  assert.doesNotMatch(src, /shopName \|\| fallback\.host\.shopName/, rel);
}

for (const rel of apis) {
  const src = readFileSync(join(root, rel), 'utf8');
  assert.match(src, /save_host' \? 40/, rel);
}

const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
assert.doesNotMatch(app, /storeLiveDeskSync/);
assert.doesNotMatch(app, /storeRestaurantLive/);
assert.doesNotMatch(app, /storeGrocersLive/);

console.log('desk-sync: ok');
