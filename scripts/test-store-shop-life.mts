/**
 * حياة صفحة الحي: إضاءة ثلاثية وحرارة المدن، بلا شعار المتجر.
 * تشغيل: npx tsx scripts/test-store-shop-life.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_SHOP_LIFE_COPY, STORE_SHOP_LIGHT_ZONES } from '../src/config/storeShopLife.ts';
import { isStoreShopLightZone, readStoreShopLightZone } from '../src/lib/storeShopLife.ts';
import { KSA_CITIES_GEO } from '../src/config/ksaCitiesGeo.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const shell = readFileSync(join(root, 'src/components/store/StorePurchasedShell.tsx'), 'utf8');
const life = readFileSync(join(root, 'src/components/store/StoreShopLife.tsx'), 'utf8');
const hook = readFileSync(join(root, 'src/hooks/useKsaCityTemps.ts'), 'utf8');

assert.doesNotMatch(app, /from ['"]@\/config\/storeShopLife['"]/);
assert.doesNotMatch(app, /from ['"]@\/components\/store\/StoreShopLife['"]/);
assert.match(shell, /life/);
assert.match(shell, /StoreShopLife/);
assert.doesNotMatch(shell, /STORE_VISUALS\.logo|storeFront/);
assert.doesNotMatch(life, /STORE_VISUALS\.logo|geolocation|getCurrentPosition|readStoredUserCoords/);
assert.doesNotMatch(hook, /geolocation|getCurrentPosition|readStoredUserCoords/);
assert.match(life, /أعلى/);
assert.match(life, /وسط/);
assert.match(life, /أسفل/);
assert.match(life, /KSA_CITIES_GEO/);
assert.match(hook, /fetchTemperatureCelsius/);

assert.deepEqual([...STORE_SHOP_LIGHT_ZONES], ['top', 'mid', 'bottom']);
assert.equal(isStoreShopLightZone('top'), true);
assert.equal(isStoreShopLightZone('side'), false);
assert.equal(readStoreShopLightZone(), 'mid');
assert.equal(STORE_SHOP_LIFE_COPY.topAr, 'أعلى');
assert.ok(KSA_CITIES_GEO.length >= 10);

for (const file of [
  'StoreGrocersShopPage.tsx',
  'StoreProduceShopPage.tsx',
  'StoreRestaurantShopPage.tsx',
  'StoreKitchenShopPage.tsx',
]) {
  assert.match(readFileSync(join(root, 'src/pages/store', file), 'utf8'), /\blife\b/);
}
assert.match(readFileSync(join(root, 'src/pages/store/StoreCafeShopPage.tsx'), 'utf8'), /life=\{neighborhoodShop \|\| mode === 'desk'\}/);
assert.doesNotMatch(readFileSync(join(root, 'src/pages/store/StoreWeddingHallPage.tsx'), 'utf8'), /\blife\b/);
assert.doesNotMatch(readFileSync(join(root, 'src/pages/store/StoreLoungeHallPage.tsx'), 'utf8'), /\blife\b/);
assert.doesNotMatch(readFileSync(join(root, 'src/pages/store/StoreEventHallPage.tsx'), 'utf8'), /\blife\b/);

console.log('store-shop-life: ok');
