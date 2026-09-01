/**
 * شعار محل الحي: بيانات مضغوطة فقط، على الخمس محلات، بلا قاعات ولا لاونج.
 * تشغيل: npx tsx scripts/test-store-shop-logo.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_SHOP_LOGO_COPY, STORE_SHOP_LOGO_MAX_CHARS } from '../src/config/storeShopLogo.ts';
import { parseShopLogoSrc } from '../src/lib/storeShopLogo.ts';
import { parseShopLogoSrc as parseShopLogoSrcApi } from '../api/_lib/storeShopLogo.ts';
import { publicKitchenPayload } from '../api/_lib/storeKitchenLive.ts';
import { publicGrocersPayload } from '../api/_lib/storeGrocersLive.ts';
import { publicRestaurantPayload } from '../api/_lib/storeRestaurantLive.ts';
import { publicCafePayload } from '../api/_lib/storeCafeLive.ts';
import { publicProducePayload } from '../api/_lib/storeProduceLive.ts';
import { defaultKitchenLabState } from '../src/lib/storeKitchenLiveLab.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

const jpeg = `data:image/jpeg;base64,${'A'.repeat(40)}`;
const png = `data:image/png;base64,${'B'.repeat(40)}`;
assert.equal(parseShopLogoSrc(jpeg), jpeg);
assert.equal(parseShopLogoSrc(png), png);
assert.equal(parseShopLogoSrc(''), '');
assert.equal(parseShopLogoSrc(null, jpeg), jpeg);
assert.equal(parseShopLogoSrc('https://evil.example/x.png'), '');
assert.equal(parseShopLogoSrc('data:image/svg+xml;base64,AAAA'), '');
assert.equal(parseShopLogoSrc(`data:image/jpeg;base64,${'A'.repeat(STORE_SHOP_LOGO_MAX_CHARS)}`), '');
assert.deepEqual(parseShopLogoSrcApi(jpeg), parseShopLogoSrc(jpeg));

const kitchen = defaultKitchenLabState();
assert.equal(kitchen.host.logoSrc, '');
assert.equal(publicKitchenPayload({ ...kitchen.host, packId: 'm6', shelf: [], orders: [] }).logoSrc, '');
assert.equal(
  publicKitchenPayload({ ...kitchen.host, packId: 'm6', shelf: [], orders: [], logoSrc: jpeg }).logoSrc,
  jpeg,
);
assert.equal(publicGrocersPayload({ shopName: 'أ', logoSrc: jpeg } as never).logoSrc, jpeg);
assert.equal(publicRestaurantPayload({ shopName: 'أ', logoSrc: jpeg } as never).logoSrc, jpeg);
assert.equal(publicCafePayload({ shopName: 'أ', logoSrc: jpeg } as never).logoSrc, jpeg);
assert.equal(publicProducePayload({ shopName: 'أ', logoSrc: jpeg } as never).logoSrc, jpeg);

assert.match(STORE_SHOP_LOGO_COPY.labelAr, /شعار المحل/);
assert.doesNotMatch(Object.values(STORE_SHOP_LOGO_COPY).join(' '), /افراحي1|اجواء1|لاونجا1|كاردي8/);

const desks = [
  'src/components/store/StoreKitchenDesk.tsx',
  'src/components/store/StoreGrocersDesk.tsx',
  'src/components/store/StoreProduceDesk.tsx',
  'src/components/store/StoreRestaurantDesk.tsx',
  'src/components/store/StoreCafeDesk.tsx',
];
for (const rel of desks) {
  assert.match(read(rel), /StoreShopLogoDesk/);
}

const shops = [
  'src/components/store/StoreKitchenShop.tsx',
  'src/components/store/StoreGrocersShop.tsx',
  'src/components/store/StoreProduceShop.tsx',
  'src/components/store/StoreRestaurantShop.tsx',
  'src/components/store/StoreCafeShop.tsx',
];
for (const rel of shops) {
  assert.match(read(rel), /StoreShopLogoMark/);
}

assert.doesNotMatch(read('src/components/store/StoreLoungeHostPanel.tsx'), /StoreShopLogo/);
assert.doesNotMatch(read('src/components/store/StoreWeddingHostPanel.tsx'), /StoreShopLogo/);
assert.doesNotMatch(read('src/components/store/StoreEventHostPanel.tsx'), /StoreShopLogo/);
assert.doesNotMatch(read('src/App.tsx'), /storeShopLogo/);

const apis = [
  'api/public-store-kitchen-live.ts',
  'api/public-store-grocers-live.ts',
  'api/public-store-restaurant-live.ts',
  'api/public-store-cafe-live.ts',
  'api/public-store-produce-live.ts',
];
for (const rel of apis) {
  assert.match(read(rel), /parseShopLogoSrc/);
}

console.log('test-store-shop-logo: ok');
