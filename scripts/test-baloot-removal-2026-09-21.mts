/**
 * التحقق من حذف ميزة "البلوت" بالكامل من جذر المشروع (طلب المستخدم الصريح:
 * "قم بحذف البلوت نهائياً من الجذر وانه اي شي يتعلق به").
 *
 * يغطي هذا الفحص:
 * ١) عدم وجود أي ملف مصدر متبقٍّ يخص البلوت (ساحة اللعب المجانية أو مدرسة
 *    البلوت المدفوعة) في src/ أو scripts/ أو api/.
 * ٢) عدم وجود أي مسار (Route) أو استيراد (import) للبلوت في App.tsx.
 * ٣) عدم وجود ثوابت مسارات بلوت في routePaths.ts.
 * ٤) إزالة معالجة عودة دفع "مدرسة البلوت" من moyasarPaymentReturn.ts مع
 *    الإبقاء الكامل على معالجة مدرسة الشطرنج (ميزة مستقلة لم تُمَس).
 * ٥) إزالة سكربتي إعادة التوجيه الخاصين بـbaloot_school من index.html مع
 *    الإبقاء الكامل على سكربتي chess_school ومنتجات المتجر الأخرى.
 * ٦) عدم وجود أي إشارة نصية متبقية لكلمة "baloot" في شجرة الكود الحية
 *    (باستثناء تطابق نصي عرضي غير متعلق باللعبة في بيانات جغرافية).
 *
 * تشغيل: npx tsx scripts/test-baloot-removal-2026-09-21.mts
 */
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = (rel: string) => join(root, rel);

// ١) لا ملفات بلوت متبقية.
const removedPaths = [
  'src/components/baloot',
  'src/pages/baloot',
  'src/pages/BalootArenaPage.tsx',
  'src/config/balootArena.ts',
  'src/config/balootSchoolPay.ts',
  'src/lib/balootSessionLab.ts',
  'src/lib/balootSchoolRegisterRemote.ts',
  'src/lib/balootSchoolMoyasar.ts',
  'src/lib/balootSchoolPayRemote.ts',
  'src/lib/balootEngine.ts',
  'src/lib/balootBotAi.ts',
  'scripts/baloot-rules-reference-tests.mts',
  'api/_lib/balootSchoolPayShared.ts',
  'api/_lib/balootSchoolPaymentService.ts',
  'api/_lib/balootSchoolRegistrationService.ts',
  'api/_lib/balootSchoolEmailConfirmToken.ts',
  'api/baloot-school-confirm-email.ts',
  'api/baloot-school-pay.ts',
  'api/baloot-school-register.ts',
  'docs/baloot-rules-v1.md',
  'supabase/migrations/20260919120000_baloot_school_registrations.sql',
  'supabase/migrations/20260919130000_baloot_school_payment.sql',
];
for (const rel of removedPaths) {
  assert.equal(existsSync(p(rel)), false, `يجب ألا يوجد ${rel} بعد حذف البلوت`);
}

// ٢) App.tsx: لا استيراد ولا Route للبلوت، مع بقاء مدرسة الشطرنج سليمة.
const appSrc = readFileSync(p('src/App.tsx'), 'utf8');
assert.doesNotMatch(appSrc, /Baloot/, 'App.tsx يجب ألا يحتوي أي إشارة لمكوّنات البلوت');
assert.match(appSrc, /ROUTE_PATHS\.CHESS_SCHOOL_PAY/, 'مدرسة الشطرنج يجب أن تبقى مسجَّلة كما هي');

// ٣) routePaths.ts: لا ثوابت بلوت، مع بقاء مدرسة الشطرنج سليمة.
const routePathsSrc = readFileSync(p('src/lib/routePaths.ts'), 'utf8');
assert.doesNotMatch(routePathsSrc, /BALOOT/, 'routePaths.ts يجب ألا يحتوي أي ثابت بلوت');
assert.match(routePathsSrc, /CHESS_SCHOOL_PAY: '\/chess\/school\/pay\/:rid'/);

// ٤) moyasarPaymentReturn.ts: إزالة بلوت مع بقاء الشطرنج وبقية المنتجات.
const moyasarSrc = readFileSync(p('src/lib/moyasarPaymentReturn.ts'), 'utf8');
assert.doesNotMatch(moyasarSrc, /[Bb]aloot/, 'moyasarPaymentReturn.ts يجب ألا يحتوي أي إشارة للبلوت');
assert.match(moyasarSrc, /function chessSchoolReturnPath/);
assert.match(moyasarSrc, /chessSchoolReturnPath\(params\)\s*\);/);

// ٥) index.html: إزالة سكربتي بلوت مع بقاء سكربتي الشطرنج وبقية المنتجات.
const indexHtml = readFileSync(p('index.html'), 'utf8');
assert.doesNotMatch(indexHtml, /baloot/, 'index.html يجب ألا يحتوي أي إشارة للبلوت');
assert.match(indexHtml, /chess_school_rid/);
assert.match(indexHtml, /\/chess\/school\/pay\//);

// ٦) لا إشارة نصية متبقية لكلمة baloot في شجرة الكود الحية (src/scripts/api/public)،
//    باستثناء تطابق عرضي غير متعلق باللعبة في بيانات المدن الجغرافية
//    (اسم مدينة يحوي السلسلة الفرعية بالمصادفة) وتعليق تأريخي في تقرير فحص
//    جنائي سابق (لا يشير لكود فعلي).
const grepOut = execSync(
  `grep -rli "baloot" src scripts api public index.html vercel.json 2>/dev/null || true`,
  { cwd: root, encoding: 'utf8' },
);
const hits = grepOut.split('\n').map((l) => l.trim()).filter(Boolean);
const allowedHits = new Set([
  'src/data/saudi-geo/cities_lite.json',
  'scripts/test-forensic-audit-2026-09-21.mts',
  'scripts/test-baloot-removal-2026-09-21.mts',
]);
const unexpectedHits = hits.filter((h) => !allowedHits.has(h));
assert.deepEqual(
  unexpectedHits,
  [],
  `وُجدت إشارات بلوت غير متوقعة: ${unexpectedHits.join(', ')}`,
);

console.log('✅ حذف البلوت من الجذر مكتمل ومُتحقَّق منه بالكامل.');
