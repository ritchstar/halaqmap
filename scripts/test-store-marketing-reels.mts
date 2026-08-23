/**
 * أشرطة التسويق: كل منتج بشريطه، واللاونج بلا قاعات زواج.
 * تشغيل: npx tsx scripts/test-store-marketing-reels.mts
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_GROCERS_MARKETING_FRAMES,
  STORE_LANDING_MARKETING_FRAMES,
  STORE_LOUNGE_MARKETING_FRAMES,
  STORE_OCCASION_MARKETING_FRAMES,
  STORE_RESTAURANT_MARKETING_FRAMES,
  STORE_WEDDING_MARKETING_FRAMES,
  loungeFrameIsWeddingHall,
  storeLiveProductReel,
  storeMarketingFrames,
  storeSoftwareShotReel,
  type StoreMarketingReelId,
} from '../src/config/storeMarketingReels.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const hall = readFileSync(join(root, 'src/components/store/StoreLoungeHallStage.tsx'), 'utf8');
const landing = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');
const loungeLanding = readFileSync(join(root, 'src/pages/store/StoreLoungeLandingPage.tsx'), 'utf8');

assert.doesNotMatch(app, /from ['"]@\/config\/storeMarketingReels['"]/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeLoungeLive['"]/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeFront['"]/);

assert.ok(STORE_LOUNGE_MARKETING_FRAMES.length >= 12);
assert.ok(STORE_GROCERS_MARKETING_FRAMES.length >= 8);
assert.ok(STORE_OCCASION_MARKETING_FRAMES.length >= 20);
assert.ok(STORE_WEDDING_MARKETING_FRAMES.length >= 12);
assert.ok(STORE_LANDING_MARKETING_FRAMES.length >= 8);
assert.ok(STORE_LANDING_MARKETING_FRAMES.length <= 12);
for (const src of STORE_LANDING_MARKETING_FRAMES) {
  assert.equal(src.includes('/images/store/lounge/lounge-'), false, src);
  assert.equal(src.includes('/images/store/grocers/grocers-'), false, src);
  assert.equal(src.includes('/images/store/restaurant/restaurant-'), false, src);
  assert.equal(src.includes('/images/store/live/pano-'), false, src);
}

for (const src of STORE_LOUNGE_MARKETING_FRAMES) {
  assert.equal(loungeFrameIsWeddingHall(src), false, src);
  assert.ok(existsSync(join(root, 'public', src.replace(/^\//, ''))), src);
}

for (const src of STORE_GROCERS_MARKETING_FRAMES) {
  assert.ok(existsSync(join(root, 'public', src.replace(/^\//, ''))), src);
}

assert.ok(STORE_RESTAURANT_MARKETING_FRAMES.length >= 2);
assert.equal(new Set(STORE_RESTAURANT_MARKETING_FRAMES).size, STORE_RESTAURANT_MARKETING_FRAMES.length);
for (const src of STORE_RESTAURANT_MARKETING_FRAMES) {
  assert.ok(existsSync(join(root, 'public', src.replace(/^\//, ''))), src);
}

const ids: StoreMarketingReelId[] = [
  'landing',
  'lounge',
  'grocers',
  'wedding',
  'wedding-women',
  'event',
  'event-women',
  'occasion',
  'halaq',
  'coiffeur',
  'ops',
];
for (const id of ids) {
  assert.ok(storeMarketingFrames(id).length >= 4, id);
}

assert.equal(storeLiveProductReel('halaq-map'), 'halaq');
assert.equal(storeLiveProductReel('coiffeur-map'), 'coiffeur');
assert.equal(storeLiveProductReel('occasion-card'), 'occasion');
assert.equal(storeLiveProductReel('live-halls'), 'lounge');
assert.equal(storeLiveProductReel('restaurant'), 'restaurant');
assert.equal(storeSoftwareShotReel(0), 'halaq');
assert.equal(storeSoftwareShotReel(2), 'lounge');

assert.match(hall, /STORE_LOUNGE_MARKETING_FRAMES/);
assert.match(hall, /reel="lounge"/);
assert.doesNotMatch(hall, /<StoreLivePanoramaCycle \/>/);
assert.match(landing, /reel="landing"/);
assert.match(landing, /reel="lounge"/);
assert.match(landing, /reel="grocers"/);
assert.match(landing, /reel="restaurant"/);
assert.match(landing, /reel="wedding"/);
assert.match(landing, /reel="event"/);
assert.match(loungeLanding, /reel="lounge"/);

const weddingHall = readFileSync(join(root, 'src/components/store/StoreWeddingHallStage.tsx'), 'utf8');
const eventHall = readFileSync(join(root, 'src/components/store/StoreEventHallStage.tsx'), 'utf8');
assert.match(weddingHall, /StoreHallAtmosphere/);
assert.match(weddingHall, /StoreHallNoticePlaque/);
assert.match(weddingHall, /STORE_WEDDING_MARKETING_FRAMES/);
assert.doesNotMatch(weddingHall, /absolute inset-x-3 top-3/);
assert.match(eventHall, /StoreHallAtmosphere/);
assert.match(eventHall, /StoreHallNoticePlaque/);
assert.match(eventHall, /STORE_EVENT_MARKETING_FRAMES/);
assert.doesNotMatch(eventHall, /absolute inset-x-3 top-3/);
assert.doesNotMatch(weddingHall, /<StoreLivePanoramaCycle \/>/);
assert.doesNotMatch(eventHall, /<StoreLivePanoramaCycle \/>/);

const shot = readFileSync(join(root, 'src/components/store/StoreShot.tsx'), 'utf8');
assert.match(shot, /IntersectionObserver/);
assert.match(shot, /fetchPriority/);
assert.doesNotMatch(shot, /nearbyFrames/);

console.log('store-marketing-reels: ok');
