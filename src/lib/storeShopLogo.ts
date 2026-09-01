/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شعار محل الحي: بيانات صورة مضغوطة فقط، بلا روابط خارجية.
 */
import { STORE_SHOP_LOGO_MAX_CHARS } from '@/config/storeShopLogo';

const JPEG = 'data:image/jpeg;base64,';
const PNG = 'data:image/png;base64,';
const B64 = /^[A-Za-z0-9+/]+={0,2}$/;

export function parseShopLogoSrc(raw: unknown, fallback = ''): string {
  if (raw == null) return fallback;
  const value = String(raw).replace(/\s+/g, '');
  if (!value) return '';
  if (value.length > STORE_SHOP_LOGO_MAX_CHARS) return fallback;
  const prefix = value.startsWith(JPEG) ? JPEG : value.startsWith(PNG) ? PNG : '';
  if (!prefix) return fallback;
  const b64 = value.slice(prefix.length);
  if (!b64 || !B64.test(b64)) return fallback;
  return value;
}
