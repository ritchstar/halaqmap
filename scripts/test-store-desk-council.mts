/**
 * فحص اجتماع وكلاء مكتب طلبات المتجر.
 * تشغيل: npx tsx scripts/test-store-desk-council.mts
 */
import {
  STORE_DESK_AGENTS,
  buildStoreDeskCouncilPrompt,
  extractLuxuryReplyDraft,
} from '../api/_lib/storeDeskCouncil.ts';

let failed = 0;

function assert(label: string, cond: boolean) {
  if (!cond) {
    failed += 1;
    console.error(`FAIL ${label}`);
  }
}

function assertEq(label: string, got: unknown, want: unknown) {
  if (got !== want) {
    failed += 1;
    console.error(`FAIL ${label}: got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
  }
}

assertEq('agents_count', STORE_DESK_AGENTS.length, 4);

const prompt = buildStoreDeskCouncilPrompt({
  applicantName: 'سالم',
  entityName: 'مؤسسة النور',
  freelanceWorkDoc: '',
  email: 'salem@example.com',
  phone: '0500000000',
  whatsapp: '0500000000',
  requestBody: 'نحتاج منصة استعلام للصالون مع تطبيق خاص.',
  source: 'store',
});

for (const agent of STORE_DESK_AGENTS) {
  assert(`agent_${agent.id}`, prompt.includes(agent.titleAr));
}

assert('public_admin_word', prompt.includes('الإدارة'));
assert('no_founder_in_client', prompt.includes('ولا تقل المؤسس'));
assert('hypotheses', prompt.includes('الفرضية الأولى'));
assert('draft_marker', prompt.includes('مسودة الرد للعميل'));
assert('isic', prompt.includes('ISIC4 474151'));
assert('no_second_entity', prompt.includes('لا تخترع كياناً قانونياً ثانياً'));
assert('coiffeur_marketing_page', prompt.includes('خطط الظهور'));
assert('no_rank_in_client', prompt.includes('دون ذكر ترتيب صفحات البحث'));
assert('three_doors', prompt.includes('ثلاثة أبواب فقط'));
assert('no_any_system', prompt.includes('لا يعد بتصميم أي نظام'));
assert('no_booking_on_behalf', prompt.includes('لا تعد بحجز أو تسعير أو تحصيل أجرة الخدمة'));

assertEq(
  'extract_colon',
  extractLuxuryReplyDraft('اجتماع المكتب\nمسودة الرد للعميل: أهلاً بك في المتجر.'),
  'أهلاً بك في المتجر.',
);
assertEq(
  'extract_missing',
  extractLuxuryReplyDraft('لا مسودة هنا'),
  '',
);
assertEq(
  'extract_empty',
  extractLuxuryReplyDraft(''),
  '',
);

if (failed) {
  console.error(`store-desk-council: ${failed} failed`);
  process.exit(1);
}
console.log('store-desk-council: ok');
