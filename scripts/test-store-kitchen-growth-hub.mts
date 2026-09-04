/**
 * مركز نمو طبختنا1: مسار اللوحة فقط، بلا أسعار اشتراك وبلا ميسر.
 * تشغيل: npx tsx scripts/test-store-kitchen-growth-hub.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  kitchenGrowthHubPath,
  kitchenGrowthItemsByCategory,
  STORE_KITCHEN_GROWTH_CATEGORIES,
  STORE_KITCHEN_GROWTH_HUB_COPY,
  STORE_KITCHEN_GROWTH_HUB_PRODUCT_ID,
  STORE_KITCHEN_GROWTH_HUB_REVISION,
  STORE_KITCHEN_GROWTH_ITEMS,
} from '../src/config/storeKitchenGrowthHub.ts';
import {
  hasKitchenGrowthHubBadge,
  markKitchenGrowthHubSeen,
  readKitchenGrowthSeenRevision,
} from '../src/lib/storeKitchenGrowthHubSeen.ts';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const page = readFileSync(join(root, 'src/pages/store/StoreKitchenGrowthHubPage.tsx'), 'utf8');
const desk = readFileSync(join(root, 'src/components/store/StoreKitchenDesk.tsx'), 'utf8');
const button = readFileSync(join(root, 'src/components/store/StoreKitchenGrowthHubButton.tsx'), 'utf8');
const shop = readFileSync(join(root, 'src/pages/store/StoreKitchenShopPage.tsx'), 'utf8');
const operators = readFileSync(join(root, 'src/pages/store/StoreOperatorsDeskPage.tsx'), 'utf8');
const cafeDesk = readFileSync(join(root, 'src/components/store/StoreCafeDesk.tsx'), 'utf8');
const grocersDesk = readFileSync(join(root, 'src/components/store/StoreGrocersDesk.tsx'), 'utf8');
const produceDesk = readFileSync(join(root, 'src/components/store/StoreProduceDesk.tsx'), 'utf8');
const restaurantDesk = readFileSync(join(root, 'src/components/store/StoreRestaurantDesk.tsx'), 'utf8');

assert.equal(STORE_KITCHEN_GROWTH_HUB_PRODUCT_ID, 'kitchen');
assert.equal(STORE_KITCHEN_GROWTH_HUB_REVISION, 2);
assert.equal(ROUTE_PATHS.STORE_KITCHEN_GROWTH, '/k/:token/desk/growth');
assert.equal(kitchenGrowthHubPath('kitchen-lab'), '/k/kitchen-lab/desk/growth');
assert.deepEqual(
  STORE_KITCHEN_GROWTH_CATEGORIES.map((item) => item.id),
  ['whatsapp', 'basket', 'intake', 'qr'],
);
assert.equal(STORE_KITCHEN_GROWTH_ITEMS.length, 9);
assert.equal(kitchenGrowthItemsByCategory('whatsapp').length, 2);
assert.equal(kitchenGrowthItemsByCategory('basket').length, 2);
assert.equal(kitchenGrowthItemsByCategory('intake').length, 3);
assert.equal(kitchenGrowthItemsByCategory('qr').length, 2);

const copyBlob = [
  JSON.stringify(STORE_KITCHEN_GROWTH_HUB_COPY),
  JSON.stringify(STORE_KITCHEN_GROWTH_CATEGORIES),
  JSON.stringify(STORE_KITCHEN_GROWTH_ITEMS),
].join('\n');
assert.match(copyBlob, /طبختنا1/);
assert.match(copyBlob, /نصوص الواتساب والمنصات/);
assert.match(copyBlob, /باقة اللمة/);
assert.match(copyBlob, /جدولة الطلب المسبق/);
assert.match(copyBlob, /كود الـ QR/);
assert.match(copyBlob, /ميسّر مالي على سلة العميل/);
assert.doesNotMatch(copyBlob, /أكلنا1|مطعمنا1|تمويناتا1|كافينا1|خضارنا1|افراحي1|اجواء1|لاونجا1|كاردي8/);
assert.doesNotMatch(copyBlob, /تجربة|رخصة النفاذ/);
assert.doesNotMatch(copyBlob.replace(/ميسّر مالي على سلة العميل/g, ''), /ميسر|ميسّر/);
assert.doesNotMatch(copyBlob, /300 ر\.س|600 ر\.س|899/);
assert.doesNotMatch(page, /أكلنا1|ميسر|تجربة/);
assert.doesNotMatch(page, /WhatsApp Business API|إرسال جماعي نيابة/);

assert.doesNotMatch(app, /from ['"]@\/config\/storeKitchenGrowthHub['"]/);
assert.doesNotMatch(app, /storeKitchenGrowthHub/);
assert.match(app, /StoreKitchenGrowthHubPage/);
assert.match(app, /\/k\/:token\/desk\/growth/);
{
  const growthRoute = app.indexOf('path={STORE_KITCHEN_GROWTH_PATH}');
  const deskRoute = app.indexOf('path={STORE_KITCHEN_DESK_PATH}');
  assert.ok(growthRoute >= 0 && deskRoute >= 0 && growthRoute < deskRoute);
}

assert.match(desk, /import \{ StoreKitchenGrowthHubButton \}/);
assert.equal((desk.match(/<StoreKitchenGrowthHubButton /g) || []).length, 1);
assert.match(button, /hasKitchenGrowthHubBadge/);
assert.match(button, /kitchenGrowthHubPath/);
assert.doesNotMatch(shop, /endsWith\(['"]\/desk['"]\)/);
assert.doesNotMatch(operators, /StoreKitchenGrowthHub|مركز النمو والتسويق/);
assert.doesNotMatch(cafeDesk, /StoreKitchenGrowthHubButton/);
assert.doesNotMatch(grocersDesk, /StoreKitchenGrowthHubButton/);
assert.doesNotMatch(produceDesk, /StoreKitchenGrowthHubButton/);
assert.doesNotMatch(restaurantDesk, /StoreKitchenGrowthHubButton/);

const memory = new Map<string, string>();
(globalThis as { window?: { localStorage: { getItem(key: string): string | null; setItem(key: string, value: string): void } } }).window = {
  localStorage: {
    getItem(key) {
      return memory.get(key) ?? null;
    },
    setItem(key, value) {
      memory.set(key, value);
    },
  },
};
assert.equal(hasKitchenGrowthHubBadge('abc'), true);
assert.equal(readKitchenGrowthSeenRevision('abc'), 0);
markKitchenGrowthHubSeen('abc');
assert.equal(readKitchenGrowthSeenRevision('abc'), STORE_KITCHEN_GROWTH_HUB_REVISION);
assert.equal(hasKitchenGrowthHubBadge('abc'), false);
assert.equal(hasKitchenGrowthHubBadge('other'), true);

console.log('test-store-kitchen-growth-hub: ok');
