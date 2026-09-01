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
assert.equal(STORE_LANDING_COPY.browseHallsAr, 'المناسبات والشاشات');
assert.equal(STORE_LANDING_COPY.browseCardsAr, 'البطاقات');
assert.equal(STORE_LANDING_COPY.browseWorksAr, 'أعمال أخرى');
assert.match(STORE_LANDING_COPY.newestLeadAr, /خضارنا1/);
assert.match(STORE_LANDING_COPY.newestLeadAr, /طبختنا1/);
assert.match(STORE_LANDING_COPY.newestLeadAr, /كافينا1/);

assert.match(landing, /store-browse-neighborhood/);
assert.match(landing, /store-browse-halls/);
assert.match(landing, /store-browse-cards/);
assert.match(landing, /store-browse-works/);
assert.match(landing, /scrollStoreBrowse/);
assert.match(landing, /StoreBrowseCard/);
assert.match(landing, /sticky/);

const neighborhoodStart = landing.indexOf('id="store-browse-neighborhood"');
const hallsStart = landing.indexOf('id="store-browse-halls"');
const cardsStart = landing.indexOf('id="store-browse-cards"');
const worksStart = landing.indexOf('id="store-browse-works"');
assert.ok(neighborhoodStart > 0 && hallsStart > neighborhoodStart);
assert.ok(worksStart > hallsStart);

const neighborhood = landing.slice(neighborhoodStart, hallsStart);
assert.match(neighborhood, /produceLiveTitleAr/);
assert.match(neighborhood, /grocersLiveTitleAr/);
assert.match(neighborhood, /kitchenLiveTitleAr/);
assert.match(neighborhood, /restaurantLiveTitleAr/);
assert.match(neighborhood, /cafeLiveTitleAr/);
assert.doesNotMatch(neighborhood, /weddingLiveTitleAr|paidInvitesTitleAr|12 و29 و59/);

const halls = landing.slice(hallsStart, Math.min(cardsStart > 0 ? cardsStart : landing.length, worksStart));
assert.match(halls, /weddingLiveTitleAr/);
assert.match(halls, /eventLiveTitleAr/);
assert.match(halls, /loungeLiveTitleAr/);
assert.doesNotMatch(halls, /produceLiveTitleAr|grocersLiveTitleAr|12 و29 و59/);

assert.match(landing, /paidInvitesTitleAr/);
assert.match(STORE_LANDING_COPY.paidInvitesLeadAr, /12 و29 و59/);
assert.ok(landing.indexOf('paidInvitesTitleAr') > cardsStart);

console.log('test-store-landing-browse: ok');
