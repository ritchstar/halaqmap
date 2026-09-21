/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إدارة موحّدة لوسوم SEO الديناميكية (canonical + og:url + الوصف) — المنصة
 * SPA بالكامل من جهة العميل (HashRouter)، وكانت كل الصفحات على كل النطاقات
 * (www.halaqmap.com وstore.halaqmap.com وغيرها) تُخدَّم بنفس index.html
 * الثابت: نفس <link rel="canonical" href="https://www.halaqmap.com/">
 * ونفس meta description/og:* لكل مسار مهما كان — بما فيها صفحات نطاق آخر
 * كلياً (store.halaqmap.com). هذا يرسل لجوجل إشارة أن كل صفحة نسخة مكرّرة
 * من جذر www.halaqmap.com، وهو التشخيص الأرجح لتعثّر فهرسة صفحات المتجر
 * الظاهرة في Search Console (راجع محادثة الجلسة بتاريخ ٢٠٢٦-٠٩-٢١).
 *
 * `SeoRouteSync` (مكوّن مُركَّب مرة واحدة داخل HashRouter) يُصحّح canonical/
 * og:url تلقائياً لكل تنقّل، ذاتي المرجعية للنطاق الفعلي الحالي — لا يحتاج
 * أي تعديل في صفحات فردية. `useMetaDescription` يتيح لأي صفحة ضبط وصف دقيق
 * عند توفره (بدل الوصف العام الافتراضي).
 */

function upsertLink(rel: string, href: string): void {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function readMeta(attr: 'name' | 'property', key: string): string | null {
  if (typeof document === 'undefined') return null;
  return document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)?.getAttribute('content') ?? null;
}

/** ينظّف مساراً لغرض canonical: يزيل الشرطة المائلة الزائدة (عدا الجذر). */
export function normalizeCanonicalPath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

/**
 * أصل الصفحة الحالية لغرض canonical — ذاتي المرجعية دوماً للنطاق الفعلي
 * (store.halaqmap.com يبقى store.halaqmap.com، لا يتحوّل لـ www مطلقاً).
 * الاستثناء الوحيد: توحيد apex الجذري (halaqmap.com بلا www) إلى www — نفس
 * الموقع فعلياً، لا نطاق فرعي مستقل، بخلاف getSiteOrigin() في siteOrigin.ts
 * المخصّصة لروابط المشاركة/الدفع المطلقة بين النطاقات ولا يصح استخدامها هنا.
 */
export function currentSelfOrigin(): string {
  if (typeof window === 'undefined' || !window.location?.origin) return 'https://www.halaqmap.com';
  try {
    const u = new URL(window.location.origin);
    if (u.hostname === 'halaqmap.com') u.hostname = 'www.halaqmap.com';
    if (u.protocol === 'http:') u.protocol = 'https:';
    return u.origin;
  } catch {
    return window.location.origin;
  }
}

/** يضبط canonical + og:url معاً على رابط مطلق واحد. */
export function setCanonicalUrl(absoluteUrl: string): void {
  upsertLink('canonical', absoluteUrl);
  upsertMeta('property', 'og:url', absoluteUrl);
}

/** يضبط og:title/twitter:title. */
export function setSocialTitle(title: string): void {
  if (!title) return;
  upsertMeta('property', 'og:title', title);
  upsertMeta('name', 'twitter:title', title);
}

/** يضبط الوصف (meta description + og:description + twitter:description) معاً. */
export function setMetaDescriptionTags(description: string): void {
  if (!description) return;
  upsertMeta('name', 'description', description);
  upsertMeta('property', 'og:description', description);
  upsertMeta('name', 'twitter:description', description);
}
