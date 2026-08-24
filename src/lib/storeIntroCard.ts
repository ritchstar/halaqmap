/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * توليد بطاقة واجهة المتجر للمشاركة — اسم وصفة + عبارات قصيرة.
 */
import { STORE_VISUALS } from '@/config/storeFront';
import {
  STORE_BRAND_LATIN,
  STORE_INTRO_CARD_COPY as COPY,
  STORE_PUBLIC_NAME_AR,
  STORE_SATELLITE_HOST,
  storeIntroCardCta,
  storeIntroCardPitch,
} from '@/config/storeIntroCardCopy';
import {
  sanitizeStoreIntroCardName,
  sanitizeStoreIntroCardRole,
} from '@/lib/storeIntroCardShare';

export {
  sanitizeStoreIntroCardName,
  sanitizeStoreIntroCardRole,
  sanitizeStoreIntroCardText,
} from '@/lib/storeIntroCardShare';

export type StoreIntroCardSaveResult =
  | { ok: true; method: 'download' | 'share' | 'preview' }
  | { ok: false; error: string };

const FONT = "Tajawal, 'Segoe UI', Tahoma, Arial, sans-serif";
const LOGO_PNG = STORE_VISUALS.logo;

const NAVY = {
  bg0: '#061018',
  bg1: '#0c1a2e',
  bg2: '#12243a',
  cream: '#f4efe4',
  gold: '#e8c547',
  bronze: '#d4af67',
} as const;

function safePngName(fileName: string): string {
  const raw = (fileName || 'halaqmap-store-card.png').trim();
  const withExt = raw.toLowerCase().endsWith('.png') ? raw : `${raw}.png`;
  const ascii = withExt.replace(/[^\w.-]+/g, '_').replace(/_+/g, '_');
  return ascii.length > 8 ? ascii : 'halaqmap-store-card.png';
}

function isMobileUa(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  try {
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      try {
        canvas.toBlob((b) => resolve(b), 'image/png');
      } catch (err) {
        reject(err);
      }
    });
    if (blob && blob.size > 0) return blob;
  } catch {
    /* toBlob مرفوض */
  }
  const dataUrl = canvas.toDataURL('image/png');
  const res = await fetch(dataUrl);
  const fromData = await res.blob();
  if (!fromData.size) throw new Error('png_blob_failed');
  return fromData;
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
    await Promise.race([
      document.fonts.load('800 40px Tajawal', STORE_PUBLIC_NAME_AR),
      new Promise<void>((r) => setTimeout(r, 900)),
    ]);
  } catch {
    /* خط النظام */
  }
}

function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    const isAbsoluteOtherOrigin =
      /^https?:\/\//i.test(src) &&
      typeof location !== 'undefined' &&
      !src.startsWith(location.origin);
    if (isAbsoluteOtherOrigin) img.crossOrigin = 'anonymous';
    const done = (el: HTMLImageElement | null) => {
      window.clearTimeout(timer);
      resolve(el);
    };
    const timer = window.setTimeout(() => done(null), 4000);
    img.onload = () => done(img);
    img.onerror = () => done(null);
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

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
    line = chunk;
  };

  for (const word of tokens) {
    if (lines.length >= maxLines) break;
    pushWord(word);
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines.slice(0, maxLines);
}

function paintNavyBackground(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, NAVY.bg0);
  bg.addColorStop(0.42, NAVY.bg1);
  bg.addColorStop(1, NAVY.bg2);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.78, 90, 10, w * 0.55, 280, 820);
  glow.addColorStop(0, 'rgba(232, 197, 71, 0.22)');
  glow.addColorStop(1, 'rgba(232, 197, 71, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h * 0.6);

  const stripe = ctx.createLinearGradient(0, 0, w, 0);
  stripe.addColorStop(0, '#b8860b');
  stripe.addColorStop(0.45, '#e8c547');
  stripe.addColorStop(1, '#f4efe4');
  ctx.fillStyle = stripe;
  ctx.fillRect(0, 0, w, 10);

  ctx.strokeStyle = 'rgba(244, 239, 228, 0.32)';
  ctx.lineWidth = 3;
  roundRect(ctx, 36, 36, w - 72, h - 72, 48);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(232, 197, 71, 0.55)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 48, 48, w - 96, h - 96, 40);
  ctx.stroke();
}

function paintPlate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 24,
): void {
  ctx.save();
  ctx.shadowColor = 'rgba(232, 197, 71, 0.24)';
  ctx.shadowBlur = 16;
  ctx.fillStyle = 'rgba(6, 16, 24, 0.78)';
  roundRect(ctx, x, y, w, h, radius);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(232, 197, 71, 0.7)';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, radius);
  ctx.stroke();
  ctx.restore();
}

