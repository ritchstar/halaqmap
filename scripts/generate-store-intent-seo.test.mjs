/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * node scripts/generate-store-intent-seo.test.mjs
 */
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { STORE_INTENT_PAGES } from './data/storeIntentLandingPages.mjs';
import {
  buildStoreIntentSitemapXml,
  renderStoreIntentHub,
  renderStoreIntentPage,
  writeStoreIntentSeo,
} from './generate-store-intent-seo.mjs';

assert.equal(STORE_INTENT_PAGES.length, 24);

const wedding = STORE_INTENT_PAGES[0];
const html = renderStoreIntentPage(wedding);
assert.match(html, /<h1>دعوة زفاف رقمية تفتح إلى قاعة حفل حيّة<\/h1>/);
assert.match(html, /meta name="robots" content="index, follow"/);
assert.match(html, /store-favicon\.ico/);
assert.doesNotMatch(html, /\/favicon\.ico\?v=/);
assert.match(html, /899 ر\.س/);
assert.match(html, /RSVP/);
assert.doesNotMatch(html, /اجواء1/);
assert.match(html, /https:\/\/store\.halaqmap\.com\/store\/wedding\/read/);
assert.match(html, /"@type":"FAQPage"/);

const coiffeur = STORE_INTENT_PAGES.find((p) => p.slug === 'salon-women-visibility');
const coiffeurHtml = renderStoreIntentPage(coiffeur);
assert.match(coiffeurHtml, /meta name="robots" content="noindex, follow"/);
assert.match(coiffeurHtml, /https:\/\/coiffeur\.halaqmap\.com/);

// ── الصفحات الثماني "متجر إلكتروني لـ..." لصاحب النشاط (أضيفت 2026-09-22) ──
const produceStore = STORE_INTENT_PAGES.find((p) => p.slug === 'online-store-for-produce-seller');
const produceStoreHtml = renderStoreIntentPage(produceStore);
assert.match(produceStoreHtml, /<h1>متجر خضار وفواكه إلكتروني لمحل أو عربة الحي<\/h1>/);
assert.match(produceStoreHtml, /meta name="robots" content="index, follow"/);
assert.match(produceStoreHtml, /1350 أو 2500 ر\.س/);
assert.match(produceStoreHtml, /https:\/\/store\.halaqmap\.com\/store\/produce\/read/);
// تمايز واضح عن صفحة الاستهلاك القائمة على نفس المنتج (نية مختلفة، لا تكرار محتوى)
assert.doesNotMatch(produceStoreHtml, /طلب خضار بالجوال/);

