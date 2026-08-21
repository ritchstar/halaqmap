/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بصمة مناسبة هندسية — SVG حتمي من البذرة، بلا توليد ذكاء اصطناعي.
 */
export function fnv1a(seed: string): number {
  let hash = 2166136261;
  const text = String(seed || '');
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function eventSignatureSeed(input: {
  occasion: string;
  initials: string;
  dateIso: string;
  paletteId: string;
  templateId: string;
}): string {
  return [input.occasion, input.initials, input.dateIso, input.paletteId, input.templateId]
    .map((item) => String(item || '').trim())
    .join('|');
}

export function arabicInitials(name: string): string {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return 'ح';
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('·');
}

export function fitArabicNameClass(name: string): string {
  const length = Array.from(String(name || '').trim()).length;
  if (length > 32) return 'text-lg leading-8';
  if (length > 22) return 'text-xl leading-8';
  if (length > 14) return 'text-2xl leading-9';
  return 'text-3xl leading-10';
}
