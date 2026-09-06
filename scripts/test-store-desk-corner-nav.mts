/**
 * ركن النمو والدعم ثابت أسفل يسار لوحات التشغيل.
 * تشغيل: npx tsx scripts/test-store-desk-corner-nav.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const corner = readFileSync(join(root, 'src/components/store/StoreDeskCornerNav.tsx'), 'utf8');
const guide = readFileSync(join(root, 'src/components/store/StoreDeskGuideLink.tsx'), 'utf8');
const help = readFileSync(join(root, 'src/components/store/StoreDeskHelpSupport.tsx'), 'utf8');
const growthBtn = readFileSync(join(root, 'src/components/store/StoreKitchenGrowthHubButton.tsx'), 'utf8');
const storeLink = readFileSync(join(root, 'src/components/store/StoreLiveStoreLink.tsx'), 'utf8');
const kitchenDesk = readFileSync(join(root, 'src/components/store/StoreKitchenDesk.tsx'), 'utf8');
const grocersDesk = readFileSync(join(root, 'src/components/store/StoreGrocersDesk.tsx'), 'utf8');

assert.match(corner, /store-live-desk-corner/);
assert.match(corner, /fixed bottom-2 left-2/);
assert.match(corner, /store-live-store-link/);
assert.match(guide, /StoreDeskCornerLink/);
assert.doesNotMatch(guide, /rounded-2xl border/);
assert.match(help, /StoreDeskCornerButton/);
assert.match(help, /store-live-desk-corner-panel/);
assert.doesNotMatch(help, /<section className=\"rounded-2xl border border-white/);
assert.match(growthBtn, /StoreDeskCornerLink/);
assert.match(growthBtn, /cornerLinkAr/);
assert.doesNotMatch(growthBtn, /rounded-full border/);
assert.match(storeLink, /store-live-store-link/);

assert.match(kitchenDesk, /StoreDeskCornerDock/);
assert.match(kitchenDesk, /StoreKitchenGrowthHubButton/);
assert.match(kitchenDesk, /<StoreDeskCornerDock>[\s\S]*<StoreKitchenGrowthHubButton token=\{token\} \/>/);
assert.match(grocersDesk, /pb-14/);
assert.doesNotMatch(grocersDesk, /ctaAr=/);

console.log('test-store-desk-corner-nav: ok');
