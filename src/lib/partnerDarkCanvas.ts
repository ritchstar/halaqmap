/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
const CANVAS_BG = '#020912';

/**
 * يثبت خلفية المسار الداكنة على `html` حتى لا يظهر كانفاس الموقع الفاتح
 * تحت صفحة الدفع/التسجيل إن أُزيلت فئة صفحة هبوط سابقة.
 */
export function lockPartnerDarkCanvas(): () => void {
  if (typeof document === 'undefined') return () => undefined;
  const root = document.documentElement;
  root.classList.add('hm-app-dark-canvas');
  root.style.background = CANVAS_BG;
  return () => {
    root.classList.remove('hm-app-dark-canvas');
    root.style.background = '';
  };
}
