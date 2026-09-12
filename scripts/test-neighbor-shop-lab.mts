/**
 * فحص تجربة جار الحي — تمويناتا1 وخضarنا1 وطبختنا1.
 * تشغيل: npx tsx scripts/test-neighbor-shop-lab.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_GROCERS_LIVE_LAB_TOKEN } from '../src/config/storeGrocersLive.ts';
import { STORE_PRODUCE_LIVE_LAB_TOKEN } from '../src/config/storeProduceLive.ts';
import { STORE_KITCHEN_LIVE_LAB_TOKEN } from '../src/config/storeKitchenLive.ts';
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

function assertNeighborShop(fileName: string, kind: 'grocers' | 'produce' | 'kitchen', checkoutId: string) {
  const shop = readFileSync(join(root, `src/components/store/Store${fileName}Shop.tsx`), 'utf8');
  assert.match(shop, /neighborShopUx\s*=\s*Boolean\(activityShell\)/);
  assert.match(shop, /NeighborShelfExplorer/);
  assert.match(shop, /AdaptiveProductGrid/);
  assert.match(shop, /NeighborFloatingCart/);
  assert.match(shop, new RegExp(`readNeighborCartQty\\('${kind}'`));
  assert.match(shop, new RegExp(`writeNeighborCartQty\\('${kind}'`));
  assert.match(shop, new RegExp(`clearNeighborCartQty\\('${kind}'`));
  assert.match(shop, /NeighborShopEvents/);
  assert.match(shop, /neighbor-shop-pad/);
  assert.match(shop, new RegExp(`id="${checkoutId}"`));

  const branchStart = shop.indexOf('neighborShopUx ? (');
  const branchEnd = shop.indexOf(') : (', branchStart);
  const branch = branchStart >= 0 && branchEnd > branchStart ? shop.slice(branchStart, branchEnd) : '';
  if (kind === 'grocers') {
    assert.doesNotMatch(branch, /grocersCatalogImage/);
  }
  if (kind === 'produce') {
    assert.doesNotMatch(branch, /produceCatalogImage/);
  }
}

const grocersPage = readFileSync(join(root, 'src/pages/store/StoreGrocersShopPage.tsx'), 'utf8');
const producePage = readFileSync(join(root, 'src/pages/store/StoreProduceShopPage.tsx'), 'utf8');
const kitchenPage = readFileSync(join(root, 'src/pages/store/StoreKitchenShopPage.tsx'), 'utf8');
const cartShop = readFileSync(join(root, 'src/components/store/live/StoreLiveActivityCartShop.tsx'), 'utf8');
const shell = readFileSync(join(root, 'src/components/store/live/StoreLiveActivityShell.tsx'), 'utf8');
const indexCss = readFileSync(join(root, 'src/index.css'), 'utf8');

assertNeighborShop('Grocers', 'grocers', 'grocers-checkout');
assertNeighborShop('Produce', 'produce', 'produce-checkout');
assertNeighborShop('Kitchen', 'kitchen', 'kitchen-checkout');

for (const page of [grocersPage, producePage, kitchenPage]) {
  assert.match(page, /showIndependentStoreIdentity(?!\=\{isLab\})/);
  assert.doesNotMatch(page, /showIndependentStoreIdentity=\{isLab\}/);
}

assert.match(cartShop, /IndependentStoreIdentity/);
assert.match(cartShop, /afterTrust=/);
assert.match(shell, /afterTrust\?: ReactNode/);
assert.match(shell, /\{afterTrust \?/);
assert.match(indexCss, /neighbor-shop\.css/);

assert.equal(neighborCartStorageKey('grocers', STORE_GROCERS_LIVE_LAB_TOKEN), 'halaqmap-neighbor-cart:grocers:grocers-lab:v1');
assert.equal(neighborCartStorageKey('produce', STORE_PRODUCE_LIVE_LAB_TOKEN), 'halaqmap-neighbor-cart:produce:produce-lab:v1');
assert.equal(neighborCartStorageKey('kitchen', STORE_KITCHEN_LIVE_LAB_TOKEN), 'halaqmap-neighbor-cart:kitchen:kitchen-lab:v1');

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

writeNeighborCartQty('produce', 'test-token', { a: 2, b: 1 });
assert.deepEqual(readNeighborCartQty('produce', 'test-token'), { a: 2, b: 1 });
clearNeighborCartQty('produce', 'test-token');
assert.deepEqual(readNeighborCartQty('produce', 'test-token'), {});

assert.equal(typeof NeighborShopEvents.viewStore, 'function');
assert.equal(typeof NeighborShopEvents.addItem, 'function');
assert.equal(typeof NeighborShopEvents.orderSubmitted, 'function');

console.log('test-neighbor-shop-lab: ok');
