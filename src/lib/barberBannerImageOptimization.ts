import {
  BARBER_BANNER_MAX_FILE_BYTES,
  BARBER_BANNER_MAX_HEIGHT,
  BARBER_BANNER_MAX_WIDTH,
  BARBER_BANNER_OUTPUT_EXT,
  BARBER_BANNER_OUTPUT_MIME,
} from '@/config/barberBannerImagePolicy';

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

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('تعذر تصدير الصورة'));
      },
      BARBER_BANNER_OUTPUT_MIME,
      quality
    );
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

/**
 * تصغير وضغط صورة بنر الحلاق لتناسب العرض وتبقى تحت الحد الأقصى للحجم.
 */
export async function optimizeImageFileForBarberBanner(
  file: File
): Promise<{ ok: true; file: File } | { ok: false; error: string }> {
  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'الملف ليس صورةً (استخدم PNG أو JPEG أو WebP).' };
  }

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

  let maxW = BARBER_BANNER_MAX_WIDTH;
  let maxH = BARBER_BANNER_MAX_HEIGHT;
  let { dw, dh } = computeDrawSize(img.naturalWidth, img.naturalHeight, maxW, maxH);

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'banner';

  for (let attempt = 0; attempt < 8; attempt++) {
    canvas.width = dw;
    canvas.height = dh;
    ctx.clearRect(0, 0, dw, dh);
    if (BARBER_BANNER_OUTPUT_MIME === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, dw, dh);
    }
    ctx.drawImage(img, 0, 0, dw, dh);

    let quality = 0.88;
    let blob: Blob | null = null;
    for (let qStep = 0; qStep < 14; qStep++) {
      try {
        blob = await canvasToJpegBlob(canvas, quality);
      } catch {
        return { ok: false, error: 'تعذر ضغط الصورة. جرّب صورة أصغر حجماً.' };
      }
      if (blob.size <= BARBER_BANNER_MAX_FILE_BYTES) {
        const out = new File([blob], `${baseName}${BARBER_BANNER_OUTPUT_EXT}`, {
          type: BARBER_BANNER_OUTPUT_MIME,
          lastModified: Date.now(),
        });
        return { ok: true, file: out };
      }
      quality -= 0.06;
      if (quality < 0.42) break;
    }

    maxW = Math.round(maxW * 0.88);
    maxH = Math.round(maxH * 0.88);
    const next = computeDrawSize(img.naturalWidth, img.naturalHeight, maxW, maxH);
    dw = next.dw;
    dh = next.dh;
  }

  return {
    ok: false,
    error: `تعذر إنزال الحجم تحت ${Math.round(BARBER_BANNER_MAX_FILE_BYTES / 1024)} كيلوبايت مع الحفاظ على وضوء معقول. جرّب صورةً أبسط (أقل تفاصيل) أو أصغر أصلاً.`,
  };
}

/** رفض قبل المعالجة إذا كان الملف ضخماً جداً (يوفّر وقت المعالجة) */
export function barberBannerRawFileTooLargeMessage(file: File): string | null {
  /** حد أولي للملف الأصلي قبل المعالجة — 12MB */
  const rawCap = 12 * 1024 * 1024;
  if (file.size > rawCap) {
    return `حجم الملف كبير جداً (${(file.size / (1024 * 1024)).toFixed(1)} ميجابايت). اختر صورة أصغر من 12 ميجابايت ثم أعد المحاولة.`;
  }
  return null;
}
