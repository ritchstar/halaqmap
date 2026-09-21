/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يُصحّح canonical + og:url تلقائياً لكل تنقّل HashRouter — ذاتي المرجعية
 * للنطاق الفعلي الحالي بدل canonical الثابت الموروث من index.html (كان
 * يشير دوماً لجذر www.halaqmap.com مهما كان المسار أو النطاق، بما في ذلك
 * صفحات store.halaqmap.com). مُركَّب مرة واحدة بجانب AnalyticsRouteTracker —
 * لا يحتاج أي تعديل في صفحات فردية.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { currentSelfOrigin, normalizeCanonicalPath, setCanonicalUrl, setSocialTitle } from '@/lib/seoHead';

export function SeoRouteSync(): null {
  const { pathname } = useLocation();

  useEffect(() => {
    const origin = currentSelfOrigin();
    const path = normalizeCanonicalPath(pathname);
    setCanonicalUrl(`${origin}${path}`);

    // og:title/twitter:title من document.title — يُؤجَّل خطوة واحدة حتى يستقر
    // عنوان الصفحة (useDocumentTitle في مكوّن الصفحة قد يُحدّثه بنفس اللفّة).
    const id = window.setTimeout(() => {
      if (document.title) setSocialTitle(document.title);
    }, 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
