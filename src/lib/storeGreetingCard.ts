/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بطاقات تهنئة مجانية لمتجر halaqmap — إصدار محلي في المتصفح، بلا تخزين.
 */
import {
  STORE_BRAND_LATIN,
  STORE_PUBLIC_NAME_AR,
  type StoreGreetingOccasion,
} from '@/config/storeFront';

export const STORE_CARD_NAME_MAX = 80;
export const STORE_CARD_CONTACT_MAX = 80;
export const STORE_CARD_EMAIL_MAX = 120;
export const STORE_CARD_PHOTO_URL_MAX = 2000;

const FONT = "Tajawal, 'Segoe UI', Tahoma, Arial, sans-serif";
const CARD_W = 1080;
const CARD_H = 1350;

type Palette = {
  bg0: string;
  bg1: string;
  accent: string;
  cream: string;
  muted: string;
  ring: string;
};

const PALETTES: Record<StoreGreetingOccasion, Palette> = {
  national_day: {
    bg0: '#06351f',
    bg1: '#0b5c36',
    accent: '#e8c547',
    cream: '#f7f4ea',
    muted: 'rgba(247, 244, 234, 0.78)',
    ring: 'rgba(232, 197, 71, 0.85)',
  },
  graduation: {
    bg0: '#071526',
    bg1: '#123258',
    accent: '#e8c872',
    cream: '#f4efe4',
    muted: 'rgba(244, 239, 228, 0.78)',
    ring: 'rgba(232, 200, 114, 0.85)',
  },
  greeting: {
    bg0: '#2a1210',
    bg1: '#5a2a22',
    accent: '#f0c9a0',
    cream: '#fff6ec',
    muted: 'rgba(255, 246, 236, 0.78)',
    ring: 'rgba(240, 201, 160, 0.85)',
  },
};

const OCCASION_COPY: Record<
  StoreGreetingOccasion,
  { title: string; wish: string; file: string }
> = {
  national_day: {
    title: 'تهنئة باليوم الوطني',
    wish: 'كل عام والوطن بخير',
    file: 'halaqmap-national-day.png',
  },
  graduation: {
    title: 'تهنئة بالتخرج',
    wish: 'ألف مبارك التخرج',
    file: 'halaqmap-graduation.png',
  },
  greeting: {
    title: 'بطاقة معايدة',
    wish: 'كل عام وأنتم بخير',
    file: 'halaqmap-greeting.png',
  },
};

export type StoreGreetingCardInput = {
  occasion: StoreGreetingOccasion;
  displayName: string;
  phone: string;
  email: string;
  photo?: CanvasImageSource | null;
};

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  const lines: string[] = [];
  let line = '';

  const pushWord = (word: string) => {
    if (ctx.measureText(word).width <= maxWidth) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
      return;
    }
    if (line) {
      lines.push(line);
      line = '';
    }
    let chunk = '';
    for (const ch of Array.from(word)) {
      const next = chunk + ch;
      if (ctx.measureText(next).width > maxWidth && chunk) {
        lines.push(chunk);
        chunk = ch;
      } else {
        chunk = next;
      }
    }
    if (chunk) line = chunk;
  };

  for (const word of tokens) {
    if (lines.length >= maxLines) break;
    pushWord(word);
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines.slice(0, maxLines);
}

async function ensureBrandFont(): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  try {
    if (!document.querySelector('link[data-hm-font="tajawal"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap';
      link.setAttribute('data-hm-font', 'tajawal');
      document.head.appendChild(link);
    }
  } catch {
    /* اختياري */
  }
  try {
    await Promise.all([
      document.fonts.load(`800 64px ${FONT}`, STORE_PUBLIC_NAME_AR),
      document.fonts.load(`700 36px ${FONT}`, STORE_BRAND_LATIN),
    ]);
  } catch {
    /* المتصفح يرسم بخط احتياطي */
  }
}

