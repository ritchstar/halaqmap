/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * توليد لوحة QR للمتجر كـ PNG عبر Canvas + qrcode — بلا html2canvas
 * (يتفادى فشل تحليل ألوان oklch من Tailwind).
 */
import QRCode from 'qrcode';
import { STORE_VISUALS } from '@/config/storeFront';
import {
  STORE_QR_BOARD_COLORS as C,
  STORE_QR_BOARD_COPY as COPY,
  storeQrBoardTargetUrl,
} from '@/config/storeQrBoard';

const FONT = "Tajawal, 'Segoe UI', Tahoma, Arial, sans-serif";
const LOGO_PNG = STORE_VISUALS.logo;

/** ألوان العلامة — تباين عالٍ لمسح QR (كحلي على كريمي + إطار ذهبي). */
const NAVY = {
  bg0: C.navy,
  bg1: C.navyMid,
  bg2: '#12243a',
  cream: C.cream,
  gold: C.gold,
  bronze: C.bronze,
  qrDark: C.qrDark,
  qrLight: C.qrLight,
} as const;

function safePngName(fileName: string): string {
  const raw = (fileName || COPY.fileName).trim();
  const withExt = raw.toLowerCase().endsWith('.png') ? raw : `${raw}.png`;
  const ascii = withExt.replace(/[^\w.-]+/g, '_').replace(/_+/g, '_');
  return ascii.length > 8 ? ascii : COPY.fileName;
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
      document.fonts.load('800 40px Tajawal', COPY.brandAr),
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
  ctx.arcTo(x + w, y + h, x, y + h, radius);
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
  const bg = ctx.createLinearGradient(0, 0, w * 0.15, h);
  bg.addColorStop(0, NAVY.bg0);
  bg.addColorStop(0.46, NAVY.bg1);
  bg.addColorStop(1, NAVY.bg2);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.5, 0, 20, w * 0.5, 180, 720);
  glow.addColorStop(0, 'rgba(232, 197, 71, 0.28)');
  glow.addColorStop(1, 'rgba(232, 197, 71, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h * 0.55);

  const stripe = ctx.createLinearGradient(0, 0, w, 0);
  stripe.addColorStop(0, '#b8860b');
  stripe.addColorStop(0.48, '#e8c547');
  stripe.addColorStop(1, '#f4efe4');
  ctx.fillStyle = stripe;
  ctx.fillRect(0, 0, w, 12);

  ctx.strokeStyle = 'rgba(244, 239, 228, 0.28)';
  ctx.lineWidth = 3;
  roundRect(ctx, 28, 28, w - 56, h - 56, 44);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(232, 197, 71, 0.5)';
  ctx.lineWidth = 1.75;
  roundRect(ctx, 40, 40, w - 80, h - 80, 36);
  ctx.stroke();
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
    ctx.fillText(COPY.brandAr, x + size / 2, y + size / 2 + 12);
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

function setCenterRtl(ctx: CanvasRenderingContext2D): void {
  ctx.textAlign = 'center';
  try {
    ctx.direction = 'rtl';
  } catch {
    /* بعض المحركات */
  }
}

function assertStoreTargetUrl(url: string): string {
  const trimmed = (url || '').trim();
  if (!trimmed) throw new Error('qr_target_empty');
  const lower = trimmed.toLowerCase();
  if (lower.includes('kharitatalhal.com')) {
    throw new Error('qr_target_forbidden_host');
  }
  if (!/^https:\/\/store\.halaqmap\.com\/#\//i.test(trimmed)) {
    // نقبل أيضاً ناتج storeQrBoardTargetUrl على نطاقات halaqmap الفرعية أثناء المعاينة المحلية
    if (!/^https:\/\/([a-z0-9-]+\.)*halaqmap\.com\/#\//i.test(trimmed)) {
      throw new Error('qr_target_invalid_host');
    }
  }
  return trimmed;
}

/**
 * يرسم لوحة QR عمودية (9:16) بألوان العلامة ويعيد Blob PNG.
 * الرابط عبر `storeQrBoardTargetUrl()` ما لم يُمرَّر صراحةً.
 */
export async function renderStoreQrBoardPng(input?: {
  targetUrl?: string;
}): Promise<Blob> {
  await ensureBrandFont();
  const targetUrl = assertStoreTargetUrl(input?.targetUrl ?? storeQrBoardTargetUrl());
  const logo = await loadImageSafe(LOGO_PNG);

  const qrDataUrl = await QRCode.toDataURL(targetUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 880,
    color: { dark: NAVY.qrDark, light: NAVY.qrLight },
  });
  const qr = await loadImageSafe(qrDataUrl);
  if (!qr || qr.naturalWidth <= 0) throw new Error('qr_render_failed');

  const w = 1080;
  const h = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_unavailable');

  paintNavyBackground(ctx, w, h);

  const markSize = 168;
  paintLogo(ctx, logo, (w - markSize) / 2, 88, markSize);

  ctx.textAlign = 'center';
  try {
    ctx.direction = 'ltr';
  } catch {
    /* ltr لاسم الشعار */
  }
  ctx.fillStyle = NAVY.cream;
  ctx.font = `800 30px ${FONT}`;
  ctx.fillText(COPY.brandLatin, w / 2, 88 + markSize + 42);

  setCenterRtl(ctx);
  ctx.fillStyle = NAVY.gold;
  ctx.font = `800 52px ${FONT}`;
  ctx.fillText(COPY.brandAr, w / 2, 88 + markSize + 100);

  ctx.fillStyle = NAVY.cream;
  ctx.font = `800 34px ${FONT}`;
  ctx.fillText(COPY.headlineAr, w / 2, 88 + markSize + 156);

  ctx.fillStyle = 'rgba(244, 239, 228, 0.72)';
  ctx.font = `700 24px ${FONT}`;
  const leadLines = wrapLines(ctx, COPY.leadAr, w - 200, 3);
  let leadY = 88 + markSize + 206;
  for (const ln of leadLines) {
    ctx.fillText(ln, w / 2, leadY);
    leadY += 34;
  }

  const kickY = leadY + 28;
  ctx.font = `800 26px ${FONT}`;
  const kickW = Math.min(w - 280, Math.max(280, ctx.measureText(COPY.kickerAr).width + 64));
  ctx.save();
  ctx.fillStyle = 'rgba(6, 16, 24, 0.78)';
  roundRect(ctx, (w - kickW) / 2, kickY, kickW, 56, 28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(232, 197, 71, 0.55)';
  ctx.lineWidth = 2;
  roundRect(ctx, (w - kickW) / 2, kickY, kickW, 56, 28);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = NAVY.gold;
  ctx.fillText(COPY.kickerAr, w / 2, kickY + 38);

  const qrOuter = 620;
  const qrPad = 36;
  const qrInner = qrOuter - qrPad * 2;
  const qrBoxX = (w - qrOuter) / 2;
  const qrBoxY = kickY + 100;

  ctx.save();
  ctx.shadowColor = 'rgba(232, 197, 71, 0.4)';
  ctx.shadowBlur = 32;
  ctx.fillStyle = NAVY.cream;
  roundRect(ctx, qrBoxX, qrBoxY, qrOuter, qrOuter, 36);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = NAVY.gold;
  ctx.lineWidth = 10;
  roundRect(ctx, qrBoxX + 5, qrBoxY + 5, qrOuter - 10, qrOuter - 10, 32);
  ctx.stroke();
  ctx.strokeStyle = NAVY.bronze;
  ctx.lineWidth = 3;
  roundRect(ctx, qrBoxX + 18, qrBoxY + 18, qrOuter - 36, qrOuter - 36, 26);
  ctx.stroke();
  // زوايا ذهبية حول لوحة QR
  const corner = 28;
  const inset = 22;
  ctx.strokeStyle = NAVY.gold;
  ctx.lineWidth = 5;
  ctx.lineCap = 'square';
  // أعلى يمين
  ctx.beginPath();
  ctx.moveTo(qrBoxX + qrOuter - inset - corner, qrBoxY + inset);
  ctx.lineTo(qrBoxX + qrOuter - inset, qrBoxY + inset);
  ctx.lineTo(qrBoxX + qrOuter - inset, qrBoxY + inset + corner);
  ctx.stroke();
  // أعلى يسار
  ctx.beginPath();
  ctx.moveTo(qrBoxX + inset + corner, qrBoxY + inset);
  ctx.lineTo(qrBoxX + inset, qrBoxY + inset);
  ctx.lineTo(qrBoxX + inset, qrBoxY + inset + corner);
  ctx.stroke();
  // أسفل يمين
  ctx.beginPath();
  ctx.moveTo(qrBoxX + qrOuter - inset - corner, qrBoxY + qrOuter - inset);
  ctx.lineTo(qrBoxX + qrOuter - inset, qrBoxY + qrOuter - inset);
  ctx.lineTo(qrBoxX + qrOuter - inset, qrBoxY + qrOuter - inset - corner);
  ctx.stroke();
  // أسفل يسار
  ctx.beginPath();
  ctx.moveTo(qrBoxX + inset + corner, qrBoxY + qrOuter - inset);
  ctx.lineTo(qrBoxX + inset, qrBoxY + qrOuter - inset);
  ctx.lineTo(qrBoxX + inset, qrBoxY + qrOuter - inset - corner);
  ctx.stroke();
  ctx.restore();

  ctx.drawImage(qr, qrBoxX + qrPad, qrBoxY + qrPad, qrInner, qrInner);

  // شعار صغير في منتصف الرمز (تصحيح خطأ H يحافظ على المسح)
  const eye = Math.round(qrInner * 0.18);
  paintLogo(
    ctx,
    logo,
    qrBoxX + qrPad + (qrInner - eye) / 2,
    qrBoxY + qrPad + (qrInner - eye) / 2,
    eye,
  );

  try {
    ctx.direction = 'ltr';
  } catch {
    /* ltr للنطاق */
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = NAVY.gold;
  ctx.font = `800 28px ${FONT}`;
  ctx.fillText(COPY.hostLine, w / 2, qrBoxY + qrOuter + 48);

  setCenterRtl(ctx);
  ctx.fillStyle = '#d4af67';
  ctx.font = `700 22px ${FONT}`;
  ctx.fillText(COPY.verifiedAr, w / 2, qrBoxY + qrOuter + 82);

  setCenterRtl(ctx);
  ctx.fillStyle = 'rgba(244, 239, 228, 0.58)';
  ctx.font = `700 22px ${FONT}`;
  const hintLines = wrapLines(ctx, COPY.hintAr, w - 220, 2);
  let hintY = h - 88;
  for (let i = hintLines.length - 1; i >= 0; i--) {
    ctx.fillText(hintLines[i]!, w / 2, hintY);
    hintY -= 30;
  }

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

/** يرسم اللوحة ويُنزّلها كملف PNG. */
export async function downloadStoreQrBoardPng(opts?: {
  targetUrl?: string;
  fileName?: string;
}): Promise<void> {
  const blob = await renderStoreQrBoardPng({ targetUrl: opts?.targetUrl });
  triggerAnchorDownload(blob, safePngName(opts?.fileName || COPY.fileName));
}

export const STORE_QR_BOARD_PNG_COLORS = NAVY;
