/**
 * خلل حقيقي مؤكَّد بفحص مباشر عبر متصفح الجوال: `LocationStatusBar` (شريط
 * «المدينة + الوقت الحي» الذي يظهر أعلى يسار الشاشة بعد نجاح تحديد الموقع)
 * عنصر `position: fixed` بلا أي إخفاء تلقائي — يبقى ملتصقاً بنفس نقطة
 * الشاشة طوال الجلسة إلى أن يضغط الزائر ✕ يدوياً. لأنه fixed، أي محتوى
 * يُمرَّر إلى نفس النطاق الرأسي (أعلى يسار الشاشة) يظهر تحته وقد يُحجَب
 * جزئياً — مؤكَّد حياً: تراكبه فوق عنوان بطاقة نتيجة بحث حقيقية (صالون)
 * أثناء تمرير الصفحة، فبدا نص العنوان محجوباً/"جانحاً". بما أن الشريط fixed
 * لا يتحرك مع الصفحة، هذا يؤثر على *أي* بطاقة نتيجة تمرّ تحت نفس النطاق —
 * لا بطاقة واحدة بعينها.
 *
 * الإصلاح: إخفاء تلقائي (`setDismissed(true)`) بمجرد تجاوز الزائر مسافة
 * تمرير صغيرة (`SCROLL_DISMISS_PX`) — أي فور مغادرته أعلى الصفحة نحو نتائج
 * البحث — بإضافة مستمع `scroll` سلبي (`passive: true`) يُنظَّف عند إزالة
 * المكوّن. زر ✕ اليدوي يبقى كما هو دون تغيير.
 *
 * تشغيل: npx tsx scripts/test-location-status-bar-auto-dismiss-2026-09-22.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'src/components/LocationStatusBar.tsx'), 'utf8');

// ── ١) ثابت مسافة التمرير معرَّف ─────────────────────────────────────────
assert.match(
  src,
  /const SCROLL_DISMISS_PX = \d+;/,
  'يجب تعريف ثابت SCROLL_DISMISS_PX لمسافة التمرير قبل الإخفاء التلقائي',
);

// ── ٢) مستمع scroll مُسجَّل بشكل سلبي (passive) ومُنظَّف عند الإزالة ──────
assert.match(
  src,
  /window\.addEventListener\('scroll',\s*onScroll,\s*\{\s*passive:\s*true\s*\}\)/,
  'يجب تسجيل مستمع scroll سلبي (passive: true) لتفادي أي تأثير على أداء التمرير',
);
assert.match(
  src,
  /return \(\) => window\.removeEventListener\('scroll', onScroll\);/,
  'يجب إزالة مستمع scroll عند تفكيك المكوّن لمنع تسرّب الذاكرة',
);

// ── ٣) الإخفاء الفعلي يحدث فور تجاوز عتبة SCROLL_DISMISS_PX ─────────────
assert.match(
  src,
  /if \(window\.scrollY > SCROLL_DISMISS_PX\) setDismissed\(true\);/,
  'يجب استدعاء setDismissed(true) فور تجاوز الزائر عتبة التمرير',
);

// ── ٤) زر الإخفاء اليدوي (✕) باقٍ دون تغيير ─────────────────────────────
assert.match(
  src,
  /onClick=\{\(e\) => \{ e\.stopPropagation\(\); setDismissed\(true\); \}\}/,
  'زر الإخفاء اليدوي (✕) يجب أن يبقى يعمل كما كان دون تغيير',
);

// ── ٥) الشريط لا يزال لا يُعرَض أصلاً بلا إحداثيات (سلوك أصلي محفوظ) ─────
assert.match(src, /if \(!lat \|\| !lng\) return null;/, 'يجب أن يبقى الشرط الأصلي: لا عرض بلا إحداثيات صالحة');

console.log('✅ الإخفاء التلقائي لشريط الموقع عند التمرير موثَّق ومُتحقَّق منه بالكامل.');
