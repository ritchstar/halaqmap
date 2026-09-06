/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * روابط مشاركة صفحات الحي. لا إرسال جماعي نيابة عن المشغّل.
 */
export function liveShopWhatsappShareHref(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text.slice(0, 1200))}`;
}

export function liveShopTelegramShareHref(url: string, text: string): string {
  const qs = new URLSearchParams({ url, text: text.slice(0, 400) });
  return `https://t.me/share/url?${qs.toString()}`;
}

export function liveShopXShareHref(url: string, text: string): string {
  const qs = new URLSearchParams({ url, text: text.split('\n')[0] || '' });
  return `https://twitter.com/intent/tweet?${qs.toString()}`;
}
