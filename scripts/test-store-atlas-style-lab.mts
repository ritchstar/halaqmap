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
assert.match(tokens, /STORE_ATLAS_LAB_VERSION = 3/);
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
assert.match(tokens, /labKickerAr: 'معاينة V3/);
assert.match(tokens, /تضم المنظومة مصنفات برمجية مسجلة لدى الهيئة السعودية للملكية الفكرية/);
assert.match(tokens, /mockCaptionAr:/);
assert.match(tokens, /orderColItemAr: 'الصنف'/);
assert.match(tokens, /daylightOnAr:/);
assert.match(tokens, /خلفية أطلس المشرقة/);
assert.match(tokens, /parseStoreAtlasDaylight/);
assert.match(tokens, /storeAtlasCardGlow/);
assert.match(css, /store-atlas-daylight/);
assert.match(css, /atlas-daylight-day/);
assert.match(css, /linear-gradient\(145deg, #f4efe4/);
assert.match(css, /store-atlas__dark-band/);
assert.match(css, /prefers-reduced-motion/);
assert.match(tokens, /forWhomLabelAr: 'لمن صُمم؟'/);
assert.match(tokens, /26-12-103276978/);
assert.match(tokens, /منتجات رقمية/);

assert.match(css, /Alexandria/);
assert.match(css, /IBM Plex Sans Arabic/);
assert.match(css, /--atlas-gold: #e8c547/);
assert.match(css, /--atlas-ink: #020912/);
assert.match(css, /--atlas-line: #1d3340/);
assert.match(css, /\.store-atlas__btn--gold[\s\S]*color: var\(--atlas-ink\)/);
assert.match(css, /--atlas-shell: 1260px/);
assert.match(css, /minmax\(340px/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /box-shadow:\s*none/);
assert.match(css, /text-shadow:\s*none/);
assert.doesNotMatch(css, /drop-shadow/);
assert.match(css, /store-atlas__skin/);
assert.match(css, /store-atlas__signals/);
assert.match(css, /atlas-signal-draw/);
assert.match(css, /\[data-atlas-daylight='on'\] \.store-atlas \{[\s\S]*?--atlas-canvas: transparent/);
assert.match(css, /\[data-atlas-daylight='on'\] \.store-atlas \{[\s\S]*?--atlas-ivory: #07151d/);
assert.match(css, /\[data-atlas-daylight='on'\] \.store-atlas \{[\s\S]*?--atlas-card: rgb\(255 255 255/);
assert.match(css, /\[data-atlas-daylight='off'\] \.store-atlas__skin/);
assert.match(page, /bg-\[#EFF6F1\]/);
assert.doesNotMatch(card, /bg-\[#07141c\]/);
assert.doesNotMatch(preview, /--atlas-ink/);

// بطاقة بطبقتين: سطح فاتح للمحتوى وقشرة داكنة للمعاينة
assert.match(css, /\.store-atlas__product-card \{[\s\S]*?flex-direction: column/);
assert.match(css, /\.store-atlas__product-shell \{[\s\S]*?rgb\(5 18 26 \/ 0\.88\)/);
assert.match(css, /\.store-atlas__product-shell \{[\s\S]*?--atlas-teal: #35c9bb/);
assert.match(css, /\.store-atlas__product-actions \{[\s\S]*?margin-top: auto/);
assert.match(css, /\.store-atlas__product-badge/);
assert.match(css, /rgb\(255 253 248 \/ 0\.82\)/);
assert.match(css, /--atlas-cta: #087b73/);
assert.match(css, /--atlas-body: #28414a/);
assert.match(css, /grid-template-columns: repeat\(2, minmax\(340px, 1fr\)\)/);
assert.match(css, /\.store-atlas__trust-rail/);
assert.match(card, /store-atlas__product-card/);
assert.match(card, /store-atlas__product-shell/);
assert.match(card, /discoverPrefixAr/);
assert.doesNotMatch(card, /store-atlas__btn--teal-fill/);
const trust = readFileSync(join(root, 'src/components/store/atlas/TrustRail.tsx'), 'utf8');
assert.match(trust, /store-atlas__trust-rail/);

// الهوية اللفظية: «خريطة الحل» هو الاسم الظاهر، و«متجر» وصف ثانوي في عنوان الصفحة
assert.match(tokens, /brandNameAr: 'خريطة الحل'/);
assert.match(tokens, /brandTaglineAr: 'حلول رقمية متخصصة'/);
assert.match(tokens, /heroTitleAr: 'خريطة الحل'/);
assert.match(tokens, /heroClaimAr: 'لعملٍ أوضح ونموٍ أسرع'/);
assert.match(tokens, /heroPrimaryAr: 'استكشف الحلول'/);
assert.match(tokens, /heroSecondaryAr: 'اطلب حلاً خاصاً'/);
assert.match(tokens, /heroSectorsAr: 'حلول للمتاجر المحلية/);
assert.match(tokens, /requestTitleAr: 'مهنتك لها تفاصيل مختلفة؟'/);
assert.match(tokens, /documentTitle: 'خريطة الحل — متجر/);
assert.doesNotMatch(header, /shopNameAr/);
assert.match(header, /brandNameAr/);

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
assert.match(page, /AtlasDaylight/);
assert.match(page, /daylightOnAr/);
assert.match(page, /signalHintAr/);
assert.match(tokens, /signalCaptionAr/);
assert.match(tokens, /signalHintAr/);
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
assert.match(card, /isGeneralTrialProduct/);
assert.match(card, /data-atlas-glow/);
assert.match(card, /store-atlas__card-signals/);
assert.match(card, /tryNowAr/);
assert.match(preview, /صندوق اليوم/);
assert.match(preview, /orderColItemAr/);
assert.match(preview, /dir="ltr"/);
assert.match(preview, /نموذج توضيحي/);
assert.match(pathSrc, /store-atlas__path-line/);
assert.match(pathSrc, /data-journey-node/);
assert.match(pathSrc, /store-atlas__signals/);
assert.match(home, /store-atlas__skin--warm/);
const hero = readFileSync(join(root, 'src/components/store/atlas/AtlasHero.tsx'), 'utf8');
assert.match(hero, /store-atlas__skin/);
assert.match(hero, /animateMotion/);
assert.match(hero, /store-atlas__product-shell/);
assert.match(hero, /store-atlas__hero-title/);
assert.doesNotMatch(hero, /Math\.random|مباشر/);
const playback = readFileSync(join(root, 'src/components/store/atlas/atlasSignalPlayback.ts'), 'utf8');
assert.match(playback, /pauseAnimations/);
assert.match(playback, /visibilitychange/);
assert.match(playback, /prefers-reduced-motion/);
assert.match(services, /صف أفقي/);
const daylight = readFileSync(join(root, 'src/components/store/atlas/AtlasDaylight.tsx'), 'utf8');
assert.match(daylight, /prefers-reduced-motion/);
assert.match(daylight, /saveData/);
assert.match(daylight, /hardwareConcurrency/);
assert.match(daylight, /pointer: fine/);
assert.match(daylight, /addEventListener\('change'/);
assert.doesNotMatch(daylight, /touchmove|ontouch/);
const footer = readFileSync(join(root, 'src/components/store/atlas/AtlasFooter.tsx'), 'utf8');
assert.match(footer, /store-atlas__footer-grid/);
assert.match(footer, /footerIntroAr/);
assert.match(footer, /footerProductsAr/);
assert.match(footer, /footerTrialServicesAr/);
assert.match(footer, /footerLegalAr/);
assert.match(footer, /footerContactAr/);
assert.match(footer, /brandTaglineAr/);
assert.doesNotMatch(footer, /shopNameAr/);
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
