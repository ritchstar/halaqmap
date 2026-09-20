/**
 * توسيع البحث عن نفس فجوة "JPG/PNG خام بدل WebP متجاوب" خارج عائلة
 * ChatlyStorefront (طلب: "ابحث عن خلل مشابه في الموقع عامة"). وُجدت 3 صفحات
 * زوار حقيقية تستخدم صوراً ثابتة تحت public/images/store/ لها نسخ WebP
 * مولَّدة مسبقاً (w480/w960/w1440) على القرص لكنها لم تكن مُستخدَمة فعلياً:
 * - صفحة المتجر الرئيسية (شارة SSL Labs)
 * - صفحة التوثيق والتحقق (شارة SSL Labs + شهادات SAIP)
 * - مختبر بطاقة المناسبة (26 صورة مخطط لوني)
 *
 * تشغيل: npx tsx scripts/test-store-site-wide-responsive-images.mts
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_TRUST_COPY } from '../src/config/storeFront.ts';
import { STORE_SAIP_PUBLIC_WORKS } from '../src/config/storeSaipRegistry.ts';
import { LAB_PALETTES } from '../src/config/storeOccasionCardLab.ts';
import { storeResponsiveWebpSrcSet } from '../src/lib/storeResponsiveImage.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const WIDTHS = [480, 960, 1440];

function assertWebpOnDisk(src: string, label: string) {
  const srcSet = storeResponsiveWebpSrcSet(src);
  assert.ok(srcSet, `${label}: المسار ${src} يجب أن يُنتج srcSet متجاوباً`);
  for (const w of WIDTHS) {
    const webpPath = src.replace(/\.(jpe?g|png)$/i, `.w${w}.webp`);
    const onDisk = join(root, 'public', webpPath.replace(/^\//, ''));
    assert.ok(existsSync(onDisk), `${label}: ملف WebP مفقود فعلياً: ${webpPath}`);
  }
}

function assertUsesResponsiveHelper(relPath: string, label: string) {
  const source = readFileSync(join(root, relPath), 'utf8');
  assert.match(source, /storeResponsiveWebpSrcSet/, `${label}: يجب استخدام الصور المتجاوبة WebP`);
  assert.match(source, /<picture>/, `${label}: يجب لف الصور بعنصر <picture>`);
}

// صفحة المتجر الرئيسية — شارة SSL Labs في شريط الثقة
assertUsesResponsiveHelper('src/pages/store/StoreLanding.tsx', 'صفحة المتجر الرئيسية');
assertWebpOnDisk(STORE_TRUST_COPY.sslImage, 'صفحة المتجر الرئيسية (SSL)');

// صفحة التوثيق والتحقق — شارة SSL Labs + شهادات SAIP
assertUsesResponsiveHelper('src/pages/store/StoreTrustPage.tsx', 'صفحة التوثيق والتحقق');
assertWebpOnDisk(STORE_TRUST_COPY.sslImage, 'صفحة التوثيق والتحقق (SSL)');
for (const work of STORE_SAIP_PUBLIC_WORKS) {
  assertWebpOnDisk(work.certImage, `صفحة التوثيق والتحقق (شهادة ${work.id})`);
}

// مختبر بطاقة المناسبة — صور المخططات اللونية الثلاثة (quick/featured/luxury)
assertUsesResponsiveHelper('src/pages/store/StoreOccasionCardLabPage.tsx', 'مختبر بطاقة المناسبة');
for (const tier of Object.keys(LAB_PALETTES) as Array<keyof typeof LAB_PALETTES>) {
  for (const palette of LAB_PALETTES[tier]) {
    assertWebpOnDisk(palette.image, `مختبر بطاقة المناسبة (${tier}/${palette.id})`);
  }
}

console.log('store-site-wide-responsive-images: ok');
