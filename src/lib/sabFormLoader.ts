/**
 * تحميل وتهيئة ودجت OPPWA / HyperPay لبوابة SAB.
 */

let scriptLoadPromise: Promise<void> | null = null;

export function loadSabPaymentWidgetScript(widgetScriptUrl: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const src = widgetScriptUrl.trim();
  if (!src) return Promise.reject(new Error('sab_widget_url_missing'));

  const existing = document.querySelector<HTMLScriptElement>(`script[data-sab-widget="1"]`);
  if (existing && existing.src === src) {
    return Promise.resolve();
  }

  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    document.querySelectorAll('script[data-sab-widget="1"]').forEach((el) => el.remove());

    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.dataset.sabWidget = '1';
    s.onload = () => resolve();
    s.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error('sab_widget_script_failed'));
    };
    document.head.appendChild(s);
  });

  return scriptLoadPromise;
}

export function mountSabPaymentForm(host: HTMLElement, shopperResultUrl: string): void {
  host.innerHTML = '';
  const form = document.createElement('form');
  form.action = shopperResultUrl;
  form.className = 'paymentWidgets';
  form.setAttribute('data-brands', 'MADA VISA MASTER');
  host.appendChild(form);
}

export function setSabWidgetLocaleAr(): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { wpwlOptions?: Record<string, unknown> };
  w.wpwlOptions = {
    locale: 'ar',
    style: 'card',
    ...(w.wpwlOptions || {}),
  };
}

export function resetSabWidgetLoader(): void {
  scriptLoadPromise = null;
}
