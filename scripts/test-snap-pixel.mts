/**
 * بكسل سناب — SPA + صفحات SEO ثابتة.
 * تشغيل: npx tsx scripts/test-snap-pixel.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { snapMeasurementTagHtml, SNAP_PIXEL_ID } from './lib/snapPixelTag.mjs';
import { fazaaMeasurementTagHtml } from './lib/platformBrandIdentity.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PIXEL_ID = '6f9bc677-f2c2-44a4-b7ba-7a4117b8c534';

assert.equal(SNAP_PIXEL_ID, PIXEL_ID);

const snapLib = readFileSync(join(root, 'src/lib/snapPixel.ts'), 'utf8');
const snapConfig = readFileSync(join(root, 'src/config/snapPixel.ts'), 'utf8');
const tracker = readFileSync(join(root, 'src/components/AnalyticsRouteTracker.tsx'), 'utf8');
const storeSeo = readFileSync(join(root, 'scripts/generate-store-intent-seo.mjs'), 'utf8');

assert.match(snapConfig, new RegExp(PIXEL_ID.replace(/-/g, '\\-')));
assert.match(snapLib, /trackSnapPageView/);
assert.match(snapLib, /trackSnapViewContent/);
assert.match(snapLib, /isSnapStoreViewContentPath/);
assert.match(snapLib, /PAGE_VIEW/);
assert.match(snapLib, /VIEW_CONTENT/);
assert.doesNotMatch(snapLib, /snaptr\([^)]*user_email/);
assert.doesNotMatch(snapLib, /ADD_CART|PURCHASE/);

assert.match(tracker, /initSnapPixel/);
assert.match(tracker, /trackSnapPageView/);
assert.match(tracker, /trackSnapViewContent/);
assert.match(tracker, /isSnapStoreViewContentPath/);

assert.match(storeSeo, /snapViewContent:\s*true/);

const baseTag = snapMeasurementTagHtml();
assert.match(baseTag, /scevent\.min\.js/);
assert.match(baseTag, new RegExp(`snaptr\\('init', '${PIXEL_ID}'\\)`));
assert.match(baseTag, /PAGE_VIEW/);
assert.doesNotMatch(baseTag, /snaptr\([^)]*user_email/);
assert.doesNotMatch(baseTag, /VIEW_CONTENT/);

const storeTag = snapMeasurementTagHtml({ viewContent: true });
assert.match(storeTag, /VIEW_CONTENT/);

const fazaaTag = fazaaMeasurementTagHtml({ snapViewContent: true });
assert.match(fazaaTag, /G-NVQ8BJDN30/);
assert.match(fazaaTag, new RegExp(PIXEL_ID.replace(/-/g, '\\-')));

console.log('test-snap-pixel: ok');
