import {
  optimizeImageFileForPlatformVariant,
  platformRawFileTooLargeMessage,
} from '@/lib/platformImageTransform';

/** تصغير وضغط صورة بنر الحلاق (5:2) — WebP عند الدعم، وإلا JPEG */
export async function optimizeImageFileForBarberBanner(
  file: File,
): Promise<{ ok: true; file: File } | { ok: false; error: string }> {
  return optimizeImageFileForPlatformVariant(file, 'banner_public', { fileNameFallback: 'banner' });
}

/** صور واجهة/داخل المحل — نسبة 4:3 دون قص بنر */
export async function optimizeImageFileForShopProfile(
  file: File,
): Promise<{ ok: true; file: File } | { ok: false; error: string }> {
  return optimizeImageFileForPlatformVariant(file, 'shop_profile', { fileNameFallback: 'shop' });
}

export function barberBannerRawFileTooLargeMessage(file: File): string | null {
  return platformRawFileTooLargeMessage(file, 12);
}

export function shopProfileRawFileTooLargeMessage(file: File): string | null {
  return platformRawFileTooLargeMessage(file, 12);
}
