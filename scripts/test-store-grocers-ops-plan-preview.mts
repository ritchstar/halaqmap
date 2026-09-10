/**
 * معاينة دليل تشغيل تمويناتا1
 * تشغيل: npx tsx scripts/test-store-grocers-ops-plan-preview.mts
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_GROCERS_OPS_PLAN_COPY } from '../src/config/storeGrocersOpsPlanCopy.ts';
import { STORE_GROCERS_LIVE_LAB_TOKEN } from '../src/config/storeGrocersLive.ts';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const view = readFileSync(join(root, 'src/components/store/grocers/StoreGrocersOpsPlanView.tsx'), 'utf8');
const mini = readFileSync(join(root, 'src/components/store/ops/StoreOpsGuestMiniSnapshot.tsx'), 'utf8');
const preview = readFileSync(join(root, 'src/pages/store/StoreGrocersOpsPlanPreviewPage.tsx'), 'utf8');
const supportPage = readFileSync(join(root, 'src/pages/store/StoreProductSupportPage.tsx'), 'utf8');
const legacySupport = readFileSync(join(root, 'src/config/storeProductSupport.ts'), 'utf8');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');

assert.equal(ROUTE_PATHS.STORE_GROCERS_OPS_PLAN_PREVIEW, '/store/grocers/ops-plan-preview');
assert.match(app, /STORE_GROCERS_OPS_PLAN_PREVIEW/);
assert.match(app, /StoreGrocersOpsPlanPreviewPage/);
assert.match(preview, /noindex, nofollow/);

assert.equal(STORE_GROCERS_OPS_PLAN_COPY.centralHookAr, 'رتّب رفّك… ودع طلب الحي يصل إلى الكاشير واضحاً.');
assert.match(STORE_GROCERS_OPS_PLAN_COPY.introAr, /دليل عملي يساعد صاحب التموينات/);
assert.doesNotMatch(STORE_GROCERS_OPS_PLAN_COPY.introAr, /26-12-103276933|599 ر\.س/);

const navTitles = STORE_GROCERS_OPS_PLAN_COPY.stages.map((s) => s.navTitleAr);
assert.deepEqual(navTitles, [
  'البداية والتفعيل',
  'اختر مسارك',
  'رتّب رفّك',
  'اختبر الطلب',
  'انشر صفحتك',
  'ثبّت حضورك في حيّك',
  'استقبل وجهّز',
  'راجع وطوّر',
]);

const allSteps = STORE_GROCERS_OPS_PLAN_COPY.stages.flatMap((s) => s.steps);
assert.equal(allSteps.length, 12);

const joinedCopy = JSON.stringify(STORE_GROCERS_OPS_PLAN_COPY);
assert.doesNotMatch(joinedCopy, /احتل حيك|\/v\/|طبختنا1|خضارنا1|تعال/);
assert.match(joinedCopy, /من رفّك إلى جوال جار الحي/);
assert.match(joinedCopy, /ثبّت حضورك في حيّك/);
assert.match(joinedCopy, /ليست سوقاً مشتركاً/);
assert.match(joinedCopy, /الزوار النشطون الآن/);
assert.match(joinedCopy, /ملخص الطلب عبر واتساب/);

assert.match(view, /grocers-ops-timeline/);
assert.match(view, /StoreOpsGuestMiniSnapshot/);
assert.doesNotMatch(view, /StoreProductSupportGuideView/);

assert.equal(STORE_GROCERS_OPS_PLAN_COPY.labToken, STORE_GROCERS_LIVE_LAB_TOKEN);
assert.equal(STORE_GROCERS_OPS_PLAN_COPY.guestPathPrefix, '/g/');
assert.equal(STORE_GROCERS_OPS_PLAN_COPY.miniSnapshots.length, 4);

for (const snap of STORE_GROCERS_OPS_PLAN_COPY.miniSnapshots) {
  assert.ok(existsSync(join(root, 'public', snap.sceneImageSrc.replace(/^\//, ''))), `${snap.sceneImageSrc} must exist`);
}

assert.equal(ROUTE_PATHS.STORE_GROCERS_VIEW.replace(':token', STORE_GROCERS_LIVE_LAB_TOKEN), '/g/grocers-lab');

assert.match(mini, /react-qr-code/);
assert.doesNotMatch(mini, /GenerateImage|placeholder\.com/);

assert.match(supportPage, /StoreGrocersOpsPlanView/);
assert.match(supportPage, /STORE_GROCERS_SUPPORT/);
assert.match(legacySupport, /احتل حيك/);

console.log('test-store-grocers-ops-plan-preview: ok');
