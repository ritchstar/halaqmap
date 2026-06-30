/**
 * تحميل نموذج الدفع الرسمي من CDN ميسر ثم استدعاء Moyasar.init
 * @see https://docs.mysr.dev/guides/card-payments/basic-integration
 */

/** إصدار 0.3.0/min.js أُزيل من CDN (403) — استخدم مسار mpf الحديث. */
const MOYASAR_MPF_VERSION = '1.15.0';
const MOYASAR_CDN_BASE = `https://cdn.moyasar.com/mpf/${MOYASAR_MPF_VERSION}`;
const MOYASAR_SCRIPT_SRC = `${MOYASAR_CDN_BASE}/moyasar.js`;
const MOYASAR_STYLE_HREF = `${MOYASAR_CDN_BASE}/moyasar.css`;

const MOYASAR_SCRIPT_FALLBACKS = [
  MOYASAR_SCRIPT_SRC,
  'https://cdn.moyasar.com/mpf/1.14.0/moyasar.js',
  'https://cdn.moyasar.com/mpf/1.0.0/moyasar.js',
] as const;

let assetsLoadPromise: Promise<void> | null = null;

function appendStylesheet(href: string): Promise<void> {
  const existing = document.querySelector<HTMLLinkElement>(`link[rel="stylesheet"][href="${href}"]`);
  if (existing) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error('moyasar_style_failed'));
    document.head.appendChild(link);
  });
}

function appendScript(src: string): Promise<void> {
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('moyasar_script_failed')), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('moyasar_script_failed'));
    document.head.appendChild(script);
  });
}

async function loadScriptWithFallbacks(sources: readonly string[]): Promise<void> {
  let lastError: unknown;
  for (const src of sources) {
    try {
      await appendScript(src);
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error('moyasar_script_failed');
}

export function loadMoyasarFormScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const w = window as unknown as { Moyasar?: { init: (config: unknown) => void } };
  if (w.Moyasar?.init) return Promise.resolve();

  if (assetsLoadPromise) return assetsLoadPromise;

  assetsLoadPromise = (async () => {
    try {
      await appendStylesheet(MOYASAR_STYLE_HREF);
      await loadScriptWithFallbacks(MOYASAR_SCRIPT_FALLBACKS);
    } catch (error) {
      assetsLoadPromise = null;
      throw error;
    }
  })();

  return assetsLoadPromise;
}

export function getMoyasarGlobal(): { init: (config: unknown) => void } | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { Moyasar?: { init: (config: unknown) => void } };
  return w.Moyasar?.init ? w.Moyasar : null;
}
