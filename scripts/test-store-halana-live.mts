/**
 * حلانا1: منتج معلن، بلا ميسر على العميلة، بلا خلط بطبختنا1.
 * تشغيل: npx tsx scripts/test-store-halana-live.mts
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_HALANA_ATMOSPHERE,
  STORE_HALANA_GALLERY_MAX,
  STORE_HALANA_LIVE_COPY,
  STORE_HALANA_LIVE_PACKS,
  STORE_HALANA_LIVE_PRICE_12_HALALAS,
  STORE_HALANA_LIVE_PRICE_12_SAR,
  STORE_HALANA_LIVE_PRICE_6_HALALAS,
  STORE_HALANA_LIVE_PRICE_6_SAR,
  STORE_HALANA_LIVE_PUBLIC_CATALOG,
  STORE_HALANA_LIVE_PUBLIC_ENABLED,
  halanaAffiliateCommissionSar,
  isHalanaPriceHalalas,
} from '../src/config/storeHalanaLive.ts';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';
import { isHalanaYoutubeChannelUrl, splitHalanaYoutubeLines } from '../src/lib/storeHalanaShare.ts';
import { halanaPayCopyText, isHalanaIban, maskHalanaIban, normalizeHalanaIban } from '../src/lib/storeHalanaPay.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const landing = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');
const sitemap = readFileSync(join(root, 'public/sitemap-store.xml'), 'utf8');
const migration = readFileSync(join(root, 'supabase/migrations/194_store_halana_live.sql'), 'utf8');
const galleryMigration = readFileSync(join(root, 'supabase/migrations/195_store_halana_gallery.sql'), 'utf8');
const showcaseMigration = readFileSync(join(root, 'supabase/migrations/196_store_halana_showcase.sql'), 'utf8');
const api = readFileSync(join(root, 'api/_lib/storeHalanaLive.ts'), 'utf8');
const publicApi = readFileSync(join(root, 'api/public-store-halana-live.ts'), 'utf8');
const page = readFileSync(join(root, 'src/pages/store/StoreHalanaShopPage.tsx'), 'utf8');
const desk = readFileSync(join(root, 'src/app/admin/store-desk/page.tsx'), 'utf8');

assert.equal(STORE_HALANA_LIVE_PUBLIC_CATALOG, true);
assert.equal(STORE_HALANA_LIVE_PUBLIC_ENABLED, true);
assert.equal(STORE_HALANA_LIVE_PRICE_6_SAR, 894);
assert.equal(STORE_HALANA_LIVE_PRICE_12_SAR, 1788);
assert.equal(STORE_HALANA_LIVE_PRICE_6_HALALAS, 89400);
assert.equal(STORE_HALANA_LIVE_PRICE_12_HALALAS, 178800);
assert.equal(STORE_HALANA_LIVE_PACKS.length, 2);
assert.equal(halanaAffiliateCommissionSar('m6'), 194);
assert.equal(halanaAffiliateCommissionSar('m12'), 288);
assert.equal(isHalanaPriceHalalas(89400), true);
assert.equal(isHalanaPriceHalalas(178800), true);
assert.equal(isHalanaPriceHalalas(60000), false);
assert.equal(ROUTE_PATHS.STORE_HALANA, '/store/halana');
assert.equal(ROUTE_PATHS.STORE_HALANA_READ, '/store/halana/read');
assert.equal(ROUTE_PATHS.STORE_HALANA_VIEW, '/h/:token');
assert.equal(ROUTE_PATHS.STORE_HALANA_ORDER, '/h/:token/order');
assert.equal(ROUTE_PATHS.STORE_HALANA_DESK, '/h/:token/desk');
assert.equal(ROUTE_PATHS.STORE_HALANA_PAY, '/pay/halana/:token');
assert.equal(ROUTE_PATHS.STORE_HALANA_SUPPORT, '/store/halana/support');
assert.match(STORE_HALANA_LIVE_COPY.titleAr, /حلانا1/);
assert.ok(!STORE_HALANA_LIVE_COPY.shopLeadAr.includes('طبختنا1'));
assert.ok(!STORE_HALANA_LIVE_COPY.shopLeadAr.includes('كاردي8'));
assert.ok(app.includes('StoreHalanaShopPage'));
assert.ok(app.includes('/h/:token'));
assert.doesNotMatch(app, /storeHalanaLive/);
assert.match(app, /\/store\/halana/);
assert.match(app, /\/pay\/halana\/:token/);
assert.match(landing, /STORE_HALANA|حلانا1/);
assert.match(sitemap, /\/store\/halana\/read/);
assert.doesNotMatch(sitemap, /\/h\//);
assert.match(migration, /store_halana_copies/);
assert.match(migration, /store_halana_requests/);
assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
assert.match(galleryMigration, /store_halana_gallery/);
assert.match(galleryMigration, /ENABLE ROW LEVEL SECURITY/);
assert.match(showcaseMigration, /promo_ar/);
assert.match(showcaseMigration, /youtube_urls/);
assert.match(STORE_HALANA_LIVE_COPY.orderCtaAr, /اطلبي/);
assert.match(STORE_HALANA_LIVE_COPY.showcaseKickerAr, /أعمال/);
assert.match(page, /halana-order-cta/);
assert.match(page, /\/order/);
assert.equal(isHalanaYoutubeChannelUrl('https://www.youtube.com/@halaqmap'), true);
assert.equal(isHalanaYoutubeChannelUrl('https://youtu.be/abc123xyz00'), false);
assert.deepEqual(splitHalanaYoutubeLines('https://www.youtube.com/@halaqmap\nhttps://youtu.be/abc123xyz00'), {
  channels: ['https://www.youtube.com/@halaqmap'],
  clips: ['https://youtu.be/abc123xyz00'],
});
assert.match(page, /StoreHalanaShareDesk/);
assert.match(page, /StoreDeskHelpSupport/);
assert.match(page, /update_gallery/);
assert.match(page, /policyTitleAr/);
assert.match(api, /halanaOrderUrl/);
assert.match(api, /updateHalanaGalleryCaption/);
assert.match(publicApi, /update_gallery/);
assert.match(app, /\/h\/:token\/order/);
assert.equal(STORE_HALANA_GALLERY_MAX, 12);
assert.match(STORE_HALANA_ATMOSPHERE.hero, /halana-hero-table/);
assert.match(STORE_HALANA_ATMOSPHERE.atelier, /halana-atelier-clear/);
assert.match(STORE_HALANA_ATMOSPHERE.frame, /halana-ornate-frame/);
assert.match(STORE_HALANA_ATMOSPHERE.goldDust, /halana-gold-dust/);
for (const file of ['halana-atelier-clear.jpg', 'halana-ornate-frame.jpg', 'halana-gold-dust.jpg']) {
  assert.ok(existsSync(join(root, 'public/images/store/halana', file)), file);
}
assert.match(page, /HalanaSparkLayer/);
assert.match(page, /halana-title/);
const css = readFileSync(join(root, 'src/index.css'), 'utf8');
assert.match(css, /halana-atelier-clear/);
assert.match(css, /halana-ornate-frame/);
assert.match(css, /halana-gold-dust/);
assert.match(css, /halana-title/);
assert.match(css, /halana-ornament/);
assert.match(api, /halanaShopUrl/);
assert.match(api, /addHalanaGallery/);
assert.match(api, /parseHalanaImageSrc/);
assert.match(publicApi, /add_request/);
assert.match(publicApi, /add_gallery/);
assert.match(publicApi, /create_pending/);
assert.match(publicApi, /activate_paid/);
assert.match(page, /add_gallery/);
assert.match(page, /halana-form-card/);
assert.match(desk, /StoreHalanaIssueBoard/);
assert.match(api, /data:image\\\/svg/);
assert.match(api, /javascript:/i);

const payMigration = readFileSync(join(root, 'supabase/migrations/197_store_halana_direct_pay.sql'), 'utf8');
const payApi = readFileSync(join(root, 'api/_lib/storeHalanaPay.ts'), 'utf8');
assert.match(payMigration, /pay_iban_cipher/);
assert.match(payMigration, /store_halana_pay_proofs/);
assert.match(payMigration, /ENABLE ROW LEVEL SECURITY/);
assert.match(payMigration, /REVOKE ALL ON TABLE public.store_halana_pay_proofs FROM anon, authenticated/);
assert.match(payApi, /aes-256-gcm/);
assert.match(payApi, /STORE_HALANA_PAY_SECRET/);
assert.match(api, /saveHalanaPay/);
assert.match(api, /getHalanaPayInstructions/);
assert.match(api, /addHalanaPayProof/);
assert.match(api, /payPublicFromCopy/);
assert.match(api, /PAY_REVEAL/);
assert.doesNotMatch(api, /payDesk: payDeskFromCopy/);
assert.match(publicApi, /payload.payDesk = payDeskFromCopy/);
assert.doesNotMatch(api, /moyasar/i);
assert.match(publicApi, /save_pay/);
assert.match(publicApi, /add_pay_proof/);
assert.match(publicApi, /requestId/);
assert.match(page, /StoreDirectPayDesk/);
assert.match(page, /StoreDirectPayGuest/);
assert.match(page, /directPayCopyText/);
assert.match(page, /DIRECT_PAY_REQUEST_KEY/);
assert.doesNotMatch(page, /moyasar/i);
assert.match(readFileSync(join(root, 'src/pages/store/StoreHalanaLandingPage.tsx'), 'utf8'), /894|1788/);
assert.doesNotMatch(readFileSync(join(root, 'src/pages/store/StoreHalanaLandingPage.tsx'), 'utf8'), /STORE_PRODUCT_TRIAL|STORE_GENERAL_TRIAL/);
assert.match(readFileSync(join(root, 'src/pages/store/StoreHalanaPayPage.tsx'), 'utf8'), /store_halana_live/);
const billing = readFileSync(join(root, 'supabase/migrations/199_store_halana_live_billing.sql'), 'utf8');
assert.match(billing, /price_halalas/);
assert.match(billing, /is_trial/);
assert.match(billing, /'halana'/);
assert.equal(normalizeHalanaIban('sa12 3456 7890 1234 5678 9012'), 'SA1234567890123456789012');
assert.equal(isHalanaIban('SA1234567890123456789012'), true);
assert.equal(isHalanaIban('SA123'), false);
assert.equal(maskHalanaIban('SA1234567890123456789012'), 'SA12••••9012');
assert.match(
  halanaPayCopyText({
    bankName: 'الأهلي',
    beneficiaryName: 'متخصصة',
    iban: 'SA1234567890123456789012',
    amountSar: '200',
  }),
  /خريطة الحل لا تستلم/,
);

console.log('store-halana-live ok');
