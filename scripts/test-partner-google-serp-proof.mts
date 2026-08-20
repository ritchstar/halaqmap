/**
 * فحص منجز بحث قوقل لحلاق ماب — بلا أسماء منافسين.
 * تشغيل: npx tsx scripts/test-partner-google-serp-proof.mts
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PARTNER_GOOGLE_SERP_PROOF } from '../src/config/partnerGoogleSerpProof.ts';

let failed = 0;

function assert(label: string, cond: boolean) {
  if (!cond) {
    failed += 1;
    console.error(`FAIL ${label}`);
  }
}

const blob = `${PARTNER_GOOGLE_SERP_PROOF.leadAr} ${PARTNER_GOOGLE_SERP_PROOF.inviteAr} ${PARTNER_GOOGLE_SERP_PROOF.captionAr}`;
assert('query', PARTNER_GOOGLE_SERP_PROOF.queryAr === 'أقرب حلاق');
assert('host', PARTNER_GOOGLE_SERP_PROOF.host === 'www.halaqmap.com');
assert('two_on_first', blob.includes('نتيجتان على الصفحة الأولى'));
assert('two_on_next', blob.includes('نتيجتان على الصفحة التالية'));
assert('verify_now', blob.includes('افتح قوقل الآن'));
assert('no_fresha', !blob.includes('Fresha') && !blob.includes('فريشا'));
assert('no_30deg', !blob.includes('ديقريز') && !blob.includes('30 Degrees'));
assert('no_address_brand', !blob.includes('صالون العنوان'));
assert('no_founder', !blob.includes('المؤسس'));

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
assert(
  'image_on_disk',
  readFileSync(join(root, 'public', PARTNER_GOOGLE_SERP_PROOF.image.replace(/^\//, ''))).length > 1000,
);

const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
assert('app_lazy_marketing', app.includes('@/pages/PartnerMarketingCommitmentsPage'));
assert('app_no_serp_card', !app.includes('PartnerGoogleSerpProofCard') && !app.includes('partnerGoogleSerpProof'));

if (failed) {
  console.error(`partner-google-serp-proof: ${failed} failed`);
  process.exit(1);
}
console.log('partner-google-serp-proof: ok');
