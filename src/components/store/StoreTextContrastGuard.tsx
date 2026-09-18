/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حارس تباين تلقائي لنصوص صفحات المتجر العامة — شقيق `StoreButtonContrastGuard`
 * لكن لعناصر النص العادية (فقرات، عناوين، وصلات، عناصر قوائم...) لا الأزرار
 * التفاعلية فقط. وُجد هذا الحارس تحديداً عند تحويل الغلاف العام للمتجر
 * (`StoreVisitorShell` وما يعتمد عليه) من كانفاس كحلي داكن إلى بيج فاتح
 * (لوحة تمرتنا1 نفسها): مئات فئات Tailwind الجاهزة في عشرات الملفات
 * (`text-white/NN`, `text-[#f4efe4]`, `text-[#e8c547]` كنص مباشر، إلخ) كانت
 * مصمَّمة لتُقرأ فوق كحلي داكن، ولا يمكن تصحيحها كلها يدوياً بأمان بمرور واحد
 * عبر عشرات الملفات — فبدل ذلك يقرأ هذا الحارس الخلفية الفعلية المحسوبة فعلياً
 * (لا افتراضاً) لكل عنصر نص، ويعكس المنطق تلقائياً: خلفية فاتحة ← نص غامق
 * (كحلي الهوية)، خلفية داكنة (مثل شارة أو بطاقة داكنة متعمّدة فوق الصفحة
 * الفاتحة) ← يبقى النص الفاتح كما هو دون تغيير، لأنه يقرأ بشكل صحيح أصلاً.
 *
 * يشارك نفس أدوات حساب WCAG ونفس نطاق مسارات `/store/*` مع حارس الأزرار
 * (`@/lib/colorContrast`, `@/lib/storeCustomerSurface`) بلا ازدواج منطق.
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  contrastRatio,
  parseCssColor,
  pickReadableTextColor,
  resolveEffectiveBackground,
} from '@/lib/colorContrast';
import { isStoreCustomerSurface } from '@/lib/storeCustomerSurface';

/** نفس حد WCAG 2.1 الأدنى لعناصر الواجهة (SC 1.4.11) — يشترك مع حارس الأزرار. */
const FIX_RATIO = 3;
const SCAN_DEBOUNCE_MS = 220;
const FIXED_ATTR = 'data-text-contrast-guard-fixed';

/**
 * عناصر النص العادية المستهدفة — الوصلات والأزرار مغطّاة أصلاً بحارس الأزرار،
 * فلا داعي لتكرارها هنا. تُقرأ فقط العناصر التي تحمل عقدة نص مباشرة (لا مجرد
 * حاوية لعناصر أخرى) لتفادي فحص آلاف الـ div/section الفارغة من نص مباشر.
 */
const TEXT_SELECTOR =
  'p, span, h1, h2, h3, h4, h5, h6, li, dt, dd, small, strong, em, b, caption, figcaption, blockquote, th, td, legend';

function hasOwnVisibleText(el: Element): boolean {
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE && (node.textContent || '').trim().length > 0) return true;
  }
  return false;
}

function checkElement(el: HTMLElement): void {
  if (!hasOwnVisibleText(el)) return;

  const style = window.getComputedStyle(el);
  const textColor = parseCssColor(style.color);
  if (!textColor || textColor.a === 0) return;

  // خلفيات متدرّجة خلف نص عادي نادرة جداً في هذا السياق (بخلاف الأزرار)
  // ولا يمكن أخذ عيّنة بكسل فعلية منها بلا Canvas — تُستثنى كما في حارس الأزرار.
  const hasGradient = Boolean(style.backgroundImage && style.backgroundImage !== 'none');
  if (hasGradient) return;

  const bg = resolveEffectiveBackground(el);
  const ratio = contrastRatio(bg, textColor);
  if (ratio >= FIX_RATIO) return;

  const safe = pickReadableTextColor(bg);
  if (style.color === safe) return;

  el.style.setProperty('color', safe, 'important');
  el.setAttribute(FIXED_ATTR, '1');
  if (import.meta.env.DEV) {
    console.warn('[text-contrast-guard] صُحِّح لون نص كان شبه مختفٍ عن الزوار', el, {
      originalColor: style.color,
      background: style.backgroundColor,
      ratio: ratio.toFixed(2),
      correctedTo: safe,
    });
  }
}

function scanNow(): void {
  document.querySelectorAll<HTMLElement>(TEXT_SELECTOR).forEach(checkElement);
}

/** حارس تباين النصوص العامة — يُركَّب مرة واحدة قرب جذر الراوتر، يعمل ضمن `/store/*` فقط. */
export function StoreTextContrastGuard(): null {
  const location = useLocation();
  const timerRef = useRef<number | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    if (!isStoreCustomerSurface(location.pathname)) return undefined;
    if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return undefined;

    const schedule = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(scanNow, SCAN_DEBOUNCE_MS);
    };

    schedule();

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [location.pathname]);

  return null;
}
