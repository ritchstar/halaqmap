/**
 * فحص أيقونات إيميل المتجر: روابط متمركزة بستايل المنتج، بلا لصق عنوان ظاهر.
 * تشغيل: npx tsx scripts/test-store-mail-icons.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildEventLiveLinksHtml,
  buildGrocersLiveLinksHtml,
  buildLoungeLiveLinksHtml,
  buildKitchenLiveLinksHtml,
  buildRestaurantLiveLinksHtml,
  buildStoreAffiliateMagicHtml,
  buildWeddingLiveLinksHtml,
  storeMailTheme,
} from '../api/_lib/storeMailIconLayout.ts';
import { storeAffiliateCheckoutLinks } from '../api/_lib/storeAffiliateCode.ts';
import { STORE_MAIL_AFFILIATE_ICON, STORE_MAIL_PRODUCT_ICONS } from '../src/config/storeMailIcons.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');

const display = 'https://store.halaqmap.com/w/disp_token';
const host = 'https://store.halaqmap.com/w/host_token';
const guest = 'https://store.halaqmap.com/l/guest_token';
const shop = 'https://store.halaqmap.com/g/shop_token';
const desk = 'https://store.halaqmap.com/g/desk_token';
const login = 'https://store.halaqmap.com/#/store/affiliates/desk?magic=secret';
const products = storeAffiliateCheckoutLinks('abcdef12');

const wedding = buildWeddingLiveLinksHtml({ displayUrl: display, hostUrl: host, expiresLabel: '2026-12-01' });
const event = buildEventLiveLinksHtml({ displayUrl: display, hostUrl: host, expiresLabel: '2026-12-01' });
const lounge = buildLoungeLiveLinksHtml({
  displayUrl: display,
  guestUrl: guest,
  hostUrl: host,
  expiresLabel: '2026-12-01',
});
const grocers = buildGrocersLiveLinksHtml({ shopUrl: shop, deskUrl: desk, expiresLabel: '2026-12-01' });
const restaurant = buildRestaurantLiveLinksHtml({ shopUrl: shop, deskUrl: desk, expiresLabel: '2026-12-01' });
const kitchen = buildKitchenLiveLinksHtml({ shopUrl: shop, deskUrl: desk, expiresLabel: '2026-12-01' });
const affiliate = buildStoreAffiliateMagicHtml({ loginUrl: login, productLinks: products });

for (const html of [wedding, event, lounge, grocers, restaurant, kitchen, affiliate]) {
  assert.match(html, /align="center"/);
  assert.match(html, /text-align:center/);
  assert.doesNotMatch(html, /المتجر يصدر المسارات/);
  assert.doesNotMatch(html, /بلا لصق عناوين/);
  assert.doesNotMatch(html, />https:\/\//);
  assert.doesNotMatch(html, /كاردي8/);
  assert.doesNotMatch(html, /store_occasion_card/);
}

assert.match(wedding, /افراحي1/);
assert.match(wedding, /شاشة القاعة/);
assert.match(wedding, /لوحة المضيف/);
assert.ok(wedding.includes(display));
assert.match(event, /اجواء1/);
assert.match(lounge, /لاونجا1/);
assert.ok(lounge.includes(guest));
assert.match(grocers, /تمويناتا1/);
assert.match(restaurant, /مطعمنا1/);
assert.match(kitchen, /طبختنا1/);
assert.match(kitchen, /صفحة الزبون/);
assert.match(kitchen, /لوحة النشاط/);
assert.doesNotMatch(kitchen, /أكلنا1/);
assert.match(affiliate, /لوحة المسوّق/);
assert.ok(affiliate.includes(products.wedding));
assert.ok(affiliate.includes(products.restaurant));
assert.ok(affiliate.includes(products.kitchen));
assert.ok(affiliate.includes(products.halana));
assert.match(affiliate, /طبختنا1/);
assert.ok(affiliate.includes(login));

assert.equal(storeMailTheme('wedding').accent, STORE_MAIL_PRODUCT_ICONS[0].accent);
assert.equal(storeMailTheme('event').accent, STORE_MAIL_PRODUCT_ICONS[1].accent);
assert.equal(storeMailTheme('lounge').accent, STORE_MAIL_PRODUCT_ICONS[2].accent);
assert.equal(storeMailTheme('grocers').accent, STORE_MAIL_PRODUCT_ICONS[3].accent);
assert.equal(storeMailTheme('restaurant').accent, STORE_MAIL_PRODUCT_ICONS[4].accent);
assert.equal(storeMailTheme('kitchen').accent, STORE_MAIL_PRODUCT_ICONS[6].accent);
assert.equal(storeMailTheme('affiliate').accent, STORE_MAIL_AFFILIATE_ICON.accent);
assert.equal(products.wedding, 'https://www.halaqmap.com/#/store/wedding?ref=abcdef12');

assert.doesNotMatch(app, /from ['"]@\/config\/storeMailIcons['"]/);
assert.doesNotMatch(app, /from ['"]@\/components\/store\/StoreProductLinkIconGrid['"]/);
assert.doesNotMatch(app, /storeMailIconLayout/);

const weddingMail = readFileSync(join(root, 'api/_lib/storeWeddingLiveMail.ts'), 'utf8');
assert.match(weddingMail, /buildWeddingLiveLinksHtml/);
assert.doesNotMatch(weddingMail, /\$\{input\.displayUrl\}<\/a>/);

console.log('store-mail-icons ok');
