/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import {
  STORE_DISALLOWED_PRODUCT_IMAGE_FRAGMENTS,
  STORE_DISALLOWED_PRODUCT_IMAGE_PATHS,
} from '../../src/config/storeDisallowedImagery.js';

export function isDisallowedStoreProductImage(raw: unknown): boolean {
  const src = String(raw ?? '').trim();
  if (!src) return false;
  const lower = src.toLowerCase();
  if (STORE_DISALLOWED_PRODUCT_IMAGE_PATHS.some((path) => lower.includes(path.toLowerCase()))) {
    return true;
  }
  return STORE_DISALLOWED_PRODUCT_IMAGE_FRAGMENTS.some((fragment) => lower.includes(fragment));
}

export function sanitizeStoreProductImageSrc(raw: unknown): string {
  const src = String(raw ?? '').trim();
  if (!src || isDisallowedStoreProductImage(src)) return '';
  return src;
}
