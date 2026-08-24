/**
 * فحص لاونجا1: السعر 600، المدة 90 يوماً، العزل عن بقية وسوم المتجر.
 * تشغيل: npx tsx scripts/test-store-lounge-live.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_LOUNGE_LIVE,
  STORE_LOUNGE_LIVE_DAYS,
  STORE_LOUNGE_LIVE_EVENTS,
  STORE_LOUNGE_LIVE_PRICE_HALALAS,
  STORE_LOUNGE_LIVE_PRICE_SAR,
  STORE_LOUNGE_LIVE_PRODUCT,
  STORE_LOUNGE_LIVE_CANNED,
  STORE_LOUNGE_LIVE_PUBLIC_ENABLED,
} from '../src/config/storeLoungeLive.ts';
import { STORE_LIVE_MARK_AR, STORE_LIVE_PANORAMAS } from '../src/config/storeLiveAtmosphere.ts';
import { STORE_EVENT_LIVE_PRODUCT, STORE_EVENT_LIVE_PRICE_SAR } from '../src/config/storeEventLive.ts';
import { STORE_WEDDING_LIVE_PRODUCT } from '../src/config/storeWeddingLive.ts';
import { STORE_LANDING_COPY } from '../src/config/storeFront.ts';
import {
  STORE_LOUNGE_LIVE_PRODUCT as apiProduct,
  STORE_LOUNGE_LIVE_PRICE_HALALAS as apiHalalas,
  loungeLiveIsExpired,
  loungeLivePaymentMatches,
  loungeLiveTermEndIso,
  parseLoungeLiveOrderBody,
} from '../api/_lib/storeLoungeLive.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const landing = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');
const webhook = readFileSync(join(root, 'supabase/functions/moyasar-webhook/index.ts'), 'utf8');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const remote = readFileSync(join(root, 'src/lib/storeLoungeLiveRemote.ts'), 'utf8');
const sql = readFileSync(join(root, 'supabase/migrations/170_store_lounge_live.sql'), 'utf8');

assert.equal(STORE_LOUNGE_LIVE_PUBLIC_ENABLED, true);
assert.equal(STORE_LOUNGE_LIVE_PRODUCT, 'store_lounge_live');
assert.equal(STORE_LOUNGE_LIVE_PRICE_SAR, 600);
assert.equal(STORE_LOUNGE_LIVE_PRICE_HALALAS, 60000);
assert.equal(STORE_LOUNGE_LIVE_DAYS, 90);
assert.equal(STORE_LOUNGE_LIVE_PRODUCT, apiProduct);
assert.equal(STORE_LOUNGE_LIVE_PRICE_HALALAS, apiHalalas);
assert.notEqual(STORE_LOUNGE_LIVE_PRODUCT, STORE_EVENT_LIVE_PRODUCT);
assert.notEqual(STORE_LOUNGE_LIVE_PRODUCT, STORE_WEDDING_LIVE_PRODUCT);
assert.notEqual(STORE_LOUNGE_LIVE_PRODUCT, 'store_occasion_card');
assert.notEqual(STORE_LOUNGE_LIVE_PRICE_SAR, STORE_EVENT_LIVE_PRICE_SAR);
assert.notEqual(STORE_LOUNGE_LIVE_PRICE_SAR, 899);
assert.notEqual(STORE_LOUNGE_LIVE_PRICE_SAR, 12);
assert.notEqual(STORE_LOUNGE_LIVE_PRICE_SAR, 29);
assert.notEqual(STORE_LOUNGE_LIVE_PRICE_SAR, 59);

assert.match(STORE_LOUNGE_LIVE.priceLineAr, /600/);
assert.match(STORE_LOUNGE_LIVE.priceLineAr, /ثلاثة أشهر/);
assert.match(STORE_LOUNGE_LIVE.durationLineAr, /إعادة الشراء/);
assert.doesNotMatch(STORE_LOUNGE_LIVE.leadAr, /12 و29 و59/);
assert.doesNotMatch(STORE_LOUNGE_LIVE.termsFoldBodyAr, /store_event_live/);
assert.match(STORE_LANDING_COPY.loungeLiveTitleAr, /لاونجا1/);
assert.match(STORE_LANDING_COPY.loungeLiveLeadAr, /600/);
assert.ok(STORE_LOUNGE_LIVE_EVENTS.length >= 4);

const end = Date.parse(loungeLiveTermEndIso(Date.parse('2026-01-01T00:00:00.000Z')));
assert.equal(end - Date.parse('2026-01-01T00:00:00.000Z'), 90 * 24 * 60 * 60 * 1000);
assert.equal(loungeLiveIsExpired('2026-01-01T00:00:00.000Z', Date.parse('2026-01-01T00:00:01.000Z')), true);
assert.equal(loungeLiveIsExpired('2026-04-01T00:00:00.000Z', Date.parse('2026-01-01T00:00:00.000Z')), false);

assert.equal(
  loungeLivePaymentMatches({
    meta: { product: 'store_lounge_live', store_lounge_token: 'tok_l' },
    token: 'tok_l',
    amount: 60000,
  }),
  true,
);
assert.equal(
  loungeLivePaymentMatches({
    meta: { product: 'store_event_live', store_lounge_token: 'tok_l' },
    token: 'tok_l',
    amount: 60000,
  }),
  false,
);
assert.equal(
  loungeLivePaymentMatches({
    meta: { product: 'store_lounge_live', store_lounge_token: 'tok_l' },
    token: 'tok_l',
    amount: 89900,
  }),
  false,
);
assert.equal(
  loungeLivePaymentMatches({
    meta: { product: 'store_lounge_live', store_lounge_token: 'tok_l' },
    token: 'tok_other',
    amount: 60000,
  }),
  false,
);

const parsed = parseLoungeLiveOrderBody({
  email: 'lounge@example.com',
  loungeName: 'لاونج النخيل',
  hostName: 'الإدارة',
  welcomeAr: 'حياكم الله',
});
assert.equal(parsed.ok, true);

assert.match(app, /\/store\/lounge/);
assert.match(app, /\/l\/:token\/guest/);
assert.match(app, /\/pay\/lounge\/:token/);
assert.match(app, /StoreLoungeLandingPage/);
assert.match(app, /StoreLoungeHallPage/);
assert.match(app, /StoreLoungePayPage/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeLoungeLive['"]/);
assert.doesNotMatch(app, /from ['"]@\/lib\/storeLoungeLiveRemote['"]/);
assert.match(landing, /loungeLiveTitleAr/);
assert.match(landing, /STORE_LOUNGE/);
assert.match(webhook, /skipped: "store_lounge_live"/);
assert.match(webhook, /store_lounge_live_orders/);
assert.match(webhook, /60000/);
assert.match(indexHtml, /store_lounge_live/);
assert.match(indexHtml, /\/pay\/lounge\//);
assert.match(remote, /public-store-lounge-live/);
assert.doesNotMatch(remote, /public-store-event-live/);
assert.match(sql, /price_halalas = 60000/);
assert.match(sql, /pending_renewal/);

assert.equal(STORE_LIVE_PANORAMAS.length, 7);
assert.equal(STORE_LIVE_MARK_AR, 'منتج خريطة الحل');
assert.ok(STORE_LOUNGE_LIVE_CANNED.length >= 7);
assert.doesNotMatch(
  readFileSync(join(root, 'src/pages/store/StoreLoungeHallPage.tsx'), 'utf8'),
  /StoreVisitorHeader|StoreVisitorFooter/,
);
assert.doesNotMatch(
  readFileSync(join(root, 'src/pages/store/StoreWeddingHallPage.tsx'), 'utf8'),
  /StoreVisitorHeader|StoreVisitorFooter/,
);
assert.doesNotMatch(
  readFileSync(join(root, 'src/pages/store/StoreEventHallPage.tsx'), 'utf8'),
  /StoreVisitorHeader|StoreVisitorFooter/,
);

console.log('store-lounge-live: ok');
