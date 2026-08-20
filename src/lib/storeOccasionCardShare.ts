/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مشاركة بطاقة المناسبة — رابط بلا هاش ونص واتساب، بلا استيراد من App.
 */
import { STORE_PAID_INVITE_COPY } from '@/config/storeIssuedCardsCatalog';
import { occasionCardShareHref } from '@/lib/storeHostRedirect';

export function buildOccasionCardShareCaption(input: {
  hostName: string;
  occasionLine: string;
  whenText?: string;
  placeText?: string;
  shareUrl: string;
}): string {
  const details = [input.whenText, input.placeText]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(' · ');
  const parts = [input.occasionLine.trim(), input.hostName.trim()];
  if (details) parts.push(details);
  parts.push('', STORE_PAID_INVITE_COPY.stampAr, '', input.shareUrl);
  return parts.filter(Boolean).join('\n');
}

export function buildOccasionCardWhatsAppHref(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function occasionCardShareUrlFromToken(token: string): string {
  return occasionCardShareHref(token);
}
