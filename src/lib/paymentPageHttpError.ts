/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * ترجمة أخطاء صفحة الدفع العامة — بدون أكواد HTTP خام في واجهة الزبون.
 */
export function paymentPageHttpErrorAr(code: string): string {
  const value = String(code || '').trim();
  if (value === 'http_429' || value === '429' || /^HTTP 429$/i.test(value)) {
    return 'الخادم مزدحم مؤقتاً بسبب طلبات متتالية. انتظر نحو دقيقة ثم أعد تحميل الصفحة.';
  }
  if (value === 'http_403' || value === '403' || /^HTTP 403$/i.test(value)) {
    return 'رُفض الطلب من الخادم. افتح الصفحة من المتصفح على www.halaqmap.com ثم أعد المحاولة.';
  }
  if (/^HTTP 5\d\d$/i.test(value) || /^http_5\d\d$/.test(value)) {
    return 'تعذر الاتصال بخادم إعدادات الدفع. حاول بعد قليل.';
  }
  if (value === 'network_error') {
    return 'تعذر الاتصال بالخادم. تحقق من الشبكة ثم أعد المحاولة.';
  }
  if (value === 'server_not_configured') {
    return 'إعدادات الدفع غير مهيأة على الخادم. تواصل مع الدعم.';
  }
  return '';
}
