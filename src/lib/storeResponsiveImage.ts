/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مسارات WebP متجاوبة لصور تسويق المتجر (مولَّدة عبر scripts/optimize-store-images.mjs).
 * الاتفاقية: foo.jpg → foo.w480.webp / foo.w960.webp / foo.w1440.webp
 */
const STORE_RESPONSIVE_WIDTHS = [480, 960, 1440] as const;

const RASTER_PATH = /\.(jpe?g|png)$/i;

export function storeResponsiveWebpSrcSet(src: string): string | null {
  if (!src.startsWith('/images/store/')) return null;
  if (!RASTER_PATH.test(src)) return null;
  const base = src.replace(RASTER_PATH, '');
  return STORE_RESPONSIVE_WIDTHS.map((w) => `${base}.w${w}.webp ${w}w`).join(', ');
}

/** أحجام العرض الشائعة لقطات المتجر (هيرو بعرض الشاشة أو بطاقة عريضة). */
export const STORE_SHOT_SIZES = '(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px';
