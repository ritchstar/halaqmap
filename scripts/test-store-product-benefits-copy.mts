/**
 * حراسة نصوص مزايا المنتجات: لا عبارات تتعارض مع منطق المتجر.
 */
import assert from 'node:assert/strict';
import { STORE_PRODUCT_BENEFITS_COPY } from '../src/config/storeProductBenefitsCopy.ts';

const blob = JSON.stringify(STORE_PRODUCT_BENEFITS_COPY);

assert.equal(STORE_PRODUCT_BENEFITS_COPY.navAr, 'مزايا المنتجات');
assert.equal(blob.includes('غالباً'), false);
assert.equal(blob.includes('أكلنا1'), false);
assert.equal(blob.includes('RSVP'), false);
assert.equal(blob.includes('مسوّق'), false);
assert.equal(blob.includes('ستون يوماً'), false);
assert.equal(blob.includes('12 و29 و59'), false);
assert.equal(blob.includes('مؤسس'), false);
assert.equal(blob.includes('مركز بيانات'), false);
assert.equal(blob.includes('stc'), false);
assert.ok(blob.includes('طبختنا1'));
assert.ok(blob.includes('افراحي1'));
assert.ok(blob.includes('لاونجا1'));
assert.ok(blob.includes('كاردي8'));

console.log('test-store-product-benefits-copy: ok');
