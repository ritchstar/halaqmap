/**
 * فحص سياسة مكتب المؤسس — طول الرسالة ومعرّف الزائر.
 * تشغيل: npx tsx scripts/test-founder-desk-chat.mts
 */
import {
  isValidFounderDeskGuestId,
  sanitizeFounderDeskBody,
  sanitizeFounderDeskOrigin,
  isFounderDeskOriginColumnMissing,
  FOUNDER_DESK_MAX_BODY,
  FOUNDER_DESK_ORIGIN_DEFAULT,
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
assertEq('origin_store', sanitizeFounderDeskOrigin('store'), 'store');
assertEq('origin_store_case', sanitizeFounderDeskOrigin(' STORE '), 'store');
assertEq('origin_default', sanitizeFounderDeskOrigin('partners'), FOUNDER_DESK_ORIGIN_DEFAULT);
assertEq('origin_junk', sanitizeFounderDeskOrigin('admin'), FOUNDER_DESK_ORIGIN_DEFAULT);
assertEq('origin_empty', sanitizeFounderDeskOrigin(''), FOUNDER_DESK_ORIGIN_DEFAULT);
assertEq(
  'origin_col_missing',
  isFounderDeskOriginColumnMissing({
    code: 'PGRST204',
    message: "Could not find the 'origin' column of 'founder_desk_conversations' in the schema cache",
  }),
  true,
);
assertEq(
  'origin_col_unrelated',
  isFounderDeskOriginColumnMissing({ code: '42501', message: 'permission denied' }),
  false,
);

if (failed) {
  console.error(`founder-desk-chat: ${failed} failed`);
  process.exit(1);
}
console.log('founder-desk-chat: ok');
