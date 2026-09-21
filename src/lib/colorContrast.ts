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
 * يحلّل قناة لون في `rgb()` الحديثة: رقم 0–255 أو نسبة مئوية.
 * الشفافية: رقم 0–1 أو نسبة مئوية.
 */
function parseRgbChannel(token: string): number {
  const t = token.trim();
  if (t.endsWith('%')) return clampByte((parseFloat(t) / 100) * 255);
  return clampByte(parseFloat(t));
}

function parseAlphaChannel(token: string | undefined): number {
  if (token === undefined) return 1;
  const t = token.trim();
  if (t.endsWith('%')) return Math.min(1, Math.max(0, parseFloat(t) / 100));
  return Math.min(1, Math.max(0, parseFloat(t)));
}

/**
 * يحلّل قيمة لون CSS محسوبة (كما تُعيدها getComputedStyle) — يدعم:
 * - `rgb()`/`rgba()` بالفواصل القديمة
 * - `rgb(r g b / a)` بصيغة CSS Color 4 (مسافات بدل فواصل) التي يعيدها Chrome الحديث
 * - `color(srgb …)`
 * - `oklab()`/`oklch()` لألوان Tailwind v4 ذات الشفافية الجزئية
 *
 * بدون صيغة المسافات يفشل الحارس بصمت على ألوان كثيرة (نص أبيض فوق بيج
 * المتجر يبقى غير مقروء لأن `parseCssColor` يعيد null فيُتخطّى العنصر).
 */
