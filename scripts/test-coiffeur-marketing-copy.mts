/**
 * فحص نصوص تسويق كوافير ماب — بلا عبارات داخلية.
 * تشغيل: npx tsx scripts/test-coiffeur-marketing-copy.mts
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  COIFFEUR_MARKETING_PAGE,
  COIFFEUR_MARKETING_PILLARS,
  COIFFEUR_MARKETING_PROOF_IMAGE,
} from '../src/config/coiffeurMarketingCopy.ts';

let failed = 0;

function assert(label: string, cond: boolean) {
  if (!cond) {
    failed += 1;
    console.error(`FAIL ${label}`);
  }
}

const blob = `${COIFFEUR_MARKETING_PAGE.lead} ${COIFFEUR_MARKETING_PAGE.proofLead} ${COIFFEUR_MARKETING_PILLARS.map((p) => `${p.body} ${p.benefit}`).join(' ')}`;

assert('no_internal_product', !blob.includes('منتج تطويري'));
assert('no_page_two', !blob.includes('الصفحة الثانية'));
assert('no_founder', !blob.includes('المؤسس'));
assert('no_nusk', !blob.includes('نسك'));
assert('query', COIFFEUR_MARKETING_PAGE.proofQuery === 'كوافير قريب');
assert('pillars', COIFFEUR_MARKETING_PILLARS.length === 7);
assert('host', COIFFEUR_MARKETING_PAGE.proofHost === 'coiffeur.halaqmap.com');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
assert(
  'image_on_disk',
  readFileSync(join(root, 'public', COIFFEUR_MARKETING_PROOF_IMAGE.replace(/^\//, ''))).length > 1000,
);

if (failed) {
  console.error(`coiffeur-marketing-copy: ${failed} failed`);
  process.exit(1);
}
console.log('coiffeur-marketing-copy: ok');
