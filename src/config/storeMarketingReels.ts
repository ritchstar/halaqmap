/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * أشرطة صور تسويقية تتبدل أثناء تصفح المنتج. كل منتج بشريطه الخاص.
 * لا يُستورد من App. لا تُخلط صور اللاونج بقاعات الزواج.
 */

import { STORE_LIVE_PANORAMAS } from '@/config/storeLiveAtmosphere';

export const STORE_MARKETING_REEL_MS = 5200;

export type StoreMarketingReelId =
  | 'landing'
  | 'lounge'
  | 'cafe'
  | 'grocers'
  | 'produce'
  | 'dates'
  | 'bakhurna'
  | 'restaurant'
  | 'kitchen'
  | 'halana'
  | 'wedding'
  | 'wedding-women'
  | 'event'
  | 'event-women'
  | 'occasion'
  | 'halaq'
  | 'coiffeur'
  | 'ops';

const LOUNGE_GENERATED = [
  '/images/store/lounge/lounge-01.jpg',
  '/images/store/lounge/lounge-02.jpg',
  '/images/store/lounge/lounge-03.jpg',
  '/images/store/lounge/lounge-04.jpg',
  '/images/store/lounge/lounge-05.jpg',
  '/images/store/lounge/lounge-06.jpg',
  '/images/store/lounge/lounge-07.jpg',
  '/images/store/lounge/lounge-08.jpg',
  '/images/store/lounge/lounge-09.jpg',
  '/images/store/lounge/lounge-10.jpg',
  '/images/store/lounge/lounge-11.jpg',
  '/images/store/lounge/lounge-12.jpg',
  // مكرّرة عمداً 3 مرات لإبرازها أكثر من أي صورة أخرى (طلب صريح)، بنفس
  // منطق تمويناتا1 وبخورنا1 أعلاه. اللاونج ليست ضمن BANKS في
  // storeShopSky.ts فلا قيد على ترتيب الفهارس هنا.
  '/images/store/lounge/lounge-13.jpg',
  '/images/store/lounge/lounge-13.jpg',
  '/images/store/lounge/lounge-13.jpg',
] as const;

export const STORE_LOUNGE_MARKETING_FRAMES = [
  '/images/store/lounge-hero-marketing.jpg',
  '/images/store/lab/lab-lounge-interior.jpg',
  ...LOUNGE_GENERATED,
] as const;

// كافينا1 كان يستعير reel="lounge" (نفس مصفوفة لاونجا1 أعلاه) لعدم وجود صور
// خاصة به. أضفنا هذا الشريط المستقل بأول صورتين مخصصتين فعلياً للمقهى، ولا
// داعي لتكرارهما — هذا الشريط بأكمله جديد وليس فيه صورة أخرى تُنافَس.
const CAFE_GENERATED = ['/images/store/cafe/cafe-01.jpg', '/images/store/cafe/cafe-02.jpg'] as const;

export const STORE_CAFE_MARKETING_FRAMES = [...CAFE_GENERATED] as const;

const GROCERS_GENERATED = [
  '/images/store/grocers/grocers-01.jpg',
  '/images/store/grocers/grocers-02.jpg',
  '/images/store/grocers/grocers-03.jpg',
  '/images/store/grocers/grocers-04.jpg',
  '/images/store/grocers/grocers-05.jpg',
  '/images/store/grocers/grocers-06.jpg',
  '/images/store/grocers/grocers-07.jpg',
  '/images/store/grocers/grocers-08.jpg',
  // مكرّرة عمداً 3 مرات لإبرازها في الشريط أكثر من أي صورة أخرى (طلب صريح) —
  // أُضيفت في الذيل حصراً حتى لا تُزحزح الفهارس 0-8 التي يعتمد عليها
  // STORE_SHOP_SKY_PHASE_INDEXES في storeShopSky.ts (يختار صوراً بموضعها
  // الرقمي ضمن هذه المصفوفة نفسها لخلفية «سماء» المتجر).
  '/images/store/grocers/grocers-09.jpg',
  '/images/store/grocers/grocers-09.jpg',
  '/images/store/grocers/grocers-09.jpg',
] as const;

export const STORE_GROCERS_MARKETING_FRAMES = [
  '/images/store/grocers-hero-marketing.jpg',
  ...GROCERS_GENERATED,
] as const;

const PRODUCE_GENERATED = [
  '/images/store/produce/produce-01.jpg',
  '/images/store/produce/produce-02.jpg',
  '/images/store/produce/produce-03.jpg',
  '/images/store/produce/produce-04.jpg',
  '/images/store/produce/produce-05.jpg',
  '/images/store/produce/produce-06.jpg',
  '/images/store/produce/produce-07.jpg',
  '/images/store/produce/produce-08.jpg',
] as const;

