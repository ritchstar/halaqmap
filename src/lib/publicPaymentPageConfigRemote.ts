const API = '/api/public-payment-page-config';

export type PublicPaymentPageConfig = {
  ok: boolean;
  preferredGateway: 'MOYASAR' | 'SAB';
  displayPaymentMode: 'test' | 'live';
  enableMoyasarCard: boolean;
  enableSabGateway: boolean;
  error?: string;
};

/** إعدادات الدفع الظاهرة للعامة — بدون مصادقة؛ تعود للقيم الافتراضية عند فشل الشبكة. */
export async function fetchPublicPaymentPageConfig(): Promise<PublicPaymentPageConfig> {
  try {
    const res = await fetch(API, { method: 'GET' });
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
    error,
  };
}
