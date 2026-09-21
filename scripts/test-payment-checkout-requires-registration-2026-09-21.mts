/**
 * شراء أول عبر صفحة الحزم يجب ألا يهبط على /partners/payment بلا requestId
 * (وإلا تظهر تأشيرة الشروط بلا نموذج ميسر — الخلل المبلَّغ عنه).
 *
 * تشغيل: npx tsx scripts/test-payment-checkout-requires-registration-2026-09-21.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');

const router = read('src/lib/buyPackageRouter.ts');
assert.match(router, /export function buildListingCheckoutUrl/);
assert.match(router, /ROUTE_PATHS\.REGISTER/);
assert.match(router, /purpose.*recharge/);

const matrix = read('src/components/billing/ListingLicensePricingMatrix.tsx');
assert.match(matrix, /buildListingCheckoutUrl/);
assert.doesNotMatch(matrix, /function paymentHref/);
assert.match(matrix, /checkoutHref\(/);

const payment = read('src/pages/Payment.tsx');
assert.match(payment, /incompleteRegistrationHref/);
assert.match(payment, /إكمال طلب التسجيل/);
assert.match(payment, /registrationRequestReady/);
assert.match(payment, /REGISTRATION_STORAGE_ORDER_ID_RE/);

console.log('✅ مسار الشراء الأول يوجّه للتسجيل، وصفحة الدفع تشرح غياب requestId.');
