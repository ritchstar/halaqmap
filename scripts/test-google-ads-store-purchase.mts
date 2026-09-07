/**
 * Google Ads — تحويل شراء المتجر بعد ميسر.
 * تشغيل: npx tsx scripts/test-google-ads-store-purchase.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const config = readFileSync(join(root, 'src/config/googleAdsTag.ts'), 'utf8');
const tagLib = readFileSync(join(root, 'src/lib/googleAdsTag.ts'), 'utf8');
const helper = readFileSync(join(root, 'src/lib/storeLivePaymentGoogleAds.ts'), 'utf8');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');

assert.match(config, /AW-18240041811\/lozMCN-MgPAcENPmw_lD/);
assert.match(tagLib, /trackGoogleAdsStorePurchase/);
assert.match(tagLib, /store_purchase/);
assert.match(tagLib, /transaction_id/);
assert.match(helper, /completeStoreLivePaymentAndGo/);
assert.match(indexHtml, /AW-18240041811/);
assert.match(indexHtml, /G-NVQ8BJDN30/);

for (const rel of [
  'src/pages/store/StoreGrocersPayPage.tsx',
  'src/pages/store/StoreHalanaPayPage.tsx',
  'src/pages/store/StorePaidInvitePayPage.tsx',
] as const) {
  const src = readFileSync(join(root, rel), 'utf8');
  assert.match(src, /completeStoreLivePaymentAndGo/, rel);
  assert.doesNotMatch(src, /window\.location\.replace\([^)]+\);\s*\n\s*return;\s*\n\s*\}\s*\n\s*setActivating\(false\);\s*\n\s*activateOnceRef\.current = false/, rel);
}

console.log('google-ads-store-purchase: ok');
