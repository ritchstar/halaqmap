/**
 * فحص سياسة مكتب المؤسس — طول الرسالة ومعرّف الزائر.
 * تشغيل: npx tsx scripts/test-founder-desk-chat.mts
 */
import {
  isValidFounderDeskGuestId,
  sanitizeFounderDeskBody,
  FOUNDER_DESK_MAX_BODY,
} from '../api/_lib/founderDeskChat.ts';

let failed = 0;

function assertEq(label: string, got: unknown, want: unknown) {
  if (got !== want) {
    failed += 1;
    console.error(`FAIL ${label}: got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
  }
}

assertEq('uuid_ok', isValidFounderDeskGuestId('550e8400-e29b-41d4-a716-446655440000'), true);
assertEq('uuid_bad', isValidFounderDeskGuestId('not-a-uuid'), false);
assertEq('trim', sanitizeFounderDeskBody('  مرحبا  '), 'مرحبا');
assertEq('empty', sanitizeFounderDeskBody('   '), '');
assertEq('null_byte', sanitizeFounderDeskBody('أهلا\u0000بك'), 'أهلابك');
assertEq('max', sanitizeFounderDeskBody('س'.repeat(FOUNDER_DESK_MAX_BODY + 20)).length, FOUNDER_DESK_MAX_BODY);

if (failed) {
  console.error(`founder-desk-chat: ${failed} failed`);
  process.exit(1);
}
console.log('founder-desk-chat: ok');
