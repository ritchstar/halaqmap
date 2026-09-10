/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * أيقونات روابط منتجات المتجر — إيموجي معبّرة، بلا حروف عربية كرموز.
 */
export type StoreProductIconId =
  | 'wedding'
  | 'event'
  | 'lounge'
  | 'grocers'
  | 'restaurant'
  | 'cafe'
  | 'kitchen'
  | 'produce'
  | 'halana'
  | 'dates'
  | 'affiliate';

/** هوية المنتج — شبكة المسوّقين وعناوين الأيقونات. */
export const STORE_PRODUCT_EMOJI: Record<StoreProductIconId, string> = {
  wedding: '💍',
  event: '🎊',
  lounge: '🛋️',
  grocers: '🛒',
  restaurant: '🍽️',
  cafe: '☕',
  kitchen: '🍲',
  produce: '🥬',
  halana: '🎂',
  dates: '🌴',
  affiliate: '🤝',
};

/** دور الرابط — صفحة الزبون، لوحة التشغيل، شاشة، إلخ. */
export const STORE_LINK_ROLE_EMOJI = {
  shop: '📱',
  desk: '📋',
  host: '🎛️',
  display: '📺',
  gallery: '🖼️',
  guestShare: '✨',
  loungeGuest: '👋',
  screenHost: '🖥️',
  screenQuiet: '🤫',
  screenMenu: '📜',
  emailConfirm: '✉️',
  gift: '🎁',
  storeHome: '🏪',
  affiliateLogin: '🔑',
} as const;

export function storeProductEmoji(id: StoreProductIconId): string {
  return STORE_PRODUCT_EMOJI[id];
}
