/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * أدوات حساب تباين الألوان وفق معادلات WCAG 2.x — تُستخدم لفرض بقاء لون
 * النص متبايناً دائماً عن لون خلفيته الفعلي (المحسوب من المتصفح مباشرة،
 * لا من افتراض ثابت)، بدل الاعتماد على مراجعة كل زر يدوياً.
 */

export type RGBA = { r: number; g: number; b: number; a: number };

/** يحلّل قيمة لون CSS محسوبة (كما تُعيدها getComputedStyle دائماً بصيغة rgb()/rgba()). */
export function parseCssColor(value: string | null | undefined): RGBA | null {
  if (!value) return null;
  const match = value
    .trim()
    .match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)$/i);
  if (!match) return null;
  const [, r, g, b, a] = match;
  return {
    r: Math.min(255, Math.max(0, parseFloat(r))),
    g: Math.min(255, Math.max(0, parseFloat(g))),
    b: Math.min(255, Math.max(0, parseFloat(b))),
    a: a === undefined ? 1 : Math.min(1, Math.max(0, parseFloat(a))),
  };
}

/** يمزج لوناً شفافاً جزئياً فوق خلفية أخرى (alpha compositing قياسي). */
export function compositeOver(fg: RGBA, bg: RGBA): RGBA {
  const a = fg.a + bg.a * (1 - fg.a);
  if (a <= 0) return { r: 0, g: 0, b: 0, a: 0 };
  return {
    r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
    g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
    b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
    a,
  };
}

function channelLuminance(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** الإضاءة النسبية للون وفق معادلة WCAG 2.x (0 = أسود مطلق، 1 = أبيض مطلق). */
export function relativeLuminance({ r, g, b }: RGBA): number {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

/** نسبة التباين بين لونين وفق WCAG — من 1 (لا تباين، لون واحد فعلياً) إلى 21 (أسود/أبيض). */
export function contrastRatio(a: RGBA, b: RGBA): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** يختار لوناً آمناً (أبيض أو كحلي هوية المنصة) بأفضل تباين فوق خلفية معيّنة. */
export function pickReadableTextColor(bg: RGBA): string {
  const white: RGBA = { r: 255, g: 255, b: 255, a: 1 };
  const dark: RGBA = { r: 6, g: 16, b: 24, a: 1 }; // #061018 — نفس الكحلي المعتمد في هوية المتجر
  return contrastRatio(bg, white) >= contrastRatio(bg, dark) ? '#ffffff' : '#061018';
}
