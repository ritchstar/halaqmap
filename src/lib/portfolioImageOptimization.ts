import { IMAGES } from '@/assets/images';
import { browserSupportsWebpExport } from '@/lib/imageCanvasCore';
import {
  optimizeImageToBase64ForPlatformVariant,
  platformRawFileTooLargeMessage,
} from '@/lib/platformImageTransform';

/** هدف تقريبي لحجم كل صورة في معرض الأعمال بعد الضغط (WebP). */
export const PORTFOLIO_TARGET_MAX_BYTES = 100 * 1024;

const PORTFOLIO_WATERMARK_OPACITY = 0.4;

function loadImageFromUrl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('logo'));
    img.src = src;
  });
}

let watermarkLogoPromise: Promise<HTMLImageElement | null> | null = null;

function getPortfolioWatermarkLogo(): Promise<HTMLImageElement | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (!watermarkLogoPromise) {
    const rel = IMAGES.HALAQMAP_LOGO_20260409_073322_83;
    const abs = rel.startsWith('http') ? rel : new URL(rel, window.location.origin).href;
    watermarkLogoPromise = loadImageFromUrl(abs)
      .then((img) => img)
      .catch(() => null);
  }
  return watermarkLogoPromise;
}

function drawPortfolioWatermark(
  ctx: CanvasRenderingContext2D,
  dw: number,
  dh: number,
  logo: HTMLImageElement | null,
): void {
  const pad = Math.max(10, Math.round(Math.min(dw, dh) * 0.022));
  const minDim = Math.min(dw, dh);

  ctx.save();
  ctx.globalAlpha = PORTFOLIO_WATERMARK_OPACITY;

  if (logo && logo.naturalWidth > 0 && logo.naturalHeight > 0) {
    const maxLogoW = minDim * 0.28;
    const scale = maxLogoW / logo.naturalWidth;
    const lw = Math.max(1, logo.naturalWidth * scale);
    const lh = Math.max(1, logo.naturalHeight * scale);
    const x = dw - pad - lw;
    const y = dh - pad - lh;
    ctx.shadowColor = 'rgba(0,0,0,0.28)';
    ctx.shadowBlur = Math.max(2, minDim * 0.008);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    ctx.drawImage(logo, x, y, lw, lh);
  } else {
    const fontPx = Math.max(13, Math.round(minDim * 0.038));
    ctx.font = `600 ${fontPx}px "Segoe UI", system-ui, Tahoma, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    const text = 'حلاق ماب';
    ctx.shadowColor = 'rgba(0,0,0,0.32)';
    ctx.shadowBlur = Math.max(2, minDim * 0.01);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.22)';
    ctx.lineWidth = Math.max(1, fontPx / 16);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    const x = dw - pad;
    const y = dh - pad;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
  }

  ctx.restore();
}

export type BarberPortfolioOptimizeMode = 'gallery' | 'featured_banner';

/**
 * ضغط صورة معرض الأعمال — WebP مع ختم المنصة.
 * `featured_banner`: قص 5:2 ليتوافق مع بنر البطاقة العامة.
 */
export async function optimizeImageFileForBarberPortfolio(
  file: File,
  mode: BarberPortfolioOptimizeMode = 'gallery',
): Promise<{ ok: true; imageBase64: string; mimeType: 'image/webp' } | { ok: false; error: string }> {
  if (!browserSupportsWebpExport()) {
    return {
      ok: false,
      error: 'المتصفح لا يدعم تصدير WebP. حدّث المتصفح أو جرّب جهازاً آخر.',
    };
  }

  const logo = await getPortfolioWatermarkLogo();
  const variant = mode === 'featured_banner' ? 'gallery_banner' : 'gallery_watermarked';
  const result = await optimizeImageToBase64ForPlatformVariant(file, variant, {
    fileNameFallback: mode === 'featured_banner' ? 'banner' : 'gallery',
    afterDraw: (ctx, dw, dh) => {
      drawPortfolioWatermark(ctx, dw, dh, logo);
    },
  });

  if (!result.ok) return result;
  if (result.mimeType !== 'image/webp') {
    return { ok: false, error: 'تعذر تصدير WebP لمعرض الأعمال.' };
  }
  return { ok: true, imageBase64: result.imageBase64, mimeType: 'image/webp' };
}

export function portfolioRawFileTooLargeMessage(file: File): string | null {
  return platformRawFileTooLargeMessage(file, 15);
}
