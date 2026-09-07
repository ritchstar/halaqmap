/**
 * وسم واتساب لصفحة النشاط يظهر اسم المحل لا عنوان المتجر العام.
 * تشغيل: npx tsx scripts/test-store-live-shop-share.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  storeLiveShopCopy,
  storeLiveShopHashHref,
  storeLiveShopShareHref,
} from '../api/_lib/storeLiveShopShare.ts';
import { halanaShopUrl } from '../api/_lib/storeHalanaLive.ts';
import { halanaShowcaseAbsoluteUrl } from '../src/lib/storeHalanaShare.ts';
import { storeLiveShopShareHref as clientShareHref } from '../src/lib/storeHostRedirect.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vercel = readFileSync(join(root, 'vercel.json'), 'utf8');
const api = readFileSync(join(root, 'api/public-store-live-shop-share.ts'), 'utf8');
const lib = readFileSync(join(root, 'api/_lib/storeLiveShopShare.ts'), 'utf8');
const grocersApi = readFileSync(join(root, 'api/public-store-grocers-live.ts'), 'utf8');
const cafeApi = readFileSync(join(root, 'api/public-store-cafe-live.ts'), 'utf8');

assert.equal(
  storeLiveShopShareHref('halana', 'lab-token'),
  'https://store.halaqmap.com/h/lab-token',
);
assert.equal(
  storeLiveShopShareHref('grocers', 'g1'),
  'https://store.halaqmap.com/g/g1',
);
assert.equal(storeLiveShopHashHref('halana', 'lab-token'), 'https://store.halaqmap.com/#/h/lab-token');
assert.doesNotMatch(storeLiveShopShareHref('halana', 'lab-token'), /#/);

assert.equal(halanaShopUrl('x'), 'https://store.halaqmap.com/h/x');
assert.equal(halanaShowcaseAbsoluteUrl('x'), 'https://store.halaqmap.com/h/x');
assert.equal(clientShareHref('cafe', 'c1'), 'https://store.halaqmap.com/c/c1');

const halanaCopy = storeLiveShopCopy('halana', 'elit.sweetsa');
assert.match(halanaCopy.title, /elit\.sweetsa/);
assert.match(halanaCopy.title, /حلانا1/);
assert.doesNotMatch(halanaCopy.title, /خريطة الحل/);
assert.equal(halanaCopy.siteName, 'elit.sweetsa');
assert.match(halanaCopy.description, /elit\.sweetsa/);

assert.match(storeLiveShopCopy('grocers', 'بقالة الحي').title, /تمويناتا1/);
assert.match(storeLiveShopCopy('cafe', 'مقهى').description, /مقهى/);
assert.match(storeLiveShopCopy('cafe', '').image, /lounge-hero-marketing/);

assert.match(vercel, /public-store-live-shop-share\?kind=halana/);
assert.match(vercel, /public-store-live-shop-share\?kind=cafe/);
assert.match(vercel, /"value": "coiffeur\.halaqmap\.com"/);
assert.match(vercel, /public-coiffeur-card\?c=:token/);
assert.match(vercel, /"source": "\/c\/:path\*"/);
assert.match(api, /isShareCrawler/);
assert.match(lib, /og:title/);
assert.match(api, /noindex, nofollow/);
assert.match(grocersApi, /storeLiveShopShareHref\('grocers'/);
assert.match(cafeApi, /storeLiveShopShareHref\('cafe'/);
assert.match(lib, /findHalanaCopy\(db, token, 'shop'\)\) \|\| \(await findHalanaCopy\(db, token, 'desk'\)\)/);

console.log('store-live-shop-share: ok');
