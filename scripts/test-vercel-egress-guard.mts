/**
 * حراسة نقل فيرسل: منع زحف الحصاد عن الصور التجريبية وواجهات الرؤى للبوتات.
 * تشغيل: npx tsx scripts/test-vercel-egress-guard.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const robots = readFileSync(join(root, 'public/robots.txt'), 'utf8');
const vercel = readFileSync(join(root, 'vercel.json'), 'utf8');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');

assert.match(robots, /User-agent: Googlebot/);
assert.match(robots, /User-agent: GPTBot[\s\S]*Disallow: \//);
assert.match(robots, /User-agent: Bytespider[\s\S]*Disallow: \//);
assert.match(robots, /Disallow: \/images\/store\/lab\//);
assert.match(robots, /Disallow: \/api\//);
assert.match(robots, /Allow: \/near\//);
assert.match(vercel, /"source": "\/images\/\(\.\*\)"/);
assert.match(vercel, /max-age=604800/);
assert.match(app, /shouldSkipVercelInsights/);
assert.match(app, /bot\|crawler\|spider/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeSalesLedger['"]/);

console.log('vercel-egress-guard: ok');
