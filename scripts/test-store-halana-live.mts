/**
 * حلانا1: نسخة غير معلنة، بلا ميسر على العميلة، بلا خلط بطبختنا1.
 * تشغيل: npx tsx scripts/test-store-halana-live.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_HALANA_ATMOSPHERE,
  STORE_HALANA_GALLERY_MAX,
  STORE_HALANA_LIVE_COPY,
  STORE_HALANA_LIVE_PUBLIC_CATALOG,
} from '../src/config/storeHalanaLive.ts';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const landing = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');
const sitemap = readFileSync(join(root, 'public/sitemap-store.xml'), 'utf8');
const migration = readFileSync(join(root, 'supabase/migrations/194_store_halana_live.sql'), 'utf8');
const galleryMigration = readFileSync(join(root, 'supabase/migrations/195_store_halana_gallery.sql'), 'utf8');
const api = readFileSync(join(root, 'api/_lib/storeHalanaLive.ts'), 'utf8');
const publicApi = readFileSync(join(root, 'api/public-store-halana-live.ts'), 'utf8');
const page = readFileSync(join(root, 'src/pages/store/StoreHalanaShopPage.tsx'), 'utf8');
const desk = readFileSync(join(root, 'src/app/admin/store-desk/page.tsx'), 'utf8');

assert.equal(STORE_HALANA_LIVE_PUBLIC_CATALOG, false);
assert.equal(ROUTE_PATHS.STORE_HALANA_VIEW, '/h/:token');
assert.equal(ROUTE_PATHS.STORE_HALANA_DESK, '/h/:token/desk');
assert.match(STORE_HALANA_LIVE_COPY.titleAr, /حلانا1/);
assert.ok(!STORE_HALANA_LIVE_COPY.shopLeadAr.includes('طبختنا1'));
assert.ok(!STORE_HALANA_LIVE_COPY.shopLeadAr.includes('كاردي8'));
assert.ok(app.includes('StoreHalanaShopPage'));
assert.ok(app.includes('/h/:token'));
assert.doesNotMatch(app, /storeHalanaLive/);
assert.doesNotMatch(landing, /STORE_HALANA|حلانا1/);
assert.doesNotMatch(sitemap, /\/h\//);
assert.match(migration, /store_halana_copies/);
assert.match(migration, /store_halana_requests/);
assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
assert.match(galleryMigration, /store_halana_gallery/);
assert.match(galleryMigration, /ENABLE ROW LEVEL SECURITY/);
assert.equal(STORE_HALANA_GALLERY_MAX, 12);
assert.match(STORE_HALANA_ATMOSPHERE.hero, /halana-hero-table/);
assert.match(api, /halanaShopUrl/);
assert.match(api, /addHalanaGallery/);
assert.match(api, /parseHalanaImageSrc/);
assert.match(publicApi, /add_request/);
assert.match(publicApi, /add_gallery/);
assert.doesNotMatch(publicApi, /moyasar/i);
assert.match(page, /add_gallery/);
assert.match(page, /halana-form-card/);
assert.match(desk, /StoreHalanaIssueBoard/);
assert.match(api, /data:image\\\/svg/);
assert.match(api, /javascript:/i);

console.log('store-halana-live ok');
