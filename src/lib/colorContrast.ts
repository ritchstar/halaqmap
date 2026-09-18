/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * أدوات حساب تباين الألوان وفق معادلات WCAG 2.x — تُستخدم لفرض بقاء لون
 * النص متبايناً دائماً عن لون خلفيته الفعلي (المحسوب من المتصفح مباشرة،
 * لا من افتراض ثابت)، بدل الاعتماد على مراجعة كل زر يدوياً.
 */

export type RGBA = { r: number; g: number; b: number; a: number };

function clampByte(n: number): number {
  return Math.min(255, Math.max(0, n));
}

function srgbGammaEncode(c: number): number {
  const clipped = Math.min(1, Math.max(0, c));
  return clipped <= 0.0031308 ? 12.92 * clipped : 1.055 * clipped ** (1 / 2.4) - 0.055;
}

/**
 * يحوّل Oklab (L, a, b — النطاق القياسي لـ CSS Color 4) إلى RGB عبر الصيغة
 * المرجعية القياسية (Björn Ottosson). لازم لأن Tailwind v4 يولّد ألوان
 * الشفافية الجزئية (مثل `text-white/70`) عبر `color-mix()` في فضاء Oklab،
 * فتُعيدها `getComputedStyle` بصيغة `oklab(L a b / alpha)` لا `rgba()` —
 * وبلا هذا التحويل تفشل `parseCssColor` بصمت وتتجاهل كل حرّاس التباين هذه
 * العناصر تماماً (وهي النمط الأكثر شيوعاً فعلياً في كود المتجر: مئات
 * الاستخدامات لـ `text-white/NN` و`border-white/NN`).
 */
function oklabToRgba(L: number, a: number, b: number, alpha: number): RGBA {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const rLin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  return {
    r: clampByte(srgbGammaEncode(rLin) * 255),
    g: clampByte(srgbGammaEncode(gLin) * 255),
    b: clampByte(srgbGammaEncode(bLin) * 255),
    a: Math.min(1, Math.max(0, alpha)),
  };
}

/** يحلّل نسبة مئوية أو رقماً عشرياً عادياً لعنصر Oklab/Oklch الأول (L) أو Alpha. */
function parsePercentOrNumber(token: string, percentBase: number): number {
  const t = token.trim();
  if (t.endsWith('%')) return (parseFloat(t) / 100) * percentBase;
  return parseFloat(t);
}

/**
 * يحلّل قيمة لون CSS محسوبة (كما تُعيدها getComputedStyle) — يدعم `rgb()`/
 * `rgba()` (الصيغة الأشيع)، وأيضاً `oklab()`/`oklch()` التي يعيدها المتصفح
 * فعلياً لأي لون Tailwind v4 بشفافية جزئية (انظر التوثيق أعلى `oklabToRgba`).
 */
export function parseCssColor(value: string | null | undefined): RGBA | null {
  if (!value) return null;
  const v = value.trim();

  const rgbMatch = v.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)$/i);
  if (rgbMatch) {
    const [, r, g, b, a] = rgbMatch;
    return {
      r: clampByte(parseFloat(r)),
      g: clampByte(parseFloat(g)),
      b: clampByte(parseFloat(b)),
      a: a === undefined ? 1 : Math.min(1, Math.max(0, parseFloat(a))),
    };
  }

  const oklabMatch = v.match(
    /^oklab\(\s*([\d.]+%?)\s+(-?[\d.]+%?)\s+(-?[\d.]+%?)\s*(?:\/\s*([\d.]+%?))?\s*\)$/i,
  );
  if (oklabMatch) {
    const [, L, a, b, alpha] = oklabMatch;
    return oklabToRgba(
      parsePercentOrNumber(L, 1),
      parsePercentOrNumber(a, 0.4),
      parsePercentOrNumber(b, 0.4),
      alpha === undefined ? 1 : parsePercentOrNumber(alpha, 1),
    );
  }

  const oklchMatch = v.match(
    /^oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+(-?[\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)$/i,
  );
  if (oklchMatch) {
    const [, L, C, H, alpha] = oklchMatch;
    const lNum = parsePercentOrNumber(L, 1);
    const cNum = parsePercentOrNumber(C, 0.4);
    const hRad = (parseFloat(H) * Math.PI) / 180;
    return oklabToRgba(
      lNum,
      cNum * Math.cos(hRad),
      cNum * Math.sin(hRad),
      alpha === undefined ? 1 : parsePercentOrNumber(alpha, 1),
    );
  }

  return null;
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

/**
 * يحسب الخلفية الفعّالة المُركَّبة (composited) لعنصر عبر تسلّق آباء DOM
 * الحقيقيين وتركيب أي طبقات شفافة جزئياً فوق بعضها — لا يفترض أن أول أب
 * يحمل لوناً هو الصحيح، بل يمزج كل الطبقات الشفافة حتى يصل لطبقة معتمة
 * كاملة (alpha = 1) أو ينفد الآباء (فيُرجع أبيض كاحتياط أخير: خلفية المتصفح
 * الافتراضية). مشتركة بين كل حرّاس التباين لتفادي ازدواج المنطق.
 */
export function resolveEffectiveBackground(el: Element): RGBA {
  const layers: RGBA[] = [];
  let node: Element | null = el;
  while (node) {
    const style = window.getComputedStyle(node);
    const parsed = parseCssColor(style.backgroundColor);
    if (parsed && parsed.a > 0) {
      layers.push(parsed);
      if (parsed.a >= 1) break;
    }
    node = node.parentElement;
  }
  if (!layers.length) return { r: 255, g: 255, b: 255, a: 1 };
  let composed = layers[layers.length - 1];
  for (let i = layers.length - 2; i >= 0; i -= 1) composed = compositeOver(layers[i], composed);
  return composed;
}

/** يستخرج ألوان توقفات تدرّج CSS (gradient stops) من قيمة `background-image` محسوبة. */
export function extractGradientStopColors(backgroundImage: string): RGBA[] {
  if (!backgroundImage || backgroundImage === 'none') return [];
  const matches = backgroundImage.match(/rgba?\([^)]+\)/gi) || [];
  return matches.map(parseCssColor).filter((c): c is RGBA => !!c);
}
