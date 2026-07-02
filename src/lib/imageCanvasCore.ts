export type CanvasOutputMime = 'image/webp' | 'image/jpeg';

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
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

export function browserSupportsWebpExport(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
}

export function computeCropSourceRect(
  naturalWidth: number,
  naturalHeight: number,
  targetAspect: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const srcAspect = naturalWidth / naturalHeight;
  if (srcAspect > targetAspect) {
    const sh = naturalHeight;
    const sw = naturalHeight * targetAspect;
    return { sx: (naturalWidth - sw) / 2, sy: 0, sw, sh };
  }
  const sw = naturalWidth;
  const sh = naturalWidth / targetAspect;
  return { sx: 0, sy: (naturalHeight - sh) / 2, sw, sh };
}

export function computeDrawSize(
  sourceWidth: number,
  sourceHeight: number,
  maxW: number,
  maxH: number,
): { dw: number; dh: number } {
  const r = Math.min(maxW / sourceWidth, maxH / sourceHeight, 1);
  return {
    dw: Math.max(1, Math.round(sourceWidth * r)),
    dh: Math.max(1, Math.round(sourceHeight * r)),
  };
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: CanvasOutputMime,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), mime, quality);
  });
}

export function fileBaseName(name: string, fallback: string): string {
  return name.replace(/\.[^.]+$/, '') || fallback;
}
