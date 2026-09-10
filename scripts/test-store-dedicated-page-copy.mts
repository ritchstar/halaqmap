/**
 * توضيح الصفحة المخصصة — لا سوقاً مشتركاً.
 * تشغيل: npx tsx scripts/test-store-dedicated-page-copy.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_DEDICATED_PAGE_COPY,
  storeDedicatedGuestLine,
} from '../src/config/storeDedicatedPageCopy.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

assert.equal(STORE_DEDICATED_PAGE_COPY.titleAr, 'صفحتك لك وحدك');
assert.match(STORE_DEDICATED_PAGE_COPY.leadAr, /ليست متجراً مشتركاً/);
assert.match(STORE_DEDICATED_PAGE_COPY.neighborGuestLineAr, /جار الحي/);
assert.match(STORE_DEDICATED_PAGE_COPY.neighborGuestLineAr, /ليس سوقاً مشتركاً/);
assert.match(STORE_DEDICATED_PAGE_COPY.districtGuestLineAr, /ضيف الحي/);
assert.match(STORE_DEDICATED_PAGE_COPY.customerGuestLineAr, /زبونك/);
assert.match(STORE_DEDICATED_PAGE_COPY.clientFeminineLineAr, /عميلتك/);
assert.match(STORE_DEDICATED_PAGE_COPY.reelOverlayDedicatedAr, /صفحة مستقلة باسم نشاطك/);
assert.match(STORE_DEDICATED_PAGE_COPY.reelOverlayBrowseAr, /يتصفح زبونك/);
assert.doesNotMatch(STORE_DEDICATED_PAGE_COPY.leadAr, /ملكك الحصري|ملكية حصرية/i);

assert.equal(storeDedicatedGuestLine('neighbor'), STORE_DEDICATED_PAGE_COPY.neighborGuestLineAr);

const landingPages = [
  'src/pages/store/StoreGrocersLandingPage.tsx',
  'src/pages/store/StoreProduceLandingPage.tsx',
  'src/pages/store/StoreRestaurantLandingPage.tsx',
  'src/pages/store/StoreCafeLandingPage.tsx',
  'src/pages/store/StoreKitchenLandingPage.tsx',
  'src/pages/store/StoreHalanaLandingPage.tsx',
];

for (const page of landingPages) {
  const src = readFileSync(join(root, page), 'utf8');
  assert.match(src, /StoreDedicatedPageCallout/, page);
  assert.match(src, /StoreDedicatedPageReelCaption/, page);
}

const storeLanding = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');
assert.match(storeLanding, /StoreDedicatedPageCallout/);
assert.match(storeLanding, /storeBrowseNeighborhoodLeadAr/);
assert.match(storeLanding, /storeBrowseHospitalityLeadAr/);

console.log('test-store-dedicated-page-copy: ok');
