/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * ترجمة أكواد أخطاء HTTP الخام (مثل http_429) إلى رسائل عربية مفهومة،
 * تُستخدم في لوحات تشغيل المتجر الإدارية بدل عرض الكود التقني كما هو.
 */
export function adminOpsHttpErrorAr(code: string): string {
  const value = String(code || '').trim();
  if (value === 'http_429' || value === '429') {
    return 'الخادم مزدحم مؤقتاً بسبب كثرة الطلبات المتتالية. انتظر دقيقة وحاول مجدداً.';
  }
  if (value === 'http_403' || value === '403' || /^forbidden$/i.test(value)) {
    return 'رُفض الطلب من الخادم. افتح اللوحة من www.halaqmap.com وأعد تسجيل الدخول، ثم حدّث الطابور.';
  }
  if (value === 'http_401' || value === '401' || /^unauthorized$/i.test(value)) {
    return 'انتهت صلاحية الجلسة. سجّل الدخول بصفة الإدارة من جديد ثم أعد المحاولة.';
  }
  if (/^http_5\d\d$/.test(value)) {
    return 'تعذر تنفيذ الطلب بسبب خطأ في الخادم. حاول مرة أخرى بعد قليل.';
  }
  if (value === 'network_error') {
    return 'تعذر الاتصال بالخادم. تحقق من الاتصال وحاول مجدداً.';
  }
  if (value === 'not_authenticated') {
    return 'انتهت الجلسة. سجّل الدخول بصفة الإدارة من جديد.';
  }
  return '';
}