export function parseCssColor(value: string | null | undefined): RGBA | null {
  if (!value) return null;
  const v = value.trim();
  if (v === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };

  const rgbComma = v.match(
    /^rgba?\(\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*(?:,\s*([\d.]+%?))?\s*\)$/i,
  );
  if (rgbComma) {
    const [, r, g, b, a] = rgbComma;
    return {
      r: parseRgbChannel(r),
      g: parseRgbChannel(g),
      b: parseRgbChannel(b),
      a: parseAlphaChannel(a),
    };
  }

  const rgbSpace = v.match(
    /^rgba?\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+%?)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i,
  );
  if (rgbSpace) {
    const [, r, g, b, a] = rgbSpace;
    return {
      r: parseRgbChannel(r),
      g: parseRgbChannel(g),
      b: parseRgbChannel(b),
      a: parseAlphaChannel(a),
    };
  }

  const srgb = v.match(
    /^color\(\s*srgb\s+([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+%?)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i,
  );
  if (srgb) {
    const [, r, g, b, a] = srgb;
    const toByte = (t: string) =>
      t.trim().endsWith('%') ? parseRgbChannel(t) : clampByte(parseFloat(t) * 255);
    return {
      r: toByte(r),
      g: toByte(g),
      b: toByte(b),
      a: parseAlphaChannel(a),
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

/**
 * يختار لوناً آمناً بأفضل تباين فوق خلفية معيّنة.
 * خلفية فاتحة ← حبر الغلاف `#2e2418` (مقروء على بيج المتجر).
 * خلفية داكنة ← أبيض.
 */
export function pickReadableTextColor(bg: RGBA): string {
  const white: RGBA = { r: 255, g: 255, b: 255, a: 1 };
  const dark: RGBA = { r: 46, g: 36, b: 24, a: 1 }; // #2e2418 — --slc-ink
  return contrastRatio(bg, white) >= contrastRatio(bg, dark) ? '#ffffff' : '#2e2418';
}

/** هل الخلفية فاتحة إجمالاً؟ (عتبة إضاءة WCAG تقريبية للبيج/الأبيض). */
export function isLightBackground(bg: RGBA): boolean {
  return relativeLuminance(bg) >= 0.55;
}

/**
 * يستخرج ألوان توقفات تدرّج CSS (gradient stops) من قيمة `background-image`
 * محسوبة — يدعم `rgb()/rgba()` وأيضاً `oklab()/oklch()` (نفس الأنماط التي
 * تدعمها `parseCssColor`)، لأن Tailwind v4 يولّد توقفات تدرّج بصيغة Oklab
 * تماماً كما يولّد ألوان النص بالشفافية الجزئية — مثال حقيقي من بطاقة
 * «هدية» في المتجر: `linear-gradient(to left, oklab(0.44 0.03 0.06 / 0.25)
 * 0%, rgb(26, 20, 12) 50%, rgb(6, 16, 24) 100%)`.
 */
export function extractGradientStopColors(backgroundImage: string): RGBA[] {
  if (!backgroundImage || backgroundImage === 'none') return [];
  const matches = backgroundImage.match(/(?:rgba?|oklab|oklch)\([^)]*\)/gi) || [];
  return matches.map(parseCssColor).filter((c): c is RGBA => !!c);
}

/**
 * يُلخّص عدة توقفات تدرّج إلى لون واحد تمثيلي (متوسط مرجّح بشفافية كل
 * توقف)، ليُستخدم كطبقة خلفية معتمة تقريبية عند حساب التباين — كافٍ لتحديد
 * إن كانت الخلفية فاتحة أو داكنة إجمالاً دون الحاجة لمحاكاة التدرّج بصرياً.
 */
function averageGradientColor(stops: RGBA[]): RGBA {
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let wSum = 0;
  for (const stop of stops) {
    const w = Math.max(stop.a, 0.05);
    rSum += stop.r * w;
    gSum += stop.g * w;
    bSum += stop.b * w;
    wSum += w;
  }
  if (wSum <= 0) return { r: 255, g: 255, b: 255, a: 1 };
  return { r: rSum / wSum, g: gSum / wSum, b: bSum / wSum, a: 1 };
}

/**
 * يحسب الخلفية الفعّالة المُركَّبة (composited) لعنصر عبر تسلّق آباء DOM
 * الحقيقيين وتركيب أي طبقات شفافة جزئياً فوق بعضها — لا يفترض أن أول أب
 * يحمل لوناً هو الصحيح، بل يمزج كل الطبقات الشفافة حتى يصل لطبقة معتمة
 * كاملة (alpha = 1) أو ينفد الآباء (فيُرجع أبيض كاحتياط أخير: خلفية المتصفح
 * الافتراضية). مشتركة بين كل حرّاس التباين لتفادي ازدواج المنطق.
 *
 * يتحقق أيضاً من `background-image` (تدرّجات) في كل مستوى من مستويات
 * الآباء، وليس فقط `background-color` — بطاقات مثل «هدية بخورنا1» تستخدم
 * `bg-gradient-to-*` بخلفية `background-color` شفافة تماماً (`rgba(0,0,0,0)`)
 * مع تدرّج داكن فعلي في `background-image`؛ بدون هذا الفحص كان الحارس يتخطى
 * الطبقة الداكنة الحقيقية بالكامل ويصل إلى خلفية المتجر البيج الفاتحة خلفها،
 * فيُحوّل نص البطاقة الفاتح المصمَّم أصلاً لهذا التدرّج الداكن إلى لون داكن
 * — أي يزيد اختفاءه بدل إصلاحه. مؤكَّد بالفحص المباشر على الموقع الفعلي.
 */
export function resolveEffectiveBackground(el: Element): RGBA {
  const layers: RGBA[] = [];
  let node: Element | null = el;
  while (node) {
    const style = window.getComputedStyle(node);

    const gradientStops = extractGradientStopColors(style.backgroundImage);
    if (gradientStops.length) {
      layers.push(averageGradientColor(gradientStops));
      break;
    }

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

/**
 * سمة اختيار صريح للانسحاب من حرّاسي التباين التلقائيين (نص وأزرار) — تُوضع
 * على عنصر حاوٍ (لا كل عنصر نص على حدة) حين تكون خلفيته الفعلية المرئية طبقة
 * زخرفية لا يمكن لـ`resolveEffectiveBackground` رؤيتها أصلاً: صورة خلفية
 * فوتوغرافية، أو طبقة شقيقة موضوعة بـ `position: absolute` (لا كخلفية CSS
 * فعلية على أحد آباء DOM الحقيقيين للنص). الحارسان يتسلّقان فقط
 * `background-color`/`background-image` (تدرّجات) الفعليين لآباء DOM — فطبقة
 * صورة الهيرو الفوتوغرافية في `LandingPreview.tsx` (ثلاث `div` شقيقة بـ
 * `absolute inset-0 z-0`، لا خلفية على `<section>` أو أي أب حقيقي للنص) غير
 * مرئية لهما إطلاقاً، فيتسلّقان مباشرة إلى خلفية الصفحة البيج الحقيقية خلف
 * الصورة (`bg-[#eee2ce]`) ويصححان نص الهيرو الأبيض المتعمَّد إلى حبر داكن —
 * يُفقِد النص قراءته فعلياً فوق الصورة الداكنة الحقيقية. مؤكَّد بفحص مباشر على
 * www.halaqmap.com/ عبر متصفح الجوال: `h1` عنوان الهيرو ظهر بـ
 * `color: rgb(46, 36, 24) !important` (`data-text-contrast-guard-fixed="1"`)
 * رغم صنف `text-white` الصريح في الكود، ونفس الشيء لشارة «مجاني · بلا تسجيل»
 * وامتداد العنوان الزمردي.
 *
 * الإصلاح الجذري (تعديل خوارزمية التسلّق نفسها لتأخذ الصور بعين الاعتبار) غير
 * ممكن عملياً: لا سبيل لأخذ عيّنة لون فعلية من صورة فوتوغرافية بلا رسمها على
 * Canvas (تكلفة أداء وتعقيد غير مبرَّرين لحارس أمان خلفي). فبدل ذلك: أي حاوية
 * تحمل هذه السمة تعني أن كل ألوان النصوص/الأزرار داخلها رُوجعت يدوياً
 * وتباينها مضمون فعلياً فوق خلفيتها الحقيقية المرئية — فلا يلمسها أي من
 * الحارسين مهما حسبا من خلفية "فعّالة" خاطئة.
 */
export const CONTRAST_GUARD_MANUAL_BG_ATTR = 'data-contrast-guard-manual-bg';

/** هل يقع العنصر داخل حاوية مُعلَنة يدوياً بمنأى عن حرّاسي التباين؟ */
export function isWithinManualContrastZone(el: Element): boolean {
  return el.closest(`[${CONTRAST_GUARD_MANUAL_BG_ATTR}]`) !== null;
}
