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
assert.doesNotMatch(
  readFileSync(join(root, 'src/components/store/StoreDeskChatCard.tsx'), 'utf8'),
  /from ['"]@\/lib\/storeHostRedirect['"]/,
);
assert.match(
  readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8'),
  /StoreDeskChatCard/,
);

console.log('boot chunk isolation ok');
