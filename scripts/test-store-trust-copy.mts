/**
 * فحص صفحة تصنيفات المتجر — تقييم تشفير قابل للتحقق، بلا ترتيب بحث.
 * تشغيل: npx tsx scripts/test-store-trust-copy.mts
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_HALAQMAP_OPS_BANNER, STORE_TRUST_COPY } from '../src/config/storeFront.ts';
import { PARTNER_ANDROID_PLAY_STORE_URL } from '../src/config/partnerAppShell.ts';
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
assert('newest_after_banner', landing.indexOf('StoreLiveOpsBanner') < landing.indexOf('store-newest-products'));
assert('trust_after_newest', landing.indexOf('store-newest-products') < landing.indexOf('store-trust-scan'));
assert('chat_after_trust', landing.indexOf('store-trust-scan') < landing.indexOf('store-admin-chat'));
assert('ops_cta_partner_app', STORE_HALAQMAP_OPS_BANNER.ctaAr === 'حمل تطبيق حلاق ماب بارتنر');
assert('ops_no_license_packages', !STORE_HALAQMAP_OPS_BANNER.ctaAr.includes('حزم الرخصة'));
assert('ops_no_license_title', !STORE_HALAQMAP_OPS_BANNER.titleAr.includes('رخصة النفاذ'));
assert('ops_play_store', STORE_HALAQMAP_OPS_BANNER.appHref === PARTNER_ANDROID_PLAY_STORE_URL);
assert('ops_play_package', STORE_HALAQMAP_OPS_BANNER.appHref.includes('id=com.halaqmap.partner'));

if (failed) {
  console.error(`store-trust-copy: ${failed} failed`);
  process.exit(1);
}
console.log('store-trust-copy: ok');