export const STORE_PRODUCE_MARKETING_FRAMES = [
  '/images/store/produce-hero-marketing.jpg',
  ...PRODUCE_GENERATED,
] as const;

const DATES_GENERATED = [
  '/images/store/dates/dates-01.jpg',
  '/images/store/dates/dates-02.jpg',
  '/images/store/dates/dates-03.jpg',
  '/images/store/dates/dates-04.jpg',
  '/images/store/dates/dates-05.jpg',
  '/images/store/dates/dates-06.jpg',
  '/images/store/dates/dates-07.jpg',
  '/images/store/dates/dates-08.jpg',
] as const;

/** صور تسويق تمرتنا1 — لقطة ميدانية حقيقية ثم أصناف التمر. */
export const STORE_DATES_MARKETING_FRAMES = [
  '/images/store/dates/dates-field-snapshot-scene.jpg',
  ...DATES_GENERATED,
] as const;

/** صور تسويق بخورنا1 — من معرض الأصناف الحقيقي (مجلد gallery). */
export const STORE_BAKHURNA_MARKETING_FRAMES = [
  '/images/store/bakhurna/gallery/01.jpg',
  '/images/store/bakhurna/gallery/05.jpg',
  '/images/store/bakhurna/gallery/08.jpg',
  '/images/store/bakhurna/gallery/12.jpg',
  '/images/store/bakhurna/gallery/03.jpg',
  '/images/store/bakhurna/gallery/15.jpg',
  '/images/store/bakhurna/gallery/20.jpg',
  '/images/store/bakhurna/gallery/22.jpg',
  // مكرّرة عمداً 3 مرات لإبرازها أكثر من أي صورة أخرى (طلب صريح)، بنفس
  // منطق صورة تمويناتا1 أعلاه. بخورنا1 ليست ضمن BANKS في storeShopSky.ts
  // فلا قيد على ترتيب الفهارس هنا، لكن أُضيفت في الذيل للاتساق.
  '/images/store/bakhurna/gallery/25.jpg',
  '/images/store/bakhurna/gallery/25.jpg',
  '/images/store/bakhurna/gallery/25.jpg',
] as const;

export const STORE_RESTAURANT_MARKETING_FRAMES = [
  '/images/store/restaurant-hero-marketing.jpg',
  '/images/store/restaurant/restaurant-02.jpg',
  // مكرّرة عمداً 3 مرات لإبرازها أكثر من أي صورة أخرى (طلب صريح)، بنفس
  // منطق تمويناتا1 وبخورنا1 ولاونجا1 أعلاه.
  '/images/store/restaurant/restaurant-03.jpg',
  '/images/store/restaurant/restaurant-03.jpg',
  '/images/store/restaurant/restaurant-03.jpg',
] as const;

const KITCHEN_GENERATED = [
  '/images/store/kitchen/kitchen-01.jpg',
  '/images/store/kitchen/kitchen-02.jpg',
  '/images/store/kitchen/kitchen-03.jpg',
  '/images/store/kitchen/kitchen-04.jpg',
  '/images/store/kitchen/kitchen-05.jpg',
  '/images/store/kitchen/kitchen-06.jpg',
  '/images/store/kitchen/kitchen-07.jpg',
] as const;

export const STORE_KITCHEN_MARKETING_FRAMES = [
  '/images/store/kitchen-hero-marketing.jpg',
  '/images/store/kitchen/kitchen-sky-ambient.jpg',
  ...KITCHEN_GENERATED,
] as const;

const OCCASION_QUICK = [
  '/images/store/lab/lab-quick-sand.jpg',
  '/images/store/lab/lab-quick-sage.jpg',
  '/images/store/lab/lab-quick-ink.jpg',
  '/images/store/lab/lab-quick-blush.jpg',
  '/images/store/lab/lab-quick-sky.jpg',
  '/images/store/lab/lab-quick-honey.jpg',
] as const;

const OCCASION_FEATURED = [
  '/images/store/lab/lab-featured-rose.jpg',
  '/images/store/lab/lab-featured-navy.jpg',
  '/images/store/lab/lab-featured-olive.jpg',
  '/images/store/lab/lab-featured-plum.jpg',
  '/images/store/lab/lab-featured-charcoal.jpg',
  '/images/store/lab/lab-featured-terracotta.jpg',
  '/images/store/lab/lab-featured-teal.jpg',
  '/images/store/lab/lab-featured-champagne.jpg',
] as const;

