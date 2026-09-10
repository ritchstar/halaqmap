/**
 * تصفح رئيسية المتجر: شريط أقسام ومجموعات مضغوطة بلا خلط أسعار كاردي8 بالحي.
 * تشغيل: npx tsx scripts/test-store-landing-browse.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_LANDING_COPY } from '../src/config/storeFront.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const landing = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');

assert.equal(STORE_LANDING_COPY.browseNeighborhoodAr, 'الحي');
assert.equal(STORE_LANDING_COPY.browseHospitalityAr, 'الطعام والضيافة');
assert.equal(STORE_LANDING_COPY.browseHallsAr, 'المناسبات');
assert.equal(STORE_LANDING_COPY.browseCardsAr, 'البطاقات');
assert.equal(STORE_LANDING_COPY.browseWorksAr, 'المهن والخدمات');
assert.equal(
  STORE_LANDING_COPY.pitchH1Ar,
  'شغلك ما يحتاج متجر إلكتروني يفرض عليك طريقته.',
);
assert.equal(STORE_LANDING_COPY.pitchSupportAr, 'منتجات خريطة الحل مصممة حول سير عملك.');
assert.equal(STORE_LANDING_COPY.pitchTransformAr, 'منتجاتنا تنقلك من انتظارهم… إلى جوالاتهم.');
assert.equal(
  STORE_LANDING_COPY.pitchClosingAr,
  'وبطريقة تمشي مع شغلك، لا بطريقة يفرضها عليك نظام عام.',
);
assert.equal(STORE_LANDING_COPY.pitchFlowAr, 'عرضك → طلب العميل → تشغيلك');
assert.equal(STORE_LANDING_COPY.pitchExploreCtaAr, 'استكشف المنتج المناسب لشغلك');
assert.equal(
  STORE_LANDING_COPY.pitchProductsBridgeAr,
  'اختر المسار الرقمي الذي يناسب طريقة شغلك.',
);
assert.match(STORE_LANDING_COPY.newestLeadAr, /خضارنا1/);
assert.match(STORE_LANDING_COPY.newestLeadAr, /طبختنا1/);
assert.match(STORE_LANDING_COPY.newestLeadAr, /كافينا1/);
assert.match(STORE_LANDING_COPY.newestLeadAr, /مخصصة لك وحدك/);

assert.match(landing, /store-browse-neighborhood/);
assert.match(landing, /store-browse-hospitality/);
assert.match(landing, /store-browse-halls/);
assert.match(landing, /store-browse-cards/);
assert.match(landing, /store-browse-works/);
assert.match(landing, /scrollStoreBrowse/);
assert.match(landing, /StoreBrowseCard/);
assert.match(landing, /StoreProductName/);
assert.match(landing, /pitchExploreCtaAr/);
assert.match(landing, /pitchProductsBridgeAr/);
assert.match(landing, /pitchH1Ar/);
assert.doesNotMatch(landing, /pitchRequestCtaAr/);
assert.match(landing, /sticky/);

const neighborhoodStart = landing.indexOf('id="store-browse-neighborhood"');
const hospitalityStart = landing.indexOf('id="store-browse-hospitality"');
const hallsStart = landing.indexOf('id="store-browse-halls"');
const cardsStart = landing.indexOf('id="store-browse-cards"');
const worksStart = landing.indexOf('id="store-browse-works"');
assert.ok(neighborhoodStart > 0 && hospitalityStart > neighborhoodStart);
assert.ok(hallsStart > hospitalityStart);
assert.ok(worksStart > hallsStart);

const neighborhood = landing.slice(neighborhoodStart, hospitalityStart);
assert.match(neighborhood, /produceLiveTitleAr/);
assert.match(neighborhood, /grocersLiveTitleAr/);
assert.doesNotMatch(neighborhood, /kitchenLiveTitleAr|weddingLiveTitleAr|paidInvitesTitleAr|12 و29 و59/);

const hospitality = landing.slice(hospitalityStart, hallsStart);
assert.match(hospitality, /kitchenLiveTitleAr/);
assert.match(hospitality, /restaurantLiveTitleAr/);
assert.match(hospitality, /cafeLiveTitleAr/);
assert.match(hospitality, /loungeLiveTitleAr/);
assert.doesNotMatch(hospitality, /produceLiveTitleAr|weddingLiveTitleAr|12 و29 و59/);

const halls = landing.slice(hallsStart, Math.min(cardsStart > 0 ? cardsStart : landing.length, worksStart));
assert.match(halls, /weddingLiveTitleAr/);
assert.match(halls, /eventLiveTitleAr/);
assert.doesNotMatch(halls, /loungeLiveTitleAr|produceLiveTitleAr|grocersLiveTitleAr|12 و29 و59/);

assert.match(landing, /paidInvitesTitleAr/);
assert.match(STORE_LANDING_COPY.paidInvitesLeadAr, /12 و29 و59/);
assert.ok(landing.indexOf('paidInvitesTitleAr') > cardsStart);

assert.match(landing, /overflow-x-clip/);
assert.match(landing, /overflow-hidden text-center/);
assert.match(landing, /StoreDedicatedPageCallout/);
assert.match(landing, /storeBrowseNeighborhoodLeadAr/);

console.log('test-store-landing-browse: ok');
