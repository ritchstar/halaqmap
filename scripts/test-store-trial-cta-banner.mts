/**
 * إزالة شريط توقيت مدن المملكة (شريط الطقس) نهائياً من كل الصفحات، وإضافة
 * بنر «اطلب تجربتك المجانية الآن» العائم أسفل صفحات المنتجات التي عليها
 * فرصة التجربة العامة (STORE_GENERAL_TRIAL_KEYS في storeProductTrial.ts).
 *
 * تشغيل: npx tsx scripts/test-store-trial-cta-banner.mts
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { storeTrialLandingKeyForPath } from '../src/lib/storeHmTube.ts';
import { STORE_GENERAL_TRIAL_KEYS } from '../src/config/storeProductTrial.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// ── 1) شريط الطقس أُزيل نهائياً: لا ملف، ولا استيراد له في أي مصدر ──
assert.equal(
  existsSync(join(root, 'src/components/KSACityClocksBar.tsx')),
  false,
  'يجب حذف مكوّن KSACityClocksBar نهائياً',
);

function walkSourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    if (name.name === 'node_modules') continue;
    const full = join(dir, name.name);
    if (name.isDirectory()) walkSourceFiles(full, out);
    else if (/\.(ts|tsx)$/.test(name.name)) out.push(full);
  }
  return out;
}

for (const file of walkSourceFiles(join(root, 'src'))) {
  const src = readFileSync(file, 'utf8');
  assert.doesNotMatch(src, /KSACityClocksBar/, `${file} لا يجب أن يشير إلى KSACityClocksBar بعد الآن`);
}

const css = readFileSync(join(root, 'src/index.css'), 'utf8');
assert.doesNotMatch(css, /ksa-clocks/, 'يجب ألا تبقى أي قاعدة CSS خاصة بشريط الطقس المحذوف');

// المكوّنات المشتركة الأخرى التي كانت تستخدم نفس بيانات الطقس (زر الموقع،
// خلفية سماء المتجر …) يجب أن تبقى كما هي — لم تُحذف تبعاً لحذف الشريط.
assert.ok(existsSync(join(root, 'src/config/ksaCitiesGeo.ts')));
assert.ok(existsSync(join(root, 'src/lib/userRegionWeather.ts')));

// ── 2) بنر التجربة المجانية يظهر على كل صفحات STORE_GENERAL_TRIAL_KEYS ──
const rootByKey: Record<string, string> = {
  lounge: '/store/lounge',
  grocers: '/store/grocers',
  restaurant: '/store/restaurant',
  cafe: '/store/cafe',
  kitchen: '/store/kitchen',
  produce: '/store/produce',
  halana: '/store/halana',
  dates: '/store/dates',
  bakhurna: '/store/bakhurna',
};

for (const key of STORE_GENERAL_TRIAL_KEYS) {
  const path = rootByKey[key];
  assert.ok(path, `أضف جذر المسار الخاص بمفتاح التجربة الجديد "${key}" إلى هذا الاختبار وإلى storeTrialLandingKeyForPath`);
  assert.equal(storeTrialLandingKeyForPath(path), key, `يجب أن يُظهر البنر مفتاح "${key}" على ${path}`);
  assert.equal(storeTrialLandingKeyForPath(`${path}/anything`), key);
}

// صفحات الإهداء الفرعية لا تخص التجربة العامة رغم وقوعها تحت جذر منتج مؤهَّل.
assert.equal(storeTrialLandingKeyForPath('/store/kitchen/gift'), null);
assert.equal(storeTrialLandingKeyForPath('/store/bakhurna/gift'), null);

// صفحات ليست ضمن التجربة العامة أصلاً (هدية العرسان بلا تجربة عامة، والرئيسية).
assert.equal(storeTrialLandingKeyForPath('/store/wedding'), null);
assert.equal(storeTrialLandingKeyForPath('/store/event'), null);
assert.equal(storeTrialLandingKeyForPath('/store'), null);
assert.equal(storeTrialLandingKeyForPath('/store/try'), null);

// ── 3) البنر مركّب في نقطة عرض واحدة يشتركها كل مسارات المنتجات ──
const chrome = readFileSync(join(root, 'src/components/store/StoreChrome.tsx'), 'utf8');
assert.match(chrome, /StoreTrialCtaBanner/, 'يجب أن يُركَّب البنر داخل StoreVisitorHeader المشترك');

const banner = readFileSync(join(root, 'src/components/store/StoreTrialCtaBanner.tsx'), 'utf8');
assert.match(banner, /STORE_GENERAL_TRIAL_PUBLIC_ENABLED/);
assert.match(banner, /storeGeneralTrialHref/);
assert.match(banner, /fixed inset-x-0 bottom-0/);
assert.match(banner, /safe-area-inset-bottom/);
assert.match(banner, /#e8c547/);

// نص البنر يحثّ على الاستعجال قبل الإغلاق، وزر التجربة نابض متوهّج.
assert.match(banner, /اطلب تجربتك المجانية الآن قبل الإغلاق/);
assert.match(banner, /store-trial-cta-pulse/, 'يجب أن يحمل زر التجربة كلاس النبض المتوهّج');

const cssForTrialPulse = readFileSync(join(root, 'src/index.css'), 'utf8');
assert.match(cssForTrialPulse, /@keyframes store-trial-cta-glow-pulse/);
assert.match(cssForTrialPulse, /\.store-trial-cta-pulse\s*\{[^}]*animation:\s*store-trial-cta-glow-pulse/);
// يحترم تفضيل تقليل الحركة — لا نفرض النبض على من يطلبون إيقاف الحركة.
assert.match(cssForTrialPulse, /prefers-reduced-motion: reduce\)\s*\{\s*\.store-trial-cta-pulse\s*\{\s*animation:\s*none;/);

// مجموعة التفاعل العائمة (تقييم/مشاركة) ترتفع فوق البنر بدل التداخل معه.
const engage = readFileSync(join(root, 'src/components/store/StoreVisitorEngage.tsx'), 'utf8');
assert.match(engage, /storeTrialLandingKeyForPath/);
assert.match(engage, /showsTrialBanner/);

console.log('store-trial-cta-banner: ok');