function drawPhotoCircle(
  ctx: CanvasRenderingContext2D,
  photo: CanvasImageSource | null | undefined,
  cx: number,
  cy: number,
  r: number,
  palette: Palette,
  initials: string,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r + 10, 0, Math.PI * 2);
  ctx.fillStyle = palette.ring;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = palette.bg0;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  if (photo) {
    const iw = 'width' in photo ? Number(photo.width) || r * 2 : r * 2;
    const ih = 'height' in photo ? Number(photo.height) || r * 2 : r * 2;
    const scale = Math.max((r * 2) / Math.max(iw, 1), (r * 2) / Math.max(ih, 1));
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(photo, cx - dw / 2, cy - dh / 2, dw, dh);
  } else {
    ctx.fillStyle = palette.accent;
    ctx.font = `800 72px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials || 'ـ', cx, cy + 6);
  }
  ctx.restore();
}

export function sanitizeStoreCardName(raw: string): string {
  return String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, STORE_CARD_NAME_MAX);
}

export function isAllowedStorePhotoUrl(raw: string): boolean {
  const value = raw.trim();
  if (!value || value.length > STORE_CARD_PHOTO_URL_MAX) return false;
  if (value.startsWith('data:image/')) return true;
  if (value.startsWith('blob:')) return true;
  try {
    const u = new URL(value);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function loadStoreCardPhoto(src: string): Promise<HTMLImageElement | null> {
  const url = src.trim();
  if (!isAllowedStorePhotoUrl(url)) return null;
  return new Promise((resolve) => {
    const img = new Image();
    if (url.startsWith('https:')) img.crossOrigin = 'anonymous';
    const timer = window.setTimeout(() => resolve(null), 8000);
    img.onload = () => {
      window.clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    img.src = url;
  });
}

export async function renderStoreGreetingCardPng(input: StoreGreetingCardInput): Promise<Blob> {
  await ensureBrandFont();
  const occasion = input.occasion;
  const palette = PALETTES[occasion];
  const copy = OCCASION_COPY[occasion];
  const name = sanitizeStoreCardName(input.displayName) || 'ضيف المتجر';
  const phone = String(input.phone ?? '').trim().slice(0, STORE_CARD_CONTACT_MAX);
  const email = String(input.email ?? '').trim().slice(0, STORE_CARD_EMAIL_MAX);
  const initials = Array.from(name).slice(0, 2).join('') || 'ح';

  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');

  const g = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  g.addColorStop(0, palette.bg0);
  g.addColorStop(1, palette.bg1);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  ctx.strokeStyle = palette.ring;
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 48, CARD_W - 96, CARD_H - 96);

  ctx.fillStyle = palette.accent;
  ctx.font = `800 28px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(STORE_BRAND_LATIN, CARD_W / 2, 88);
  ctx.fillStyle = palette.cream;
  ctx.font = `800 42px ${FONT}`;
  ctx.fillText(STORE_PUBLIC_NAME_AR, CARD_W / 2, 128);

  ctx.fillStyle = palette.accent;
  ctx.font = `800 48px ${FONT}`;
  ctx.fillText(copy.title, CARD_W / 2, 198);

  drawPhotoCircle(ctx, input.photo, CARD_W / 2, 470, 168, palette, initials);

  ctx.fillStyle = palette.cream;
  ctx.font = `800 56px ${FONT}`;
  const nameLines = wrapLines(ctx, name, CARD_W - 160, 2);
  nameLines.forEach((ln, i) => ctx.fillText(ln, CARD_W / 2, 690 + i * 64));

  ctx.fillStyle = palette.muted;
  ctx.font = `700 32px ${FONT}`;
  let y = 690 + nameLines.length * 64 + 28;
  if (phone) {
    ctx.fillText(phone, CARD_W / 2, y);
    y += 48;
  }
  if (email) {
    ctx.fillText(email, CARD_W / 2, y);
    y += 48;
  }

  ctx.fillStyle = palette.accent;
  ctx.font = `800 40px ${FONT}`;
  ctx.fillText(copy.wish, CARD_W / 2, Math.max(y + 36, 1080));

  ctx.fillStyle = palette.muted;
  ctx.font = `600 22px ${FONT}`;
  ctx.fillText(`${STORE_BRAND_LATIN} · ${STORE_PUBLIC_NAME_AR}`, CARD_W / 2, CARD_H - 92);

  const blob = await new Promise<Blob | null>((resolve, reject) => {
    try {
      canvas.toBlob((next) => resolve(next), 'image/png');
    } catch (err) {
      reject(err);
    }
  });
  if (!blob) throw new Error('png');
  return blob;
}

export function storeGreetingCardFilename(occasion: StoreGreetingOccasion): string {
  return OCCASION_COPY[occasion].file;
}

export async function downloadStoreGreetingCard(blob: Blob, occasion: StoreGreetingOccasion): Promise<void> {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = storeGreetingCardFilename(occasion);
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
