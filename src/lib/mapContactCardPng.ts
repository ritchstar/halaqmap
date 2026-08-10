/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تصدير بطاقة تواصل ماب كـ PNG عبر Canvas — مع حفظ متوافق مع الجوال.
 */
import { MAP_CONTACT_CARD_PRODUCT_NAME_AR } from '@/config/mapContactCardCopy';
import { PLATFORM_BRAND_LOGO_PATH } from '@/config/platformBrandIdentity';

export type MapContactCardPngInput = {
  alias: string;
  message: string;
  cityNameAr: string;
  iconGlyph: string;
  qrDataUrl: string | null;
};

export type MapContactCardSaveResult =
  | { ok: true; method: 'download' | 'share' | 'preview' }
  | { ok: false; error: string };

const W = 1080;
const H = 1920;
const FONT = "Tajawal, 'Segoe UI', Tahoma, Arial, sans-serif";

function safeFileName(fileName: string): string {
  const raw = (fileName || 'halaqmap-contact-card.png').trim();
  const withExt = raw.toLowerCase().endsWith('.png') ? raw : `${raw}.png`;
  // أسماء عربية تكسر التحميل على بعض متصفحات الجوال
  const ascii = withExt.replace(/[^\w.\-]+/g, '_').replace(/_+/g, '_');
  return ascii.length > 8 ? ascii : 'halaqmap-contact-card.png';
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
    /* toBlob مرفوض (لوحة ملوّثة) — نجرّب dataURL */
  }

  let dataUrl: string;
  try {
    dataUrl = canvas.toDataURL('image/png');
  } catch (err) {
    throw new Error(
      err instanceof Error ? `canvas_export:${err.name}` : 'canvas_export_failed',
    );
  }
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
      document.fonts.load("800 40px Tajawal", 'حلاق ماب'),
      new Promise<void>((r) => setTimeout(r, 900)),
    ]);
  } catch {
    /* نكمل بخط النظام */
  }
}

/**
 * لا نضبط crossOrigin على مسارات نفس الأصل — يمنع تلوّث الـ canvas على الجوال.
 * data: و blob: تُحمَّل كما هي.
 */
