import { IMAGES } from '@/assets/images';

/** هدف تقريبي لحجم كل صورة في معرض الأعمال بعد الضغط (WebP). */
export const PORTFOLIO_TARGET_MAX_BYTES = 100 * 1024;

/** شفافية الختم الذكي (معرض الأعمال فقط) — بين 30% و50% */
const PORTFOLIO_WATERMARK_OPACITY = 0.4;

const MAX_EDGE_FIRST = 1600;
const MIN_EDGE = 480;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('تعذر قراءة ملف الصورة'));
    };
    img.src = url;
  });
}

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

/** شعار المنصة من الأصول المحلية — يُحمّل مرة واحدة لكل جلسة المتصفح. */
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
  logo: HTMLImageElement | null
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

function canvasToWebpBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/webp', quality);
  });
}

function computeDrawSize(
  naturalWidth: number,
  naturalHeight: number,
  maxW: number,
  maxH: number
): { dw: number; dh: number } {
  const r = Math.min(maxW / naturalWidth, maxH / naturalHeight, 1);
  return {
    dw: Math.max(1, Math.round(naturalWidth * r)),
    dh: Math.max(1, Math.round(naturalHeight * r)),
  };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result ?? '');
      const i = s.indexOf(',');
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    r.onerror = () => reject(new Error('read'));
    r.readAsDataURL(blob);
  });
}

/**
 * ضغط وتصغير صورة لمعرض الأعمال — ختم «حلاق ماب» محلي في الزاوية السفلية ثم WebP ~100KB.
 * لا يُستخدم لبنر الخريطة (مسار آخر).
 */
export async function optimizeImageFileForBarberPortfolio(
  file: File
): Promise<{ ok: true; imageBase64: string; mimeType: 'image/webp' } | { ok: false; error: string }> {
  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'الملف ليس صورةً (PNG أو JPEG أو WebP).' };
  }

  let img: HTMLImageElement;
  try {
    img = await loadImageFromFile(file);
  } catch {
    return { ok: false, error: 'تعذر تحميل الصورة. جرّب ملفاً آخر.' };
  }

  const logo = await getPortfolioWatermarkLogo();

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { ok: false, error: 'المتصفح لا يدعم معالجة الصور في هذه البيئة.' };
  }

  let maxW = MAX_EDGE_FIRST;
  let maxH = MAX_EDGE_FIRST;
  let { dw, dh } = computeDrawSize(img.naturalWidth, img.naturalHeight, maxW, maxH);

  for (let attempt = 0; attempt < 10; attempt++) {
    canvas.width = dw;
    canvas.height = dh;
    ctx.clearRect(0, 0, dw, dh);
    ctx.drawImage(img, 0, 0, dw, dh);
    drawPortfolioWatermark(ctx, dw, dh, logo);

    let quality = 0.82;
    let best: Blob | null = null;
    for (let qStep = 0; qStep < 16; qStep++) {
      const blob = await canvasToWebpBlob(canvas, quality);
      if (!blob) {
        return {
          ok: false,
          error: 'تعذر تصدير WebP. جرّب متصفحاً أحدث أو صورة بصيغة مختلفة.',
        };
      }
      if (blob.size <= PORTFOLIO_TARGET_MAX_BYTES) {
        best = blob;
        break;
      }
      best = blob;
      quality -= 0.055;
      if (quality < 0.38) break;
    }

    if (best && best.size <= PORTFOLIO_TARGET_MAX_BYTES) {
      const b64 = await blobToBase64(best);
      return { ok: true, imageBase64: b64, mimeType: 'image/webp' };
    }

    maxW = Math.max(MIN_EDGE, Math.round(maxW * 0.88));
    maxH = Math.max(MIN_EDGE, Math.round(maxH * 0.88));
    const next = computeDrawSize(img.naturalWidth, img.naturalHeight, maxW, maxH);
    dw = next.dw;
    dh = next.dh;
  }

  return {
    ok: false,
    error:
      'تعذر ضغط الصورة لتقترب من 100 كيلوبايت مع الحفاظ على وضوح معقول. جرّب صورةً أبسط أو أصغر.',
  };
}

export function portfolioRawFileTooLargeMessage(file: File): string | null {
  const rawCap = 15 * 1024 * 1024;
  if (file.size > rawCap) {
    return `حجم الملف كبير جداً (${(file.size / (1024 * 1024)).toFixed(1)} ميجابايت). اختر صورة أصغر من 15 ميجابايت.`;
  }
  return null;
}
