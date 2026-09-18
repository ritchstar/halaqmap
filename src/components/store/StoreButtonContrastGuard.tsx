/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حارس تباين تلقائي لأزرار صفحات الزبائن في المتجر — يمنع اختفاء الأزرار حين
 * يتطابق لون النص مع لون الخلفية الفعلي. يعمل على الألوان المحسوبة فعلياً من
 * المتصفح (getComputedStyle) لا على تخمين أسماء أصناف Tailwind، فيغطي أي زر
 * حالي أو مستقبلي بلا حاجة لمراجعة كل صفحة منتج يدوياً.
 *
 * مستويان:
 *  - إصلاح تلقائي فوري عند تباين دون الحد الأدنى الذي تفرضه WCAG لعناصر
 *    الواجهة (النسبة < FIX_RATIO) — الزر كان سيبدو مختفياً أو شبه مختفٍ عن
 *    الزائر، فيُصحَّح لون نصه فوراً إلى أبيض أو كحلي الهوية (#061018) بحسب
 *    الأنسب لخلفيته الفعلية.
 *  - تحذير في console (بيئة التطوير فقط) عند تباين أضعف من حد AA الكامل
 *    للنص العادي (< WARN_RATIO) دون تغيير العرض — لمراجعة يدوية.
 *
 * محدودية معروفة موثّقة بصراحة: الخلفيات المتدرّجة (gradient) لا يمكن أخذ
 * عيّنة بكسل فعلية منها بلا Canvas؛ لذلك تُستثنى من الإصلاح التلقائي، ويُكتفى
 * بتحذير إن تطابق لون النص مع أحد ألوان التدرّج المُعلنة في CSS نفسه.
 *
 * مُقيَّد بمسارات `/store/*` فقط (لا يمسّ الرئيسية العامة أو مسارات أخرى) —
 * وهذا يشمل عمداً لوحات تشغيل المحلات (Desk) لأنها هي «صفحات الزبائن» الفعلية
 * (زبون المنصة هو صاحب النشاط)، لا الواجهة الأمامية للمتسوّق النهائي فقط.
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  contrastRatio,
  extractGradientStopColors,
  parseCssColor,
  pickReadableTextColor,
  resolveEffectiveBackground,
} from '@/lib/colorContrast';
import { isStoreCustomerSurface } from '@/lib/storeCustomerSurface';

/**
 * أدنى نسبة تباين قبل الإصلاح التلقائي الفوري — 3:1 هو الحد الأدنى الذي تفرضه
 * WCAG 2.1 لعناصر الواجهة والنص الغامق/الكبير (SC 1.4.11 وSC 1.4.3)، وهو نفس
 * الحد الذي أثبت هذا التدقيق أن أزراراً حقيقية في الكود الحالي تقع تحته فعلاً
 * (مثال مؤكَّد: نص كحلي #061018 فوق خلفية بخورنا1 الديناميكية #6E4A26 ← 2.44:1).
 */
const FIX_RATIO = 3;
/** أدنى نسبة تباين قبل تسجيل تحذير تطوير فقط (بلا تغيير العرض) — حد AA الكامل للنص العادي. */
const WARN_RATIO = 4.5;
const SCAN_DEBOUNCE_MS = 220;
const FIXED_ATTR = 'data-contrast-guard-fixed';

function checkElement(el: HTMLElement): void {
  const style = window.getComputedStyle(el);
  const textColor = parseCssColor(style.color);
  if (!textColor || textColor.a === 0) return; // نص شفاف عمداً (أيقونة فقط، إلخ) — ليس خللاً

  const hasGradient = Boolean(style.backgroundImage && style.backgroundImage !== 'none');

  if (hasGradient) {
    const stops = extractGradientStopColors(style.backgroundImage);
    const clash = stops.some((stop) => contrastRatio(stop, textColor) < WARN_RATIO);
    if (clash && import.meta.env.DEV) {
      console.warn('[contrast-guard] تباين ضعيف محتمل بين نص زر وتدرّج خلفيته', el, {
        color: style.color,
        backgroundImage: style.backgroundImage,
      });
    }
    return;
  }

  const bg = resolveEffectiveBackground(el);
  const ratio = contrastRatio(bg, textColor);

  if (ratio < FIX_RATIO) {
    const safe = pickReadableTextColor(bg);
    if (style.color !== safe) {
      el.style.setProperty('color', safe, 'important');
      el.setAttribute(FIXED_ATTR, '1');
      if (import.meta.env.DEV) {
        console.warn('[contrast-guard] صُحِّح لون نص زر كان شبه مختفٍ عن الزوار', el, {
          originalColor: style.color,
          background: style.backgroundColor,
          ratio: ratio.toFixed(2),
          correctedTo: safe,
        });
      }
    }
  } else if (ratio < WARN_RATIO && import.meta.env.DEV) {
    console.warn('[contrast-guard] تباين ضعيف (لم يُصحَّح تلقائياً) — يستحق مراجعة تصميم يدوية', el, {
      color: style.color,
      background: style.backgroundColor,
      ratio: ratio.toFixed(2),
    });
  }
}

function scanNow(): void {
  // label مضمّن لأن نمط «زر تحميل مخفي داخل label» مستخدم فعلياً في الكود
  // (مثال مؤكَّد: زر رفع شعار المحل StoreShopLogoDesk.tsx) ولا يحمل role="button".
  const candidates = document.querySelectorAll<HTMLElement>(
    'button, [role="button"], a, label, summary, input[type="submit"], input[type="button"]',
  );
  candidates.forEach(checkElement);
}

/** حارس تباين الأزرار — يُركَّب مرة واحدة قرب جذر الراوتر، يعمل ضمن `/store/*` فقط. */
export function StoreButtonContrastGuard(): null {
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

    schedule(); // فحص أولي بعد استقرار أول رسم للصفحة

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
