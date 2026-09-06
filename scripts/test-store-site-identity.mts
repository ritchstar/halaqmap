/**
 * أيقونة المتجر على store.halaqmap.com وصفحات /need.
 * تشغيل: npx tsx scripts/test-store-site-identity.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src/main.tsx'), 'utf8');
const storeIdentity = readFileSync(join(root, 'src/lib/storeSiteIdentity.ts'), 'utf8');
const storeBrand = readFileSync(join(root, 'scripts/lib/storeBrandIdentity.mjs'), 'utf8');

assert.match(main, /applyStoreHeadSiteIdentity/);
assert.match(storeIdentity, /store-favicon\.ico/);
assert.match(storeIdentity, /store\.halaqmap\.com/);
assert.match(storeBrand, /storeIconLinks/);
assert.match(storeBrand, /halaqmap-store-mark-radar-square-1200x1200\.png/);

for (const file of [
  'store-favicon.ico',
  'store-favicon-48.png',
  'store-favicon-96.png',
  'store-favicon-32.png',
  'store-apple-touch-icon.png',
]) {
  assert.ok(readFileSync(join(root, 'public/icons', file)).byteLength > 0, file);
}

console.log('test-store-site-identity: ok');