// بخورنا1: الوجهة الصحيحة هي /store/bakhurna نفسها (لا صفحة /read منفصلة لهذا المنتج)
const oudStore = STORE_INTENT_PAGES.find((p) => p.slug === 'online-store-for-oud-perfume');
const oudStoreHtml = renderStoreIntentPage(oudStore);
assert.match(oudStoreHtml, /https:\/\/store\.halaqmap\.com\/store\/bakhurna"/);
assert.doesNotMatch(oudStoreHtml, /\/store\/bakhurna\/read/);

assert.equal(
  STORE_INTENT_PAGES.filter((p) => p.slug.startsWith('online-store-for-')).length,
  8,
  'يجب أن تبقى ثماني صفحات "متجر إلكتروني لـ..." بالضبط — لا سبع ولا تسع',
);

// ── صفحة نية "كيف اسوق لطبخي" المعلوماتية (أضيفت 2026-09-23) ──
const marketingPage = STORE_INTENT_PAGES.find((p) => p.slug === 'how-to-market-home-cooking');
const marketingHtml = renderStoreIntentPage(marketingPage);
assert.match(marketingHtml, /<h1>كيف تسوّق لطبخك المنزلي؟ خطوات عملية لزيادة الطلبات<\/h1>/);
assert.match(marketingHtml, /meta name="robots" content="index, follow"/);
assert.match(marketingHtml, /https:\/\/store\.halaqmap\.com\/store\/kitchen\/read/);
assert.match(marketingHtml, /"@type":"FAQPage"/);
// تمايز واضح عن صفحتي طبختنا1 القائمتين (نية مختلفة: معلوماتية لا شرائية)
assert.doesNotMatch(marketingHtml, /طلبات الأكل المنزلي من الجوال بلا تشتت/);
assert.doesNotMatch(marketingHtml, /متجر إلكتروني لصاحبة أو صاحب الأكل المنزلي/);

// ── ثلاث صفحات نية «برنامج إدارة/هدايا» (أُضيفت 2026-09-23) ──
const restaurantProgram = STORE_INTENT_PAGES.find((p) => p.slug === 'restaurant-management-program');
const restaurantProgramHtml = renderStoreIntentPage(restaurantProgram);
assert.match(restaurantProgramHtml, /<h1>برنامج لإدارة قائمة مطعمك واستقبال طلباته برابط واحد<\/h1>/);
assert.match(restaurantProgramHtml, /meta name="robots" content="index, follow"/);
assert.match(restaurantProgramHtml, /https:\/\/store\.halaqmap\.com\/store\/restaurant\/read/);
// تمايز عن صفحتي مطعمنا1 القائمتين، ولا ادعاء لميزات غير موجودة
assert.doesNotMatch(restaurantProgramHtml, /قائمة مطعم رقمية وطلبات مرتبة لضيف الحي/);
assert.doesNotMatch(restaurantProgramHtml, /متجر إلكتروني لقائمة مطعم وطلباته/);
assert.match(restaurantProgramHtml, /ليس نظام إدارة موظفين أو مخزون أو محاسبة/);

const cafeProgram = STORE_INTENT_PAGES.find((p) => p.slug === 'cafe-management-program');
const cafeProgramHtml = renderStoreIntentPage(cafeProgram);
assert.match(cafeProgramHtml, /<h1>برنامج لإدارة قائمة كوفيك وطلباته وشاشاته من مكان واحد<\/h1>/);
assert.match(cafeProgramHtml, /meta name="robots" content="index, follow"/);
assert.doesNotMatch(cafeProgramHtml, /طلبات المقهى وشاشاته في تجربة رقمية واحدة/);
assert.doesNotMatch(cafeProgramHtml, /متجر إلكتروني لقائمة مقهى وشاشاته/);
assert.match(cafeProgramHtml, /ليس نظام محاسبة أو مخزون شامل/);

const datesGifts = STORE_INTENT_PAGES.find((p) => p.slug === 'dates-gift-boxes');
const datesGiftsHtml = renderStoreIntentPage(datesGifts);
assert.match(datesGiftsHtml, /<h1>صفحة هدايا تمور مرتبة تناسب مناسباتك<\/h1>/);
assert.match(datesGiftsHtml, /meta name="robots" content="index, follow"/);
assert.match(datesGiftsHtml, /https:\/\/store\.halaqmap\.com\/store\/dates\/read/);
assert.doesNotMatch(datesGiftsHtml, /متجر تمر إلكتروني بمزاد علني لصناديق الموسم/);

// ── صورة بارزة أعلى-يمين لصفحة "طلبات الأكل المنزلي" فقط (أُضيفت 2026-09-24) ──
const homeFoodOrders = STORE_INTENT_PAGES.find((p) => p.slug === 'home-food-orders');
const homeFoodOrdersHtml = renderStoreIntentPage(homeFoodOrders);
assert.match(homeFoodOrdersHtml, /<div class="wrap wrap-hero">/);
assert.match(homeFoodOrdersHtml, /<aside class="hero-image">/);
assert.match(homeFoodOrdersHtml, /\/images\/store\/kitchen\/home-food-orders-hero\.jpg/);
// حقل heroImage اختياري — صفحة لا تملكه يجب أن تبقى بجسم <div class="wrap"> العادي
// بلا وسم <aside class="hero-image"> (قاعدة CSS غير المستخدمة تبقى في <style> بلا ضرر)
const cafeProgramNoHero = STORE_INTENT_PAGES.find((p) => p.slug === 'cafe-management-program');
const cafeProgramNoHeroHtml = renderStoreIntentPage(cafeProgramNoHero);
assert.match(cafeProgramNoHeroHtml, /<div class="wrap">/);
assert.doesNotMatch(cafeProgramNoHeroHtml, /<div class="wrap wrap-hero">/);
assert.doesNotMatch(cafeProgramNoHeroHtml, /<aside class="hero-image">/);

const sitemap = buildStoreIntentSitemapXml();
assert.match(sitemap, /need\/store<\/loc>/);
assert.match(sitemap, /need\/wedding-invite-digital<\/loc>/);
assert.match(sitemap, /need\/online-store-for-produce-seller<\/loc>/);
assert.match(sitemap, /need\/online-store-for-cafe<\/loc>/);
assert.doesNotMatch(sitemap, /salon-women-visibility/);

const hub = renderStoreIntentHub();
assert.match(hub, /حلول أعمال متجر خريطة الحل/);
assert.match(hub, /need\/store/);

const tmp = mkdtempSync(join(tmpdir(), 'hm-store-intent-'));
try {
  writeStoreIntentSeo(tmp);
  assert.match(
    readFileSync(join(tmp, 'need', 'store', 'index.html'), 'utf8'),
    /حلول أعمال/,
  );
  assert.match(
    readFileSync(join(tmp, 'need', 'digital-invite-card', 'index.html'), 'utf8'),
    /12 و29 و59/,
  );
  assert.match(
    readFileSync(join(tmp, 'need', 'online-store-for-dates-shop', 'index.html'), 'utf8'),
    /مزاد علني حي لصناديق التمر/,
  );
  assert.match(readFileSync(join(tmp, 'sitemap-store-intent.xml'), 'utf8'), /<\?xml/);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

console.log('[generate-store-intent-seo.test] ok');
