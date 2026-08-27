/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * اسم مرسل البريد = متجر خريطة الحل، ونوع الرسالة داخل المتن.
 * تشغيل: npx tsx scripts/test-resend-store-sender.mts
 */
import {
  isLegacyResendSenderName,
  RESEND_SENDER_DISPLAY_NAME_AR,
  resolveResendFromAddress,
  resolveResendSenderDisplayName,
} from '../api/_lib/resendFrom.ts';
import { buildWeddingLiveLinksHtml } from '../api/_lib/storeMailIconLayout.ts';

let failed = 0;

function assert(label: string, ok: boolean, detail?: string) {
  if (!ok) {
    failed += 1;
    console.error(`FAIL ${label}${detail ? `: ${detail}` : ''}`);
  } else {
    console.log(`OK   ${label}`);
  }
}

assert('sender_is_store', RESEND_SENDER_DISPLAY_NAME_AR === 'halaqmap خريطة الحل');
assert('legacy_ar', isLegacyResendSenderName('حلاق ماب'));
assert('legacy_en', isLegacyResendSenderName('Halaq Map'));
assert('not_legacy_store', isLegacyResendSenderName('halaqmap خريطة الحل') === false);

process.env.RESEND_FROM_NAME = 'حلاق ماب';
process.env.RESEND_FROM_EMAIL = 'noreply@halaqmap.com';
assert(
  'ignores_legacy_env',
  resolveResendSenderDisplayName() === 'halaqmap خريطة الحل',
);
assert(
  'from_header',
  resolveResendFromAddress() === 'halaqmap خريطة الحل <noreply@halaqmap.com>',
);
assert(
  'from_never_halaqmap_product_name',
  !resolveResendFromAddress().startsWith('حلاق ماب '),
);

process.env.RESEND_FROM_NAME = 'مكتب التشغيل';
assert('allows_explicit_override', resolveResendSenderDisplayName() === 'مكتب التشغيل');
delete process.env.RESEND_FROM_NAME;
delete process.env.RESEND_SENDER_NAME;

const html = buildWeddingLiveLinksHtml({
  displayUrl: 'https://store.halaqmap.com/w/demo',
  hostUrl: 'https://store.halaqmap.com/w/demo/host',
  expiresLabel: 'ستون يوماً من أول دخول للرابط',
});

assert('html_has_store_logo', html.includes('halaqmap-store-mark-radar-square-1200x1200.png'));
assert('html_has_brand_ar', html.includes('خريطة الحل'));
assert('html_has_kind_label', html.includes('نوع الرسالة'));
assert('html_has_wedding_kind', html.includes('روابط تشغيل — افراحي1'));
assert('html_not_sender_product', !html.includes('>حلاق ماب<'));
assert('html_footer_store', html.includes('رسالة من متجر خريطة الحل'));

if (failed > 0) {
  console.error(`\nResend store sender: ${failed} failure(s)`);
  process.exit(1);
}
console.log('\nResend store sender: all paths green.');
