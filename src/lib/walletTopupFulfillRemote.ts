/**
 * شحن محفظة المناوب بعد عودة الدفع من ميسر — يستدعي /api/wallet-topup-fulfill (يتحقق من الدفع ويشحن الرصيد الصافي).
 */

function registrationApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || '')
    .trim()
    .replace(/\/$/, '');
}

function walletTopupEndpoint(): string {
  // في المتصفح نستخدم مساراً نسبياً نفس-الأصل دائماً — مناعة تامة ضد CORS
  // واختلاف النطاق (معاينة/إنتاج)، وبلا اعتماد على أصل مُهيّأ قد يشير للإنتاج.
  if (typeof window !== 'undefined') {
    return '/api/wallet-topup-fulfill';
  }
  const explicit = String(import.meta.env.VITE_WALLET_TOPUP_FULFILL_URL || '').trim();
  if (explicit) return explicit;
  const origin = registrationApiOrigin();
  if (origin) return `${origin}/api/wallet-topup-fulfill`;
  return '/api/wallet-topup-fulfill';
}

export type WalletTopupFulfillResult =
  | {
      ok: true;
      alreadyCredited: boolean;
      barberId: string;
      walletSku: string;
      chargedHalalas: number;
      creditedHalalas: number;
      balanceHalalas: number;
      repliesRemaining: number;
    }
  | { ok: false; error: string };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function walletTopupFulfillRemoteOnce(
  paymentId: string,
  opts?: { timeoutMs?: number },
): Promise<WalletTopupFulfillResult> {
  const q = new URLSearchParams({ paymentId: paymentId.trim() });
  const url = `${walletTopupEndpoint()}?${q.toString()}`;
  const timeoutMs = opts?.timeoutMs ?? 25_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: 'GET', credentials: 'omit', signal: controller.signal });
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok || data.ok !== true) {
      return { ok: false, error: String(data.error || 'fulfill_failed') };
    }
    return {
      ok: true,
      alreadyCredited: data.alreadyCredited === true,
      barberId: String(data.barberId ?? ''),
      walletSku: String(data.walletSku ?? ''),
      chargedHalalas: typeof data.chargedHalalas === 'number' ? data.chargedHalalas : 0,
      creditedHalalas: typeof data.creditedHalalas === 'number' ? data.creditedHalalas : 0,
      balanceHalalas: typeof data.balanceHalalas === 'number' ? data.balanceHalalas : 0,
      repliesRemaining: typeof data.repliesRemaining === 'number' ? data.repliesRemaining : 0,
    };
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') return { ok: false, error: 'timeout' };
    return { ok: false, error: 'network' };
  } finally {
    clearTimeout(timer);
  }
}

/** إعادة المحاولة حتى يتأكد الشحن (payment_not_paid = ما زال قيد التأكيد لدى ميسر). */
export async function pollWalletTopupFulfillRemote(
  paymentId: string,
  opts?: { maxAttempts?: number },
): Promise<WalletTopupFulfillResult> {
  const maxAttempts = opts?.maxAttempts ?? 14;
  const normalized = paymentId.trim();
  let lastError = 'fulfill_pending';

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (attempt > 0) await sleep(attempt < 4 ? 1200 : 2200);
    const result = await walletTopupFulfillRemoteOnce(normalized, { timeoutMs: 20_000 });
    if (result.ok) return result;
    lastError = result.error;
    if (lastError !== 'payment_not_paid') return result;
  }

  return { ok: false, error: lastError };
}
