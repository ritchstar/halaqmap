/**
 * فحص تموينات الحي: 599/899 ثابت، 799/1250 متحرك، تجربة 60 يوماً، وعزل وسوم المتجر.
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
  STORE_GROCERS_EXTENSION_PRICING,
  STORE_GROCERS_LIVE,
  STORE_GROCERS_LIVE_CHECKOUT_ENABLED,
  STORE_GROCERS_LIVE_FEATURES,
  STORE_GROCERS_LIVE_DAYS_12,
  STORE_GROCERS_LIVE_DAYS_6,
  STORE_GROCERS_LIVE_LAB_TOKEN,
  STORE_GROCERS_LIVE_PACKS,
  STORE_GROCERS_LIVE_PRICE_12_HALALAS,
  STORE_GROCERS_LIVE_PRICE_12_SAR,
  STORE_GROCERS_LIVE_PRICE_6_HALALAS,
  STORE_GROCERS_LIVE_PRICE_6_SAR,
  STORE_GROCERS_LIVE_PRODUCT,
  STORE_GROCERS_LIVE_PUBLIC_ENABLED,
  STORE_GROCERS_TRIAL_DAYS,
  grocersCatalogImage,
} from '../src/config/storeGrocersLive.ts';
import { STORE_EVENT_LIVE_PRODUCT } from '../src/config/storeEventLive.ts';
import { STORE_LOUNGE_LIVE_PRODUCT } from '../src/config/storeLoungeLive.ts';
import { STORE_WEDDING_LIVE_PRODUCT } from '../src/config/storeWeddingLive.ts';
import { STORE_LANDING_COPY } from '../src/config/storeFront.ts';
import { trialDaysFor } from '../src/config/storeProductTrial.ts';
import { nextStoreLivePublicGate } from '../src/lib/storeLivePublicRead.ts';
import { defaultGrocersLabState, grocersWhatsAppText } from '../src/lib/storeGrocersLiveLab.ts';
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
const grocersShop = readFileSync(join(root, 'src/components/store/StoreGrocersShop.tsx'), 'utf8');
const grocersOrderForm = readFileSync(join(root, 'src/components/store/StoreGrocersOrderForm.tsx'), 'utf8');
const grocersStudio = readFileSync(join(root, 'src/components/store/StoreGrocersStudio.tsx'), 'utf8');
const grocersDesk = readFileSync(join(root, 'src/components/store/StoreGrocersDesk.tsx'), 'utf8');

const copyBlob = [
  STORE_GROCERS_LIVE.kickerAr,
  STORE_GROCERS_LIVE.hookAr,
  STORE_GROCERS_LIVE.leadAr,
  STORE_GROCERS_LIVE.problemTitleAr,
  STORE_GROCERS_LIVE.problemBodyAr,
  STORE_GROCERS_LIVE.solutionTitleAr,
  STORE_GROCERS_LIVE.howTitleAr,
  ...STORE_GROCERS_LIVE.howSteps.map((step) => `${step.titleAr}\n${step.bodyAr}`),
  STORE_GROCERS_LIVE.ingestLineAr,
  STORE_GROCERS_LIVE.hoursLineAr,
  STORE_GROCERS_LIVE.presenceLineAr,
  STORE_GROCERS_LIVE.payTitleAr,
  STORE_GROCERS_LIVE.payIndependenceAr,
  STORE_GROCERS_LIVE.chatAddonTitleAr,
  STORE_GROCERS_LIVE.chatAddonLeadAr,
  STORE_GROCERS_LIVE.legalBodyAr,
  STORE_GROCERS_LIVE.trialLeadAr,
  STORE_GROCERS_LIVE.extensionLeadAr,
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
assert.equal(STORE_GROCERS_TRIAL_DAYS, 60);
assert.equal(trialDaysFor('grocers'), 60);
assert.equal(STORE_GROCERS_LIVE_PACKS.length, 2);
assert.equal(STORE_GROCERS_LIVE_PRICE_6_SAR, 599);
assert.equal(STORE_GROCERS_LIVE_PRICE_12_SAR, 899);
assert.equal(STORE_GROCERS_EXTENSION_PRICING[1].price6Sar, 799);
assert.equal(STORE_GROCERS_EXTENSION_PRICING[1].price12Sar, 1250);
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
assert.match(grocersLiveInvoiceDescription('m6', true), /قناة|محادثة|استفسار/);
assert.match(STORE_GROCERS_LIVE.titleAr, /تمويناتا1/);
assert.match(STORE_GROCERS_LIVE.chatAddonPrice6Ar, /299/);
assert.match(STORE_GROCERS_LIVE.chatAddonPrice12Ar, /499/);
assert.equal(STORE_GROCERS_LIVE_PACKS[0].priceSar, 599);
assert.equal(STORE_GROCERS_LIVE_PACKS[1].priceSar, 899);
assert.notEqual(STORE_GROCERS_LIVE_PRICE_6_SAR, 600);
assert.notEqual(STORE_GROCERS_LIVE_PRICE_6_SAR, 12);

assert.ok(STORE_GROCERS_CATALOG.length >= 200);
assert.match(STORE_GROCERS_LIVE.problemTitleAr, /رسائل الطلبات/);
assert.match(STORE_GROCERS_LIVE.solutionTitleAr, /لوحة تشغيل/);
assert.equal(STORE_GROCERS_LIVE.howSteps.length, 5);
assert.match(STORE_GROCERS_LIVE.howSteps[1].bodyAr, /QR/);
assert.match(STORE_GROCERS_LIVE.ingestLineAr, /مكتبة السلع/);
assert.doesNotMatch(STORE_GROCERS_LIVE.ingestLineAr, /يقرأها النظام مباشرة/);
assert.match(STORE_GROCERS_LIVE.presenceLineAr, /الزوار النشطون الآن/);
assert.match(STORE_GROCERS_LIVE.legalCertAr, /26-12-103276933/);
assert.doesNotMatch(copyBlob, /تفعيل المباشر|تجهّز فور السداد|فور السداد يصلك/);
assert.doesNotMatch(copyBlob, /12 و29 و59/);
assert.doesNotMatch(copyBlob, /مطعمنا1|كافينا1|طبختنا1|افراحي1|اجواء1|لاونجا1|كاردي8|أكلنا1/);
assert.doesNotMatch(copyBlob, /برقم طاولة منزلية/);
assert.doesNotMatch(STORE_GROCERS_LIVE.termsFoldBodyAr, /store_lounge_live/);
assert.match(STORE_LANDING_COPY.grocersLiveTitleAr, /تمويناتا1/);
assert.match(grocersLanding, /STORE_GROCERS_LIVE.trialCtaAr/);
assert.match(grocersLanding, /STORE_GROCERS_EXTENSION_PRICING/);
assert.match(grocersLanding, /product=grocers/);
assert.match(grocersOrderForm, /totalSar/);
assert.match(grocersOrderForm, /useState\(false\)/);
assert.match(grocersStudio, /labPreviewBadgeAr/);
assert.match(grocersStudio, /max-w-\[1180px\]/);
assert.match(grocersDesk, /maskPii/);
assert.match(grocersShop, /grocersCatalogImage/);
assert.match(grocersShop, /useState\(false\)/);
assert.equal(STORE_GROCERS_LIVE_LAB_TOKEN, 'grocers-lab');
assert.match(STORE_GROCERS_LIVE.locateMeAr, /تحديد موقعي/);
assert.match(STORE_GROCERS_LIVE.confirmPlaceAr, /تأكيد الموقع/);
assert.match(STORE_GROCERS_LIVE.qrPhraseAr, /موقع التسليم/);
assert.ok(grocersCatalogImage(0).includes('/images/store/grocers/'));

const demo = defaultGrocersLabState();
assert.equal(demo.chatAddon, false);
assert.match(demo.host.shopName, /متجر تجريبي/);
assert.match(demo.shelf[0]?.nameAr || '', /حليب|خبز|مياه|جبنة|أرز|مسحوق|مناديل/);

assert.match(
  grocersWhatsAppText({
    id: '1',
    name: 'عميل',
    phone: '0500000000',
    place: 'حي النخيل',
    pay: 'card',
    service: 'delivery',
    lines: [],
    total: 0,
    facadeSrc: '',
    at: '2026-09-04T00:00:00.000Z',
    seen: false,
  }, 'تموينات'),
  /شبكة عند الاستلام/,
);

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
    amount: 125000,
  }),
  true,
);

const parsed = parseGrocersLiveOrderBody({
  email: 'grocers@example.com',
  shopName: 'تموينات النخيل',
  packId: 'm6',
});
assert.equal(parsed.ok, true);
if (parsed.ok) {
  assert.equal(parsed.chatAddon, false);
  const shopView = publicGrocersPayload(parsed.payload, 'shop');
  assert.equal(shopView.pickupLat, 0);
}

const rows = parseGrocersListText('حليب طازج 2 لتر 11\nكرتون مياه 14');
assert.equal(rows.length, 2);
assert.equal(rows[0].price, 11);

assert.match(app, /\/store\/grocers/);
assert.match(app, /StoreGrocersLandingPage/);
assert.match(landing, /grocersLiveTitleAr/);
assert.match(webhook, /store_grocers_live/);
assert.match(indexHtml, /store_grocers_live/);
assert.match(remote, /public-store-grocers-live/);
assert.equal(nextStoreLivePublicGate('ok', { expired: true }).gate, 'expired');

console.log('store-grocers-live ok', STORE_GROCERS_CATALOG.length);
