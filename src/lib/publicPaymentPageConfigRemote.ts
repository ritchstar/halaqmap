const API = '/api/public-payment-page-config';

export type PublicPaymentPageConfig = {
  ok: boolean;
  preferredGateway: 'MOYASAR' | 'SAB';
  displayPaymentMode: 'test' | 'live';
  enableMoyasarCard: boolean;
  enableSabGateway: boolean;
  /** علم ض.ق.م الحيّ (مصدر الحقيقة: حالة ZATCA) — مطفأ افتراضياً. */
  vatEnabled: boolean;
  /** النسبة المئوية المعتمدة للضريبة (مثال 15). */
  vatPercent: number;
  /** commit النشر الحيّ على الخادم — لمقارنة كاش PWA على صفحة الدفع. */
  buildCommit?: string | null;
  error?: string;
};

/** النسبة المُجهَّزة الافتراضية عند تعذّر القراءة (canonical). */
const DEFAULT_VAT_PERCENT = 15;

function parseVatPercent(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : Number.parseFloat(String(raw ?? ''));
  if (!Number.isFinite(n) || n < 0) return DEFAULT_VAT_PERCENT;
  if (n > 50) return 50;
  return Math.round(n * 100) / 100;
}

/** إعدادات الدفع الظاهرة للعامة — بدون مصادقة؛ تعود للقيم الافتراضية عند فشل الشبكة. */
export async function fetchPublicPaymentPageConfig(): Promise<PublicPaymentPageConfig> {
  try {
    const res = await fetch(API, { method: 'GET', cache: 'no-store' });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok || json.ok !== true) {
      return fallbackConfig(typeof json.error === 'string' ? json.error : `HTTP ${res.status}`);
    }
    const gw = String(json.preferredGateway || 'MOYASAR').toUpperCase() === 'SAB' ? 'SAB' : 'MOYASAR';
    const mode = String(json.displayPaymentMode || 'test').toLowerCase() === 'live' ? 'live' : 'test';
    return {
      ok: true,
      preferredGateway: gw,
      displayPaymentMode: mode,
      enableMoyasarCard: json.enableMoyasarCard !== false,
      enableSabGateway: json.enableSabGateway === true,
      vatEnabled: json.vatEnabled === true,
      vatPercent: parseVatPercent(json.vatPercent),
      buildCommit: typeof json.buildCommit === 'string' ? json.buildCommit.trim() || null : null,
    };
  } catch (e) {
    return fallbackConfig(e instanceof Error ? e.message : 'network_error');
  }
}

function fallbackConfig(error: string): PublicPaymentPageConfig {
  return {
    ok: false,
    preferredGateway: 'MOYASAR',
    displayPaymentMode: 'test',
    enableMoyasarCard: true,
    enableSabGateway: false,
    vatEnabled: false,
    vatPercent: DEFAULT_VAT_PERCENT,
    error,
  };
}
