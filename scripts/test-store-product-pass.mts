/**
 * بطاقة كيو آر المنتج على الجوال: اسم ومنصب، افتح أو انسخ فقط، بلا تحميل أو مشاركة منصات.
 * تشغيل: npx tsx scripts/test-store-product-pass.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_PRODUCT_PASS_COPY,
  STORE_PRODUCT_PASS_KINDS,
  STORE_PRODUCT_PASS_ROLES,
} from '../src/config/storeProductPass.ts';
import {
  isStoreProductPassKind,
  parsePassName,
  parsePassRole,
  passCardPath,
  passIssuerPath,
  passShopHashPath,
} from '../src/lib/storeProductPass.ts';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const page = readFileSync(join(root, 'src/pages/store/StoreProductPassPage.tsx'), 'utf8');
const grocers = readFileSync(join(root, 'src/components/store/StoreGrocersDesk.tsx'), 'utf8');
const restaurant = readFileSync(join(root, 'src/components/store/StoreRestaurantDesk.tsx'), 'utf8');
const cafe = readFileSync(join(root, 'src/components/store/StoreCafeDesk.tsx'), 'utf8');
const kitchen = readFileSync(join(root, 'src/components/store/StoreKitchenDesk.tsx'), 'utf8');
const lounge = readFileSync(join(root, 'src/components/store/StoreLoungeHostPanel.tsx'), 'utf8');
const produce = readFileSync(join(root, 'src/components/store/StoreProduceDesk.tsx'), 'utf8');
const halana = readFileSync(join(root, 'src/pages/store/StoreHalanaShopPage.tsx'), 'utf8');

assert.equal(ROUTE_PATHS.STORE_PRODUCT_PASS, '/store/pass/:kind/:token');
assert.deepEqual([...STORE_PRODUCT_PASS_KINDS], ['lounge', 'grocers', 'restaurant', 'cafe', 'kitchen', 'produce', 'halana']);
assert.equal(STORE_PRODUCT_PASS_ROLES.length, 8);
assert.match(STORE_PRODUCT_PASS_ROLES.map((item) => item.labelAr).join(' '), /المالك|المالكة|المتخصصة|مشرف|مشرفة|مساعد|مساعدة|عامل التوصيل/);
assert.match(STORE_PRODUCT_PASS_COPY.openAr, /افتح/);
assert.match(STORE_PRODUCT_PASS_COPY.copyAr, /انسخ الرابط/);
assert.match(STORE_PRODUCT_PASS_COPY.saveHintAr, /احفظ صورة الشاشة/);
assert.equal(isStoreProductPassKind('grocers'), true);
assert.equal(isStoreProductPassKind('wedding'), false);
assert.equal(parsePassName('أ'), null);
assert.equal(parsePassName('انظر https://example.com'), null);
assert.equal(parsePassName('سارة أحمد'), 'سارة أحمد');
assert.equal(parsePassRole('owner_f'), 'owner_f');
assert.equal(parsePassRole('manager'), null);
assert.equal(passShopHashPath('grocers', 'abc'), '/g/abc');
assert.equal(passShopHashPath('halana', 'abc'), '/h/abc');
assert.equal(passShopHashPath('kitchen', 'abc', 'stamp1'), '/k/abc?qr=stamp1');
assert.match(passIssuerPath({ kind: 'cafe', token: 'cafe-lab' }), /\/store\/pass\/cafe\/cafe-lab/);
assert.match(passCardPath({ kind: 'lounge', token: 'lounge-lab', name: 'أحمد', role: 'supervisor', shopName: 'الردهة', qrStamp: '' }), /n=/);

assert.match(app, /StoreProductPassPage/);
assert.match(app, /\/store\/pass\/:kind\/:token/);
assert.doesNotMatch(app, /storeProductPass/);
assert.match(page, /COPY\.openAr/);
assert.match(page, /COPY\.copyAr/);
assert.doesNotMatch(page, /Download|whatsapp|navigator\.share|حفظ في الصور/);
assert.match(page, /saveHintAr/);
assert.match(grocers, /StoreProductPassDeskButton/);
assert.match(restaurant, /StoreProductPassDeskButton/);
assert.match(cafe, /StoreProductPassDeskButton/);
assert.match(kitchen, /StoreProductPassDeskButton/);
assert.match(lounge, /StoreProductPassDeskButton/);
assert.match(produce, /StoreProductPassDeskButton/);
assert.match(halana, /StoreHalanaShareDesk/);
assert.doesNotMatch(STORE_PRODUCT_PASS_COPY.leadAr, /كاردي8|افراحي1|اجواء1/);

console.log('test-store-product-pass: ok');
