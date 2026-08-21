/**
 * رمز بطاقة كوافير ماب — اختصار بلا ترميز عربي ظاهر، ومعاينة واتساب مربّعة.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function main() {
  const api = await import('../api/_lib/coiffeurCardShare.ts');
  const web = await import('../src/lib/coiffeurCardShare.ts');
  const copy = await import('../src/config/coiffeurIntroCardCopy.ts');
  const og = await import('../api/_lib/coiffeurCardOg.ts');

  const name = copy.COIFFEUR_CARD_LAUNCH_PRESET.name;
  const role = copy.COIFFEUR_CARD_LAUNCH_PRESET.role;

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

  assert.equal(copy.isCoiffeurMarketingLeadRole(role), true);
  assert.ok(copy.COIFFEUR_CARD_ROLE_CHIPS.includes(role));
  assert.equal(copy.coiffeurCardPitch(role).kicker, copy.COIFFEUR_INTRO_CARD_COPY.marketingKicker);
  assert.match(copy.buildCoiffeurCardWhatsAppText({ name, role, cardUrl: 'https://coiffeur.halaqmap.com/c/x' }), /أدعوك إلى كوافير ماب/);

  const html = readFileSync(join(root, 'api/public-coiffeur-card.ts'), 'utf8');
  assert.match(html, /isCoiffeurShareCrawler/);
  assert.match(html, /refresh: !crawler/);
  assert.match(html, /og:image:width" content="1200"/);
  assert.match(html, /og:image:height" content="1200"/);
  assert.match(html, /coiffeurCardOgPublicUrl/);

  const vercel = readFileSync(join(root, 'vercel.json'), 'utf8');
  const ogRewriteAt = vercel.indexOf('/c/:token/og.jpg');
  const cardRewriteAt = vercel.indexOf('"/c/:token"');
  assert.ok(ogRewriteAt > 0);
  assert.ok(cardRewriteAt > ogRewriteAt);

  const intro = readFileSync(join(root, 'src/lib/coiffeurIntroCard.ts'), 'utf8');
  assert.match(intro, /const h = 1350/);
  assert.match(intro, /files: \[opts\.file\]/);

  const src = readFileSync(join(root, 'src/lib/coiffeurHostRedirect.ts'), 'utf8');
  assert.match(src, /path === '\/c'/);
  assert.equal(/path\.startsWith\('\/c'\)/.test(src), false);

  const jpeg = await og.renderCoiffeurCardOgJpeg(tokenApi);
  assert.ok(jpeg);
  assert.ok(jpeg.length > 20_000);
  assert.equal(jpeg[0], 0xff);
  assert.equal(jpeg[1], 0xd8);
  assert.match(og.coiffeurCardOgPublicUrl('https://coiffeur.halaqmap.com', tokenApi), /\/c\/.+\/og\.jpg\?v=/);

  console.log('coiffeur card share: ok', tokenApi, jpeg.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
