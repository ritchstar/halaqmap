/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
export type HalanaGalleryKind = 'inspire' | 'featured';

export const HALANA_GALLERY_KINDS: readonly { id: HalanaGalleryKind; labelAr: string; hintAr: string }[] = [
  {
    id: 'inspire',
    labelAr: 'عمل للإلهام',
    hintAr: 'يظهر في معرض «من التنفيذ» — العميلة تبدأ طلباً مشابهاً.',
  },
  {
    id: 'featured',
    labelAr: 'مميز في المعرض',
    hintAr: 'يُبرز في الصفحة الرئيسية ضمن مختارات اليوم.',
  },
] as const;

export function normalizeHalanaGalleryKind(raw: unknown): HalanaGalleryKind {
  return String(raw || '').trim() === 'featured' ? 'featured' : 'inspire';
}

export function halanaGalleryKindLabel(kind: HalanaGalleryKind): string {
  return HALANA_GALLERY_KINDS.find((item) => item.id === kind)?.labelAr || 'عمل للإلهام';
}
