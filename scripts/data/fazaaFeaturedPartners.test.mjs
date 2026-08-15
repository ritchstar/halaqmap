/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  featuredPartnerOgImage,
  featuredPartnersForPlace,
  featuredPartnersJsonLd,
  featuredPartnerSitemapImages,
  featuredPartnersSectionHtml,
  isSafeHttpsBannerUrl,
  pickFeaturedPartnerOgImage,
  resolveFeaturedPartnerBanner,
} from './fazaaFeaturedPartners.mjs';

const sample = {
  nameAr: 'صالون تجريبي',
  citySlug: 'riyadh',
  cityNameAr: 'الرياض',
  neighborhoodSlugs: ['narjis'],
  areaLabelAr: 'حي النرجس',
  specialtyHintAr: 'حلاقة رجالي',
  phrases: ['صالون تجريبي النرجس'],
  bannerUrl: 'https://cdn.example.com/narjis-banner.jpg',
  bannerAltAr: 'صالون تجريبي — حلاقة رجالي في حي النرجس، الرياض',
};

test('يرفض رابط بنر غير HTTPS', () => {
  assert.equal(isSafeHttpsBannerUrl('http://cdn.example.com/x.jpg'), false);
  assert.equal(isSafeHttpsBannerUrl('javascript:alert(1)'), false);
  assert.equal(isSafeHttpsBannerUrl(''), false);
  assert.equal(isSafeHttpsBannerUrl(sample.bannerUrl), true);
});

test('og:image يظهر فقط في صفحة حي ببنر واحد', () => {
  assert.equal(pickFeaturedPartnerOgImage([sample], { neighborhoodPage: true }), sample.bannerUrl);
  assert.equal(pickFeaturedPartnerOgImage([sample, sample], { neighborhoodPage: true }), null);
  assert.equal(pickFeaturedPartnerOgImage([sample], { neighborhoodPage: false }), null);
  assert.equal(resolveFeaturedPartnerBanner({ ...sample, bannerUrl: '' }), null);
});

test('لا يُنشر شريك على فزعة قبل موافقة مصدَّرة', () => {
  const rawnah = featuredPartnersForPlace('khamis-mushait', 'rawnah');
  assert.equal(rawnah.length, 0);
  assert.equal(featuredPartnerOgImage('khamis-mushait', 'rawnah'), null);
  assert.equal(featuredPartnerSitemapImages('khamis-mushait', 'rawnah').length, 0);
  assert.equal(featuredPartnersSectionHtml({
    citySlug: 'khamis-mushait',
    neighborhoodSlug: 'rawnah',
    placeNameAr: 'الرونة',
  }), '');
});

test('بيانات الصالون تُرفق بالصورة عند وجود بنر', () => {
  const [shop] = featuredPartnersJsonLd([sample], { pageUrl: 'https://www.halaqmap.com/near/riyadh/narjis' });
  assert.equal(shop['@type'], 'BarberShop');
  assert.equal(shop.image, sample.bannerUrl);
  assert.equal(shop.areaServed.name.includes('النرجس'), true);
});
