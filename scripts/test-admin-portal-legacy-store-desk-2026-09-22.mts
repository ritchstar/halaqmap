/**
 * الإشارة المحفوظة `#/hmap-int-9kz2/store-desk` بلا شرطة سفلية لا تطابق
 * بوابة الإدارة بعد التدوير، فتفتح صفحة بيضاء. يجب أن تبقى القاعدة الأولى
 * للروابط الجديدة هي المسار الحالي، مع إلحاق المسارين القديمين دائماً.
 *
 * تشغيل: node --experimental-strip-types scripts/test-admin-portal-legacy-store-desk-2026-09-22.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'src/config/adminAuth.ts'), 'utf8');

assert.match(src, /LEGACY_ADMIN_PORTAL_BASES = \['\/_hmap-int-9kz2', '\/hmap-int-9kz2'\]/);
assert.match(src, /function withRememberedPortalBases/);
assert.match(
  src,
  /if \(!raw\) return withRememberedPortalBases\(\[ADMIN_PORTAL_DEFAULT_BASE\]\);/,
);
assert.doesNotMatch(
  src,
  /if \(!raw\) return \[ADMIN_PORTAL_DEFAULT_BASE\];/,
  'المسار الفارغ لا يجوز أن يسقط الإشارات القديمة',
);

console.log('✅ مسارا لوحة التحكم المحفوظان ملحقان ببوابة الإدارة.');
