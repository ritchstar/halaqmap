/**
 * روابط Search Console التي صارت 404 بسبب `/https://www.halaqmap.com/...`
 * أو مسارات متجر بلا رمز.
 * تشغيل: npx tsx scripts/test-gsc-malformed-http-path.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteRelativePath } from '../src/lib/siteRelativePath.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vercel = readFileSync(join(root, 'vercel.json'), 'utf8');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const siteOrigin = readFileSync(join(root, 'src/config/siteOrigin.ts'), 'utf8');

assert.equal(siteRelativePath('/store'), '/store');
assert.equal(siteRelativePath('partners'), '/partners');
assert.equal(siteRelativePath('https://www.halaqmap.com/store'), '/store');
assert.equal(siteRelativePath('https://www.halaqmap.com/pay/wedding'), '/pay/wedding');
assert.equal(siteRelativePath('/https://www.halaqmap.com/partners'), '/partners');
assert.equal(siteRelativePath('/https://www.halaqmap.com/c'), '/c');
assert.equal(siteRelativePath('/https:/www.halaqmap.com/barber'), '/barber');
assert.equal(siteRelativePath('https://www.halaqmap.com/#/store/wedding'), '/store/wedding');
assert.equal(siteRelativePath('/#/store'), '/store');
assert.doesNotMatch(siteRelativePath('https://www.halaqmap.com/store'), /^\/https:/);

assert.match(siteOrigin, /siteRelativePath\(path\)/);

assert.doesNotMatch(vercel, /:protocol\(https\)/);
assert.doesNotMatch(vercel, /"source": "\/https/);
assert.match(vercel, /"source": "\/pay\/wedding"/);
assert.match(vercel, /"source": "\/pay\/event"/);
assert.match(vercel, /"source": "\/pay\/lounge"/);
assert.match(vercel, /"source": "\/pay\/occasion-card"/);
assert.match(vercel, /"source": "\/c"/);
assert.match(vercel, /coiffeur\.halaqmap\.com\/coiffeur/);
assert.match(vercel, /"source": "\/oc",/);
assert.match(vercel, /"source": "\/oc\/"/);
assert.match(vercel, /"source": "\/c\/"/);
assert.match(vercel, /"source": "\/guest"/);
assert.match(vercel, /"source": "\/w\/"/);
assert.match(vercel, /"source": "\/g\/"/);
assert.match(vercel, /"source": "\/pay\/produce"/);
assert.match(vercel, /store\.halaqmap\.com\/store\/grocers/);
assert.match(vercel, /store\.halaqmap\.com\/store\/produce/);
assert.match(vercel, /"source": "\/rate",/);
assert.match(vercel, /"source": "\/rate\/"/);
assert.match(vercel, /"source": "\/barber",/);
assert.match(vercel, /"source": "\/barber\/"/);
assert.match(vercel, /"source": "\/api",/);
assert.match(vercel, /"source": "\/api\/"/);
assert.match(vercel, /"source": "\/assets",/);
assert.match(vercel, /"source": "\/assets\/"/);
assert.match(vercel, /"source": "\/store\/"/);
assert.match(vercel, /"source": "\/partners\/"/);
assert.match(vercel, /"source": "\/pay\/:path\*"/);
assert.match(vercel, /store\.halaqmap\.com\/store\/wedding/);
assert.match(vercel, /store\.halaqmap\.com\/store\/cafe/);

assert.match(indexHtml, /healed \+ search \+ hash/);
assert.match(indexHtml, /halaqmap\\\.com/);

console.log('test-gsc-malformed-http-path: ok');
