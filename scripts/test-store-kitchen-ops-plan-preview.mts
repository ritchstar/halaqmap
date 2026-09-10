/**
 * معاينة دليل تشغيل طبختنا1
 * تشغيل: npx tsx scripts/test-store-kitchen-ops-plan-preview.mts
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_KITCHEN_OPS_PLAN_COPY } from '../src/config/storeKitchenOpsPlanCopy.ts';
import { STORE_KITCHEN_LIVE_LAB_TOKEN } from '../src/config/storeKitchenLive.ts';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const view = readFileSync(join(root, 'src/components/store/kitchen/StoreKitchenOpsPlanView.tsx'), 'utf8');
const mini = readFileSync(join(root, 'src/components/store/ops/StoreOpsKitchenMiniSnapshot.tsx'), 'utf8');
const preview = readFileSync(join(root, 'src/pages/store/StoreKitchenOpsPlanPreviewPage.tsx'), 'utf8');
const supportPage = readFileSync(join(root, 'src/pages/store/StoreProductSupportPage.tsx'), 'utf8');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');

assert.equal(ROUTE_PATHS.STORE_KITCHEN_OPS_PLAN_PREVIEW, '/store/kitchen/ops-plan-preview');
assert.match(app, /STORE_KITCHEN_OPS_PLAN_PREVIEW/);
assert.match(app, /StoreKitchenOpsPlanPreviewPage/);
assert.match(preview, /noindex, nofollow/);

assert.equal(STORE_KITCHEN_OPS_PLAN_COPY.centralHookAr, 'اطبخ بتركيز… ودع الطلب يصل مرتباً.');
assert.match(STORE_KITCHEN_OPS_PLAN_COPY.introAr, /دليل عملي يساعد الأسرة المنتجة/);
assert.doesNotMatch(STORE_KITCHEN_OPS_PLAN_COPY.introAr, /26-12-103276936|300 ر\.س/);

const navTitles = STORE_KITCHEN_OPS_PLAN_COPY.stages.map((s) => s.navTitleAr);
assert.deepEqual(navTitles, [
  'البداية والتفعيل',
  'نظّم مطبخك',
  'جهّز القائمة',
  'اختبر الطلب',
  'انشر صفحتك',
  'استقبل وجهّز',
  'سلّم بوضوح',
  'راجع وطوّر',
]);

const allSteps = STORE_KITCHEN_OPS_PLAN_COPY.stages.flatMap((s) => s.steps);
assert.equal(allSteps.length, 12);
assert.equal(allSteps[0]?.stepNumber, 1);
assert.equal(allSteps[11]?.stepNumber, 12);

const joinedCopy = JSON.stringify(STORE_KITCHEN_OPS_PLAN_COPY);
assert.doesNotMatch(joinedCopy, /احتل حيك|تعال|بسطة|جولة|كيلو|خضارنا1/);
assert.match(joinedCopy, /من مطبخك إلى جوال زبونك/);
assert.match(joinedCopy, /لا تحصيل إلكتروني لقيمة الوجبة/);
assert.match(joinedCopy, /مذكرة واتساب|يدوياً/);

assert.match(view, /kitchen-ops-timeline/);
assert.match(view, /kitchen-ops-trust/);
assert.match(view, /StoreOpsKitchenMiniSnapshot/);
assert.doesNotMatch(view, /StoreProductSupportGuideView/);

assert.equal(STORE_KITCHEN_OPS_PLAN_COPY.labToken, STORE_KITCHEN_LIVE_LAB_TOKEN);
assert.equal(STORE_KITCHEN_OPS_PLAN_COPY.guestPathPrefix, '/k/');
assert.equal(STORE_KITCHEN_OPS_PLAN_COPY.miniSnapshots.length, 4);

for (const snap of STORE_KITCHEN_OPS_PLAN_COPY.miniSnapshots) {
  assert.ok(existsSync(join(root, 'public', snap.sceneImageSrc.replace(/^\//, ''))), `${snap.sceneImageSrc} must exist`);
}

assert.equal(ROUTE_PATHS.STORE_KITCHEN_VIEW.replace(':token', STORE_KITCHEN_LIVE_LAB_TOKEN), '/k/kitchen-lab');

assert.match(mini, /react-qr-code/);
assert.doesNotMatch(mini, /GenerateImage|placeholder\.com/);

assert.match(supportPage, /StoreKitchenOpsPlanView/);
assert.match(supportPage, /STORE_KITCHEN_SUPPORT/);
assert.equal(ROUTE_PATHS.STORE_KITCHEN_SUPPORT, '/store/kitchen/support');

console.log('test-store-kitchen-ops-plan-preview: ok');
