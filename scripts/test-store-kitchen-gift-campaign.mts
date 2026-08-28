/**
 * هدية طبختنا1: خمسة نماذج، باقة 180 يوماً من أول دخول، معزولة عن هدية المناسبات.
 * تشغيل: npx tsx scripts/test-store-kitchen-gift-campaign.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_KITCHEN_GIFT_COPY,
  STORE_KITCHEN_GIFT_CYCLE_CAP,
  STORE_KITCHEN_GIFT_PACK_ID,
  STORE_KITCHEN_GIFT_SLOT_COUNT,
  STORE_KITCHEN_GIFT_TERM_DAYS,
  STORE_KITCHEN_GIFT_TERMS_COPY,
} from '../src/config/storeKitchenGiftCampaign.ts';
import { isKitchenGivenName, pickKitchenGiftWinnerIndex } from '../api/_lib/storeKitchenGiftCampaign.ts';
import { isKitchenGiftPayload } from '../api/_lib/storeKitchenLive.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const sql = readFileSync(join(root, 'supabase/migrations/184_store_kitchen_gift_campaign.sql'), 'utf8');
const landing = readFileSync(join(root, 'src/pages/store/StoreKitchenGiftLandingPage.tsx'), 'utf8');
const form = readFileSync(join(root, 'src/components/store/StoreKitchenGiftEnterForm.tsx'), 'utf8');
const kitchenLanding = readFileSync(join(root, 'src/pages/store/StoreKitchenLandingPage.tsx'), 'utf8');
const desk = readFileSync(join(root, 'src/components/store/StoreKitchenDesk.tsx'), 'utf8');
const cafe = readFileSync(join(root, 'src/pages/store/StoreCafeLandingPage.tsx'), 'utf8');
const wedding = readFileSync(join(root, 'src/pages/store/StoreWeddingLandingPage.tsx'), 'utf8');
const eventLanding = readFileSync(join(root, 'src/pages/store/StoreEventLandingPage.tsx'), 'utf8');
const storeHub = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');
const chrome = readFileSync(join(root, 'src/components/store/StoreChrome.tsx'), 'utf8');
const api = readFileSync(join(root, 'api/public-store-kitchen-gift.ts'), 'utf8');
const liveApi = readFileSync(join(root, 'api/public-store-kitchen-live.ts'), 'utf8');

assert.equal(STORE_KITCHEN_GIFT_SLOT_COUNT, 5);
assert.equal(STORE_KITCHEN_GIFT_CYCLE_CAP, 50);
assert.equal(STORE_KITCHEN_GIFT_TERM_DAYS, 180);
assert.equal(STORE_KITCHEN_GIFT_PACK_ID, 'm6');
assert.equal(isKitchenGivenName('سارة أحمد'), true);
assert.equal(isKitchenGivenName('سارة'), false);
assert.equal(pickKitchenGiftWinnerIndex(1, () => 0), 0);
assert.equal(isKitchenGiftPayload({ gift: true, issuedByLabel: 'هدية طبختنا1' }), true);
assert.equal(isKitchenGiftPayload({ gift: false }), false);

const visitor = `${STORE_KITCHEN_GIFT_COPY.kickerAr} ${STORE_KITCHEN_GIFT_COPY.titleAr} ${STORE_KITCHEN_GIFT_COPY.leadAr} ${STORE_KITCHEN_GIFT_COPY.promoTitleAr} ${STORE_KITCHEN_GIFT_COPY.promoLeadAr}`;
assert.doesNotMatch(visitor, /مسابقة/);
assert.doesNotMatch(visitor, /فعالية/);
assert.doesNotMatch(visitor, /الفوز بمنتج/);
assert.doesNotMatch(visitor, /افراحي1|اجواء1|أكلنا1|كاردي8/);
assert.match(STORE_KITCHEN_GIFT_COPY.packBodyAr, /مئة وثمانين/);
assert.doesNotMatch(STORE_KITCHEN_GIFT_COPY.packBodyAr, /ثلاثمئة وستين يوماً فقط/);
assert.match(STORE_KITCHEN_GIFT_COPY.packBodyAr, /أول دخول/);
assert.match(STORE_KITCHEN_GIFT_COPY.deskBadgeAr, /متجر خريطة الحل/);
assert.match(form, /acceptedTerms/);
assert.match(form, /STORE_KITCHEN_GIFT_TERMS/);
assert.doesNotMatch(form, /occasionDate|productChoice/);
assert.match(landing, /StoreKitchenGiftEnterForm/);
assert.match(kitchenLanding, /StoreKitchenGiftPromoBanner/);
assert.doesNotMatch(cafe, /StoreKitchenGiftPromoBanner/);
assert.doesNotMatch(wedding, /StoreKitchenGiftPromoBanner/);
assert.doesNotMatch(eventLanding, /StoreKitchenGiftPromoBanner/);
assert.doesNotMatch(storeHub, /StoreKitchenGiftPromoBanner/);
assert.doesNotMatch(chrome, /STORE_KITCHEN_GIFT/);
assert.match(desk, /deskBadgeAr/);
assert.match(desk, /deskRenewCtaAr/);
assert.match(app, /StoreKitchenGiftLandingPage/);
assert.match(app, /\/store\/kitchen\/gift\/terms/);
assert.match(app, /\/store\/kitchen\/gift\/confirm/);
assert.doesNotMatch(app, /storeKitchenGiftCampaign/);
assert.match(sql, /store_kitchen_gift_cycles/);
assert.match(sql, /store_kitchen_gift_entries/);
assert.match(sql, /service_role/);
assert.match(STORE_KITCHEN_GIFT_TERMS_COPY.sections.map((s) => s.bodyAr).join('\n'), /أول دخول/);
assert.match(STORE_KITCHEN_GIFT_TERMS_COPY.sections.map((s) => s.bodyAr).join('\n'), /مئة وثمانون/);
assert.doesNotMatch(STORE_KITCHEN_GIFT_TERMS_COPY.sections.map((s) => s.titleAr).join('\n'), /العزل/);
assert.match(api, /await sendKitchenGiftConfirmEmail/);
assert.doesNotMatch(api, /void sendKitchenGiftConfirmEmail/);
assert.match(form, /company_url_hp/);
assert.match(liveApi, /startKitchenGiftClockIfNeeded/);
assert.match(liveApi, /giftConvertedAt/);

console.log('test-store-kitchen-gift-campaign: ok');
