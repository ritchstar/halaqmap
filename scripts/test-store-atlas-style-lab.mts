/**
 * عزل معاينة أطلس الحلول: مسار داخلي، بلا طقس، بلا تعميم على المتجر العام.
 * تشغيل: npx tsx scripts/test-store-atlas-style-lab.mts
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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
const preview = readFileSync(join(root, 'src/components/store/atlas/ProductUiPreview.tsx'), 'utf8');
const pathSrc = readFileSync(join(root, 'src/components/store/atlas/AtlasPath.tsx'), 'utf8');
const services = readFileSync(join(root, 'src/components/store/atlas/ServiceLane.tsx'), 'utf8');
const tokens = readFileSync(join(root, 'src/config/storeAtlasTokens.ts'), 'utf8');
const produceLive = readFileSync(join(root, 'src/config/storeProduceLive.ts'), 'utf8');
const routes = readFileSync(join(root, 'src/lib/routePaths.ts'), 'utf8');
const css = readFileSync(join(root, 'src/styles/storeAtlas.css'), 'utf8');

assert.match(tokens, /STORE_ATLAS_STYLE_LAB_ENABLED = true/);
assert.match(tokens, /STORE_ATLAS_LAB_VERSION = 2/);
assert.match(routes, /STORE_STYLE_LAB:\s*'\/store\/style-lab'/);
assert.match(tokens, /STORE_ATLAS_STYLE_LAB_PATH = '\/store\/style-lab'/);
assert.match(tokens, /home-desktop/);
assert.match(tokens, /home-mobile/);
assert.match(tokens, /gold: '#E8C547'/);
assert.match(tokens, /teal: '#0D9488'/);
assert.match(tokens, /line: '#1D3340'/);
assert.match(tokens, /shell: 1260/);
assert.match(tokens, /cardMin: 340/);
assert.match(tokens, /id: 'local'/);
assert.match(tokens, /id: 'food'/);
assert.match(tokens, /id: 'screens'/);
assert.match(tokens, /id: 'occasions'/);
assert.doesNotMatch(tokens, /id: 'trades'/);
assert.match(tokens, /titleAr: 'العرض'/);
assert.match(tokens, /titleAr: 'الطلب'/);
assert.match(tokens, /titleAr: 'التشغيل'/);
assert.match(tokens, /titleAr: 'الولاء'/);
assert.match(tokens, /id: 'halaq'/);
assert.match(tokens, /id: 'coiffeur'/);
assert.match(tokens, /nameAr: 'خضارنا1'/);
assert.match(tokens, /uiKind: 'produce'/);
assert.match(tokens, /sectorImage:/);
assert.match(tokens, /forWhomAr:/);
assert.match(tokens, /labKickerAr: 'معاينة V2/);
assert.match(tokens, /forWhomLabelAr: 'لمن صُمم؟'/);
assert.match(tokens, /26-12-103276978/);
assert.match(tokens, /منتجات رقمية/);

assert.match(css, /Alexandria/);
assert.match(css, /IBM Plex Sans Arabic/);
assert.match(css, /--atlas-gold: #e8c547/);
assert.match(css, /--atlas-line: #1d3340/);
assert.match(css, /--atlas-shell: 1260px/);
assert.match(css, /minmax\(340px/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /box-shadow:\s*none/);
assert.match(css, /text-shadow:\s*none/);
assert.doesNotMatch(css, /drop-shadow/);

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
assert.match(home, /AtlasPath/);
assert.match(home, /ServiceLane/);
assert.doesNotMatch(home, /JourneySteps/);
assert.doesNotMatch(card, /priceSar|ر\.س|1350|2500/);
assert.match(card, /ProductUiPreview/);
assert.match(card, /sectorImage/);
assert.match(card, /forWhomLabelAr/);
assert.match(preview, /صندوق اليوم/);
assert.match(pathSrc, /العرض/);
assert.match(services, /تخطيط نصي/);
assert.match(produceMock, /ProductUiPreview/);
assert.match(produceMock, /ProduceDeskPreview/);
assert.doesNotMatch(produceMock, /ProductInterfaceFrame/);
assert.doesNotMatch(produceMock, /تمويناتا1|مطعمنا1|كافينا1|طبختنا1|أكلنا1|لاونجا1/);
assert.doesNotMatch(produceMock, /STORE_PRODUCE_TRIAL/);
assert.match(produceMock, /STORE_PRODUCE_LIVE_PACKS/);
assert.match(produceLive, /STORE_PRODUCE_LIVE_PRICE_6_SAR = 1350/);
assert.match(produceLive, /STORE_PRODUCE_LIVE_PRICE_12_SAR = 2500/);

const produceCopyKeys = [
  'produceForWhomAr',
  'produceResultAr',
  'produceCtaAr',
  'produceGuestTitleAr',
  'produceSaipLineAr',
];
for (const key of produceCopyKeys) {
  const match = tokens.match(new RegExp(`${key}:\\s*'([^']+)'`));
  assert.ok(match, key);
  assert.doesNotMatch(match?.[1] ?? '', /تجربة|تمويناتا1|مطعمنا1|كافينا1|طبختنا1|أكلنا1|لاونجا1/);
}

console.log('store-atlas-style-lab: ok');
