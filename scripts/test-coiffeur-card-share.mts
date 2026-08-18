/**
 * رمز بطاقة كوافير ماب — اختصار بلا ترميز عربي ظاهر.
 */
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function main() {
  const api = await import('../api/_lib/coiffeurCardShare.ts');
  const web = await import('../src/lib/coiffeurCardShare.ts');

  const name = 'ايمان السرااف م احمد';
  const role = 'مسوقة فخرية للمنصة';

  const tokenApi = api.encodeCoiffeurCardToken(name, role);
  const tokenWeb = web.encodeCoiffeurCardToken(name, role);
  assert.ok(tokenApi);
  assert.equal(tokenApi, tokenWeb);
  assert.match(tokenApi, /^[A-Za-z0-9_-]+$/);
  assert.equal(tokenApi.includes('%'), false);
  assert.ok(tokenApi.length < 120);

  const decodedApi = api.decodeCoiffeurCardToken(tokenApi);
  const decodedWeb = web.decodeCoiffeurCardToken(tokenWeb);
  assert.deepEqual(decodedApi, { name, role });
  assert.deepEqual(decodedWeb, { name, role });
  assert.equal(api.decodeCoiffeurCardToken('%%%%'), null);
  assert.equal(web.decodeCoiffeurCardToken('abc'), null);

  const src = await import('node:fs').then((fs) =>
    fs.readFileSync(join(root, 'src/lib/coiffeurHostRedirect.ts'), 'utf8'),
  );
  assert.match(src, /path === '\/c'/);
  assert.equal(/path\.startsWith\('\/c'\)/.test(src), false);

  console.log('coiffeur card share: ok', tokenApi);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
