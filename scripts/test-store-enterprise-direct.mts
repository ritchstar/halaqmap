/**
 * فحص جملة التعامل المباشر عبر بريد الإدارة على نماذج المتجر عدا كاردي8.
 * تشغيل: npx tsx scripts/test-store-enterprise-direct.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_ENTERPRISE_DIRECT } from '../src/config/storeEnterpriseDirect.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const forms = {
  wedding: readFileSync(join(root, 'src/components/store/StoreWeddingOrderForm.tsx'), 'utf8'),
  event: readFileSync(join(root, 'src/components/store/StoreEventOrderForm.tsx'), 'utf8'),
  lounge: readFileSync(join(root, 'src/components/store/StoreLoungeOrderForm.tsx'), 'utf8'),
  grocers: readFileSync(join(root, 'src/components/store/StoreGrocersOrderForm.tsx'), 'utf8'),
  restaurant: readFileSync(join(root, 'src/components/store/StoreRestaurantOrderForm.tsx'), 'utf8'),
};
const occasionStudio = readFileSync(join(root, 'src/pages/store/StorePaidInviteStudioPage.tsx'), 'utf8');
const occasionPay = readFileSync(join(root, 'src/pages/store/StorePaidInvitePayPage.tsx'), 'utf8');
const occasionLab = readFileSync(join(root, 'src/pages/store/StoreOccasionCardLabPage.tsx'), 'utf8');

assert.match(STORE_ENTERPRISE_DIRECT.lineAr, /للمنشآت الراغبة في التعامل المباشر/);
assert.match(STORE_ENTERPRISE_DIRECT.lineAr, /بريد الإدارة/);
assert.equal(STORE_ENTERPRISE_DIRECT.email, 'admin@halaqmap.com');
assert.doesNotMatch(STORE_ENTERPRISE_DIRECT.lineAr, /كاردي8|افراحي1|اجواء1|لاونجا1|تمويناتا1|مطعمنا1/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeEnterpriseDirect['"]/);
assert.doesNotMatch(app, /from ['"]@\/components\/store\/StoreEnterpriseDirectMail['"]/);

for (const [name, source] of Object.entries(forms)) {
  assert.match(source, /<StoreEnterpriseDirectMail/, name);
}

assert.doesNotMatch(occasionStudio, /StoreEnterpriseDirectMail/);
assert.doesNotMatch(occasionPay, /StoreEnterpriseDirectMail/);
assert.doesNotMatch(occasionLab, /StoreEnterpriseDirectMail/);
assert.doesNotMatch(occasionStudio, /storeEnterpriseDirect/);

console.log('store-enterprise-direct ok');
