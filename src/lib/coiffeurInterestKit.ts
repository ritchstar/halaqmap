/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * كروت برمجية لكوافير ماب — تعريفي / تشاركي / ملف موجز.
 * هوية عنّابي/بورجندي، ليست فيروز حلاق ماب.
 */
import { PLATFORM_BRAND_LOGO_PATH } from '@/config/platformBrandIdentity';
import { COIFFEUR_BRAND_AR, COIFFEUR_CORE_PROJECT_AR } from '@/config/coiffeurMapUmbrella';
import {
  buildCoiffeurInterestBriefAr,
  coiffeurInterestPageUrl,
} from '@/config/coiffeurInterestCopy';

export type CoiffeurKitSaveResult =
  | { ok: true; method: 'download' | 'share' | 'preview' }
  | { ok: false; error: string };

const FONT = "Tajawal, 'Segoe UI', Tahoma, Arial, sans-serif";

const WINE = {
  bg0: '#14080e',
  bg1: '#2a1218',
  bg2: '#3a1820',
  cream: '#f7efe8',
  blush: '#f4d4c0',
  rose: '#e8b4a2',
  line: 'rgba(244, 212, 192, 0.45)',
} as const;

function safePngName(fileName: string, fallback: string): string {
  const raw = (fileName || fallback).trim();
  const withExt = raw.toLowerCase().endsWith('.png') ? raw : `${raw}.png`;
  const ascii = withExt.replace(/[^\w.-]+/g, '_').replace(/_+/g, '_');
  return ascii.length > 8 ? ascii : fallback;
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
      document.fonts.load('800 40px Tajawal', COIFFEUR_BRAND_AR),
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
    const isDataOrBlob = src.startsWith('data:') || src.startsWith('blob:');
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

function paintWineBackground(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, WINE.bg0);
  bg.addColorStop(0.45, WINE.bg1);
  bg.addColorStop(1, WINE.bg2);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.72, 80, 20, w * 0.55, 220, 780);
  glow.addColorStop(0, 'rgba(232, 180, 162, 0.22)');
  glow.addColorStop(1, 'rgba(232, 180, 162, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h * 0.55);

  ctx.strokeStyle = WINE.line;
  ctx.lineWidth = 5;
  roundRect(ctx, 36, 36, w - 72, h - 72, 44);
  ctx.stroke();
}

function setRtl(ctx: CanvasRenderingContext2D): void {
  ctx.textAlign = 'right';
  try {
    ctx.direction = 'rtl';
  } catch {
    /* بعض المحركات */
  }
}

function paintLogo(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement | null,
  x: number,
  y: number,
  size: number,
): void {
  if (!logo || logo.naturalWidth <= 0) return;
  try {
    ctx.save();
    roundRect(ctx, x, y, size, size, 22);
    ctx.clip();
    ctx.drawImage(logo, x, y, size, size);
    ctx.restore();
    ctx.strokeStyle = WINE.line;
    ctx.lineWidth = 3;
    roundRect(ctx, x, y, size, size, 22);
    ctx.stroke();
  } catch {
    ctx.restore();
  }
}

