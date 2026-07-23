/**
 * فحص جنائي سباعي — تطبيع أرقام واتساب البنر.
 * تشغيل: npx tsx scripts/test-saudi-whatsapp-phone.mts
 */
import {
  buildWhatsAppChatHref,
  normalizeSaudiMobileForWa,
} from '../src/lib/saudiWhatsAppPhone.ts';

type Case = { name: string; input: string; expect: string | null; href?: string | null };

const CASES: Case[] = [
  // 1) صيغة محلية 05 — السبب الجذري لرفض واتساب
  { name: 'local_05', input: '0563523629', expect: '966563523629', href: 'https://wa.me/966563523629' },
  // 2) E.164 مع +
  { name: 'e164_plus', input: '+966558357131', expect: '966558357131', href: 'https://wa.me/966558357131' },
  // 3) بدون +
  { name: 'cc_digits', input: '966540405631', expect: '966540405631' },
  // 4) بدون صفر وطني
  { name: 'national_5', input: '558357131', expect: '966558357131' },
  // 5) 00 دولي
  { name: 'intl_00', input: '00966558357131', expect: '966558357131' },
  // 6) صفر زائد بعد 966 (فساد تخزين)
  { name: 'extra_zero_after_cc', input: '+9660558357131', expect: '966558357131' },
  // 7) أرقام عربية-هندية
  { name: 'arabic_indic', input: '٠٥٦٣٥٢٣٦٢٩', expect: '966563523629' },
];

const NEGATIVE: Case[] = [
  { name: 'empty', input: '', expect: null },
  { name: 'too_short', input: '05512', expect: null },
  { name: 'landline_ish', input: '0112345678', expect: null },
];

let failed = 0;

function assertEq(label: string, got: unknown, want: unknown) {
  if (got !== want) {
    failed += 1;
    console.error(`FAIL ${label}: got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
  } else {
    console.log(`OK   ${label}`);
  }
}

for (const c of CASES) {
  assertEq(`${c.name}.normalize`, normalizeSaudiMobileForWa(c.input), c.expect);
  if (c.href !== undefined) {
    assertEq(`${c.name}.href`, buildWhatsAppChatHref(c.input), c.href);
  } else if (c.expect) {
    assertEq(`${c.name}.href`, buildWhatsAppChatHref(c.input), `https://wa.me/${c.expect}`);
  }
}

for (const c of NEGATIVE) {
  assertEq(`${c.name}.normalize`, normalizeSaudiMobileForWa(c.input), c.expect);
  assertEq(`${c.name}.href`, buildWhatsAppChatHref(c.input), null);
}

// مسار البنر: يجب ألا يمرّر 05 كما هو
const legacyBug = 'https://wa.me/0563523629';
const fixed = buildWhatsAppChatHref('0563523629');
assertEq('banner_never_local_05_in_url', fixed?.includes('/05') ?? false, false);
assertEq('banner_not_legacy_bug', fixed === legacyBug, false);

if (failed > 0) {
  console.error(`\nForensic WA phone: ${failed} failure(s)`);
  process.exit(1);
}
console.log('\nForensic WA phone: all paths green (7+ negatives).');
