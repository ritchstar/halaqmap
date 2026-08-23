/**
 * فحص نسخة مسوّقات كوافير ماب — مؤنثة، عمولة على الرخصة لا على الخدمة.
 * تشغيل: npx tsx scripts/test-coiffeur-ambassador-copy.mts
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  COIFFEUR_AMBASSADOR_COPY,
  COIFFEUR_AMBASSADOR_PROGRAM_NAME_AR,
  COIFFEUR_AMBASSADOR_RULES_SECTIONS,
} from '../src/config/coiffeurAmbassadorCopy.ts';
import { STORE_COMMISSION_COPY, STORE_CONTACT_EMAIL, STORE_CONTACT_X_URL } from '../src/config/storeFront.ts';

let failed = 0;

function assert(label: string, cond: boolean) {
  if (!cond) {
    failed += 1;
    console.error(`FAIL ${label}`);
  }
}

const rulesBlob = COIFFEUR_AMBASSADOR_RULES_SECTIONS.map((section) => `${section.title} ${section.content}`).join(' ');
const blob = `${COIFFEUR_AMBASSADOR_COPY.leadAr} ${COIFFEUR_AMBASSADOR_COPY.coverageLabelAr} ${rulesBlob}`;

assert('program', COIFFEUR_AMBASSADOR_PROGRAM_NAME_AR.includes('كوافير ماب'));
assert('feminine_coverage', COIFFEUR_AMBASSADOR_COPY.coverageLabelAr.includes('تستطيعين'));
assert('no_founder', !blob.includes('المؤسس'));
assert('no_serp', !blob.includes('أقرب حلاق'));
assert('license_not_craft', rulesBlob.includes('ليست عمولة على خدمة التجميل'));
assert('store_pair_halaq', STORE_COMMISSION_COPY.halaqHref.includes('/ambassadors'));
assert('store_pair_coiffeur', STORE_COMMISSION_COPY.coiffeurHref.includes('/coiffeur/ambassadors'));
assert('store_pair_store', STORE_COMMISSION_COPY.storeHref.includes('/store/affiliates'));
assert('store_pair_no_lane', !STORE_COMMISSION_COPY.storeHref.includes('lane=store'));
assert('store_email', STORE_CONTACT_EMAIL.includes('@halaqmap.com'));
assert('store_x', STORE_CONTACT_X_URL === 'https://x.com/halaqmap');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
assert('lazy_enter', app.includes('@/pages/coiffeur/CoiffeurAmbassadorEnter'));
assert('no_static_copy', !/from ['"]@\/config\/coiffeurAmbassadorCopy['"]/.test(app));

if (failed) {
  console.error(`coiffeur-ambassador-copy: ${failed} failed`);
  process.exit(1);
}
console.log('coiffeur-ambassador-copy: ok');
