/**
 * فحص صفحة تصنيفات المتجر — تقييم تشفير قابل للتحقق، بلا ترتيب بحث.
 * تشغيل: npx tsx scripts/test-store-trust-copy.mts
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_TRUST_COPY } from '../src/config/storeFront.ts';
import { PLATFORM_TLS_SSL_LABS_GRADE, PLATFORM_TLS_SSL_LABS_REPORT_DATE_AR } from '../src/config/platformTlsTrust.ts';

let failed = 0;

function assert(label: string, cond: boolean) {
  if (!cond) {
    failed += 1;
    console.error(`FAIL ${label}`);
  }
}

const blob = `${STORE_TRUST_COPY.leadAr} ${STORE_TRUST_COPY.sslBodyAr} ${STORE_TRUST_COPY.disclaimerAr}`;
assert('title', STORE_TRUST_COPY.titleAr === 'التصنيفات والتحقق');
assert('verify', blob.includes('تأكد بنفسك'));
assert('no_serp_query', !blob.includes('أقرب حلاق'));
assert('no_first_page', !blob.includes('الصفحة الأولى'));
assert('no_founder', !blob.includes('المؤسس'));
assert('grade', PLATFORM_TLS_SSL_LABS_GRADE === 'A+');
assert('date', PLATFORM_TLS_SSL_LABS_REPORT_DATE_AR.includes('أغسطس 2026'));

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
assert(
  'image_on_disk',
  readFileSync(join(root, 'public', STORE_TRUST_COPY.sslImage.replace(/^\//, ''))).length > 1000,
);

const landing = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');
assert('landing_strip', landing.includes('STORE_LANDING_COPY.trustStripTitleAr'));
assert('landing_trust_route', landing.includes('ROUTE_PATHS.STORE_TRUST'));

if (failed) {
  console.error(`store-trust-copy: ${failed} failed`);
  process.exit(1);
}
console.log('store-trust-copy: ok');
