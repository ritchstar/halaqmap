import {
  BARBER_BANNER_DISPLAY_ASPECT_RATIO,
  BARBER_BANNER_MAX_FILE_BYTES,
  BARBER_BANNER_MAX_HEIGHT,
  BARBER_BANNER_MAX_WIDTH,
} from '@/config/barberBannerImagePolicy';
import {
  browserSupportsWebpExport,
  canvasToBlob,
  computeCropSourceRect,
  computeDrawSize,
  fileBaseName,
  loadImageFromFile,
  type CanvasOutputMime,
} from '@/lib/imageCanvasCore';

/** أغراض الصورة على المنصة — كل غرض له نسبة وحجم وصيغة مستهدفة */
export type PlatformImageVariant =
  | 'banner_public'
  | 'shop_profile'
  | 'gallery_watermarked'
  | 'gallery_banner';

export type PlatformDisplayVariant = 'banner_card' | 'banner_detail' | 'gallery_tile' | 'gallery_carousel';

type TransformSpec = {
  aspectRatio: number | null;
  maxWidth: number;
  maxHeight: number;
  maxBytes: number;
  preferWebp: boolean;
  qualityStart: number;
  qualityMin: number;
  qualityStep: number;
  shrinkAttempts: number;
};

const SPECS: Record<PlatformImageVariant, TransformSpec> = {
  banner_public: {
    aspectRatio: BARBER_BANNER_DISPLAY_ASPECT_RATIO,
    maxWidth: BARBER_BANNER_MAX_WIDTH,
    maxHeight: BARBER_BANNER_MAX_HEIGHT,
    maxBytes: BARBER_BANNER_MAX_FILE_BYTES,
    preferWebp: true,
    qualityStart: 0.86,
    qualityMin: 0.42,
    qualityStep: 0.06,
    shrinkAttempts: 8,
  },
  shop_profile: {
    aspectRatio: 4 / 3,
    maxWidth: 1200,
    maxHeight: 900,
    maxBytes: 400 * 1024,
    preferWebp: true,
    qualityStart: 0.84,
    qualityMin: 0.4,
    qualityStep: 0.06,
    shrinkAttempts: 7,
  },
  gallery_watermarked: {
    aspectRatio: null,
    maxWidth: 1600,
    maxHeight: 1600,
    maxBytes: 100 * 1024,
    preferWebp: true,
    qualityStart: 0.82,
    qualityMin: 0.38,
    qualityStep: 0.055,
    shrinkAttempts: 10,
  },
  gallery_banner: {
    aspectRatio: BARBER_BANNER_DISPLAY_ASPECT_RATIO,
    maxWidth: BARBER_BANNER_MAX_WIDTH,
    maxHeight: BARBER_BANNER_MAX_HEIGHT,
    maxBytes: 220 * 1024,
    preferWebp: true,
    qualityStart: 0.84,
    qualityMin: 0.4,
    qualityStep: 0.055,
    shrinkAttempts: 9,
  },
};

const DISPLAY_FRAME_CLASS: Record<PlatformDisplayVariant, string> = {
  banner_card: 'block h-full w-full max-w-full object-cover object-center',
  banner_detail: 'block h-full w-full object-cover object-center',
  gallery_tile: 'h-full w-full object-cover object-center',
  gallery_carousel: 'h-full w-full object-cover object-center',
};

export function platformDisplayImageClass(variant: PlatformDisplayVariant): string {
  return DISPLAY_FRAME_CLASS[variant];
}

function resolveOutputMime(preferWebp: boolean): { mime: CanvasOutputMime; ext: '.webp' | '.jpg' } {
  if (preferWebp && browserSupportsWebpExport()) {
    return { mime: 'image/webp', ext: '.webp' };
  }
  return { mime: 'image/jpeg', ext: '.jpg' };
}

export type OptimizePlatformImageOptions = {
  afterDraw?: (ctx: CanvasRenderingContext2D, dw: number, dh: number) => void | Promise<void>;
  fileNameFallback?: string;
};

