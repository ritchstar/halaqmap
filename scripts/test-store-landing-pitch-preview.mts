/**
 * معاينة الشاشة الأولى الجديدة — /store/pitch-preview
 * تشغيل: npx tsx scripts/test-store-landing-pitch-preview.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_LANDING_PITCH_COPY } from '../src/config/storeLandingPitchCopy.ts';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const hero = readFileSync(join(root, 'src/components/store/StoreLandingPitchHero.tsx'), 'utf8');
const preview = readFileSync(join(root, 'src/pages/store/StoreLandingPitchPreviewPage.tsx'), 'utf8');
const philosophy = readFileSync(join(root, 'src/components/store/StoreLandingPhilosophySection.tsx'), 'utf8');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const landing = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');

assert.equal(ROUTE_PATHS.STORE_LANDING_PITCH_PREVIEW, '/store/pitch-preview');
assert.match(app, /STORE_LANDING_PITCH_PREVIEW/);
assert.match(app, /StoreLandingPitchPreviewPage/);

assert.equal(STORE_LANDING_PITCH_COPY.pitchH1Ar, 'شغلك ما يحتاج متجر إلكتروني يفرض عليك طريقته.');
assert.equal(
  STORE_LANDING_PITCH_COPY.pitchDedicatedLineAr,
  'صفحة مستقلة باسم نشاطك، تعرض ما تقدمه وتوجّه زبائنك إليك مباشرة.',
);
assert.equal(
  STORE_LANDING_PITCH_COPY.pitchNotMarketplaceAr,
  'ليست سوقاً مشتركاً، ولا صفحة تجمعك مع أنشطة أخرى.',
);
assert.equal(STORE_LANDING_PITCH_COPY.pitchTransformAr, 'منتجاتنا تنقلك من انتظارهم… إلى جوالاتهم.');
assert.equal(STORE_LANDING_PITCH_COPY.pitchExploreCtaAr, 'اكتشف المنتج المناسب لشغلك');
assert.equal(
  STORE_LANDING_PITCH_COPY.philosophyTitleAr,
  'ليس كل حضور رقمي يقود العميل إلى نشاطك',
);
assert.equal(
  STORE_LANDING_PITCH_COPY.philosophyClosingAr,
  'منتج مخصص لطبيعة نشاطك، وصفحة زبائن مخصصة لك.',
);
assert.match(STORE_LANDING_PITCH_COPY.dedicatedPageDefinitionAr, /ليست متجراً مشتركاً/);
assert.match(STORE_LANDING_PITCH_COPY.neighborGuestDefinitionAr, /جار الحي/);
assert.match(STORE_LANDING_PITCH_COPY.neighborGuestDefinitionAr, /ليس سوقاً مشتركاً/);

const heroOrder = [
  'shopNameAr',
  'pitchH1Ar',
  'pitchDedicatedLineAr',
  'pitchNotMarketplaceAr',
  'pitchTransformAr',
  'pitchExploreCtaAr',
];
let lastIndex = -1;
for (const key of heroOrder) {
  const idx = hero.indexOf(key);
  assert.ok(idx > lastIndex, `ترتيب ${key} في الهيرو`);
  lastIndex = idx;
}

assert.match(hero, /store-pitch-trust/);
assert.match(hero, /PanelTop/);
assert.match(hero, /min-h-11/);
assert.doesNotMatch(hero, /pitchFlowAr|StoreDedicatedPageCallout/);

assert.match(philosophy, /philosophyTitleAr/);
assert.match(philosophy, /philosophyBodyAr/);
assert.match(philosophy, /philosophyClosingAr/);
assert.doesNotMatch(philosophy, /pitchH1Ar/);

assert.match(preview, /noindex, nofollow/);
assert.match(preview, /StoreLandingPhilosophySection/);
assert.match(preview, /preview-definitions/);
assert.match(preview, /neighborGuestDefinitionAr/);
assert.match(preview, /store-browse-neighborhood/);

assert.match(landing, /StoreLandingPitchHero/);
assert.match(landing, /StoreLandingPhilosophySection/);

console.log('test-store-landing-pitch-preview: ok');
