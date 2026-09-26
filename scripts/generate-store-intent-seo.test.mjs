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
  STORE_INTENT_OPEN_STORE_PATH,
  buildStoreIntentSitemapXml,
  renderStoreIntentHub,
  renderStoreIntentOpenStorePage,
  renderStoreIntentPage,
  writeStoreIntentSeo,
} from './generate-store-intent-seo.mjs';

assert.equal(STORE_INTENT_PAGES.length, 30);

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

const startProduce = STORE_INTENT_PAGES.find((p) => p.slug === 'how-to-start-selling-produce');
const startProduceHtml = renderStoreIntentPage(startProduce);
assert.match(startProduceHtml, /<h1>كيف تبدأ بيع الخضار والفواكه؟<\/h1>/);
assert.match(startProduceHtml, /كيف ابدأ بيع خضار وفواكه/);
assert.match(startProduceHtml, /1350 ر\.س لمئة وثمانين يوماً/);
assert.match(startProduceHtml, /https:\/\/store\.halaqmap\.com\/store\/produce\/read/);
assert.match(startProduceHtml, /meta name="robots" content="index, follow"/);
assert.doesNotMatch(startProduceHtml, /تجربة/);
assert.doesNotMatch(startProduceHtml, /تمويناتا1|طبختنا1|مطعمنا1|كافينا1/);
assert.doesNotMatch(startProduceHtml, /متجر خضار وفواكه إلكتروني لمحل أو عربة الحي/);
assert.doesNotMatch(startProduceHtml, /خضار وفواكه الحي بأسعار اليوم على الجوال/);

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

const startCooking = STORE_INTENT_PAGES.find((p) => p.slug === 'how-to-start-home-cooking');
const startCookingHtml = renderStoreIntentPage(startCooking);
assert.match(startCookingHtml, /<h1>كيف تبدأ مشروع بيع طبخك المنزلي؟<\/h1>/);
assert.match(startCookingHtml, /كيف ابدأ مشروع بيع طبخي/);
assert.match(startCookingHtml, /300 ر\.س لمئة وثمانين يوماً/);
assert.match(startCookingHtml, /https:\/\/store\.halaqmap\.com\/store\/kitchen\/read/);
assert.match(startCookingHtml, /meta name="robots" content="index, follow"/);
assert.doesNotMatch(startCookingHtml, /تجربة/);
assert.doesNotMatch(startCookingHtml, /مطعمنا1|كافينا1|أكلنا1/);
assert.doesNotMatch(startCookingHtml, /كيف تسوّق لطبخك المنزلي/);
assert.doesNotMatch(startCookingHtml, /طلبات الأكل المنزلي من الجوال بلا تشتت/);
assert.doesNotMatch(startCookingHtml, /متجر إلكتروني لصاحبة أو صاحب الأكل المنزلي/);

for (const row of [
  {
    slug: 'how-to-start-home-sweets',
    h1: 'كيف تبدأين مشروع بيع حلوياتك من المنزل؟',
    keyword: 'كيف ابدأ مشروع بيع حلويات منزلية',
    price: /894 ر\.س لمئة وثمانين يوماً/,
    href: /https:\/\/store\.halaqmap\.com\/store\/halana\/read/,
    absent: /متجر إلكتروني لحلويات مخصصة بطلب المناسبة|تجربة|تمويناتا1/,
  },
  {
    slug: 'how-to-start-selling-dates',
    h1: 'كيف تبدأ مشروع بيع التمر من المنزل؟',
    keyword: 'كيف ابدأ مشروع بيع تمر منزلي',
    price: /1350 ر\.س لمئة وثمانين يوماً/,
    href: /https:\/\/store\.halaqmap\.com\/store\/dates\/read/,
    absent: /متجر تمر إلكتروني بمزاد علني لصناديق الموسم|تجربة|بخورنا1/,
  },
  {
    slug: 'how-to-start-selling-oud',
    h1: 'كيف تبدأ مشروع بيع البخور؟',
    keyword: 'كيف ابدأ مشروع بيع بخور',
    price: /899 ر\.س لمئة وثمانين يوماً/,
    href: /https:\/\/store\.halaqmap\.com\/store\/bakhurna"/,
    absent: /متجر بخور وعود إلكتروني لمحل أو عربة|تجربة|افراحي1/,
  },
]) {
  const page = STORE_INTENT_PAGES.find((p) => p.slug === row.slug);
  const html = renderStoreIntentPage(page);
  assert.match(html, new RegExp(`<h1>${row.h1}</h1>`));
  assert.match(html, new RegExp(row.keyword));
  assert.match(html, row.price);
  assert.match(html, row.href);
  assert.match(html, /meta name="robots" content="index, follow"/);
  assert.doesNotMatch(html, row.absent);
}