async function renderCardBlob(kind: 'intro' | 'share', displayName: string): Promise<Blob> {
  await ensureBrandFont();
  const logo = await loadImageSafe(PLATFORM_BRAND_LOGO_PATH);
  const w = 1080;
  const h = kind === 'share' ? 1920 : 1350;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_unavailable');

  const alias = displayName.trim() || 'شريكة كوافير ماب';
  const pageUrl = coiffeurInterestPageUrl();

  paintWineBackground(ctx, w, h);
  paintLogo(ctx, logo, w - 42 - 36 - 108, 78, 108);

  setRtl(ctx);
  ctx.fillStyle = WINE.blush;
  ctx.font = `800 32px ${FONT}`;
  ctx.fillText(COIFFEUR_BRAND_AR, w - 72, 118);
  ctx.fillStyle = 'rgba(247, 239, 232, 0.62)';
  ctx.font = `700 24px ${FONT}`;
  ctx.fillText(`تحت مظلة ${COIFFEUR_CORE_PROJECT_AR}`, w - 72, 158);

  ctx.textAlign = 'center';
  ctx.fillStyle = WINE.cream;
  ctx.font = `900 64px ${FONT}`;
  const nameLines = wrapLines(ctx, alias, w - 160, 2);
  let ny = kind === 'share' ? 620 : 430;
  for (const ln of nameLines) {
    ctx.fillText(ln, w / 2, ny);
    ny += 78;
  }

  ctx.fillStyle = WINE.rose;
  ctx.font = `800 34px ${FONT}`;
  const pitch =
    kind === 'intro'
      ? 'سطح قطاعي نسائي · استعلام مجاني · رخصة نفاذ للمنشأة بلا عمولة على الخدمة'
      : 'سجّلي اهتمامك وتلقّي التحديثات — نفس منصة حلاق ماب، سطح كوافير';
  const pitchLines = wrapLines(ctx, pitch, w - 180, 4);
  let py = ny + 48;
  for (const ln of pitchLines) {
    ctx.fillText(ln, w / 2, py);
    py += 48;
  }

  if (kind === 'intro') {
    ctx.fillStyle = 'rgba(244, 212, 192, 0.12)';
    roundRect(ctx, 90, py + 36, w - 180, 220, 28);
    ctx.fill();
    ctx.fillStyle = WINE.cream;
    ctx.font = `800 28px ${FONT}`;
    const facts = [
      'الاستعلام للمستعلمة مجاني بلا حساب',
      'المنشأة تشتري رخصة نفاذ رقمية مسبقة الدفع',
      'الكيان والدفع على حلاق ماب — ليست علامة منافسة',
    ];
    let fy = py + 92;
    for (const fact of facts) {
      ctx.fillText(fact, w / 2, fy);
      fy += 48;
    }
  }

  ctx.fillStyle = 'rgba(247, 239, 232, 0.55)';
  ctx.font = `700 26px ${FONT}`;
  ctx.textAlign = 'center';
  try {
    ctx.direction = 'ltr';
  } catch {
    /* ltr للرابط */
  }
  ctx.fillText(pageUrl.replace(/^https:\/\//, ''), w / 2, h - 88);

  return canvasToPngBlob(canvas);
}

async function savePngBlob(
  blob: Blob,
  fileName: string,
  shareTitle: string,
  preferShare: boolean,
): Promise<CoiffeurKitSaveResult> {
  try {
    const name = safePngName(fileName, 'coiffeur-map-card.png');
    const file = new File([blob], name, { type: 'image/png' });
    if (preferShare && canShareFile(file)) {
      try {
        await navigator.share({
          files: [file],
          title: shareTitle,
          text: shareTitle,
        });
        return { ok: true, method: 'share' };
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return { ok: false, error: 'cancelled' };
        }
      }
    }
    triggerAnchorDownload(blob, name);
    return { ok: true, method: 'download' };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'save_failed' };
  }
}

export async function downloadCoiffeurIntroCard(
  displayName: string,
): Promise<CoiffeurKitSaveResult> {
  const blob = await renderCardBlob('intro', displayName);
  return savePngBlob(blob, 'coiffeur-map-intro.png', COIFFEUR_BRAND_AR, false);
}

export async function shareOrSaveCoiffeurShareCard(
  displayName: string,
): Promise<CoiffeurKitSaveResult> {
  const blob = await renderCardBlob('share', displayName);
  return savePngBlob(
    blob,
    'coiffeur-map-share.png',
    COIFFEUR_BRAND_AR,
    isMobileUa(),
  );
}

export function downloadCoiffeurInterestBrief(): CoiffeurKitSaveResult {
  try {
    const text = `\uFEFF${buildCoiffeurInterestBriefAr()}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    triggerAnchorDownload(blob, 'coiffeur-map-brief.txt');
    return { ok: true, method: 'download' };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'save_failed' };
  }
}