export async function optimizeImageFileForPlatformVariant(
  file: File,
  variant: PlatformImageVariant,
  options?: OptimizePlatformImageOptions,
): Promise<{ ok: true; file: File } | { ok: false; error: string }> {
  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'الملف ليس صورةً (استخدم PNG أو JPEG أو WebP).' };
  }

  const spec = SPECS[variant];
  const { mime, ext } = resolveOutputMime(spec.preferWebp);

  let img: HTMLImageElement;
  try {
    img = await loadImageFromFile(file);
  } catch {
    return { ok: false, error: 'تعذر تحميل الصورة. جرّب ملفاً آخر أو صيغة مختلفة.' };
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { ok: false, error: 'المتصفح لا يدعم معالجة الصور في هذه البيئة.' };
  }

  const crop = spec.aspectRatio
    ? computeCropSourceRect(img.naturalWidth, img.naturalHeight, spec.aspectRatio)
    : { sx: 0, sy: 0, sw: img.naturalWidth, sh: img.naturalHeight };

  let maxW = spec.maxWidth;
  let maxH = spec.maxHeight;
  let { dw, dh } = computeDrawSize(crop.sw, crop.sh, maxW, maxH);
  const baseName = fileBaseName(file.name, options?.fileNameFallback ?? variant);

  for (let attempt = 0; attempt < spec.shrinkAttempts; attempt++) {
    canvas.width = dw;
    canvas.height = dh;
    ctx.clearRect(0, 0, dw, dh);
    if (mime === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, dw, dh);
    }
    ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, dw, dh);
    if (options?.afterDraw) {
      await options.afterDraw(ctx, dw, dh);
    }

    let quality = spec.qualityStart;
    for (let qStep = 0; qStep < 16; qStep++) {
      const blob = await canvasToBlob(canvas, mime, quality);
      if (!blob) {
        return {
          ok: false,
          error:
            mime === 'image/webp'
              ? 'تعذر تصدير WebP. جرّب متصفحاً أحدث أو صورة بصيغة مختلفة.'
              : 'تعذر ضغط الصورة. جرّب صورة أصغر حجماً.',
        };
      }
      if (blob.size <= spec.maxBytes) {
        const out = new File([blob], `${baseName}${ext}`, {
          type: mime,
          lastModified: Date.now(),
        });
        return { ok: true, file: out };
      }
      quality -= spec.qualityStep;
      if (quality < spec.qualityMin) break;
    }

    maxW = Math.round(maxW * 0.88);
    maxH = Math.round(maxH * 0.88);
    const next = computeDrawSize(crop.sw, crop.sh, maxW, maxH);
    dw = next.dw;
    dh = next.dh;
  }

  return {
    ok: false,
    error: `تعذر إنزال الحجم تحت ${Math.round(spec.maxBytes / 1024)} كيلوبايت مع الحفاظ على وضوء معقول. جرّب صورةً أبسط أو أصغر.`,
  };
}

export async function optimizeImageToBase64ForPlatformVariant(
  file: File,
  variant: PlatformImageVariant,
  options?: OptimizePlatformImageOptions,
): Promise<{ ok: true; imageBase64: string; mimeType: CanvasOutputMime } | { ok: false; error: string }> {
  const fileResult = await optimizeImageFileForPlatformVariant(file, variant, options);
  if (!fileResult.ok) return { ok: false, error: fileResult.error };
  const b64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result ?? '');
      const i = raw.indexOf(',');
      resolve(i >= 0 ? raw.slice(i + 1) : raw);
    };
    reader.onerror = () => reject(new Error('read'));
    reader.readAsDataURL(fileResult.file);
  }).catch(() => null);
  if (!b64) return { ok: false, error: 'تعذر قراءة الصورة المضغوطة.' };
  return {
    ok: true,
    imageBase64: b64,
    mimeType: fileResult.file.type === 'image/webp' ? 'image/webp' : 'image/jpeg',
  };
}

export function platformRawFileTooLargeMessage(file: File, maxMb: number): string | null {
  const rawCap = maxMb * 1024 * 1024;
  if (file.size > rawCap) {
    return `حجم الملف كبير جداً (${(file.size / (1024 * 1024)).toFixed(1)} ميجابايت). اختر صورة أصغر من ${maxMb} ميجابايت.`;
  }
  return null;
}
