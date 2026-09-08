/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import type { CSSProperties } from 'react';
import {
  FORBIDDEN_PAGE_BACKGROUNDS,
  STORE_PRODUCT_THEME_FALLBACK,
  STORE_PRODUCT_THEMES,
  type StoreProductId,
  type StoreProductThemeContext,
  type StoreProductThemePair,
  type StoreProductThemeTokens,
} from '@/config/storeProductThemes';

export type { StoreProductId, StoreProductThemeContext };

/** @deprecated استخدم StoreProductId */
export type StoreLiveSectorId = Extract<
  StoreProductId,
  'grocers' | 'produce' | 'kitchen' | 'restaurant' | 'cafe' | 'halana'
>;

export type StoreLiveSurface = 'storefront' | 'workspace';

export function normalizeStoreLiveSurface(surface: 'storefront' | 'workspace'): StoreProductThemeContext {
  return surface === 'workspace' ? 'operator' : 'storefront';
}

export function productThemePair(product: StoreProductId | undefined): StoreProductThemePair {
  if (!product) return STORE_PRODUCT_THEME_FALLBACK;
  return STORE_PRODUCT_THEMES[product] ?? STORE_PRODUCT_THEME_FALLBACK;
}

export function productThemeTokens(
  product: StoreProductId | undefined,
  context: StoreProductThemeContext,
): StoreProductThemeTokens {
  return productThemePair(product)[context];
}

function normalizeHex(value: string): string {
  return value.trim().toLowerCase();
}

export function isForbiddenPageBackground(raw: unknown): boolean {
  const value = String(raw ?? '').trim();
  if (!value) return false;
  const lower = value.toLowerCase();
  if (FORBIDDEN_PAGE_BACKGROUNDS.has(normalizeHex(value))) return true;
  if (/rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.(7[5-9]|[89]\d|9\d)\)/.test(lower)) return true;
  if (/linear-gradient/i.test(value)) {
    for (const forbidden of FORBIDDEN_PAGE_BACKGROUNDS) {
      if (lower.includes(forbidden)) return true;
    }
  }
  return false;
}

export function resolveThemedStorefrontPageBg(product: StoreProductId | undefined, operatorOverride?: string): string {
  const custom = String(operatorOverride || '').trim();
  if (custom && !isForbiddenPageBackground(custom)) return custom;
  return productThemeTokens(product, 'storefront').pageBg;
}

export function productThemeCssVars(
  product: StoreProductId | undefined,
  context: StoreProductThemeContext,
  operatorStorefrontOverride?: string,
): CSSProperties {
  const pair = productThemePair(product);
  const sf = pair.storefront;
  const op = pair.operator;
  const storefrontPageBg = resolveThemedStorefrontPageBg(product, operatorStorefrontOverride);

  return {
    '--storefront-page-bg': storefrontPageBg,
    '--storefront-surface': sf.surface,
    '--storefront-surface-alt': sf.surfaceAlt,
    '--storefront-text': sf.text,
    '--storefront-muted': sf.muted,
    '--storefront-accent': sf.accent,
    '--storefront-accent-secondary': sf.accentSecondary ?? sf.accent,
    '--storefront-accent-warm': sf.accentWarm ?? sf.accent,
    '--operator-page-bg': op.pageBg,
    '--operator-surface': op.surface,
    '--operator-surface-alt': op.surfaceAlt,
    '--operator-field': op.field ?? '#FFFFFF',
    '--operator-text': op.text,
    '--operator-muted': op.muted,
    '--operator-accent': op.accent,
    '--live-accent': context === 'operator' ? op.accent : sf.accent,
  } as CSSProperties;
}

const CANVAS_CLASS = 'hm-app-product-canvas';

export function lockStoreProductCanvas(pageBg: string): () => void {
  if (typeof document === 'undefined') return () => undefined;
  const root = document.documentElement;
  const safeBg = isForbiddenPageBackground(pageBg) ? STORE_PRODUCT_THEME_FALLBACK.storefront.pageBg : pageBg;
  root.classList.add(CANVAS_CLASS);
  root.style.background = safeBg;
  return () => {
    root.classList.remove(CANVAS_CLASS);
    root.style.background = '';
  };
}

/** @deprecated */
export function storeSectorIdentity(sector: StoreLiveSectorId) {
  return productThemeTokens(sector, 'storefront');
}

/** @deprecated */
export function sectorIdentityCssVars(sector: StoreLiveSectorId): CSSProperties {
  return productThemeCssVars(sector, 'storefront');
}

/** @deprecated */
export function resolveStoreLivePageStyle(input: {
  sector?: StoreLiveSectorId;
  surface: 'storefront' | 'workspace';
  operatorPageBg?: string;
}): CSSProperties {
  const context = normalizeStoreLiveSurface(input.surface);
  return productThemeCssVars(input.sector, context, input.operatorPageBg);
}
