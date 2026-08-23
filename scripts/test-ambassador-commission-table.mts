/**
 * فحص جدول عمولات المسوّقين والمسوّقات — باقة فقط، بلا عمولة على الإضافة.
 * تشغيل: npx tsx scripts/test-ambassador-commission-table.mts
 */
import assert from 'node:assert/strict';
import {
  AMBASSADOR_COMMISSION_TABLE,
  AMBASSADOR_RULES_VERSION,
  formatAmbassadorCommissionTableAr,
} from '../src/config/ambassadorFieldRulesPolicy.ts';
import { COIFFEUR_AMBASSADOR_RULES_SECTIONS, COIFFEUR_AMBASSADOR_RULES_VERSION } from '../src/config/coiffeurAmbassadorCopy.ts';
import { STORE_AFFILIATE_LINES } from '../src/config/storeAffiliateLive.ts';

assert.equal(AMBASSADOR_RULES_VERSION, '2026-08-23');
assert.equal(COIFFEUR_AMBASSADOR_RULES_VERSION, AMBASSADOR_RULES_VERSION);

const bronze = AMBASSADOR_COMMISSION_TABLE.find((row) => row.packageKey === 'bronze');
const gold = AMBASSADOR_COMMISSION_TABLE.find((row) => row.packageKey === 'gold');
const diamond = AMBASSADOR_COMMISSION_TABLE.find((row) => row.packageKey === 'diamond');
const office = AMBASSADOR_COMMISSION_TABLE.find((row) => row.packageKey === 'diamond_office');

assert.ok(bronze && gold && diamond && office);
assert.equal(bronze.monthlySar, 200);
assert.deepEqual(bronze.commissionByMonths, { 1: 100, 3: 300, 6: 600, 12: 1200 });
assert.equal(gold.monthlySar, 300);
assert.deepEqual(gold.commissionByMonths, { 1: 150, 3: 450, 6: 800, 12: 1600 });
assert.equal(diamond.monthlySar, 400);
assert.deepEqual(diamond.commissionByMonths, { 1: 200, 3: 400, 6: 800, 12: 1600 });
assert.equal(office.monthlySar, 450);
assert.deepEqual(office.commissionByMonths, diamond.commissionByMonths);

assert.equal(bronze.commissionByMonths[1], 100);
assert.equal(gold.commissionByMonths[6], 800);
assert.equal(diamond.commissionByMonths[3], 400);
assert.equal(office.commissionByMonths[12], 1600);

const tableAr = formatAmbassadorCommissionTableAr();
assert.match(tableAr, /لا عمولة على إضافة المناوب أو المكتب الخاص/);
assert.match(tableAr, /عمولة \*\*100\*\*/);

const coiffeurRules = COIFFEUR_AMBASSADOR_RULES_SECTIONS.map((section) => section.content).join('\n');
assert.match(coiffeurRules, /لا عمولة على إضافة المناوب أو المكتب الخاص/);
assert.match(coiffeurRules, /شهر \/ 3 \/ 6 \/ 12/);

assert.deepEqual(
  STORE_AFFILIATE_LINES.map((line) => [line.id, line.priceSar, line.commissionSar]),
  [
    ['wedding', 899, 99],
    ['event', 899, 99],
    ['lounge', 600, 100],
    ['grocers_6', 599, 99],
    ['grocers_12', 899, 199],
    ['grocers_chat_6', 299, 98],
    ['grocers_chat_12', 499, 199],
  ],
);

console.log('ambassador-commission-table: ok');
