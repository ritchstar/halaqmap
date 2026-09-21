/**
 * تحقق من إصلاح canonical/og:url الديناميكي — كانت كل صفحات المنصة (SPA
 * كاملة عبر HashRouter) تُخدَّم بنفس index.html الثابت: نفس
 * <link rel="canonical" href="https://www.halaqmap.com/"> لكل مسار ونطاق،
 * بما فيها صفحات store.halaqmap.com كلياً. هذا الإشارة الخاطئة (كل صفحة
 * "نسخة مكرّرة" من جذر نطاق آخر) هي الأرجح كسبب لتعثّر فهرسة صفحات المتجر
 * الظاهرة في Search Console بتاريخ ٢٠٢٦-٠٩-٢١.
 *
 * تشغيل: npx tsx scripts/test-seo-canonical-sync.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { currentSelfOrigin, normalizeCanonicalPath } from '../src/lib/seoHead.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// ١) normalizeCanonicalPath — دالة نقية، بلا DOM.
assert.equal(normalizeCanonicalPath('/'), '/', 'الجذر يبقى / بلا تعديل');
assert.equal(normalizeCanonicalPath(''), '/', 'مسار فارغ يُعامَل كالجذر');
assert.equal(normalizeCanonicalPath('/store'), '/store');
assert.equal(normalizeCanonicalPath('/store/'), '/store', 'يزيل الشرطة المائلة الزائدة');
assert.equal(normalizeCanonicalPath('/store/kitchen/read'), '/store/kitchen/read');
assert.equal(normalizeCanonicalPath('/store/kitchen/read/'), '/store/kitchen/read');

// ٢) currentSelfOrigin — ذاتي المرجعية للنطاق الفعلي، لا يتحوّل store.halaqmap.com
//    أبداً، والاستثناء الوحيد هو توحيد apex الجذري (بلا www) إلى www.
const originalWindow = (globalThis as { window?: unknown }).window;
function withWindowOrigin(origin: string, run: () => void) {
  (globalThis as { window?: unknown }).window = { location: { origin } };
  try {
    run();
  } finally {
    (globalThis as { window?: unknown }).window = originalWindow;
  }
}

withWindowOrigin('https://store.halaqmap.com', () => {
  assert.equal(
    currentSelfOrigin(),
    'https://store.halaqmap.com',
    'صفحات المتجر يجب أن تبقى canonical على نطاقها الخاص — لا تتحوّل لـ www.halaqmap.com',
  );
});

withWindowOrigin('https://www.halaqmap.com', () => {
  assert.equal(currentSelfOrigin(), 'https://www.halaqmap.com');
});

withWindowOrigin('https://halaqmap.com', () => {
  assert.equal(
    currentSelfOrigin(),
    'https://www.halaqmap.com',
    'apex الجذري (بلا www) فقط يُوحَّد إلى www — نفس الموقع فعلياً',
  );
});

// ٣) SeoRouteSync مُركَّب فعلياً داخل HashRouter في App.tsx، بجانب
//    AnalyticsRouteTracker — وإلا فالإصلاح موجود بالكود لكن غير مُفعَّل عملياً.
const appSource = readFileSync(join(root, 'src/App.tsx'), 'utf8');
assert.match(appSource, /import \{ SeoRouteSync \} from ["']@\/components\/SeoRouteSync["']/);
assert.match(appSource, /<AnalyticsRouteTracker \/>\s*\n\s*<SeoRouteSync \/>/, 'يجب تركيب SeoRouteSync داخل شجرة HashRouter فعلياً');

// ٤) صفحات القراءة (١٠ من الـ١٩ في sitemap-store.xml) تستخدم الوصف الفعلي
//    بدل العام — أعلى قيمة فورية لأنها بالضبط الصفحات التي ظهرت "لم تُفهرس
//    بعد" في تقرير Search Console.
const readPageSource = readFileSync(join(root, 'src/pages/store/StoreProductReadPage.tsx'), 'utf8');
assert.match(readPageSource, /useMetaDescription\(entry\?\.metaDescriptionAr\)/);

console.log('✅ إصلاح مزامنة canonical/og:url ديناميكياً موجود ومُفعَّل — كل الفحوصات نجحت.');
