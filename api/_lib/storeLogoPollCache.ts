/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تخفيف إرسال شعار المتجر (base64، قد يصل حجمه إلى عشرات الكيلوبايتات) بالكامل
 * مع كل استطلاع (polling) من لوحة الكاشير أو صفحة الزبون، رغم أنه نادراً ما يتغيّر.
 *
 * الفكرة: إن كانت نسخة الخادم (serverless function) دافئة وخدمت نفس المتجر/الدور
 * خلال النافذة الزمنية الأخيرة بنفس الشعار، نُسقط حقل logoSrc من الرد بالكامل
 * بدل إعادة إرساله — والعميل مصمَّم أصلاً على إبقاء القيمة الحالية إذا غاب
 * الحقل من الرد (انظر parseShopLogoSrc). هذا تخفيف حقيقي وليس ضماناً مطلقاً،
 * لأنه يعمل فقط ضمن نفس نسخة الخادم الدافئة ولا يمتد عبر نُسخ Vercel المختلفة.
 */

const RECENT_LOGO_TTL_MS = 20 * 60 * 1000;
const recentLogoSent = new Map<string, { hash: string; at: number }>();

export function shopLogoFingerprint(src: string): string {
  const v = String(src || '');
  if (!v) return '';
  let h = 5381;
  for (let i = 0; i < v.length; i++) {
    h = ((h << 5) + h + v.charCodeAt(i)) | 0;
  }
  return `${v.length}:${h}`;
}

function pruneRecentLogoSent(): void {
  if (recentLogoSent.size <= 500) return;
  const now = Date.now();
  for (const [key, value] of recentLogoSent) {
    if (now - value.at > RECENT_LOGO_TTL_MS) recentLogoSent.delete(key);
  }
}

/**
 * يعيد الشعار كما هو أول مرة (أو بعد تغيّره)، ويعيد undefined إذا كان نفس
 * الشعار قد أُرسل لنفس المفتاح (متجر + دور) خلال النافذة الزمنية الأخيرة.
 */
export function logoSrcIfChanged(cacheKey: string, logoSrc: string): string | undefined {
  if (!logoSrc) return logoSrc;
  const hash = shopLogoFingerprint(logoSrc);
  const cached = recentLogoSent.get(cacheKey);
  if (cached && cached.hash === hash && Date.now() - cached.at < RECENT_LOGO_TTL_MS) {
    return undefined;
  }
  recentLogoSent.set(cacheKey, { hash, at: Date.now() });
  pruneRecentLogoSent();
  return logoSrc;
}
