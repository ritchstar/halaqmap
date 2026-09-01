/**
 * فحص زرّي حدد موقعي وتأكد من موقعي على صفحات طلب جار الحي.
 * تشغيل: npx tsx scripts/test-store-buyer-locate.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buyerPlaceMapsUrl, shopMapsSearchUrl } from '../src/lib/storeShopPlace.ts';
import { STORE_PRODUCE_LIVE } from '../src/config/storeProduceLive.ts';
import { STORE_GROCERS_LIVE } from '../src/config/storeGrocersLive.ts';
import { STORE_RESTAURANT_LIVE } from '../src/config/storeRestaurantLive.ts';
import { STORE_CAFE_LIVE } from '../src/config/storeCafeLive.ts';
import { STORE_KITCHEN_LIVE } from '../src/config/storeKitchenLive.ts';
import { STORE_LOUNGE_LIVE } from '../src/config/storeLoungeLive.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const shops = [
  'src/components/store/StoreProduceShop.tsx',
  'src/components/store/StoreGrocersShop.tsx',
  'src/components/store/StoreRestaurantShop.tsx',
  'src/components/store/StoreCafeShop.tsx',
  'src/components/store/StoreKitchenShop.tsx',
];

assert.equal(buyerPlaceMapsUrl(''), null);
assert.equal(buyerPlaceMapsUrl('javascript:alert(1)'), null);
assert.equal(buyerPlaceMapsUrl('https://evil.example/phish'), null);
assert.equal(buyerPlaceMapsUrl('https://maps.google.com/?q=24.7,46.6'), 'https://maps.google.com/?q=24.7,46.6');
assert.equal(buyerPlaceMapsUrl('24.7136, 46.6753'), shopMapsSearchUrl(24.7136, 46.6753));
assert.match(String(buyerPlaceMapsUrl('حي النسيم')), /maps\.google\.com/);

for (const copy of [STORE_PRODUCE_LIVE, STORE_GROCERS_LIVE, STORE_RESTAURANT_LIVE, STORE_CAFE_LIVE, STORE_KITCHEN_LIVE]) {
  assert.match(copy.locateMeAr, /حدد موقعي/);
  assert.match(copy.confirmPlaceAr, /تأكد من موقعي/);
}

assert.equal('confirmPlaceAr' in STORE_LOUNGE_LIVE, false);

const button = readFileSync(join(root, 'src/components/store/StoreBuyerLocateButtons.tsx'), 'utf8');
assert.match(button, /buyerPlaceMapsUrl/);
assert.match(button, /requestShopGeo/);
assert.match(button, /noopener/);
assert.doesNotMatch(button, /كاردي8|كوافير ماب|حلاق ماب|افراحي1|اجواء1|لاونجا1/);

for (const path of shops) {
  const src = readFileSync(join(root, path), 'utf8');
  assert.match(src, /StoreBuyerLocateButtons/);
  assert.doesNotMatch(src, /from ['"]@\/config\/storeLoungeLive['"]/);
}

assert.doesNotMatch(readFileSync(join(root, 'src/App.tsx'), 'utf8'), /StoreBuyerLocateButtons|storeShopPlace/);
assert.match(readFileSync(join(root, 'src/components/store/StoreKitchenDesk.tsx'), 'utf8'), /StoreKitchenLocateButton/);

console.log('store-buyer-locate: ok');
