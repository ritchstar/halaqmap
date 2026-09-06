/**
 * رابط خريطة الحل على صفحات جار الحي والمدعوين.
 * تشغيل: npx tsx scripts/test-store-live-store-link.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_PUBLIC_NAME_AR } from '../src/config/storeFront.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const link = readFileSync(join(root, 'src/components/store/StoreLiveStoreLink.tsx'), 'utf8');
const shell = readFileSync(join(root, 'src/components/store/StorePurchasedShell.tsx'), 'utf8');

assert.equal(STORE_PUBLIC_NAME_AR, 'خريطة الحل');
assert.match(link, /STORE_PUBLIC_NAME_AR/);
assert.match(link, /STORE_ORIGIN/);
assert.match(link, /#\/store/);
assert.match(shell, /showStoreLink/);
assert.match(shell, /StoreLiveStoreLink/);

for (const [file, pattern] of [
  ['StoreGrocersShopPage.tsx', /showStoreLink=\{!desk\}/],
  ['StoreProduceShopPage.tsx', /showStoreLink=\{!desk\}/],
  ['StoreRestaurantShopPage.tsx', /showStoreLink=\{!desk\}/],
  ['StoreKitchenShopPage.tsx', /showStoreLink=\{!desk\}/],
  ['StoreCafeShopPage.tsx', /showStoreLink=\{mode === 'shop'\}/],
  ['StoreWeddingHallPage.tsx', /showStoreLink=\{mode === 'guest'\}/],
  ['StoreEventHallPage.tsx', /showStoreLink=\{mode === 'guest'\}/],
  ['StoreLoungeHallPage.tsx', /showStoreLink=\{mode === 'guest'\}/],
  ['StoreHalanaShopPage.tsx', /StoreLiveStoreLink/],
] as const) {
  assert.match(readFileSync(join(root, 'src/pages/store', file), 'utf8'), pattern, file);
}

console.log('test-store-live-store-link: ok');