const barberApp = STORE_INTENT_PAGES.find((p) => p.slug === 'mens-barbershop-app');
const barberAppHtml = renderStoreIntentPage(barberApp);
assert.match(barberAppHtml, /<h1>تطبيق صالونات الحلاقة الرجالية<\/h1>/);
assert.match(barberAppHtml, /تطبيق صالونات الحلاقة الرجالية/);
assert.match(barberAppHtml, /https:\/\/www\.halaqmap\.com\/partners/);
assert.match(barberAppHtml, /meta name="robots" content="index, follow"/);
assert.doesNotMatch(barberAppHtml, /اجعل صالونك ظاهراً عند بحث العميل القريب/);
assert.doesNotMatch(barberAppHtml, /كوافير|صالون نسائي/);

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

// ── صور بارزة أعلى-يمين للصفحات الاثنتي عشرة المتبقية (رسومات chatlyai، أُضيفت 2026-09-24) ──
// الاسم داخل كل صورة مطبوع فعلياً في مشهد الرسمة (وليس فوقها)، لذا width/height الحقيقية
// (1200×896) تحل محل الافتراضي 640×349 المصمَّم لصورة طبختنا1 الفوتوغرافية وحدها.
const heroSlugsChatlyai = [
  'wedding-invite-digital',
  'event-invite-interactive',
  'neighborhood-grocery-orders',
  'restaurant-menu-ordering',
  'cafe-neighborhood-screens',
  'produce-delivery-neighborhood',
  'custom-sweets-portfolio',
  'lounge-event-screens',
  'digital-invite-card',
  'barbershop-visibility',
  'salon-women-visibility',
];
for (const slug of heroSlugsChatlyai) {
  const page = STORE_INTENT_PAGES.find((p) => p.slug === slug);
  assert.ok(page, `صفحة ${slug} يجب أن تكون موجودة`);
  const html = renderStoreIntentPage(page);
  assert.match(html, /<div class="wrap wrap-hero">/, `${slug}: يجب أن يظهر wrap-hero`);
  assert.match(html, new RegExp(`/images/store/need/${slug}-hero\\.webp`), `${slug}: مسار الصورة الصحيح`);
  assert.match(html, /width="1200" height="896"/, `${slug}: أبعاد الصورة الحقيقية`);
}

const openStore = renderStoreIntentOpenStorePage();
assert.equal(STORE_INTENT_OPEN_STORE_PATH, '/need/how-to-open-online-store');
assert.match(openStore, /<h1>كيف تفتح متجراً إلكترونياً لنشاطك؟<\/h1>/);
assert.match(openStore, /meta name="robots" content="index, follow"/);
for (const slug of [
  'online-store-for-home-cooking',
  'online-store-for-grocer',
  'online-store-for-produce-seller',
  'how-to-start-selling-produce',
  'how-to-start-home-cooking',
  'online-store-for-dates-shop',
  'dates-gift-boxes',
  'how-to-start-selling-dates',
  'how-to-start-home-sweets',
  'online-store-for-restaurant',
  'online-store-for-cafe',
  'online-store-for-custom-sweets',
]) {
  assert.match(openStore, new RegExp(`/need/${slug}`), `رابط النشاط ${slug}`);
}
assert.doesNotMatch(openStore, /need\/wedding-invite-digital/);
assert.doesNotMatch(openStore, /need\/digital-invite-card/);
assert.doesNotMatch(openStore, /تجربة/);
assert.match(openStore, /بلا عمولة على السلة/);
assert.match(openStore, /تؤكد المتخصصة العربون/);

const homeCooking = STORE_INTENT_PAGES.find((p) => p.slug === 'online-store-for-home-cooking');
assert.match(renderStoreIntentPage(homeCooking), /need\/how-to-open-online-store/);
assert.doesNotMatch(html, /need\/how-to-open-online-store/);

const sitemap = buildStoreIntentSitemapXml();
assert.match(sitemap, /need\/store<\/loc>/);
assert.match(sitemap, /need\/how-to-open-online-store<\/loc>/);
assert.match(sitemap, /need\/wedding-invite-digital<\/loc>/);
assert.match(sitemap, /need\/online-store-for-produce-seller<\/loc>/);
assert.match(sitemap, /need\/how-to-start-selling-produce<\/loc>/);
assert.match(sitemap, /need\/how-to-start-home-cooking<\/loc>/);
assert.match(sitemap, /need\/how-to-start-home-sweets<\/loc>/);
assert.match(sitemap, /need\/how-to-start-selling-dates<\/loc>/);
assert.match(sitemap, /need\/how-to-start-selling-oud<\/loc>/);
assert.match(sitemap, /need\/mens-barbershop-app<\/loc>/);
assert.match(sitemap, /need\/online-store-for-cafe<\/loc>/);
assert.doesNotMatch(sitemap, /salon-women-visibility/);

const hub = renderStoreIntentHub();
assert.match(hub, /حلول أعمال متجر خريطة الحل/);
assert.match(hub, /need\/store/);
assert.match(hub, /need\/how-to-open-online-store/);

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
  assert.match(
    readFileSync(join(tmp, 'need', 'how-to-open-online-store', 'index.html'), 'utf8'),
    /كيف تفتح متجراً إلكترونياً لنشاطك/,
  );
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

console.log('[generate-store-intent-seo.test] ok');
