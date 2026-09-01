/**
 * فحص تنظيم صفحات المنتجات على الجوال: طي التفاصيل، تحميل الاستوديو عند الظهور، وعزل App.
 * تشغيل: npx tsx scripts/test-store-mobile-product-page.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');
const app = read('src/App.tsx');
const chrome = read('src/components/store/StoreChrome.tsx');
const shell = read('src/components/store/StorePurchasedShell.tsx');
const engage = read('src/components/store/StoreVisitorEngage.tsx');
const css = read('src/index.css');

assert.match(chrome, /store-product-shell/);
assert.match(chrome, /store-visitor-header__row/);
assert.match(shell, /useIsMobile/);
assert.match(shell, /life && isMobile/);
assert.match(engage, /\/store\/wedding/);
assert.match(css, /store-studio-switch/);
assert.match(css, /store-ops-tool/);
assert.match(css, /store-preview-skeleton/);

assert.doesNotMatch(app, /from ['"]@\/components\/store\/StoreInViewMount['"]/);
assert.doesNotMatch(app, /from ['"]@\/components\/store\/StoreLandingFold['"]/);
assert.doesNotMatch(app, /from ['"]@\/components\/store\/StoreOpsSection['"]/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeGrocersLive['"]/);

const landings = [
  'src/pages/store/StoreGrocersLandingPage.tsx',
  'src/pages/store/StoreRestaurantLandingPage.tsx',
  'src/pages/store/StoreCafeLandingPage.tsx',
  'src/pages/store/StoreKitchenLandingPage.tsx',
  'src/pages/store/StoreProduceLandingPage.tsx',
  'src/pages/store/StoreWeddingLandingPage.tsx',
  'src/pages/store/StoreEventLandingPage.tsx',
  'src/pages/store/StoreLoungeLandingPage.tsx',
];

for (const file of landings) {
  const src = read(file);
  assert.match(src, /StoreInViewMount/);
  assert.match(src, /StoreLandingFold/);
  assert.match(src, /text-3xl/);
  assert.doesNotMatch(src, /\beager\b/);
}

const desks = [
  'src/components/store/StoreGrocersDesk.tsx',
  'src/components/store/StoreRestaurantDesk.tsx',
  'src/components/store/StoreCafeDesk.tsx',
  'src/components/store/StoreKitchenDesk.tsx',
  'src/components/store/StoreProduceDesk.tsx',
];

for (const file of desks) {
  assert.match(read(file), /StoreOpsSection/);
}

assert.match(read('src/components/store/StoreWeddingHallStage.tsx'), /line-clamp-2/);
assert.match(read('src/components/store/StoreCafeHallStage.tsx'), /min-h-\[20rem\]/);

console.log('store-mobile-product-page: ok');
