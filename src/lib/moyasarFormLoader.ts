/**
 * تحميل نموذج الدفع الرسمي من CDN ميسر ثم استدعاء Moyasar.init
 * @see https://docs.mysr.dev/guides/card-payments/basic-integration
 */

const MOYASAR_SCRIPT_SRC = 'https://cdn.moyasar.com/mpf/0.3.0/moyasar.min.js';

let scriptLoadPromise: Promise<void> | null = null;

export function loadMoyasarFormScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const w = window as unknown as { Moyasar?: { init: (config: unknown) => void } };
  if (w.Moyasar?.init) return Promise.resolve();

  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${MOYASAR_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('moyasar_script_failed')), { once: true });
      return;
    }
    const s = document.createElement('script');
    s.src = MOYASAR_SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error('moyasar_script_failed'));
    };
    document.head.appendChild(s);
  });

  return scriptLoadPromise;
}

export function getMoyasarGlobal(): { init: (config: unknown) => void } | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { Moyasar?: { init: (config: unknown) => void } };
  return w.Moyasar?.init ? w.Moyasar : null;
}
