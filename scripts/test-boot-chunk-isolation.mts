/**
 * فحص جنائي لعزل إقلاع App: أي ملف تستورده App.tsx وتستورده صفحة كسولة
 * يجب أن يبقى خارج حزمة App (app-shell / route-paths / …) وإلا reading 'default'.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vite = readFileSync(join(root, 'vite.config.ts'), 'utf8');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const landing = readFileSync(join(root, 'src/pages/LandingPreview.tsx'), 'utf8');

const shellStart = vite.indexOf('norm.includes(\'/src/context/PlatformAmbientContext\')');
const shellEnd = vite.indexOf('return \'app-shell\'', shellStart);
assert.ok(shellStart >= 0 && shellEnd > shellStart, 'app-shell block missing');
const appShellBlock = vite.slice(shellStart, shellEnd);

const requiredInAppShell = [
  '/src/lib/coiffeurHostRedirect',
  '/src/lib/storeHostRedirect',
  '/src/lib/hashQueryParams',
  '/src/lib/resolveLazyPage',
  '/src/config/publicPulseExperience',
  '/src/config/adminAuth',
  '/src/config/mapContactCardCopy',
  '/src/components/RootErrorBoundary',
];

for (const id of requiredInAppShell) {
  assert.ok(appShellBlock.includes(id), `app-shell must isolate ${id}`);
}

assert.match(app, /from ['"]@\/lib\/storeHostRedirect['"]/);
assert.match(app, /from ['"]@\/lib\/hashQueryParams['"]/);
assert.match(app, /from ['"]@\/config\/publicPulseExperience['"]/);
assert.match(landing, /from ['"]@\/lib\/hashQueryParams['"]/);
assert.match(landing, /from ['"]@\/config\/publicPulseExperience['"]/);

assert.doesNotMatch(
  readFileSync(join(root, 'src/config/storeFront.ts'), 'utf8'),
  /from ['"]@\/lib\/storeHostRedirect['"]/,
  'storeFront must not import storeHostRedirect (keeps partnerLegal out of App graph)',
);

const coiffeurChrome = readFileSync(
  join(root, 'src/components/coiffeur/CoiffeurVisitorChrome.tsx'),
  'utf8',
);
assert.doesNotMatch(
  coiffeurChrome,
  /from ['"]@\/lib\/storeHostRedirect['"]/,
  'Coiffeur chrome must not import storeHostRedirect',
);
assert.match(coiffeurChrome, /from ['"]@\/config\/summiCoiffeurRegistry['"]/);
assert.match(coiffeurChrome, /SUMMI_SITE_ORIGIN/);
assert.match(coiffeurChrome, /SUMMI_HUB_PATH/);

assert.doesNotMatch(
  app,
  /FounderDeskBanner|StoreDeskChatCard|storeFront/,
  'App must not statically import store/desk UI',
);
assert.match(
  app,
  /@\/app\/admin\/store-desk\/page/,
  'App must lazy-load the store desk page',
);
assert.match(
  app,
  /\$\{adminBase\}\/store-desk/,
  'App must mount store desk under the admin portal',
);
assert.match(
  app,
  /@\/pages\/coiffeur\/CoiffeurMarketingPage/,
  'App must lazy-load the coiffeur marketing page',
);
assert.doesNotMatch(
  readFileSync(join(root, 'src/components/store/StoreDeskChatCard.tsx'), 'utf8'),
  /from ['"]@\/lib\/storeHostRedirect['"]/,
);
assert.match(
  readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8'),
  /StoreDeskChatCard/,
);
assert.match(
  readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8'),
  /StoreLiveOpsBanner/,
  'Store landing must mount the static Halaq Map ops banner',
);
assert.doesNotMatch(
  readFileSync(join(root, 'src/components/store/StoreChrome.tsx'), 'utf8'),
  /StoreHalaqMapOpsTicker/,
  'Store chrome must not duplicate the moving ops ticker',
);

assert.match(
  readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8'),
  /StoreLaterServicesSection/,
  'Store landing must mount the later software-services doors',
);
assert.match(
  readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8'),
  /trustStripTitleAr/,
  'Store landing must tease the trust attestations page',
);

const storeFront = readFileSync(join(root, 'src/config/storeFront.ts'), 'utf8');
assert.match(storeFront, /متنوع الإنتاج/);
assert.match(storeFront, /منتجات ضمن أعمال المتجر/);
assert.match(storeFront, /حلول تشغيل للمنشآت/);
assert.match(storeFront, /طلب خاص يُدرس/);
assert.doesNotMatch(storeFront, /منتج واحد، واجهتان/);
assert.doesNotMatch(storeFront, /استثمار مجالي/);
assert.doesNotMatch(storeFront, /نصمم لك نظام/);
assert.doesNotMatch(storeFront, /ستُعرض هنا عند الجاهزية/);
assert.doesNotMatch(storeFront, /يرغب العميل في تصميمه/);
assert.match(storeFront, /ثلاثة أبواب فقط/);
assert.match(storeFront, /مسوّقات لكوافير ماب/);
assert.match(storeFront, /حلاق ماب منتج ضمن أعمال المتجر/);
assert.doesNotMatch(storeFront, /إيراد المنتجات الجاهزة من رخص النفاذ الرقمية للصالون/);

assert.match(
  app,
  /@\/pages\/store\/StoreTrustPage/,
  'App must lazy-load the store trust page',
);
assert.match(
  app,
  /@\/pages\/store\/StoreIssuedCardsLegalHub/,
  'App must lazy-load the issued-cards legal hub',
);
assert.doesNotMatch(
  app,
  /from ['"]@\/config\/storeIssuedCardsLegal['"]/,
  'App must not statically import issued-cards legal copy',
);
assert.match(
  storeFront,
  /كاردي8/,
);
assert.match(
  storeFront,
  /بلاغات الوفاة والعزاء/,
);
assert.match(
  app,
  /@\/pages\/coiffeur\/CoiffeurAmbassadorEnter/,
  'App must lazy-load the coiffeur ambassador enter page',
);

console.log('boot chunk isolation ok');
