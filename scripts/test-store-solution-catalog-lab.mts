/**
 * عزل معاينة فهرس خريطة الحل (كتالوج شاتلي).
 * تشغيل: npx tsx scripts/test-store-solution-catalog-lab.mts
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const routes = readFileSync(join(root, 'src/lib/routePaths.ts'), 'utf8');
const config = readFileSync(join(root, 'src/config/storeSolutionCatalog.ts'), 'utf8');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const main = readFileSync(join(root, 'src/main.tsx'), 'utf8');
const page = readFileSync(join(root, 'src/pages/store/StoreSolutionCatalogLabPage.tsx'), 'utf8');
const ui = readFileSync(join(root, 'src/components/store/catalog/SolutionCatalogApp.tsx'), 'utf8');
const signal = readFileSync(join(root, 'src/components/store/catalog/CatalogSignalLayer.tsx'), 'utf8');
const mark = readFileSync(join(root, 'src/components/store/catalog/ProductMark.tsx'), 'utf8');
const css = readFileSync(join(root, 'src/styles/storeSolutionCatalog.css'), 'utf8');
const landing = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');

assert.match(routes, /STORE_CATALOG_LAB:\s*'\/store\/catalog-lab'/);
assert.match(config, /STORE_SOLUTION_CATALOG_LAB_ENABLED = true/);
assert.match(config, /code: 'A-01'/);
assert.match(config, /code: 'E-01'/);
assert.match(config, /solutionCatalogMarkSrc\('A-01'\)/);
assert.match(config, /solutionCatalogMarkSrc\('E-01'\)/);
assert.doesNotMatch(config, /logoSrc: null/);
assert.match(config, /STORE_SOLUTION_CATALOG_MARK_BASE/);
assert.match(config, /stripe: 'brick'/);
assert.match(config, /stripe: 'blue'/);
assert.match(config, /stripe: 'yellow'/);
assert.match(config, /solutionCatalogSearchHaystack/);
assert.match(app, /StoreSolutionCatalogLabPage/);
assert.match(main, /\/store\/catalog-lab/);
assert.match(page, /noindex, nofollow/);
assert.match(ui, /SolutionCatalogApp/);
assert.match(ui, /CatalogSignalLayer/);
assert.match(ui, /ProductMark/);
assert.match(mark, /sanitizeStoreProductImageSrc/);
assert.doesNotMatch(mark, /next\/image/);
assert.match(signal, /prefers-reduced-motion/);
assert.match(css, /catalog-signal-drawing/);
assert.match(ui, /parseSolutionCatalogProductHash/);
assert.match(ui, /STORE_REQUEST/);
assert.doesNotMatch(landing, /SolutionCatalogApp/);
assert.doesNotMatch(landing, /storeSolutionCatalog/);

for (const code of ['A-01', 'A-02', 'B-01', 'B-02', 'C-01', 'C-02', 'D-01', 'D-02', 'D-03', 'E-01']) {
  const markPath = join(root, 'public/images/store/catalog', `halaqmap-${code.toLowerCase()}.webp`);
  assert.ok(existsSync(markPath), `missing catalog mark: ${markPath}`);
}

console.log('test-store-solution-catalog-lab: ok');
