/**
 * فحص تجربة جار الحي — مختبر grocers-lab فقط (P0).
 * تشغيل: npx tsx scripts/test-neighbor-shop-lab.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_GROCERS_LIVE_LAB_TOKEN } from '../src/config/storeGrocersLive.ts';
import {
  neighborCartStorageKey,
  readNeighborCartQty,
  writeNeighborCartQty,
  clearNeighborCartQty,
} from '../src/lib/neighborCartStorage.ts';
import {
  NEIGHBOR_SHELF_ALL_CATEGORY,
  filterNeighborShelf,
  neighborProductLayout,
  neighborShelfCategories,
} from '../src/lib/neighborShelfFilter.ts';
import { NeighborShopEvents } from '../src/lib/neighborShopAnalytics.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const grocersShop = readFileSync(join(root, 'src/components/store/StoreGrocersShop.tsx'), 'utf8');
const grocersPage = readFileSync(join(root, 'src/pages/store/StoreGrocersShopPage.tsx'), 'utf8');
const cartShop = readFileSync(join(root, 'src/components/store/live/StoreLiveActivityCartShop.tsx'), 'utf8');
const shell = readFileSync(join(root, 'src/components/store/live/StoreLiveActivityShell.tsx'), 'utf8');
const indexCss = readFileSync(join(root, 'src/index.css'), 'utf8');

assert.match(grocersShop, /neighborLabUx\s*=\s*isLab\s*&&\s*Boolean\(activityShell\)/);
assert.match(grocersShop, /NeighborShelfExplorer/);
assert.match(grocersShop, /AdaptiveProductGrid/);
assert.match(grocersShop, /NeighborFloatingCart/);
assert.match(grocersShop, /readNeighborCartQty\('grocers'/);
assert.match(grocersShop, /writeNeighborCartQty\('grocers'/);
assert.match(grocersShop, /clearNeighborCartQty\('grocers'/);
assert.match(grocersShop, /NeighborShopEvents/);
assert.match(grocersShop, /neighbor-shop-lab-pad/);
assert.match(grocersShop, /grocers-checkout/);

const labStart = grocersShop.indexOf('neighborLabUx ? (');
const labEnd = grocersShop.indexOf(') : (', labStart);
const labBranch = labStart >= 0 && labEnd > labStart ? grocersShop.slice(labStart, labEnd) : '';
assert.doesNotMatch(labBranch, /grocersCatalogImage/);

assert.match(grocersPage, /showIndependentStoreIdentity=\{isLab\}/);
assert.match(cartShop, /IndependentStoreIdentity/);
assert.match(cartShop, /afterTrust=/);
assert.match(shell, /afterTrust\?: ReactNode/);
assert.match(shell, /\{afterTrust \?/);
assert.match(indexCss, /neighbor-shop\.css/);

assert.equal(neighborCartStorageKey('grocers', STORE_GROCERS_LIVE_LAB_TOKEN), 'halaqmap-neighbor-cart:grocers:grocers-lab:v1');

const sample = [
  { catalogId: 'a', nameAr: 'حليب', category: 'ألبان', price: 5, inStock: true },
  { catalogId: 'b', nameAr: 'خبز', category: 'مخبوزات', price: 2, inStock: true },
  { catalogId: 'c', nameAr: 'أرز', category: 'ألبان', price: 20, inStock: false },
];
assert.deepEqual(neighborShelfCategories(sample), ['ألبان', 'مخبوزات']);
assert.equal(
  filterNeighborShelf(sample, { query: 'حل', category: NEIGHBOR_SHELF_ALL_CATEGORY }).length,
  1,
);
assert.equal(
  filterNeighborShelf(sample, { query: '', category: 'ألبان' }).length,
  1,
);
assert.equal(
  neighborProductLayout({
    ...sample[0],
    nameAr: 'أرز بسمتي فاخر مناسب للعائلة الكبيرة — كيس',
  }),
  'row',
);
assert.equal(neighborProductLayout(sample[0]), 'compact');

const cartStore = new Map<string, string>();
Object.assign(globalThis, {
  window: {
    localStorage: {
      getItem: (key: string) => cartStore.get(key) ?? null,
      setItem: (key: string, value: string) => {
        cartStore.set(key, value);
      },
      removeItem: (key: string) => {
        cartStore.delete(key);
      },
    },
  },
});

writeNeighborCartQty('grocers', 'test-token', { a: 2, b: 1 });
assert.deepEqual(readNeighborCartQty('grocers', 'test-token'), { a: 2, b: 1 });
clearNeighborCartQty('grocers', 'test-token');
assert.deepEqual(readNeighborCartQty('grocers', 'test-token'), {});

assert.equal(typeof NeighborShopEvents.viewStore, 'function');
assert.equal(typeof NeighborShopEvents.addItem, 'function');
assert.equal(typeof NeighborShopEvents.orderSubmitted, 'function');

console.log('test-neighbor-shop-lab: ok');
