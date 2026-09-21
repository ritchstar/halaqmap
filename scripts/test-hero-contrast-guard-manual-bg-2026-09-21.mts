/**
 * خلل حقيقي مؤكَّد بفحص مباشر على www.halaqmap.com عبر متصفح الجوال بعد نشر
 * خلفية الهيرو المصوَّرة (باتش 0044): `StoreTextContrastGuard` كان يصحّح نص
 * عنوان الهيرو الأبيض المتعمَّد (`text-white` صريح في الكود) إلى حبر داكن
 * `#2e2418` رغماً عنه — النص يظهر شبه مختفٍ فوق صورة الصالون الداكنة.
 *
 * السبب الجذري: خلفية الهيرو المصوَّرة الفعلية طبقات `<div>` شقيقة
 * `absolute inset-0 z-0` — لا خلفية CSS حقيقية (`background-color` أو
 * `background-image`) على `<section>` الهيرو أو أي أب حقيقي في سلسلة DOM
 * لعنصر النص. `resolveEffectiveBackground` يتسلّق فقط آباء DOM الحقيقيين
 * فيتخطّى طبقة الصورة كلياً ويصل مباشرة لخلفية الصفحة البيج الحقيقية خلفها
 * (`bg-[#eee2ce]`)، فيُخطئ الحارسان (النص والأزرار) بحساب خلفية فعّالة فاتحة
 * ويصححان النص الفاتح المتعمَّد إلى داكن — عكس المطلوب تماماً.
 *
 * مؤكَّد حياً (قبل هذا الإصلاح): `h1` عنوان الهيرو
 * `style="color: rgb(46, 36, 24) !important;"` +
 * `data-text-contrast-guard-fixed="1"` رغم `text-white` في الكود، ونفس
 * الشيء لشارة «مجاني · بلا تسجيل» وامتداد العنوان الزمردي.
 *
 * الإصلاح: سمة انسحاب صريحة `data-contrast-guard-manual-bg` (مُصدَّرة من
 * colorContrast.ts مع `isWithinManualContrastZone`) توضع على حاوية تُقرّ
 * فيها كل ألوان النصوص/الأزرار داخلها بأنها رُوجعت يدوياً وتباينها مضمون
 * فوق خلفيتها الحقيقية المرئية (هنا: صورة الهيرو + التعتيم) — فلا يلمسها أي
 * من الحارسين. طُبِّقت على `<section>` الهيرو في LandingPreview.tsx.
 *
 * تشغيل: npx tsx scripts/test-hero-contrast-guard-manual-bg-2026-09-21.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isWithinManualContrastZone } from '../src/lib/colorContrast.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = (rel: string) => join(root, rel);

// ── ١) isWithinManualContrastZone: يجب أن تتسلّق آباء DOM الحقيقيين (لا
//    تُحاكي البحث عن طبقات شقيقة) وتكتشف السمة على أي مستوى أعلى ─────────
type FakeNode = {
  parentElement: FakeNode | null;
  getAttribute: (name: string) => string | null;
  closest: (sel: string) => FakeNode | null;
};

function makeNode(attrs: Record<string, string>, parent: FakeNode | null): FakeNode {
  const node: FakeNode = {
    parentElement: parent,
    getAttribute: (name: string) => attrs[name] ?? null,
    closest: (sel: string) => {
      // نفس دلالة Element.closest الحقيقية: العنصر نفسه أو أقرب أب مطابق.
      const attrName = sel.replace(/^\[|\]$/g, '');
      let n: FakeNode | null = node;
      while (n) {
        if (n.getAttribute(attrName) !== null) return n;
        n = n.parentElement;
      }
      return null;
    },
  };
  return node;
}

const pageRoot = makeNode({}, null);
const heroSection = makeNode({ 'data-contrast-guard-manual-bg': 'true' }, pageRoot);
const heroInner = makeNode({}, heroSection);
const h1 = makeNode({}, heroInner);

assert.equal(
  isWithinManualContrastZone(h1 as unknown as Element),
  true,
  'عنصر نص متداخل داخل حاوية data-contrast-guard-manual-bg يجب أن يُعتبر ضمن منطقة الانسحاب اليدوي',
);

const outsideSection = makeNode({}, pageRoot);
const outsideText = makeNode({}, outsideSection);
assert.equal(
  isWithinManualContrastZone(outsideText as unknown as Element),
  false,
  'عنصر نص خارج أي حاوية data-contrast-guard-manual-bg يجب ألا يُعتبر ضمن منطقة الانسحاب',
);

// ── ٢) كلا الحارسين يتحققان من isWithinManualContrastZone قبل أي تصحيح ──
const textGuardSrc = readFileSync(p('src/components/store/StoreTextContrastGuard.tsx'), 'utf8');
assert.match(
  textGuardSrc,
  /import\s*\{[^}]*isWithinManualContrastZone[^}]*\}\s*from\s*'@\/lib\/colorContrast'/,
  'StoreTextContrastGuard يجب أن يستورد isWithinManualContrastZone',
);
assert.match(
  textGuardSrc,
  /if\s*\(isWithinManualContrastZone\(el\)\)\s*return;/,
  'StoreTextContrastGuard يجب أن يتخطّى العنصر مبكراً إن كان ضمن منطقة الانسحاب اليدوي',
);

const buttonGuardSrc = readFileSync(p('src/components/store/StoreButtonContrastGuard.tsx'), 'utf8');
assert.match(
  buttonGuardSrc,
  /import\s*\{[^}]*isWithinManualContrastZone[^}]*\}\s*from\s*'@\/lib\/colorContrast'/,
  'StoreButtonContrastGuard يجب أن يستورد isWithinManualContrastZone',
);
assert.match(
  buttonGuardSrc,
  /if\s*\(isWithinManualContrastZone\(el\)\)\s*return;/,
  'StoreButtonContrastGuard يجب أن يتخطّى العنصر مبكراً إن كان ضمن منطقة الانسحاب اليدوي',
);

// ── ٣) قسم الهيرو في LandingPreview.tsx يحمل السمة فعلياً على <section> ──
const landingSrc = readFileSync(p('src/pages/LandingPreview.tsx'), 'utf8');
const heroSectionMatch = landingSrc.match(/\{\/\* ── Hero section[\s\S]*?\n {6}<\/section>/);
assert.ok(heroSectionMatch, 'يجب إيجاد كتلة قسم الهيرو كاملة لفحصها');
const heroBlock = heroSectionMatch![0];
assert.match(
  heroBlock,
  /<section\s+data-contrast-guard-manual-bg="true"/,
  '<section> الهيرو يجب أن يحمل data-contrast-guard-manual-bg="true"',
);

console.log('✅ إصلاح تعارض حارس التباين مع خلفية الهيرو المصوَّرة موثَّق ومُتحقَّق منه بالكامل.');
