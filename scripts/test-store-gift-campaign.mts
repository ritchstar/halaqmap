/**
 * هدية خريطة الحل: مقترح المستخدم مع تأكيد البريد وشروط الإهداء.
 * تشغيل: npx tsx scripts/test-store-gift-campaign.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  giftProductLabelAr,
  giftTrialKey,
  giftTrialVoice,
  STORE_GIFT_COPY,
  STORE_GIFT_CYCLE_CAP,
  STORE_GIFT_SLOT_COUNT,
  STORE_GIFT_TERMS_COPY,
} from '../src/config/storeGiftCampaign.ts';
import { isGivenName, pickWinnerIndex } from '../api/_lib/storeGiftCampaign.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const sql = readFileSync(join(root, 'supabase/migrations/182_store_gift_campaign.sql'), 'utf8');
const landing = readFileSync(join(root, 'src/pages/store/StoreGiftLandingPage.tsx'), 'utf8');
const form = readFileSync(join(root, 'src/components/store/StoreGiftEnterForm.tsx'), 'utf8');
const chrome = readFileSync(join(root, 'src/components/store/StoreChrome.tsx'), 'utf8');
const storeHub = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');
const wedding = readFileSync(join(root, 'src/pages/store/StoreWeddingLandingPage.tsx'), 'utf8');
const eventHub = readFileSync(join(root, 'src/pages/store/StoreEventHubPage.tsx'), 'utf8');
const eventLanding = readFileSync(join(root, 'src/pages/store/StoreEventLandingPage.tsx'), 'utf8');
const cafe = readFileSync(join(root, 'src/pages/store/StoreCafeLandingPage.tsx'), 'utf8');
const kitchen = readFileSync(join(root, 'src/pages/store/StoreKitchenLandingPage.tsx'), 'utf8');
const grocers = readFileSync(join(root, 'src/pages/store/StoreGrocersLandingPage.tsx'), 'utf8');
const restaurant = readFileSync(join(root, 'src/pages/store/StoreRestaurantLandingPage.tsx'), 'utf8');
const lounge = readFileSync(join(root, 'src/pages/store/StoreLoungeLandingPage.tsx'), 'utf8');

assert.equal(STORE_GIFT_SLOT_COUNT, 5);
assert.equal(STORE_GIFT_CYCLE_CAP, 50);
assert.equal(giftTrialKey('wedding_men'), 'wedding');
assert.equal(giftTrialKey('event'), 'event');
assert.equal(giftTrialVoice('wedding_women'), 'women');
assert.equal(giftTrialVoice('event', 'men'), 'men');
assert.equal(giftProductLabelAr('wedding_men'), 'افراحي1 رجالي');
assert.equal(isGivenName('سارة أحمد'), true);
assert.equal(isGivenName('سارة'), false);
assert.equal(pickWinnerIndex(1, () => 0), 0);

const visitor = `${STORE_GIFT_COPY.kickerAr} ${STORE_GIFT_COPY.titleAr} ${STORE_GIFT_COPY.leadAr} ${STORE_GIFT_COPY.promoTitleAr} ${STORE_GIFT_COPY.promoLeadAr} ${STORE_GIFT_COPY.promoCtaAr}`;
assert.doesNotMatch(visitor, /مسابقة/);
assert.doesNotMatch(visitor, /فعالية/);
assert.doesNotMatch(visitor, /الفوز بمنتج/);
assert.match(STORE_GIFT_TERMS_COPY.titleAr, /مبادئ الإهداء/);
assert.match(form, /acceptedTerms/);
assert.match(form, /STORE_GIFT_TERMS/);
assert.match(landing, /StoreGiftEnterForm/);
assert.match(app, /StoreGiftLandingPage/);
assert.match(app, /\/store\/gift\/terms/);
assert.match(app, /\/store\/gift\/confirm/);
assert.doesNotMatch(app, /storeGiftCampaign/);
assert.match(sql, /store_gift_cycles/);
assert.match(sql, /store_gift_entries/);
assert.match(sql, /service_role/);
assert.match(chrome, /STORE_GIFT/);
assert.match(chrome, /headerShortAr/);
assert.match(STORE_GIFT_COPY.promoLeadAr, /افراحي1/);
assert.match(storeHub, /StoreGiftPromoBanner/);
assert.match(wedding, /StoreGiftPromoBanner/);
assert.match(eventHub, /StoreGiftPromoBanner/);
assert.match(eventLanding, /StoreGiftPromoBanner/);
assert.doesNotMatch(cafe, /StoreGiftPromoBanner/);
assert.doesNotMatch(kitchen, /StoreGiftPromoBanner/);
assert.doesNotMatch(grocers, /StoreGiftPromoBanner/);
assert.doesNotMatch(restaurant, /StoreGiftPromoBanner/);
assert.doesNotMatch(lounge, /StoreGiftPromoBanner/);
assert.match(STORE_GIFT_TERMS_COPY.sections.map((s) => s.bodyAr).join('\n'), /ستون يوماً/);
assert.match(STORE_GIFT_TERMS_COPY.sections.map((s) => s.bodyAr).join('\n'), /لا ترسل نيابة/);

console.log('test-store-gift-campaign: ok');
