/**
 * تسجيل service worker للـ PWA وإشعارات الدفع.
 */

// حارس لمنع حلقة إعادة تحميل: نُعيد التحميل مرة واحدة فقط عند تبدّل العامل المتحكّم.
let reloadingForNewWorker = false;

/**
 * يُعيد تحميل الصفحة تلقائياً مرة واحدة عندما يتولّى عامل خدمة جديد التحكّم — أي بعد
 * نشرة جديدة (skipWaiting + clientsClaim). بدون هذا كانت الصفحة تبقى تشغّل الحزمة
 * القديمة (assets مُخزّنة مسبقاً) حتى إعادة تحميل يدوية ثانية، فيظهر خطأ التحقق من
 * نسخة قديمة رغم أن الخادم يخدم الأحدث. نتجاهل التبدّل الأول (أول تثبيت بلا متحكّم
 * سابق) كي لا نُعيد التحميل بلا داعٍ في أول زيارة.
 */
function enableAutoReloadOnServiceWorkerUpdate(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  // متحكّم موجود مسبقاً ⇒ هذه زيارة عائدة، فأيّ تبدّل لاحق يعني تحديثاً يستوجب إعادة تحميل.
  if (!navigator.serviceWorker.controller) return;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloadingForNewWorker) return;
    reloadingForNewWorker = true;
    window.location.reload();
  });
}

export async function registerAppServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    enableAutoReloadOnServiceWorkerUpdate();
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    // ابحث فوراً عن تحديث حتى يُثبَّت العامل الجديد ويُنشَّط دون انتظار الفحص الدوري.
    void reg.update().catch(() => {});
    return reg;
  } catch {
    return null;
  }
}

export async function waitForServiceWorkerReady(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}
