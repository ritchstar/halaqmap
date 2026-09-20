/**
 * اسم لاتيني مختصر لتطبيق لوحة مشغّلي خريطة الحل: HMOps.
 * يتحقق أن الثابت موجود ومتّسق عبر غلافي iOS/Android والـ PWA، بلا مساس
 * بالاسم العربي الكامل الظاهر في متاجر التطبيقات وداخل الواجهة.
 *
 * تشغيل: npx tsx scripts/test-operators-app-name-latin.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  OPERATORS_APP_DISPLAY_NAME_AR,
  OPERATORS_APP_NAME_LATIN,
} from '../src/config/operatorsAppShell.ts';
import { STORE_OPERATORS_APP_NAME_LATIN } from '../src/config/storeOperatorsAppShell.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

assert.equal(OPERATORS_APP_NAME_LATIN, 'HMOps');
assert.equal(STORE_OPERATORS_APP_NAME_LATIN, 'HMOps');
// الاسم العربي الكامل يبقى كما هو — لم يُمسّ بهذا التعديل.
assert.equal(OPERATORS_APP_DISPLAY_NAME_AR, 'لوحة مشغّلي منصة خريطة الحل');

const capacitorConfig = readFileSync(join(root, 'operators-app/capacitor.config.ts'), 'utf8');
assert.match(capacitorConfig, /appName:\s*OPERATORS_APP_NAME_LATIN/);
assert.doesNotMatch(capacitorConfig, /appName:\s*OPERATORS_APP_DISPLAY_NAME_AR/);
assert.match(capacitorConfig, /appId:\s*OPERATORS_APP_PACKAGE_ID/);

const infoPlist = readFileSync(join(root, 'operators-app/ios/App/App/Info.plist'), 'utf8');
assert.match(infoPlist, /<key>CFBundleDisplayName<\/key>\s*<string>HMOps<\/string>/);

const webManifest = JSON.parse(readFileSync(join(root, 'public/manifest-operators.json'), 'utf8'));
assert.equal(webManifest.short_name, 'HMOps');
// الاسم الطويل العربي الكامل يبقى دون تغيير في حقل name.
assert.equal(webManifest.name, 'لوحة مشغّلي خريطة الحل');

const twaManifest = JSON.parse(readFileSync(join(root, 'android-operators-twa/twa-manifest.json'), 'utf8'));
assert.equal(twaManifest.launcherName, 'HMOps');
assert.equal(twaManifest.name, 'لوحة مشغّلي خريطة الحل');

// اختصارات القائمة (shortcuts) داخل الويب مانيفست لم تتأثر — ليست اسم التطبيق نفسه.
assert.equal(webManifest.shortcuts[0].short_name, 'الدخول');

console.log('operators-app-name-latin: ok');
