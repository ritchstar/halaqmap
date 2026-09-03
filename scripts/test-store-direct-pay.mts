/**
 * نظام تمرير تعليمات الدفع الموحّد.
 * تشغيل: npx tsx scripts/test-store-direct-pay.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_DIRECT_PAY_COPY, STORE_DIRECT_PAY_GUEST_PRODUCTS } from '../src/config/storeDirectPay.ts';
import { STORE_DIRECT_PAY_POLICY_PATH, STORE_DIRECT_PAY_TERMS_SUMMARY_AR } from '../src/config/storeDirectPayLegal.ts';
import {
  isDirectEntityNumber,
  isDirectExternalUrl,
  isDirectIban,
  isDirectMobile,
  isDirectSarieAlias,
  normalizeDirectIban,
} from '../src/lib/storeDirectPay.ts';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const migration = readFileSync(join(root, 'supabase/migrations/198_store_direct_pay.sql'), 'utf8');
const api = readFileSync(join(root, 'api/public-store-direct-pay.ts'), 'utf8');
const service = readFileSync(join(root, 'api/_lib/storeDirectPayService.ts'), 'utf8');
const legal = readFileSync(join(root, 'src/config/storeIssuedCardsLegal.ts'), 'utf8');
const privacy = readFileSync(join(root, 'src/pages/Privacy.tsx'), 'utf8');

assert.equal(ROUTE_PATHS.STORE_DIRECT_PAY_POLICY, '/store/direct-pay');
assert.equal(STORE_DIRECT_PAY_POLICY_PATH, '/store/direct-pay');
assert.match(STORE_DIRECT_PAY_COPY.leadAr, /شريك تقني/);
assert.match(STORE_DIRECT_PAY_TERMS_SUMMARY_AR, /لا تأخذ عليه عمولة/);
assert.ok(STORE_DIRECT_PAY_GUEST_PRODUCTS.includes('store_halana_live'));
assert.ok(STORE_DIRECT_PAY_GUEST_PRODUCTS.includes('store_kitchen_live'));
assert.ok(!(STORE_DIRECT_PAY_GUEST_PRODUCTS as readonly string[]).includes('store_wedding_live'));
assert.ok(app.includes('StoreDirectPayPolicyPage'));
assert.ok(app.includes('/store/direct-pay'));
assert.doesNotMatch(app, /from ['"]@\/config\/storeDirectPay/);
assert.match(migration, /store_direct_pay_profiles/);
assert.match(migration, /store_direct_pay_proofs/);
assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
assert.match(migration, /REVOKE ALL ON TABLE public.store_direct_pay_profiles FROM anon, authenticated/);
assert.match(api, /save_pay/);
assert.match(api, /add_proof/);
assert.doesNotMatch(api, /moyasar/i);
assert.match(service, /pay_stc_mobile_cipher/);
assert.match(service, /pay_sarie_alias_cipher/);
assert.match(service, /لا تُستخدم الهوية/);
assert.match(legal, /STORE_DIRECT_PAY_TERMS_SUMMARY_AR/);
assert.match(privacy, /وسائل الدفع المباشر/);
assert.equal(normalizeDirectIban('sa12 3456 7890 1234 5678 9012'), 'SA1234567890123456789012');
assert.equal(isDirectIban('SA1234567890123456789012'), true);
assert.equal(isDirectMobile('0551234567'), true);
assert.equal(isDirectSarieAlias('entity', '7001234567'), true);
assert.equal(isDirectEntityNumber('1047848245'), false);
assert.equal(isDirectExternalUrl('https://bit.ly/pay'), false);
assert.equal(isDirectExternalUrl('https://checkout.tap.company/x'), true);

for (const file of [
  'src/components/store/StoreKitchenDesk.tsx',
  'src/components/store/StoreGrocersDesk.tsx',
  'src/components/store/StoreProduceDesk.tsx',
  'src/components/store/StoreRestaurantDesk.tsx',
  'src/components/store/StoreCafeDesk.tsx',
  'src/pages/store/StoreHalanaShopPage.tsx',
]) {
  const src = readFileSync(join(root, file), 'utf8');
  assert.match(src, /StoreDirectPayDesk/, file);
}

for (const file of [
  'src/components/store/StoreKitchenShop.tsx',
  'src/components/store/StoreGrocersShop.tsx',
  'src/components/store/StoreProduceShop.tsx',
  'src/components/store/StoreRestaurantShop.tsx',
  'src/components/store/StoreCafeShop.tsx',
]) {
  const src = readFileSync(join(root, file), 'utf8');
  assert.match(src, /StoreDirectPayGuest/, file);
}

console.log('store-direct-pay ok');
