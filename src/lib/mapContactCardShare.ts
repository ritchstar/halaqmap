/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مشاركة بطاقة تواصل ماب — واتساب / منصات / Web Share مع صورة.
 */
import { buildWhatsAppChatHref } from '@/lib/saudiWhatsAppPhone';

export function buildMapContactWhatsAppHref(text: string, phone?: string): string {
  const trimmed = phone?.trim();
  if (trimmed) {
    const direct = buildWhatsAppChatHref(trimmed, text);
    if (direct) return direct;
  }
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildMapContactFacebookShareHref(partnerUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(partnerUrl)}`;
}

export function buildMapContactXShareHref(text: string, partnerUrl: string): string {
  const body = text.includes(partnerUrl) ? text.replace(partnerUrl, '').trim() : text;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(body)}&url=${encodeURIComponent(partnerUrl)}`;
}

export function buildMapContactTelegramShareHref(text: string, partnerUrl: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(partnerUrl)}&text=${encodeURIComponent(text)}`;
}

/** سناب لا يوفّر مشاركة صورة عبر رابط ويب — نفتح المشاركة الأصلية أو نحمّل الصورة. */
export function canNativeShareFiles(): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return false;
  try {
    const probe = new File(['x'], 'probe.png', { type: 'image/png' });
    if (typeof navigator.canShare === 'function') {
      return navigator.canShare({ files: [probe] });
    }
    return true;
  } catch {
    return false;
  }
}

export async function shareMapContactCardNative(opts: {
  title: string;
  text: string;
  partnerUrl: string;
  file?: File | null;
}): Promise<'shared' | 'cancelled' | 'unsupported'> {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return 'unsupported';
  }
  try {
    const payload: ShareData = {
      title: opts.title,
      text: opts.text,
      url: opts.partnerUrl,
    };
    if (opts.file) {
      const withFiles: ShareData = { ...payload, files: [opts.file] };
      if (typeof navigator.canShare !== 'function' || navigator.canShare(withFiles)) {
        await navigator.share(withFiles);
        return 'shared';
      }
    }
    await navigator.share(payload);
    return 'shared';
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return 'cancelled';
    throw err;
  }
}
