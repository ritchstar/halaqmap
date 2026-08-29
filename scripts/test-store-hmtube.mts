/**
 * أيقونة HMTube على رئيسية المتجر وصفحات المنتجات فقط.
 * تشغيل: npx tsx scripts/test-store-hmtube.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_HMTUBE } from '../src/config/storeHmTube.ts';
import {
  isStoreHomePath,
  isStoreProductLandingPath,
  showStoreHmTubeMark,
} from '../src/lib/storeHmTube.ts';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const chrome = readFileSync(join(root, 'src/components/store/StoreChrome.tsx'), 'utf8');
const purchased = readFileSync(join(root, 'src/components/store/StorePurchasedShell.tsx'), 'utf8');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const mark = readFileSync(join(root, 'public/images/store/hmtube-mark.png'));

assert.equal(STORE_HMTUBE.brand, 'HMTube');
assert.equal(STORE_HMTUBE.markSrc, '/images/store/hmtube-mark.png');
assert.equal(STORE_HMTUBE.labelAr, 'مقاطع منتجات المتجر');
assert.equal('supportAr' in STORE_HMTUBE, false);
assert.equal('watchAr' in STORE_HMTUBE, false);
assert.ok(mark.length > 800 && mark.length < 180_000);

assert.equal(isStoreHomePath('/store'), true);
assert.equal(isStoreHomePath('/store/'), true);
assert.equal(isStoreHomePath('/store/grocers'), false);

assert.equal(isStoreProductLandingPath('/store/grocers'), true);
assert.equal(isStoreProductLandingPath('/store/produce'), true);
assert.equal(isStoreProductLandingPath('/store/restaurant'), true);
assert.equal(isStoreProductLandingPath('/store/cafe'), true);
assert.equal(isStoreProductLandingPath('/store/kitchen'), true);
assert.equal(isStoreProductLandingPath('/store/kitchen/gift'), false);
assert.equal(isStoreProductLandingPath('/store/wedding'), true);
assert.equal(isStoreProductLandingPath('/store/wedding/women'), true);
assert.equal(isStoreProductLandingPath('/store/event/men'), true);
assert.equal(isStoreProductLandingPath('/store/lounge'), true);
assert.equal(isStoreProductLandingPath('/store/invites'), true);
assert.equal(isStoreProductLandingPath('/store'), false);
assert.equal(isStoreProductLandingPath('/store/gift'), false);
assert.equal(isStoreProductLandingPath('/g/abc'), false);

assert.equal(showStoreHmTubeMark('/store'), true);
assert.equal(showStoreHmTubeMark('/store/grocers'), true);
assert.equal(showStoreHmTubeMark('/store/about'), false);
assert.equal(showStoreHmTubeMark('/g/token'), false);
assert.equal(showStoreHmTubeMark('/k/token/desk'), false);

const landing = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');
const css = readFileSync(join(root, 'src/index.css'), 'utf8');
assert.match(chrome, /STORE_HMTUBE/);
assert.match(chrome, /YOUTUBE_STORE/);
assert.match(chrome, /isStoreProductLandingPath/);
assert.match(chrome, /store-hmtube-live/);
assert.match(chrome, /StoreHmTubeHero/);
assert.match(chrome, /labelAr/);
assert.doesNotMatch(chrome, /دعم تسويقي/);
assert.doesNotMatch(chrome, /showStoreHmTubeMark/);
assert.match(landing, /StoreHmTubeHero/);
assert.match(css, /store-hmtube-glow/);
assert.match(css, /store-hmtube-beat/);
assert.doesNotMatch(purchased, /HMTube|hmtube-mark|YOUTUBE_STORE/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeHmTube['"]/);
assert.doesNotMatch(app, /from ['"]@\/lib\/storeHmTube['"]/);
assert.equal(ROUTE_PATHS.YOUTUBE_STORE, '/store/videos');

console.log('store-hmtube: ok');
