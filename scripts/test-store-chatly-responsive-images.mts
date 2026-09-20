/**
 * نفس فجوة تمرتنا1 (JPG خام بدل WebP متجاوب) كانت موجودة في واجهات خضارنا1
 * وتمويناتا1 وكافينا1 وطبختنا1 ومطعمنا1 وبخورنا1 — طُلب إصلاحها كلها معاً بعد
 * إصلاح تمرتنا1 (انظر test-store-dates-responsive-images.mts)، وتم اكتشاف
 * بخورنا1 عبر بحث عام عن نفس النمط في مكوّنات المتجر.
 *
 * تشغيل: npx tsx scripts/test-store-chatly-responsive-images.mts
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_PRODUCE_ITEM_IMAGES } from '../src/config/storeProduceLive.ts';
import { STORE_GROCERS_ITEM_IMAGES } from '../src/config/storeGrocersLive.ts';
import { STORE_BAKHURNA_ITEM_IMAGES } from '../src/config/storeBakhurnaLive.ts';
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

function assertStorefrontSource(relPath: string, gridConst: string, label: string) {
  const source = readFileSync(join(root, relPath), 'utf8');
  assert.match(source, /storeResponsiveWebpSrcSet/, `${label}: يجب استخدام الصور المتجاوبة WebP`);
  assert.match(source, /<picture>/, `${label}: يجب لف الصور بعنصر <picture>`);
  assert.match(source, new RegExp(gridConst), `${label}: يجب تعريف مقاسات الشبكة ${gridConst}`);
}

// خضارنا1 — كتالوج كامل من الصور الثابتة
assertStorefrontSource(
  'src/components/store/produce/ProduceChatlyStorefront.tsx',
  'PRODUCE_GRID_IMAGE_SIZES',
  'خضارنا1',
);
for (const src of STORE_PRODUCE_ITEM_IMAGES) {
  assertWebpOnDisk(src, 'خضارنا1');
}

// تمويناتا1 — كتالوج كامل من الصور الثابتة
assertStorefrontSource(
  'src/components/store/grocers/GrocersChatlyStorefront.tsx',
  'GROCERS_GRID_IMAGE_SIZES',
  'تمويناتا1',
);
for (const src of STORE_GROCERS_ITEM_IMAGES) {
  assertWebpOnDisk(src, 'تمويناتا1');
}

// بخورنا1 — كتالوج كامل من الصور الثابتة (اكتُشفت عبر بحث عام عن نفس النمط)
assertStorefrontSource(
  'src/components/store/bakhurna/BakhurnaChatlyStorefront.tsx',
  'BAKHURNA_GRID_IMAGE_SIZES',
  'بخورنا1',
);
for (const src of STORE_BAKHURNA_ITEM_IMAGES) {
  assertWebpOnDisk(src, 'بخورنا1');
}

// كافينا1 وطبختنا1 ومطعمنا1 — لا يوجد كتالوج صور ثابت للعناصر (صور المنتج تأتي
// من بيانات المشغّل الحيّة)، لكن صورة الغلاف (heroImage) ثابتة ويجب أن تُخدَّم
// كـ WebP متجاوب أيضاً، وكذلك بطاقة "عرض اليوم" في الكود.
const heroOnlyProducts: Array<{ label: string; relPath: string; gridConst: string; heroSrc: string }> = [
  {
    label: 'كافينا1',
    relPath: 'src/components/store/cafe/CafeChatlyStorefront.tsx',
    gridConst: 'CAFE_GRID_IMAGE_SIZES',
    heroSrc: '/images/store/cafe/cafe-01.jpg',
  },
  {
    label: 'طبختنا1',
    relPath: 'src/components/store/kitchen/KitchenChatlyStorefront.tsx',
    gridConst: 'KITCHEN_GRID_IMAGE_SIZES',
    heroSrc: '/images/store/kitchen/kitchen-07.jpg',
  },
  {
    label: 'مطعمنا1',
    relPath: 'src/components/store/restaurant/RestaurantChatlyStorefront.tsx',
    gridConst: 'RESTAURANT_GRID_IMAGE_SIZES',
    heroSrc: '/images/store/restaurant/restaurant-03.jpg',
  },
];

for (const { label, relPath, gridConst, heroSrc } of heroOnlyProducts) {
  assertStorefrontSource(relPath, gridConst, label);
  assertWebpOnDisk(heroSrc, label);
}

console.log('store-chatly-responsive-images: ok');