function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    const isDataOrBlob = src.startsWith('data:') || src.startsWith('blob:');
    const isAbsoluteOtherOrigin =
      /^https?:\/\//i.test(src) &&
      typeof location !== 'undefined' &&
      !src.startsWith(location.origin);
    if (isAbsoluteOtherOrigin) {
      img.crossOrigin = 'anonymous';
    }
    const done = (el: HTMLImageElement | null) => {
      window.clearTimeout(timer);
      resolve(el);
    };
    const timer = window.setTimeout(() => done(null), 4000);
    img.onload = () => done(img);
    img.onerror = () => done(null);
    img.src = isDataOrBlob || src.startsWith('/') ? src : src;
  });
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length >= maxLines) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines.slice(0, maxLines);
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
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function paintCard(
  ctx: CanvasRenderingContext2D,
  input: MapContactCardPngInput,
  logo: HTMLImageElement | null,
  qr: HTMLImageElement | null,
): void {
  const alias = input.alias.trim() || 'زائر ماب';
  const message = input.message.trim() || 'أفضل البحث والتواصل عبر حلاق ماب.';
  const city = input.cityNameAr.trim() || 'المملكة';
  const glyph = input.iconGlyph.trim() || '✦';

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0a1f2e');
  bg.addColorStop(0.48, '#041016');
  bg.addColorStop(1, '#0c1a14');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W / 2, 0, 40, W / 2, 180, 720);
  glow.addColorStop(0, 'rgba(45,212,191,0.28)');
  glow.addColorStop(1, 'rgba(45,212,191,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H * 0.55);

  ctx.strokeStyle = 'rgba(94, 234, 212, 0.4)';
  ctx.lineWidth = 6;
  roundRect(ctx, 36, 36, W - 72, H - 72, 48);
  ctx.stroke();

  ctx.fillStyle = '#006c35';
  ctx.fillRect(42, 42, (W - 84) * 0.72, 14);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(42 + (W - 84) * 0.72, 42, (W - 84) * 0.28, 14);

  if (logo && logo.naturalWidth > 0) {
    const s = 110;
    const lx = W - 42 - 36 - s;
    const ly = 78;
    try {
      ctx.save();
      roundRect(ctx, lx, ly, s, s, 28);
      ctx.clip();
      ctx.drawImage(logo, lx, ly, s, s);
      ctx.restore();
      ctx.strokeStyle = 'rgba(45,212,191,0.45)';
      ctx.lineWidth = 4;
      roundRect(ctx, lx, ly, s, s, 28);
      ctx.stroke();
    } catch {
      ctx.restore();
    }
  }

  ctx.textAlign = 'right';
  try {
    ctx.direction = 'rtl';
  } catch {
    /* بعض المحركات لا تدعم direction */
  }
  ctx.fillStyle = 'rgba(94, 234, 212, 0.95)';
  ctx.font = `800 34px ${FONT}`;
  ctx.fillText(MAP_CONTACT_CARD_PRODUCT_NAME_AR, W - 72, 120);
  ctx.fillStyle = '#94a3b8';
  ctx.font = `700 28px ${FONT}`;
  ctx.fillText('طلب تواصل من زبون', W - 72, 168);

  const cx = W / 2;
  const cy = 520;
  ctx.beginPath();
  ctx.arc(cx, cy, 120, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(45, 212, 191, 0.16)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(94, 234, 212, 0.45)';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.font = `800 96px ${FONT}`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(glyph, cx, cy + 34);

  const seal = `ختم ${city}`;
  ctx.font = `800 36px ${FONT}`;
  const sealW = Math.min(ctx.measureText(seal).width + 80, W - 160);
  const sealX = (W - sealW) / 2;
  const sealY = 700;
  ctx.fillStyle = 'rgba(245, 158, 11, 0.14)';
  roundRect(ctx, sealX, sealY, sealW, 72, 36);
  ctx.fill();
  ctx.strokeStyle = 'rgba(252, 211, 77, 0.45)';
  ctx.lineWidth = 3;
  roundRect(ctx, sealX, sealY, sealW, 72, 36);
  ctx.stroke();
  ctx.fillStyle = '#fef3c7';
  ctx.fillText(seal, cx, sealY + 48);

  ctx.fillStyle = '#ffffff';
  ctx.font = `900 64px ${FONT}`;
  const nameLines = wrapLines(ctx, alias, W - 160, 2);
  let ny = 860;
  for (const ln of nameLines) {
    ctx.fillText(ln, cx, ny);
    ny += 74;
  }

  ctx.fillStyle = '#e2e8f0';
  ctx.font = `700 40px ${FONT}`;
  const msgLines = wrapLines(ctx, message, W - 180, 5);
  let my = ny + 36;
  for (const ln of msgLines) {
    ctx.fillText(ln, cx, my);
    my += 56;
  }

  const qrSize = 220;
  const qrPad = 72;
  const qrBoxX = qrPad;
  const qrBoxY = H - qrPad - qrSize - 24;

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, qrBoxX - 14, qrBoxY - 14, qrSize + 28, qrSize + 28, 28);
  ctx.fill();

  if (qr && qr.naturalWidth > 0) {
    try {
      ctx.drawImage(qr, qrBoxX, qrBoxY, qrSize, qrSize);
    } catch {
      ctx.fillStyle = '#64748b';
      ctx.font = `700 28px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText('QR', qrBoxX + qrSize / 2, qrBoxY + qrSize / 2 + 10);
    }
  } else {
    ctx.fillStyle = '#64748b';
    ctx.font = `700 28px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('QR', qrBoxX + qrSize / 2, qrBoxY + qrSize / 2 + 10);
  }

  ctx.textAlign = 'right';
  try {
    ctx.direction = 'rtl';
  } catch {
    /* ignore */
  }
  ctx.fillStyle = '#99f6e4';
  ctx.font = `900 40px ${FONT}`;
  ctx.fillText('حلاق ماب', W - qrPad, qrBoxY + 48);
  ctx.fillStyle = '#64748b';
  ctx.font = `800 26px ${FONT}`;
  ctx.textAlign = 'left';
  try {
    ctx.direction = 'ltr';
  } catch {
    /* ignore */
  }
  ctx.fillText('HALAQ MAP', W - qrPad - 220, qrBoxY + 96);
  ctx.textAlign = 'right';
  try {
    ctx.direction = 'rtl';
  } catch {
    /* ignore */
  }
  ctx.fillStyle = '#94a3b8';
  ctx.font = `700 28px ${FONT}`;
  const footLines = wrapLines(ctx, 'امسح الرمز للانضمام والظهور عند الطلب', 420, 2);
  let fy = qrBoxY + 150;
  for (const ln of footLines) {
    ctx.fillText(ln, W - qrPad, fy);
    fy += 40;
  }
}

export async function renderMapContactCardPngBlob(
  input: MapContactCardPngInput,
): Promise<Blob> {
  await ensureBrandFont();

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('canvas_unavailable');

  const [logo, qr] = await Promise.all([
    loadImageSafe(PLATFORM_BRAND_LOGO_PATH),
    input.qrDataUrl ? loadImageSafe(input.qrDataUrl) : Promise.resolve(null),
  ]);

  try {
    paintCard(ctx, input, logo, qr);
    return await canvasToPngBlob(canvas);
  } catch {
    // إعادة رسم بلا صور خارجية إن تلوّثت اللوحة
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    paintCard(ctx, input, null, qr?.src?.startsWith('data:') ? qr : null);
    return canvasToPngBlob(canvas);
  }
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

function canSharePngFile(file: File): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return false;
  try {
    if (typeof navigator.canShare === 'function') {
      return navigator.canShare({ files: [file] });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * يحفظ البطاقة بأفضل طريقة متاحة على الجهاز:
 * 1) مشاركة النظام (جوال — حفظ للاستوديو / واتساب / سناب)
 * 2) تنزيل مباشر
 * 3) معاينة للضغط المطوّل (iOS)
 */
export async function saveMapContactCardPng(
  input: MapContactCardPngInput,
  fileName: string,
  opts?: { preferShareOnMobile?: boolean; openPreview?: (url: string) => void },
): Promise<MapContactCardSaveResult> {
  try {
    const blob = await renderMapContactCardPngBlob(input);
    const name = safeFileName(fileName);
    const file = new File([blob], name, { type: 'image/png' });
    const preferShare = opts?.preferShareOnMobile !== false && isMobileUa();

    if (preferShare && canSharePngFile(file)) {
      try {
        await navigator.share({
          files: [file],
          title: MAP_CONTACT_CARD_PRODUCT_NAME_AR,
          text: MAP_CONTACT_CARD_PRODUCT_NAME_AR,
        });
        return { ok: true, method: 'share' };
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return { ok: false, error: 'cancelled' };
        }
        /* نكمل للتنزيل */
      }
    }

    triggerAnchorDownload(blob, name);

    // Safari iOS يتجاهل download غالباً — نفتح معاينة للحفظ بالضغط المطوّل
    if (isMobileUa() && opts?.openPreview) {
      const url = URL.createObjectURL(blob);
      opts.openPreview(url);
      return { ok: true, method: 'preview' };
    }

    return { ok: true, method: 'download' };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'save_failed',
    };
  }
}

/** @deprecated استخدم saveMapContactCardPng */
export async function downloadMapContactCardPng(
  input: MapContactCardPngInput,
  fileName: string,
): Promise<void> {
  const result = await saveMapContactCardPng(input, fileName, {
    preferShareOnMobile: false,
  });
  if (!result.ok) throw new Error(result.error);
}

export async function mapContactCardPngFile(
  input: MapContactCardPngInput,
  fileName: string,
): Promise<File> {
  const blob = await renderMapContactCardPngBlob(input);
  return new File([blob], safeFileName(fileName), { type: 'image/png' });
}
