/**
 * صور واجهة تمرتنا1 (DatesChatlyStorefront) كانت تُحمَّل كـ JPG خام مباشرة رغم
 * وجود نسخ WebP متجاوبة مولَّدة مسبقاً (w480/w960/w1440) بجانبها على القرص —
 * فجوة تكشفت مع حملتي يوتيوب/سناب شات اللتين ستقودان زواراً حقيقيين لهذه
 * الصفحة تحديداً، ونفس نمط المشكلة التي سبّبت قفزة Fast Data Transfer في
 * 29-30 أغسطس (انظر Claude outputs/vercel_bandwidth_spike_for_cursor.md).
 *
 * تشغيل: npx tsx scripts/test-store-dates-responsive-images.mts
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_DATES_ITEM_IMAGES } from '../src/config/storeDatesLive.ts';
import { storeResponsiveWebpSrcSet } from '../src/lib/storeResponsiveImage.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const storefront = readFileSync(
  join(root, 'src/components/store/dates/DatesChatlyStorefront.tsx'),
  'utf8',
);

assert.match(storefront, /storeResponsiveWebpSrcSet/, 'يجب استخدام الصور المتجاوبة WebP في واجهة تمرتنا1');
assert.match(storefront, /<picture>/, 'يجب لف الصور بعنصر <picture> ليختار المتصفح النسخة الأنسب');
assert.match(storefront, /DATES_GRID_IMAGE_SIZES/);

// كل صورة في كتالوج تمرتنا1 يجب أن يكون لها نسخ WebP الثلاث فعلياً على القرص،
// وإلا فسيعود storeResponsiveWebpSrcSet مساراً غير موجود فعلياً (404 صامت).
const WIDTHS = [480, 960, 1440];
for (const src of STORE_DATES_ITEM_IMAGES) {
  const srcSet = storeResponsiveWebpSrcSet(src);
  assert.ok(srcSet, `المسار ${src} يجب أن يُنتج srcSet متجاوباً`);
  for (const w of WIDTHS) {
    const webpPath = src.replace(/\.(jpe?g|png)$/i, `.w${w}.webp`);
    const onDisk = join(root, 'public', webpPath.replace(/^\//, ''));
    assert.ok(existsSync(onDisk), `ملف WebP مفقود فعلياً: ${webpPath}`);
  }
}

console.log('store-dates-responsive-images: ok');
