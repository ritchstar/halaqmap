/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * روابط مشاركة معرض حلانا1. لا إرسال جماعي نيابة عن المتخصصة.
 */
import { passCardAbsoluteUrl, passCardPath } from '@/lib/storeProductPass';

export function isHalanaYoutubeChannelUrl(url: string): boolean {
  return /youtube\.com\/(@|channel\/|c\/|user\/)/i.test(url);
}

export function splitHalanaYoutubeLines(raw: string): { channels: string[]; clips: string[] } {
  const channels: string[] = [];
  const clips: string[] = [];
  for (const line of raw.split('\n').map((item) => item.trim()).filter(Boolean)) {
    if (isHalanaYoutubeChannelUrl(line)) channels.push(line);
    else clips.push(line);
  }
  return { channels, clips };
}

export function halanaShowcaseAbsoluteUrl(token: string): string {
  const path = `/#/h/${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return `https://store.halaqmap.com${path}`;
  return `${window.location.origin}${path}`;
}

export function halanaShareCaptionAr(shopName: string, url: string): string {
  const name = shopName.trim() || 'حلانا1';
  return [`أعمال ${name}.`, 'اطّلعي على المعرض ثم اطلبي حلوى خاصة مسبقاً.', url].join('\n');
}

export function halanaPassCardShareUrl(input: { token: string; shopName: string }): string {
  const shopName = input.shopName.trim().slice(0, 40) || 'حلانا1';
  const card = {
    kind: 'halana' as const,
    token: input.token,
    name: shopName,
    role: 'specialist' as const,
    shopName,
    qrStamp: '',
  };
  if (typeof window === 'undefined') {
    return `https://store.halaqmap.com/#${passCardPath(card)}`;
  }
  return passCardAbsoluteUrl(card);
}

export function halanaWhatsappShareHref(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text.slice(0, 1200))}`;
}

export function halanaTelegramShareHref(url: string, text: string): string {
  const qs = new URLSearchParams({ url, text: text.slice(0, 400) });
  return `https://t.me/share/url?${qs.toString()}`;
}

export function halanaXShareHref(url: string, text: string): string {
  const qs = new URLSearchParams({ url, text: text.split('\n')[0] || 'حلانا1' });
  return `https://twitter.com/intent/tweet?${qs.toString()}`;
}