const OCCASION_LUXURY = [
  '/images/store/lab/lab-luxury-gold.jpg',
  '/images/store/lab/lab-luxury-ivory.jpg',
  '/images/store/lab/lab-luxury-emerald.jpg',
  '/images/store/lab/lab-luxury-garnet.jpg',
  '/images/store/lab/lab-luxury-onyx.jpg',
  '/images/store/lab/lab-luxury-sapphire.jpg',
  '/images/store/lab/lab-luxury-bronze.jpg',
  '/images/store/lab/lab-luxury-pearl.jpg',
  '/images/store/lab/lab-luxury-burgundy.jpg',
  '/images/store/lab/lab-luxury-amber.jpg',
  '/images/store/lab/lab-luxury-silver.jpg',
  '/images/store/lab/lab-luxury-rosegold.jpg',
] as const;

export const STORE_OCCASION_MARKETING_FRAMES = [
  '/images/coiffeur/card-intro.webp',
  '/images/coiffeur/card-og.png',
  ...OCCASION_QUICK,
  ...OCCASION_FEATURED,
  ...OCCASION_LUXURY,
] as const;

export const STORE_WEDDING_MARKETING_FRAMES = [
  '/images/store/lab/lab-luxury-gold.jpg',
  '/images/store/lab/lab-luxury-ivory.jpg',
  '/images/store/lab/lab-luxury-emerald.jpg',
  '/images/store/lab/lab-luxury-onyx.jpg',
  '/images/store/lab/lab-luxury-sapphire.jpg',
  '/images/store/lab/lab-luxury-bronze.jpg',
  '/images/store/lab/lab-luxury-amber.jpg',
  '/images/store/lab/lab-luxury-silver.jpg',
  '/images/store/lab/lab-wedding-panorama.jpg',
  ...STORE_LIVE_PANORAMAS,
] as const;

export const STORE_WEDDING_WOMEN_MARKETING_FRAMES = [
  '/images/store/lab/lab-luxury-rosegold.jpg',
  '/images/store/lab/lab-luxury-pearl.jpg',
  '/images/store/lab/lab-luxury-burgundy.jpg',
  '/images/store/lab/lab-luxury-garnet.jpg',
  '/images/store/lab/lab-featured-rose.jpg',
  '/images/store/lab/lab-featured-champagne.jpg',
  '/images/store/lab/lab-luxury-ivory.jpg',
  '/images/store/lab/lab-wedding-panorama.jpg',
  ...STORE_LIVE_PANORAMAS,
] as const;

export const STORE_EVENT_MARKETING_FRAMES = [
  '/images/store/lab/lab-luxury-ivory.jpg',
  '/images/store/lab/lab-luxury-gold.jpg',
  '/images/store/lab/lab-luxury-bronze.jpg',
  '/images/store/lab/lab-luxury-amber.jpg',
  '/images/store/lab/lab-luxury-onyx.jpg',
  '/images/store/lab/lab-luxury-sapphire.jpg',
  '/images/store/lab/lab-featured-navy.jpg',
  '/images/store/lab/lab-wedding-panorama.jpg',
  ...STORE_LIVE_PANORAMAS,
] as const;

export const STORE_EVENT_WOMEN_MARKETING_FRAMES = [
  '/images/store/lab/lab-luxury-rosegold.jpg',
  '/images/store/lab/lab-luxury-pearl.jpg',
  '/images/store/lab/lab-featured-rose.jpg',
  '/images/store/lab/lab-featured-plum.jpg',
  '/images/store/lab/lab-luxury-burgundy.jpg',
  '/images/store/lab/lab-luxury-garnet.jpg',
  '/images/store/lab/lab-featured-champagne.jpg',
  ...STORE_LIVE_PANORAMAS,
] as const;

/**
 * خلفيات فاتحة ومبهجة (قاعة أفراح مضiئة نهارًا) — مخصّصة لشاشة القاعة الحية فقط
 * لمنتجي أفراحي1 وأجواء1 (StoreWeddingHallStage / StoreEventHallStage)، ولا تُستخدم
 * في بكرات التسويق الأخرى حتى لا تتغيّر تلك الصفحات.
 */
export const STORE_HALL_FESTIVE_FRAMES = [
  '/images/store/lab/lab-wedding-panorama.jpg',
  '/images/store/lab/lab-luxury-ivory.jpg',
  '/images/store/lab/lab-luxury-gold.jpg',
  '/images/store/lab/lab-luxury-pearl.jpg',
  '/images/store/lab/lab-luxury-rosegold.jpg',
] as const;

