/**
 * فحص تموينات الحي: 599/899، العزل عن بقية وسوم المتجر، وفتح التحصيل.
 * تشغيل: npx tsx scripts/test-store-grocers-live.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_GROCERS_CATALOG, parseGrocersListText } from '../src/config/storeGrocersCatalog.ts';
import {
  STORE_GROCERS_CHAT_ADDON_12_HALALAS,
  STORE_GROCERS_CHAT_ADDON_12_SAR,
  STORE_GROCERS_CHAT_ADDON_6_HALALAS,
  STORE_GROCERS_CHAT_ADDON_6_SAR,
  STORE_GROCERS_LIVE,
  STORE_GROCERS_LIVE_CHECKOUT_ENABLED,
  STORE_GROCERS_LIVE_FEATURES,
  STORE_GROCERS_LIVE_DAYS_12,
  STORE_GROCERS_LIVE_DAYS_6,
  STORE_GROCERS_LIVE_PACKS,
  STORE_GROCERS_LIVE_PRICE_12_HALALAS,
  STORE_GROCERS_LIVE_PRICE_12_SAR,
  STORE_GROCERS_LIVE_PRICE_6_HALALAS,
  STORE_GROCERS_LIVE_PRICE_6_SAR,
  STORE_GROCERS_LIVE_PRODUCT,
  STORE_GROCERS_LIVE_PUBLIC_ENABLED,
} from '../src/config/storeGrocersLive.ts';
import { STORE_EVENT_LIVE_PRODUCT } from '../src/config/storeEventLive.ts';
import { STORE_LOUNGE_LIVE_PRODUCT } from '../src/config/storeLoungeLive.ts';
import { STORE_WEDDING_LIVE_PRODUCT } from '../src/config/storeWeddingLive.ts';
import { STORE_LANDING_COPY } from '../src/config/storeFront.ts';
import { STORE_SHOP_PRESENCE_LABEL_AR } from '../src/config/storeShopPresence.ts';
import {
  STORE_GROCERS_LIVE_PRODUCT as apiProduct,
  grocersChargeHalalas,
  grocersChatAddonFromHalalas,
  grocersLiveInvoiceDescription,
  grocersLiveIsExpired,
  grocersLivePaymentMatches,
  grocersLiveTermEndIso,
  parseGrocersLiveOrderBody,
  publicGrocersPayload,
} from '../api/_lib/storeGrocersLive.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const landing = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');
const webhook = readFileSync(join(root, 'supabase/functions/moyasar-webhook/index.ts'), 'utf8');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const remote = readFileSync(join(root, 'src/lib/storeGrocersLiveRemote.ts'), 'utf8');
const sql = readFileSync(join(root, 'supabase/migrations/171_store_grocers_live.sql'), 'utf8');
const sqlChat = readFileSync(join(root, 'supabase/migrations/173_store_grocers_chat_prices.sql'), 'utf8');
const grocersLanding = readFileSync(join(root, 'src/pages/store/StoreGrocersLandingPage.tsx'), 'utf8');

const copyBlob = [
  STORE_GROCERS_LIVE.kickerAr,
  STORE_GROCERS_LIVE.leadAr,
  STORE_GROCERS_LIVE.problemTitleAr,
  STORE_GROCERS_LIVE.problemBodyAr,
  STORE_GROCERS_LIVE.solutionTitleAr,
  STORE_GROCERS_LIVE.howTitleAr,
  STORE_GROCERS_LIVE.howLeadAr,
  STORE_GROCERS_LIVE.howSteps.join('\n'),
  STORE_GROCERS_LIVE.ingestLineAr,
  STORE_GROCERS_LIVE.hoursLineAr,
  STORE_GROCERS_LIVE.presenceLineAr,
  STORE_GROCERS_LIVE.payTitleAr,
  STORE_GROCERS_LIVE.payIndependenceAr,
  STORE_GROCERS_LIVE.chatAddonTitleAr,
  STORE_GROCERS_LIVE.chatAddonLeadAr,
  STORE_GROCERS_LIVE.chatAddonPriceAr,
  STORE_GROCERS_LIVE.legalTitleAr,
  STORE_GROCERS_LIVE.legalLeadBeforeAr,
  STORE_GROCERS_LIVE.legalLeadAfterAr,
  STORE_GROCERS_LIVE.startTitleAr,
  STORE_GROCERS_LIVE.closeAr,
  STORE_GROCERS_LIVE.priceLineAr,
  STORE_GROCERS_LIVE.durationLineAr,
  STORE_GROCERS_LIVE.termsFoldBodyAr,
  STORE_GROCERS_LIVE.labLeadAr,
  STORE_LANDING_COPY.grocersLiveLeadAr,
  STORE_GROCERS_LIVE_FEATURES.map((item) => `${item.titleAr}\n${item.bodyAr}`).join('\n'),
].join('\n');

assert.equal(STORE_GROCERS_LIVE_PUBLIC_ENABLED, true);
assert.equal(STORE_GROCERS_LIVE_CHECKOUT_ENABLED, true);
assert.equal(STORE_GROCERS_LIVE_PRODUCT, 'store_grocers_live');
assert.equal(STORE_GROCERS_LIVE_PRODUCT, apiProduct);
assert.notEqual(STORE_GROCERS_LIVE_PRODUCT, STORE_LOUNGE_LIVE_PRODUCT);
assert.notEqual(STORE_GROCERS_LIVE_PRODUCT, STORE_EVENT_LIVE_PRODUCT);
assert.notEqual(STORE_GROCERS_LIVE_PRODUCT, STORE_WEDDING_LIVE_PRODUCT);
assert.notEqual(STORE_GROCERS_LIVE_PRODUCT, 'store_occasion_card');
assert.equal(STORE_GROCERS_LIVE_DAYS_6, 180);
assert.equal(STORE_GROCERS_LIVE_DAYS_12, 365);
assert.equal(STORE_GROCERS_LIVE_PACKS.length, 2);
assert.equal(STORE_GROCERS_LIVE_PRICE_6_SAR, 599);
assert.equal(STORE_GROCERS_LIVE_PRICE_12_SAR, 899);
assert.equal(STORE_GROCERS_LIVE_PRICE_6_HALALAS, 59900);
assert.equal(STORE_GROCERS_LIVE_PRICE_12_HALALAS, 89900);
assert.equal(STORE_GROCERS_CHAT_ADDON_6_SAR, 299);
assert.equal(STORE_GROCERS_CHAT_ADDON_12_SAR, 499);
assert.equal(STORE_GROCERS_CHAT_ADDON_6_HALALAS, 29900);
assert.equal(STORE_GROCERS_CHAT_ADDON_12_HALALAS, 49900);
assert.equal(grocersChargeHalalas('m6', false), 59900);
assert.equal(grocersChargeHalalas('m12', false), 89900);
assert.equal(grocersChargeHalalas('m6', true), 89800);
assert.equal(grocersChargeHalalas('m12', true), 139800);
assert.equal(grocersChatAddonFromHalalas(89800), true);
assert.equal(grocersChatAddonFromHalalas(139800), true);
assert.equal(grocersChatAddonFromHalalas(59900), false);
assert.match(grocersLiveInvoiceDescription('m6', true), /صندوق محادثة/);
assert.match(STORE_GROCERS_LIVE.titleAr, /تمويناتا1/);
assert.match(STORE_GROCERS_LIVE.chatAddonPriceAr, /299/);
assert.match(STORE_GROCERS_LIVE.chatAddonPriceAr, /499/);
assert.equal(STORE_GROCERS_LIVE_PACKS[0].priceSar, 599);
assert.equal(STORE_GROCERS_LIVE_PACKS[1].priceSar, 899);
assert.notEqual(STORE_GROCERS_LIVE_PRICE_6_SAR, 600);
assert.notEqual(STORE_GROCERS_LIVE_PRICE_6_SAR, 12);

assert.ok(STORE_GROCERS_CATALOG.length >= 200);
assert.match(STORE_GROCERS_LIVE.priceLineAr, /599/);
assert.match(STORE_GROCERS_LIVE.priceLineAr, /899/);
assert.match(STORE_GROCERS_LIVE.problemTitleAr, /دفتر الأسعار/);
assert.match(STORE_GROCERS_LIVE.solutionTitleAr, /لوحة كاشير/);
assert.equal(STORE_GROCERS_LIVE.howSteps.length, 5);
assert.match(STORE_GROCERS_LIVE.howSteps[0], /QR/);
assert.match(STORE_GROCERS_LIVE.ingestLineAr, /مراجعة الصفوف قبل الحفظ/);
assert.doesNotMatch(STORE_GROCERS_LIVE.ingestLineAr, /يقرأها النظام مباشرة/);
assert.match(STORE_GROCERS_LIVE.presenceLineAr, new RegExp(STORE_SHOP_PRESENCE_LABEL_AR));
assert.match(STORE_GROCERS_LIVE.legalLeadAfterAr, /7054117093/);
assert.match(STORE_GROCERS_LIVE.legalLeadAfterAr, /0000291761/);
assert.match(STORE_GROCERS_LIVE.closeAr, /اختر باقتك الآن/);
assert.doesNotMatch(STORE_GROCERS_LIVE.closeAr, /تجربة/);
assert.doesNotMatch(copyBlob, /12 و29 و59/);
assert.doesNotMatch(copyBlob, /مطعمنا1|كافينا1|طبختنا1|افراحي1|اجواء1|لاونجا1|كاردي8|أكلنا1/);
assert.doesNotMatch(copyBlob, /تجربة ستون|المسوّق/);
assert.doesNotMatch(STORE_GROCERS_LIVE.termsFoldBodyAr, /store_lounge_live/);
assert.match(STORE_LANDING_COPY.grocersLiveTitleAr, /تمويناتا1/);
assert.match(STORE_LANDING_COPY.grocersLiveLeadAr, /599/);
assert.match(grocersLanding, /problemTitleAr/);
assert.match(grocersLanding, /howSteps/);
assert.match(grocersLanding, /chatAddonPriceAr/);
assert.match(grocersLanding, /legalLeadBeforeAr/);
assert.match(grocersLanding, /STORE_BRAND_LATIN/);
assert.match(grocersLanding, /list-decimal/);

const end6 = Date.parse(grocersLiveTermEndIso(180, Date.parse('2026-01-01T00:00:00.000Z')));
assert.equal(end6 - Date.parse('2026-01-01T00:00:00.000Z'), 180 * 24 * 60 * 60 * 1000);
assert.equal(grocersLiveIsExpired('2026-01-01T00:00:00.000Z', Date.parse('2026-01-01T00:00:01.000Z')), true);
assert.equal(grocersLiveIsExpired('2026-07-01T00:00:00.000Z', Date.parse('2026-01-01T00:00:00.000Z')), false);

assert.equal(
  grocersLivePaymentMatches({
    meta: { product: 'store_grocers_live', store_grocers_token: 'tok_g' },
    token: 'tok_g',
    amount: 59900,
  }),
  true,
);
assert.equal(
  grocersLivePaymentMatches({
    meta: { product: 'store_grocers_live', store_grocers_token: 'tok_g' },
    token: 'tok_g',
    amount: 89900,
  }),
  true,
);
assert.equal(
  grocersLivePaymentMatches({
    meta: { product: 'store_grocers_live', store_grocers_token: 'tok_g' },
    token: 'tok_g',
    amount: 79900,
  }),
  true,
);
assert.equal(
  grocersLivePaymentMatches({
    meta: { product: 'store_grocers_live', store_grocers_token: 'tok_g' },
    token: 'tok_g',
    amount: 125000,
  }),
  true,
);
assert.equal(
  grocersLivePaymentMatches({
    meta: { product: 'store_grocers_live', store_grocers_token: 'tok_g' },
    token: 'tok_g',
    amount: 89800,
  }),
  true,
);
assert.equal(
  grocersLivePaymentMatches({
    meta: { product: 'store_grocers_live', store_grocers_token: 'tok_g' },
    token: 'tok_g',
    amount: 139800,
  }),
  true,
);
assert.equal(
  grocersLivePaymentMatches({
    meta: { product: 'store_event_live', store_grocers_token: 'tok_g' },
    token: 'tok_g',
    amount: 89900,
  }),
  false,
);
assert.equal(
  grocersLivePaymentMatches({
    meta: { product: 'store_grocers_live', store_grocers_token: 'tok_g' },
    token: 'tok_g',
    amount: 60000,
  }),
  false,
);
assert.equal(
  grocersLivePaymentMatches({
    meta: { product: 'store_grocers_live', store_grocers_token: 'tok_g' },
    token: 'tok_other',
    amount: 59900,
  }),
  false,
);

const parsed = parseGrocersLiveOrderBody({
  email: 'grocers@example.com',
  shopName: 'تموينات النخيل',
  packId: 'm6',
});
assert.equal(parsed.ok, true);
if (parsed.ok) {
  assert.equal(parsed.chatAddon, false);
  assert.equal(parsed.payload.chatAddon, false);
  assert.equal(parsed.payload.pickupPlaceVisible, false);
  const withPlace = {
    ...parsed.payload,
    pickupLat: 24.7136,
    pickupLng: 46.6753,
    pickupMapsUrl: 'https://maps.google.com/?q=24.713600,46.675300',
    pickupPlaceVisible: false,
  };
  const shopView = publicGrocersPayload(withPlace, 'shop');
  assert.equal(shopView.pickupLat, 0);
  assert.equal(shopView.pickupMapsUrl, '');
  const deskView = publicGrocersPayload(withPlace, 'desk');
  assert.equal(deskView.pickupLat, 24.7136);
  assert.match(deskView.pickupMapsUrl, /maps\.google\.com/);
}

const parsedChat = parseGrocersLiveOrderBody({
  email: 'grocers@example.com',
  shopName: 'تموينات النخيل',
  packId: 'm12',
  chatAddon: true,
});
assert.equal(parsedChat.ok, true);
if (parsedChat.ok) {
  assert.equal(parsedChat.chatAddon, true);
  assert.equal(parsedChat.payload.chatAddon, true);
}

assert.match(app, /\/store\/grocers/);
assert.match(app, /\/g\/:token\/desk/);
assert.match(app, /\/pay\/grocers\/:token/);
assert.match(app, /StoreGrocersLandingPage/);
assert.match(app, /StoreGrocersShopPage/);
assert.match(app, /StoreGrocersPayPage/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeGrocersLive['"]/);
assert.doesNotMatch(app, /from ['"]@\/lib\/storeGrocersLiveRemote['"]/);
assert.match(readFileSync(join(root, 'src/components/store/StoreGrocersDesk.tsx'), 'utf8'), /StoreShopPresenceCount/);
assert.match(readFileSync(join(root, 'src/pages/store/StoreGrocersShopPage.tsx'), 'utf8'), /useStoreShopPresence/);
assert.match(landing, /grocersLiveTitleAr/);
assert.match(landing, /STORE_GROCERS/);
assert.match(webhook, /skipped: "store_grocers_live"/);
assert.match(webhook, /store_grocers_live_orders/);
assert.match(webhook, /59900/);
assert.match(webhook, /89800/);
assert.match(webhook, /139800/);
assert.match(indexHtml, /store_grocers_live/);
assert.match(indexHtml, /\/pay\/grocers\//);
assert.match(remote, /public-store-grocers-live/);
assert.doesNotMatch(remote, /public-store-lounge-live/);
assert.match(sql, /price_halalas IN \(59900, 89900\)/);
assert.match(sql, /pending_renewal/);
assert.match(sql, /desk_token/);
assert.match(sqlChat, /89800/);
assert.match(sqlChat, /139800/);
assert.match(sqlChat, /store_grocers_live_price_chk/);

const rows = parseGrocersListText('حليب نادك طازج 2 لتر 11\nكرتون مياه نوفا 14');
assert.equal(rows.length, 2);
assert.equal(rows[0].price, 11);
assert.equal(rows[1].nameAr, 'كرتون مياه نوفا');

assert.match(STORE_GROCERS_LIVE.locateMeAr, /حدد موقعي/);
assert.match(STORE_GROCERS_LIVE.pickupShowAr, /إبراز الموقع/);
assert.doesNotMatch(STORE_GROCERS_LIVE.deskPickupLeadAr, /مطعمنا1|كافينا1|لاونجا1|طبختنا1/);
assert.match(readFileSync(join(root, 'src/components/store/StoreGrocersDesk.tsx'), 'utf8'), /StoreShopPlaceDesk/);
assert.match(readFileSync(join(root, 'src/components/store/StoreGrocersShop.tsx'), 'utf8'), /StoreShopPlacePin/);
assert.match(readFileSync(join(root, 'api/public-store-grocers-live.ts'), 'utf8'), /parseShopPickupPlace/);

console.log('store-grocers-live ok', STORE_GROCERS_CATALOG.length);
