/**
 * ثيمات منتجات المتجر — خلفيات فاتحة قطاعية.
 * تشغيل: npx tsx scripts/test-store-product-themes.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  FORBIDDEN_PAGE_BACKGROUNDS,
  STORE_PRODUCT_THEME_FALLBACK,
  STORE_PRODUCT_THEMES,
  type StoreProductId,
} from '../src/config/storeProductThemes.ts';
import { isForbiddenPageBackground, productThemeCssVars, productThemeTokens } from '../src/lib/storeProductThemes.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const PRIORITY_PRODUCTS: StoreProductId[] = ['halana', 'kitchen', 'produce'];
const NEIGHBORHOOD_PRODUCTS: StoreProductId[] = ['grocers', 'restaurant', 'cafe'];
const ALL_PRODUCTS = Object.keys(STORE_PRODUCT_THEMES) as StoreProductId[];

function assertLightPageBg(label: string, color: string) {
  assert.ok(!isForbiddenPageBackground(color), `${label} must not use forbidden background: ${color}`);
  assert.match(color, /^#[0-9a-f]{6}$/i, `${label} must be hex color`);
}

for (const product of ALL_PRODUCTS) {
  const pair = STORE_PRODUCT_THEMES[product];
  assertLightPageBg(`${product} storefront pageBg`, pair.storefront.pageBg);
  assertLightPageBg(`${product} operator pageBg`, pair.operator.pageBg);
  assertLightPageBg(`${product} storefront surface`, pair.storefront.surface);
  assertLightPageBg(`${product} operator surface`, pair.operator.surface);
  assert.equal(pair.operator.field ?? '#FFFFFF', '#FFFFFF', `${product} operator field must be white`);
}

assert.equal(STORE_PRODUCT_THEME_FALLBACK.storefront.pageBg, '#F3EEE6');
assert.equal(STORE_PRODUCT_THEME_FALLBACK.storefront.surface, '#FBF8F2');
assert.ok(FORBIDDEN_PAGE_BACKGROUNDS.has('#000000') && FORBIDDEN_PAGE_BACKGROUNDS.has('#020912'));

for (const forbidden of ['#000000', '#020912', '#070A0D', 'rgba(0, 0, 0, 0.85)']) {
  assert.equal(isForbiddenPageBackground(forbidden), true, `forbidden: ${forbidden}`);
}

assert.equal(isForbiddenPageBackground('#F7EFE9'), false);
assert.equal(isForbiddenPageBackground(''), false);

const customBlocked = productThemeCssVars('kitchen', 'storefront', '#020912');
assert.equal(String(customBlocked['--storefront-page-bg']), '#F3E5D3');

const themeCss = readFileSync(join(root, 'src/styles/storeProductTheme.css'), 'utf8');
assert.match(themeCss, /\.store-product-theme/);
assert.match(themeCss, /--storefront-page-bg/);
assert.match(themeCss, /--operator-page-bg/);

const shell = readFileSync(join(root, 'src/components/store/StorePurchasedShell.tsx'), 'utf8');
assert.match(shell, /StoreProductThemeRoot/);
assert.doesNotMatch(shell, /lockPartnerDarkCanvas/);
assert.doesNotMatch(shell, /store-live-workspace/);

const halanaPage = readFileSync(join(root, 'src/pages/store/StoreHalanaShopPage.tsx'), 'utf8');
assert.match(halanaPage, /StoreProductThemeRoot/);

const shopPages: Array<{ file: string; product: StoreProductId }> = [
  { file: 'src/pages/store/StoreKitchenShopPage.tsx', product: 'kitchen' },
  { file: 'src/pages/store/StoreProduceShopPage.tsx', product: 'produce' },
  { file: 'src/pages/store/StoreGrocersShopPage.tsx', product: 'grocers' },
  { file: 'src/pages/store/StoreRestaurantShopPage.tsx', product: 'restaurant' },
  { file: 'src/pages/store/StoreCafeShopPage.tsx', product: 'cafe' },
];

for (const { file, product } of shopPages) {
  const src = readFileSync(join(root, file), 'utf8');
  assert.match(src, new RegExp(`product="${product}"`), `${file} must set product="${product}"`);
}

const indexCss = readFileSync(join(root, 'src/index.css'), 'utf8');
assert.doesNotMatch(indexCss, /\.store-live-workspace \{/);
assert.match(indexCss, /\.halana-page:not\(\.store-product-theme\)/);

console.log('store-product-themes ok');
console.log('');
console.log('Theme matrix (computed CSS vars):');
for (const product of [...PRIORITY_PRODUCTS, ...NEIGHBORHOOD_PRODUCTS]) {
  for (const context of ['storefront', 'operator'] as const) {
    const vars = productThemeCssVars(product, context);
    const tokens = productThemeTokens(product, context);
    console.log(
      `- ${product} / ${context}: page=${tokens.pageBg} surface=${tokens.surface} text=${tokens.text} accent=${tokens.accent}`,
    );
    if (context === 'storefront') {
      assert.equal(vars['--storefront-page-bg'], tokens.pageBg);
    } else {
      assert.equal(vars['--operator-page-bg'], tokens.pageBg);
    }
  }
}

console.log('');
console.log('Manual screenshot checklist (1440 + 390, guest + operator):');
for (const product of PRIORITY_PRODUCTS) {
  console.log(`  [ ] ${product}: guest 1440 / guest 390 / operator 1440 / operator 390`);
}
