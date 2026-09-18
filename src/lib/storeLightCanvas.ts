/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
const CANVAS_BG = '#eee2ce'; // نفس بيج تمرتنا1 — لوحة المتجر العامة الجديدة

/**
 * يثبت خلفية المسار البيج الفاتحة على `html` حتى لا يظهر الكانفاس الداكن
 * الافتراضي (المشترك مع صفحات حلاق ماب الأخرى) للحظة تحت صفحات المتجر
 * العامة أثناء الانتقال بين المسارات — نظير `lockPartnerDarkCanvas` تماماً،
 * لكن بلا لمس الفئة المشتركة `hm-app-dark-canvas` أو متغيّراتها العامة، حتى
 * لا يتأثر أي قسم آخر من المنصة (حلاق ماب، صفحات الشركاء) بهذا التغيير.
 */
export function lockStoreLightCanvas(): () => void {
  if (typeof document === 'undefined') return () => undefined;
  const root = document.documentElement;
  root.style.background = CANVAS_BG;
  return () => {
    root.style.background = '';
  };
}
