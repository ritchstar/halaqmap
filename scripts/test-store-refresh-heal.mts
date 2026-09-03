/**
 * يمنع تكرار انقطاع المتجر بعد النشر: تحديث /#/store/... لا يجوز أن يُحوَّل إلى /store.
 * تشغيل: npx tsx scripts/test-store-refresh-heal.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { healStoreRefreshUrl } from '../src/lib/storeRefreshHeal.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8')) as {
  redirects?: Array<{ source: string; destination: string; has?: Array<{ value?: string }> }>;
  rewrites?: Array<{ source: string; destination: string; has?: Array<{ value?: string }> }>;
};
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const buildSync = readFileSync(join(root, 'src/lib/platformBuildSync.ts'), 'utf8');

assert.equal(
  healStoreRefreshUrl({ pathname: '/store', hash: '#/store/affiliates' }),
  '/#/store/affiliates',
);
assert.equal(
  healStoreRefreshUrl({ pathname: '/store/kitchen', search: '?x=1', hash: '#/store/kitchen' }),
  '/?x=1#/store/kitchen',
);
assert.equal(healStoreRefreshUrl({ pathname: '/h/abc', hash: '#/h/abc' }), '/#/h/abc');
assert.equal(healStoreRefreshUrl({ pathname: '/', hash: '#/store/affiliates' }), null);
assert.equal(healStoreRefreshUrl({ pathname: '/store', hash: '' }), null);

const storeRootRedirects = (vercel.redirects || []).filter(
  (row) =>
    (row.source === '/' || row.source === '/index.html') &&
    (row.has || []).some((item) => item.value === 'store.halaqmap.com'),
);
assert.equal(storeRootRedirects.length, 0, 'store host / and /index.html must not redirect');

const storeRootRewrites = (vercel.rewrites || []).filter(
  (row) =>
    (row.source === '/' || row.source === '/index.html') &&
    (row.has || []).some((item) => item.value === 'store.halaqmap.com') &&
    row.destination === '/store-index.html',
);
assert.equal(storeRootRewrites.length, 2, 'store host / and /index.html must rewrite to store-index.html');

assert.match(indexHtml, /hm-store-refresh-heal/);
assert.match(indexHtml, /\/store#/);
assert.match(indexHtml, /hm-sw-reset-v19/);
assert.match(buildSync, /healStoreRefreshUrl/);

console.log('store-refresh-heal ok');
