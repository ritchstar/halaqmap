/**
 * معاينة خطة تشغيل خضارنا1
 * تشغيل: npx tsx scripts/test-store-produce-ops-plan-preview.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { STORE_PRODUCE_OPS_PLAN_COPY } from '../src/config/storeProduceOpsPlanCopy.ts';
import { STORE_PRODUCE_LIVE_LAB_TOKEN } from '../src/config/storeProduceLive.ts';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const view = readFileSync(join(root, 'src/components/store/produce/StoreProduceOpsPlanView.tsx'), 'utf8');
const snapshot = readFileSync(join(root, 'src/components/store/ops/StoreOpsFieldSnapshot.tsx'), 'utf8');
const scenePath = join(root, 'public/images/store/produce/produce-field-snapshot-scene.jpg');
const preview = readFileSync(join(root, 'src/pages/store/StoreProduceOpsPlanPreviewPage.tsx'), 'utf8');
const supportPage = readFileSync(join(root, 'src/pages/store/StoreProductSupportPage.tsx'), 'utf8');
const legacySupport = readFileSync(join(root, 'src/config/storeProductSupport.ts'), 'utf8');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');

assert.equal(ROUTE_PATHS.STORE_PRODUCE_OPS_PLAN_PREVIEW, '/store/produce/ops-plan-preview');
assert.match(app, /STORE_PRODUCE_OPS_PLAN_PREVIEW/);
assert.match(app, /StoreProduceOpsPlanPreviewPage/);
assert.match(preview, /noindex, nofollow/);

assert.equal(STORE_PRODUCE_OPS_PLAN_COPY.centralHookAr, 'لا تجعل البيع ينتهي بانتهاء وقفتك.');
assert.match(STORE_PRODUCE_OPS_PLAN_COPY.introAr, /خطة عملية لصاحب خضارنا1/);
assert.doesNotMatch(STORE_PRODUCE_OPS_PLAN_COPY.introAr, /26-12-103276978|000029176/);

const navTitles = STORE_PRODUCE_OPS_PLAN_COPY.stages.map((s) => s.navTitleAr);
assert.deepEqual(navTitles, [
  'البداية والتفعيل',
  'جهّز صفحتك',
  'اطبع رمزك',
  'ارسم نطاقك',
  'ثبّت حضورك في حيّك',
  'استقبل الطلب',
  'راجع وتوسّع',
]);

const allSteps = STORE_PRODUCE_OPS_PLAN_COPY.stages.flatMap((s) => s.steps);
assert.equal(allSteps.length, 10);
assert.equal(allSteps[0]?.stepNumber, 1);
assert.equal(allSteps[9]?.stepNumber, 10);

const joinedCopy = JSON.stringify(STORE_PRODUCE_OPS_PLAN_COPY);
assert.doesNotMatch(joinedCopy, /احتل حيك|\/v\/|\/desk|000029176/);
assert.match(joinedCopy, /ثبّت حضورك في حيّك/);
assert.match(joinedCopy, /ليست سوقاً|صفحة زبائن|لا عمولة على قيمة سلة/);
assert.match(joinedCopy, /يجيك البائع إلى موقعك/);
assert.doesNotMatch(joinedCopy, /صلِّ مع جماعة|أمام كل مسجد/);

assert.match(view, /produce-ops-timeline/);
assert.match(view, /produce-ops-trust/);
assert.match(view, /StoreOpsFieldSnapshot/);
assert.match(view, /stage\.id === 'qr'/);
assert.doesNotMatch(view, /StoreProductSupportGuideView/);

assert.equal(STORE_PRODUCE_OPS_PLAN_COPY.fieldSnapshot.titleAr, 'من البيع الميداني إلى جوال زبونك');
assert.equal(STORE_PRODUCE_OPS_PLAN_COPY.fieldSnapshot.qrToken, STORE_PRODUCE_LIVE_LAB_TOKEN);
assert.match(STORE_PRODUCE_OPS_PLAN_COPY.fieldSnapshot.sceneAltAr, /دون إظهار الوجوه/);
assert.ok(existsSync(scenePath), 'scene image must exist in public/');

assert.equal(ROUTE_PATHS.STORE_PRODUCE_VIEW.replace(':token', STORE_PRODUCE_LIVE_LAB_TOKEN), '/v/produce-lab');

assert.match(snapshot, /react-qr-code/);
assert.match(snapshot, /store-ops-field-snapshot__board/);
assert.doesNotMatch(snapshot, /GenerateImage|placeholder\.com/);

assert.match(supportPage, /StoreProduceOpsPlanView/);
assert.match(supportPage, /STORE_PRODUCE_SUPPORT/);
assert.match(legacySupport, /احتل حيك/);

console.log('test-store-produce-ops-plan-preview: ok');