function paintLogo(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement | null,
  x: number,
  y: number,
  size: number,
): void {
  ctx.save();
  ctx.shadowColor = 'rgba(232, 197, 71, 0.55)';
  ctx.shadowBlur = 28;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2 + 6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(232, 197, 71, 0.18)';
  ctx.fill();
  ctx.restore();

  if (!logo || logo.naturalWidth <= 0) {
    ctx.fillStyle = NAVY.cream;
    ctx.font = `800 36px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(STORE_PUBLIC_NAME_AR, x + size / 2, y + size / 2);
    return;
  }
  try {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(logo, x, y, size, size);
    ctx.restore();
    ctx.strokeStyle = 'rgba(232, 197, 71, 0.92)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();
  } catch {
    ctx.restore();
  }
}

function paintMoodBand(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement | null,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  if (!photo || photo.naturalWidth <= 0) return;
  ctx.save();
  roundRect(ctx, x, y, w, h, 28);
  ctx.clip();
  const scale = Math.max(w / photo.naturalWidth, h / photo.naturalHeight);
  const dw = photo.naturalWidth * scale;
  const dh = photo.naturalHeight * scale;
  ctx.drawImage(photo, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  const veil = ctx.createLinearGradient(x, y, x, y + h);
  veil.addColorStop(0, 'rgba(6, 16, 24, 0.15)');
  veil.addColorStop(1, 'rgba(6, 16, 24, 0.45)');
  ctx.fillStyle = veil;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  ctx.strokeStyle = 'rgba(244, 239, 228, 0.55)';
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 28);
  ctx.stroke();
}

function setCenterRtl(ctx: CanvasRenderingContext2D): void {
  ctx.textAlign = 'center';
  try {
    ctx.direction = 'rtl';
  } catch {
    /* بعض المحركات */
  }
}

function paintCenteredPlateLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  plateX: number,
  plateY: number,
  plateW: number,
  plateH: number,
  lineHeight: number,
): void {
  const usable = lines.length ? lines : [''];
  const blockH = usable.length * lineHeight;
  let y = plateY + (plateH - blockH) / 2 + lineHeight * 0.72;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  try {
    ctx.direction = 'ltr';
  } catch {
    /* موضع الرسم يبقى وسط الخانة */
  }
  const cx = plateX + plateW / 2;
  for (const ln of usable) {
    ctx.fillText(ln, cx, y);
    y += lineHeight;
  }
  ctx.restore();
}

export async function renderStoreIntroCardPng(input: {
  displayName: string;
  role: string;
  qrDataUrl: string | null;
}): Promise<Blob> {
  await ensureBrandFont();
  const logo = await loadImageSafe(LOGO_PNG);
  const photo = await loadImageSafe(STORE_VISUALS.radar);
  const qr = input.qrDataUrl ? await loadImageSafe(input.qrDataUrl) : null;

  const w = 1080;
  const h = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_unavailable');

  const name = sanitizeStoreIntroCardName(input.displayName);
  const role = sanitizeStoreIntroCardRole(input.role);
  if (!name || !role) throw new Error('card_fields_required');
  const pitch = storeIntroCardPitch(role);
  const cta = storeIntroCardCta(role);

  paintNavyBackground(ctx, w, h);

  const markSize = 148;
  paintLogo(ctx, logo, (w - markSize) / 2, 44, markSize);

  ctx.textAlign = 'center';
  try {
    ctx.direction = 'ltr';
  } catch {
    /* ltr لاسم الشعار */
  }
  ctx.fillStyle = NAVY.cream;
  ctx.font = `800 28px ${FONT}`;
  ctx.fillText(STORE_BRAND_LATIN, w / 2, 44 + markSize + 36);

  setCenterRtl(ctx);
  ctx.fillStyle = NAVY.gold;
  ctx.font = `800 26px ${FONT}`;
  ctx.fillText(STORE_PUBLIC_NAME_AR, w / 2, 44 + markSize + 70);

  let cursorY = 44 + markSize + 88;
  if (pitch.kicker) {
    ctx.font = `800 22px ${FONT}`;
    const kickW = Math.min(w - 280, Math.max(280, ctx.measureText(pitch.kicker).width + 48));
    paintPlate(ctx, (w - kickW) / 2, cursorY, kickW, 44, 22);
    ctx.fillStyle = NAVY.gold;
    ctx.fillText(pitch.kicker, w / 2, cursorY + 30);
    cursorY += 56;
  }

  paintMoodBand(ctx, photo, 92, cursorY, w - 184, 118);
  const nameTop = photo && photo.naturalWidth > 0 ? cursorY + 132 : cursorY + 8;
  paintPlate(ctx, 92, nameTop, w - 184, 118, 24);
  ctx.fillStyle = NAVY.cream;
  ctx.font = `900 44px ${FONT}`;
  const namePlateW = w - 184;
  const nameLines = wrapLines(ctx, name, namePlateW - 76, 2);
  paintCenteredPlateLines(ctx, nameLines, 92, nameTop, namePlateW, 118, 46);

  const roleY = nameTop + 130;
  const roleLines = wrapLines(ctx, role, 640, 2);
  ctx.font = `800 26px ${FONT}`;
  const roleW = Math.min(
    w - 240,
    Math.max(280, Math.max(...roleLines.map((ln) => ctx.measureText(ln).width)) + 56),
  );
  const roleH = roleLines.length === 1 ? 52 : 84;
  paintPlate(ctx, (w - roleW) / 2, roleY, roleW, roleH, 26);
  ctx.fillStyle = NAVY.gold;
  paintCenteredPlateLines(ctx, roleLines, (w - roleW) / 2, roleY, roleW, roleH, 34);

  const pitchY = roleY + roleH + 16;
  const pitchH = pitch.invite ? 168 : 148;
  paintPlate(ctx, 92, pitchY, w - 184, pitchH, 22);
  ctx.fillStyle = NAVY.cream;
  ctx.font = `900 30px ${FONT}`;
  ctx.fillText(pitch.headline, w / 2, pitchY + 44);
  ctx.fillStyle = NAVY.gold;
  ctx.font = `800 22px ${FONT}`;
  const tagLines = wrapLines(ctx, pitch.tagline, w - 260, 2);
  let ty = pitchY + 80;
  for (const ln of tagLines) {
    ctx.fillText(ln, w / 2, ty);
    ty += 30;
  }
  ctx.fillStyle = NAVY.bronze;
  ctx.font = `800 20px ${FONT}`;
  ctx.fillText(COPY.sectors, w / 2, ty + 6);
  if (pitch.invite) {
    ctx.fillStyle = NAVY.gold;
    ctx.font = `800 20px ${FONT}`;
    ctx.fillText(pitch.invite, w / 2, ty + 34);
  }

  const ctaW = 600;
  const ctaY = pitchY + pitchH + 16;
  ctx.save();
  ctx.shadowColor = 'rgba(232, 197, 71, 0.45)';
  ctx.shadowBlur = 16;
  const ctaGrad = ctx.createLinearGradient((w - ctaW) / 2, ctaY, (w + ctaW) / 2, ctaY);
  ctaGrad.addColorStop(0, '#f4efe4');
  ctaGrad.addColorStop(0.5, '#e8c547');
  ctaGrad.addColorStop(1, '#b8860b');
  ctx.fillStyle = ctaGrad;
  roundRect(ctx, (w - ctaW) / 2, ctaY, ctaW, 62, 31);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#061018';
  ctx.font = `900 26px ${FONT}`;
  ctx.fillText(cta, w / 2, ctaY + 42);

  const qrSize = 118;
  const qrY = h - 214;
  if (qr && qr.naturalWidth > 0) {
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, (w - qrSize) / 2 - 8, qrY - 8, qrSize + 16, qrSize + 16, 14);
    ctx.fill();
    ctx.drawImage(qr, (w - qrSize) / 2, qrY, qrSize, qrSize);
  }

  ctx.fillStyle = NAVY.cream;
  ctx.font = `800 20px ${FONT}`;
  try {
    ctx.direction = 'ltr';
  } catch {
    /* ltr للنطاق */
  }
  ctx.textAlign = 'center';
  ctx.fillText(STORE_SATELLITE_HOST, w / 2, h - 64);

  setCenterRtl(ctx);
  ctx.fillStyle = NAVY.gold;
  ctx.font = `800 18px ${FONT}`;
  ctx.fillText(COPY.scanHint, w / 2, h - 36);

  return canvasToPngBlob(canvas);
}

function triggerAnchorDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}

function canShareFile(file: File): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return false;
  try {
    if (typeof navigator.canShare === 'function') return navigator.canShare({ files: [file] });
    return true;
  } catch {
    return false;
  }
}

export async function saveStoreIntroCardPng(opts: {
  blob: Blob;
  shareTitle: string;
  shareText: string;
  preferShare: boolean;
}): Promise<StoreIntroCardSaveResult> {
  try {
    const name = safePngName('halaqmap-store-card.png');
    const file = new File([opts.blob], name, { type: 'image/png' });
    if (opts.preferShare && canShareFile(file)) {
      try {
        const withFiles: ShareData = {
          files: [file],
          title: opts.shareTitle,
          text: opts.shareText,
        };
        if (typeof navigator.canShare !== 'function' || navigator.canShare(withFiles)) {
          await navigator.share(withFiles);
          return { ok: true, method: 'share' };
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return { ok: false, error: 'cancelled' };
        }
      }
    }
    triggerAnchorDownload(opts.blob, name);
    return { ok: true, method: 'download' };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'save_failed' };
  }
}

export function storeIntroCardFilename(): string {
  return safePngName('halaqmap-store-card.png');
}

export function shouldPreferNativeShare(): boolean {
  return isMobileUa();
}

export function buildStoreIntroCardWhatsAppHref(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildStoreIntroCardFacebookHref(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export function buildStoreIntroCardXHref(text: string, url: string): string {
  const body = text.includes(url) ? text.replace(url, '').trim() : text;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(body)}&url=${encodeURIComponent(url)}`;
}

export function buildStoreIntroCardTelegramHref(text: string, url: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

export async function shareStoreIntroCardNative(opts: {
  title: string;
  text: string;
  url: string;
  file?: File | null;
}): Promise<'shared' | 'cancelled' | 'unsupported'> {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return 'unsupported';
  }
  try {
    const payload: ShareData = {
      title: opts.title,
      text: opts.text,
      url: opts.url,
    };
    if (opts.file) {
      const withFiles: ShareData = {
        files: [opts.file],
        title: opts.title,
        text: opts.text,
      };
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
