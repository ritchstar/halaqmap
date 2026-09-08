/**
 * صفحة اليوم الوطني — مسار مستقل بلا DB.
 * تشغيل: npx tsx scripts/test-store-national-day.mts
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  NATIONAL_DAY_PRODUCTS,
  STORE_NATIONAL_DAY_PUBLIC_ENABLED,
  nationalDayCampaignPhase,
  nationalDayProductsForSegment,
  nationalDayTrialProductLabels,
} from '../src/config/storeNationalDay.ts';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const page = readFileSync(join(root, 'src/pages/store/StoreNationalDayLandingPage.tsx'), 'utf8');

assert.equal(STORE_NATIONAL_DAY_PUBLIC_ENABLED, true);
assert.equal(ROUTE_PATHS.STORE_NATIONAL_DAY, '/store/national-day');
assert.match(app, /StoreNationalDayLandingPage/);
assert.match(app, /\/store\/national-day/);
assert.match(page, /StoreNationalDayExplorer/);
assert.match(page, /STORE_NATIONAL_DAY_IDENTITY_MARK_SRC/);
assert.match(page, /store-national-day__identity-mark/);
assert.ok(existsSync(join(root, 'public/images/store/national-day/official-identity-mark.png')));
assert.doesNotMatch(page, /href="#national-day-explorer"/);
assert.match(app, /StoreNationalDayHashRedirect/);
assert.match(readFileSync(join(root, 'src/lib/storeNationalDayScroll.ts'), 'utf8'), /scrollToNationalDayExplorer/);
assert.match(readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8'), /StoreNationalDayPromoBanner/);
assert.doesNotMatch(page, /moyasar/i);
assert.doesNotMatch(page, /خصم|تخفيض/i);

assert.equal(nationalDayProductsForSegment('daily_retail').length, 2);
assert.equal(nationalDayProductsForSegment('home_made').length, 2);
assert.equal(nationalDayProductsForSegment('hospitality').length, 2);
assert.equal(nationalDayProductsForSegment('venues').length, 1);
assert.ok(nationalDayProductsForSegment('occasions').length >= 3);
assert.equal(nationalDayProductsForSegment('trades').length, 1);
assert.ok(nationalDayTrialProductLabels().length >= 7);
assert.ok(NATIONAL_DAY_PRODUCTS.every((p) => p.href.startsWith('/')));

assert.ok(existsSync(join(root, 'src/styles/storeNationalDay.css')));
assert.match(readFileSync(join(root, 'src/index.css'), 'utf8'), /storeNationalDay\.css/);

assert.ok(['active', 'thanks'].includes(nationalDayCampaignPhase(new Date('2026-09-20T12:00:00+03:00'))));
assert.equal(nationalDayCampaignPhase(new Date('2026-09-26T12:00:00+03:00')), 'thanks');

console.log('store-national-day: ok');
