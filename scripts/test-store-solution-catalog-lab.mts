/**
 * عزل معاينة فهرس خريطة الحل (كتالوج شاتلي).
 * تشغيل: npx tsx scripts/test-store-solution-catalog-lab.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const routes = readFileSync(join(root, 'src/lib/routePaths.ts'), 'utf8');
const config = readFileSync(join(root, 'src/config/storeSolutionCatalog.ts'), 'utf8');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const main = readFileSync(join(root, 'src/main.tsx'), 'utf8');
const page = readFileSync(join(root, 'src/pages/store/StoreSolutionCatalogLabPage.tsx'), 'utf8');
const ui = readFileSync(join(root, 'src/components/store/catalog/SolutionCatalogApp.tsx'), 'utf8');
const landing = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');

assert.match(routes, /STORE_CATALOG_LAB:\s*'\/store\/catalog-lab'/);
assert.match(config, /STORE_SOLUTION_CATALOG_LAB_ENABLED = true/);
assert.match(config, /code: 'A-01'/);
assert.match(config, /code: 'E-01'/);
assert.match(config, /stripe: 'brick'/);
assert.match(config, /stripe: 'blue'/);
assert.match(config, /stripe: 'yellow'/);
assert.match(config, /solutionCatalogSearchHaystack/);
assert.match(app, /StoreSolutionCatalogLabPage/);
assert.match(main, /\/store\/catalog-lab/);
assert.match(page, /noindex, nofollow/);
assert.match(ui, /SolutionCatalogApp/);
assert.match(ui, /parseSolutionCatalogProductHash/);
assert.match(ui, /STORE_REQUEST/);
assert.doesNotMatch(landing, /SolutionCatalogApp/);
assert.doesNotMatch(landing, /storeSolutionCatalog/);

console.log('test-store-solution-catalog-lab: ok');
