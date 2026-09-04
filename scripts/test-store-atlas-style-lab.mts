/**
 * عزل معاينة أطلس الحلول: مسار داخلي، بلا طقس، بلا تعميم على المتجر العام.
 * تشغيل: npx tsx scripts/test-store-atlas-style-lab.mts
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseStoreAtlasLabView,
  STORE_ATLAS_CARDS,
  STORE_ATLAS_COLORS,
  STORE_ATLAS_COPY,
  STORE_ATLAS_LAB_VIEWS,
  STORE_ATLAS_PRODUCE_FAQ,
  STORE_ATLAS_SECTORS,
  STORE_ATLAS_STYLE_LAB_ENABLED,
  STORE_ATLAS_STYLE_LAB_PATH,
} from '../src/config/storeAtlasTokens.ts';
import { STORE_PRODUCE_LIVE_PACKS } from '../src/config/storeProduceLive.ts';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const main = readFileSync(join(root, 'src/main.tsx'), 'utf8');
const chrome = readFileSync(join(root, 'src/components/store/StoreChrome.tsx'), 'utf8');
const landing = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');
const page = readFileSync(join(root, 'src/pages/store/StoreAtlasStyleLabPage.tsx'), 'utf8');
const produceMock = readFileSync(join(root, 'src/components/store/atlas/AtlasProduceMock.tsx'), 'utf8');
const home = readFileSync(join(root, 'src/components/store/atlas/AtlasHome.tsx'), 'utf8');
const header = readFileSync(join(root, 'src/components/store/atlas/AtlasHeader.tsx'), 'utf8');
const card = readFileSync(join(root, 'src/components/store/atlas/ProductShowcaseCard.tsx'), 'utf8');
const tokens = readFileSync(join(root, 'src/config/storeAtlasTokens.ts'), 'utf8');
const css = readFileSync(join(root, 'src/styles/storeAtlas.css'), 'utf8');

assert.equal(STORE_ATLAS_STYLE_LAB_ENABLED, true);
assert.equal(ROUTE_PATHS.STORE_STYLE_LAB, '/store/style-lab');
assert.equal(STORE_ATLAS_STYLE_LAB_PATH, '/store/style-lab');
assert.deepEqual(
  STORE_ATLAS_LAB_VIEWS.map((item) => item.id),
  ['home-desktop', 'home-mobile', 'produce'],
);
assert.equal(parseStoreAtlasLabView(null), 'home-desktop');
assert.equal(parseStoreAtlasLabView('produce'), 'produce');
assert.equal(STORE_ATLAS_COLORS.canvas, '#020912');
assert.equal(STORE_ATLAS_COLORS.gold, '#E8C547');
assert.equal(STORE_ATLAS_COLORS.teal, '#0D9488');
assert.equal(STORE_ATLAS_SECTORS.length, 5);
assert.ok(STORE_ATLAS_CARDS.some((item) => item.id === 'produce' && item.nameAr === 'خضارنا1'));
assert.match(STORE_ATLAS_COPY.heroTitleAr, /منتجات رقمية/);
assert.match(STORE_ATLAS_PRODUCE_FAQ.map((item) => item.aAr).join('\n'), /26-12-103276978/);

assert.match(css, /Alexandria/);
assert.match(css, /IBM Plex Sans Arabic/);
assert.match(css, /--atlas-gold: #e8c547/);
assert.match(css, /prefers-reduced-motion/);

assert.match(app, /StoreAtlasStyleLabPage/);
assert.match(app, /\/store\/style-lab/);
assert.match(main, /\/store\/style-lab/);
assert.doesNotMatch(main, /storeAtlasTokens|storeProduceLive/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeAtlasTokens['"]/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeProduceLive['"]/);
assert.doesNotMatch(app, /storeAtlasTokens/);
assert.doesNotMatch(app, /storeProduceLive/);

assert.doesNotMatch(chrome, /style-lab|STORE_STYLE_LAB|أطلس الحلول/);
assert.doesNotMatch(landing, /style-lab|STORE_STYLE_LAB/);

assert.match(page, /noindex/);
assert.match(page, /home-desktop/);
assert.match(page, /home-mobile/);
assert.match(page, /AtlasProduceMock/);
assert.doesNotMatch(page, /KSACityClocksBar|StoreVisitorEngage/);

const atlasDir = join(root, 'src/components/store/atlas');
for (const name of readdirSync(atlasDir)) {
  if (!name.endsWith('.tsx')) continue;
  const src = readFileSync(join(atlasDir, name), 'utf8');
  assert.doesNotMatch(src, /KSACityClocksBar|StoreVisitorEngage/);
}

assert.match(header, /بلا أزرار عائمة/);
assert.match(home, /AtlasHero/);
assert.doesNotMatch(card, /priceSar|ر\.س|1350|2500/);
const produceCopy = [
  STORE_ATLAS_COPY.produceForWhomAr,
  STORE_ATLAS_COPY.produceResultAr,
  STORE_ATLAS_COPY.produceCtaAr,
  STORE_ATLAS_COPY.produceGuestTitleAr,
  STORE_ATLAS_COPY.produceSaipLineAr,
  JSON.stringify(STORE_ATLAS_PRODUCE_FAQ),
].join('\n');
assert.doesNotMatch(produceCopy, /تجربة|تمويناتا1|مطعمنا1|كافينا1|طبختنا1|أكلنا1|لاونجا1/);
assert.doesNotMatch(produceMock, /تمويناتا1|مطعمنا1|كافينا1|طبختنا1|أكلنا1|لاونجا1/);
assert.doesNotMatch(produceMock, /STORE_PRODUCE_TRIAL/);
assert.match(produceMock, /STORE_PRODUCE_LIVE_PACKS/);
assert.equal(STORE_PRODUCE_LIVE_PACKS[0]?.priceSar, 1350);
assert.equal(STORE_PRODUCE_LIVE_PACKS[1]?.priceSar, 2500);
assert.match(tokens, /#020912/);
assert.match(tokens, /26-12-103276978/);

console.log('store-atlas-style-lab: ok');
