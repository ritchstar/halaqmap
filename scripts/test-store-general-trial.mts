/**
 * نظام التجربة العام: ستون يوماً للمنتجات الستة، متصفح أو مسوّق، بلا مدد أطول.
 * تشغيل: npx tsx scripts/test-store-general-trial.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_GENERAL_TRIAL_COPY,
  STORE_GENERAL_TRIAL_KEYS,
  STORE_GENERAL_TRIAL_PUBLIC_ENABLED,
  STORE_PRODUCT_TRIAL_COPY,
  STORE_PRODUCT_TRIAL_DAYS,
  isGeneralTrialProduct,
  trialDaysFor,
} from '../src/config/storeProductTrial.ts';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const landing = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');
const produceLanding = readFileSync(join(root, 'src/pages/store/StoreProduceLandingPage.tsx'), 'utf8');
const kitchenLanding = readFileSync(join(root, 'src/pages/store/StoreKitchenLandingPage.tsx'), 'utf8');
const grocersLanding = readFileSync(join(root, 'src/pages/store/StoreGrocersLandingPage.tsx'), 'utf8');
const trialApi = readFileSync(join(root, 'api/_lib/storeProductTrial.ts'), 'utf8');
const affiliate = readFileSync(join(root, 'src/components/affiliate/AffiliateStoreLane.tsx'), 'utf8');
const adminBoard = readFileSync(join(root, 'src/components/admin/StoreTrialOpsBoard.tsx'), 'utf8');
const migration = readFileSync(join(root, 'supabase/migrations/193_store_general_trial.sql'), 'utf8');

assert.equal(STORE_GENERAL_TRIAL_PUBLIC_ENABLED, true);
assert.equal(STORE_PRODUCT_TRIAL_DAYS, 60);
assert.deepEqual([...STORE_GENERAL_TRIAL_KEYS], ['lounge', 'grocers', 'restaurant', 'cafe', 'kitchen', 'produce']);
assert.equal(isGeneralTrialProduct('kitchen'), true);
assert.equal(isGeneralTrialProduct('wedding'), false);
assert.equal(trialDaysFor('kitchen'), 60);
assert.equal(trialDaysFor('produce'), 60);
assert.equal(trialDaysFor('lounge'), 60);
assert.match(STORE_PRODUCT_TRIAL_COPY.firstVisitAr, /ستون يوماً/);
assert.doesNotMatch(STORE_PRODUCT_TRIAL_COPY.firstVisitAr, /مئة وثمانون/);
assert.match(STORE_GENERAL_TRIAL_COPY.titleAr, /ستين يوماً/);
assert.ok(!STORE_GENERAL_TRIAL_COPY.leadAr.includes('افراحي1'));
assert.ok(!STORE_GENERAL_TRIAL_COPY.leadAr.includes('كاردي8'));

assert.equal(ROUTE_PATHS.STORE_GENERAL_TRIAL, '/store/try');
assert.equal(ROUTE_PATHS.STORE_GENERAL_TRIAL_TERMS, '/store/try/terms');
assert.equal(ROUTE_PATHS.STORE_GENERAL_TRIAL_CONFIRM, '/store/try/confirm');
assert.ok(app.includes('StoreGeneralTrialLandingPage'));
assert.ok(app.includes('/store/try'));
assert.doesNotMatch(app, /storeProductTrial/);
assert.ok(landing.includes('StoreGeneralTrialPromoBanner'));
assert.doesNotMatch(produceLanding, /STORE_GENERAL_TRIAL|STORE_PRODUCT_TRIAL/);
assert.doesNotMatch(kitchenLanding, /STORE_GENERAL_TRIAL|STORE_PRODUCT_TRIAL/);
assert.doesNotMatch(grocersLanding, /STORE_GENERAL_TRIAL|STORE_PRODUCT_TRIAL/);
assert.match(trialApi, /isGeneralTrialProductKey/);
assert.match(trialApi, /issuer_kind: 'visitor'/);
assert.match(trialApi, /pending_confirm/);
assert.doesNotMatch(trialApi, /trial-180/);
assert.match(affiliate, /STORE_GENERAL_TRIAL_KEYS/);
assert.doesNotMatch(affiliate, /STORE_PRODUCT_TRIAL_KEYS\.map/);
assert.match(adminBoard, /STORE_GENERAL_TRIAL_KEYS/);
assert.match(migration, /pending_confirm/);
assert.match(migration, /visitor/);

console.log('store-general-trial ok');