export const STORE_HALAQ_MARKETING_FRAMES = [
  '/images/partners/feature_radar_2.webp',
  '/images/platform-radar-night-map.jpg',
  '/images/partners/feature_autonomy_2.webp',
  '/images/halaqmap-hero.jpg',
  '/images/partners/hero_mall_2.webp',
  '/images/partners/feature_commission_2.webp',
] as const;

export const STORE_COIFFEUR_MARKETING_FRAMES = [
  '/images/coiffeur/hero-atelier.webp',
  '/images/coiffeur/spa-still.webp',
  '/images/coiffeur/makeup-still.webp',
  '/images/coiffeur/story-path.webp',
  '/images/coiffeur/card-intro.webp',
  '/images/coiffeur/card-share.webp',
] as const;

export const STORE_OPS_MARKETING_FRAMES = [
  '/images/platform-radar-night-map.jpg',
  '/images/partners/feature_autonomy_2.webp',
  '/images/partners/feature_radar_2.webp',
  '/images/partners/hero_mall_2.webp',
] as const;

export const STORE_HALANA_MARKETING_FRAMES = [
  '/images/store/halana/halana-hero-table.jpg',
  '/images/store/halana/halana-atelier-clear.jpg',
  '/images/store/halana/halana-cake-light.jpg',
] as const;

export const STORE_LANDING_MARKETING_FRAMES = [
  '/images/halaqmap-hero.jpg',
  '/images/store/lounge-hero-marketing.jpg',
  '/images/store/grocers-hero-marketing.jpg',
  '/images/store/produce-hero-marketing.jpg',
  '/images/store/kitchen-hero-marketing.jpg',
  '/images/store/lab/lab-luxury-gold.jpg',
  '/images/store/lab/lab-luxury-rosegold.jpg',
  '/images/store/lab/lab-luxury-ivory.jpg',
  '/images/coiffeur/card-intro.webp',
  '/images/partners/feature_radar_2.webp',
  '/images/coiffeur/hero-atelier.webp',
  '/images/store/lab/lab-lounge-interior.jpg',
] as const;

const REELS: Record<StoreMarketingReelId, readonly string[]> = {
  landing: STORE_LANDING_MARKETING_FRAMES,
  lounge: STORE_LOUNGE_MARKETING_FRAMES,
  cafe: STORE_CAFE_MARKETING_FRAMES,
  grocers: STORE_GROCERS_MARKETING_FRAMES,
  produce: STORE_PRODUCE_MARKETING_FRAMES,
  dates: STORE_DATES_MARKETING_FRAMES,
  bakhurna: STORE_BAKHURNA_MARKETING_FRAMES,
  restaurant: STORE_RESTAURANT_MARKETING_FRAMES,
  kitchen: STORE_KITCHEN_MARKETING_FRAMES,
  halana: STORE_HALANA_MARKETING_FRAMES,
  wedding: STORE_WEDDING_MARKETING_FRAMES,
  'wedding-women': STORE_WEDDING_WOMEN_MARKETING_FRAMES,
  event: STORE_EVENT_MARKETING_FRAMES,
  'event-women': STORE_EVENT_WOMEN_MARKETING_FRAMES,
  occasion: STORE_OCCASION_MARKETING_FRAMES,
  halaq: STORE_HALAQ_MARKETING_FRAMES,
  coiffeur: STORE_COIFFEUR_MARKETING_FRAMES,
  ops: STORE_OPS_MARKETING_FRAMES,
};

export function storeMarketingFrames(id: StoreMarketingReelId): readonly string[] {
  return REELS[id];
}

export function storeLiveProductReel(productId: string): StoreMarketingReelId {
  if (productId === 'halaq-map') return 'halaq';
  if (productId === 'coiffeur-map') return 'coiffeur';
  if (productId === 'occasion-card') return 'occasion';
  if (productId === 'live-halls') return 'lounge';
  if (productId === 'restaurant') return 'restaurant';
  if (productId === 'kitchen') return 'kitchen';
  if (productId === 'produce') return 'produce';
  if (productId === 'dates') return 'dates';
  if (productId === 'bakhurna') return 'bakhurna';
  if (productId === 'halana') return 'halana';
  return 'landing';
}

export function storeSoftwareShotReel(index: number): StoreMarketingReelId {
  if (index === 0) return 'halaq';
  if (index === 1) return 'ops';
  return 'lounge';
}

export function loungeFrameIsWeddingHall(src: string): boolean {
  return src.includes('/images/store/live/pano-') || src.includes('lab-wedding-panorama');
}
