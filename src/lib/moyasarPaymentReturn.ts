import { ROUTE_PATHS, SubscriptionTier } from '@/lib';
import { clampListingLicenseQuantity, computeListingLicenseTotalSar, isDigitalShiftAddonAllowed, parseDigitalShiftAddonParam } from '@/config/listingLicenseQuantity';
import { calcVatBreakdown, type PlatformVatSettings } from '@/lib/platformVatSettings';

export const MOYASAR_PAYMENT_CONTEXT_STORAGE_KEY = 'hm-moyasar-payment-context-v1';
export const MOYASAR_LAST_PAYMENT_ID_STORAGE_KEY = 'hm-moyasar-last-payment-id-v1';
export const MOYASAR_PAID_RECEIPT_STORAGE_KEY = 'hm-moyasar-paid-receipt-v1';

export type MoyasarPaymentContext = {
  tier: string;
  qty: number;
  requestId: string;
  linkedBarberId?: string;
  aiAddon?: boolean;
  barberName?: string;
  purpose?: string;
  /** رمز باقة شحن المحفظة عندما purpose === 'wallet_topup' */
  walletSku?: string;
};

export function persistMoyasarPaymentContext(ctx: MoyasarPaymentContext): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(MOYASAR_PAYMENT_CONTEXT_STORAGE_KEY, JSON.stringify(ctx));
  } catch {
    // ignore quota / private mode
  }
}

export function readMoyasarPaymentContext(): MoyasarPaymentContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(MOYASAR_PAYMENT_CONTEXT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MoyasarPaymentContext;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearMoyasarPaymentContext(): void {
  clearMoyasarCheckoutContext();
  clearMoyasarLastPaymentId();
  clearMoyasarPaidReceipt();
}

/** يُمسح سياق الدفع قبل الإتمام دون مسح إيصال الدفع الناجح. */
export function clearMoyasarCheckoutContext(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(MOYASAR_PAYMENT_CONTEXT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function clearMoyasarLastPaymentId(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(MOYASAR_LAST_PAYMENT_ID_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export type MoyasarPaidReceipt = {
  paymentId: string;
  paidAt: string;
  requestId?: string;
};

export function persistMoyasarPaidReceipt(paymentId: string, requestId?: string): void {
  if (typeof window === 'undefined') return;
  const id = paymentId.trim();
  if (!id) return;
  const rid = requestId?.trim();
  try {
    sessionStorage.setItem(
      MOYASAR_PAID_RECEIPT_STORAGE_KEY,
      JSON.stringify({
        paymentId: id,
        paidAt: new Date().toISOString(),
        ...(rid ? { requestId: rid } : {}),
      } satisfies MoyasarPaidReceipt),
    );
  } catch {
    // ignore
  }
}

export function readMoyasarPaidReceipt(expectedRequestId?: string): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = sessionStorage.getItem(MOYASAR_PAID_RECEIPT_STORAGE_KEY);
    if (!raw) return '';
    const parsed = JSON.parse(raw) as MoyasarPaidReceipt;
    const paymentId = typeof parsed?.paymentId === 'string' ? parsed.paymentId.trim() : '';
    if (!paymentId) return '';
    const expected = expectedRequestId?.trim();
    const storedRequestId = typeof parsed.requestId === 'string' ? parsed.requestId.trim() : '';
    if (expected && storedRequestId && storedRequestId !== expected) return '';
    return paymentId;
  } catch {
    return '';
  }
}

export function clearMoyasarPaidReceipt(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(MOYASAR_PAID_RECEIPT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function persistMoyasarLastPaymentId(paymentId: string): void {
  if (typeof window === 'undefined') return;
  const id = paymentId.trim();
  if (!id) return;
  try {
    sessionStorage.setItem(MOYASAR_LAST_PAYMENT_ID_STORAGE_KEY, id);
  } catch {
    // ignore
  }
}

export function readMoyasarLastPaymentId(): string {
  if (typeof window === 'undefined') return '';
  try {
    return (sessionStorage.getItem(MOYASAR_LAST_PAYMENT_ID_STORAGE_KEY) || '').trim();
  } catch {
    return '';
  }
}

export function buildMoyasarCallbackSearchParams(input: {
  tier: string;
  licenseQuantity: number;
  digitalShiftAddonSelected: boolean;
  requestId: string;
  linkedBarberId?: string;
}): URLSearchParams {
  const q = new URLSearchParams();
  q.set('tier', input.tier);
  q.set('qty', String(input.licenseQuantity));
  if (input.digitalShiftAddonSelected) q.set('aiAddon', '1');
  if (input.requestId.trim()) q.set('requestId', input.requestId.trim());
  if (input.linkedBarberId?.trim()) q.set('linkedBarberId', input.linkedBarberId.trim());
  return q;
}

/**
 * على نشر Preview (نطاق `*.vercel.app`) نتجاهل callback_url الثابت للإنتاج
 * ونعود لنفس الأصل الحالي — وإلا يعود الدفع للإنتاج (كود مختلف + sessionStorage
 * لأصل آخر) فتُعامَل شحنة المحفظة كـ«شراء أول». الإنتاج لا يتأثر.
 */
function isVercelPreviewHost(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.toLowerCase().endsWith('.vercel.app');
}

/**
 * Moyasar يُلحق `id` كـ query على أصل الموقع (قبل `#`) — لا نمرّر HashRouter في callback_url.
 * index.html يعيد التوجيه إلى `/#/partners/payment?...&id=...` قبل تحميل React.
 */
export function buildMoyasarCallbackUrl(
  input: Parameters<typeof buildMoyasarCallbackSearchParams>[0],
  explicitCallback?: string,
): string {
  const q = buildMoyasarCallbackSearchParams(input);
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin.replace(/\/+$/, '')
      : 'https://www.halaqmap.com';

  const explicit = explicitCallback?.trim();
  if (explicit) {
    try {
      const u = new URL(explicit);
      const baseOrigin = isVercelPreviewHost() ? origin : u.origin.replace(/\/+$/, '');
      const hashBody = u.hash.replace(/^#\/?/, '');
      const hashQuery = hashBody.includes('?') ? hashBody.split('?').slice(1).join('?') : '';
      const merged = new URLSearchParams(hashQuery || u.search);
      q.forEach((value, key) => merged.set(key, value));
      return `${baseOrigin}/?${merged.toString()}`;
    } catch {
      // fall through to default
    }
  }

  return `${origin}/`;
}

/** callback شحن المحفظة — يحمل purpose=wallet_topup و walletSku دون tier/qty الرخصة. */
export function buildWalletTopupCallbackUrl(
  input: { walletSku: string; linkedBarberId?: string; barberName?: string },
  explicitCallback?: string,
): string {
  const q = new URLSearchParams();
  q.set('purpose', 'wallet_topup');
  q.set('walletSku', input.walletSku);
  if (input.linkedBarberId?.trim()) q.set('linkedBarberId', input.linkedBarberId.trim());
  if (input.barberName?.trim()) q.set('barberName', input.barberName.trim());

  const origin =
    typeof window !== 'undefined'
      ? window.location.origin.replace(/\/+$/, '')
      : 'https://www.halaqmap.com';

  const explicit = explicitCallback?.trim();
  if (explicit) {
    try {
      const u = new URL(explicit);
      const baseOrigin = isVercelPreviewHost() ? origin : u.origin.replace(/\/+$/, '');
      const hashBody = u.hash.replace(/^#\/?/, '');
      const hashQuery = hashBody.includes('?') ? hashBody.split('?').slice(1).join('?') : '';
      const merged = new URLSearchParams(hashQuery || u.search);
      // إزالة معاملات الرخصة كي لا تُفسَّر شحنة المحفظة كباقة إدراج.
      merged.delete('tier');
      merged.delete('qty');
      merged.delete('aiAddon');
      q.forEach((value, key) => merged.set(key, value));
      return `${baseOrigin}/?${merged.toString()}`;
    } catch {
      // fall through
    }
  }

  return `${origin}/?${q.toString()}`;
}

function parseTierFromParam(raw: string | null): SubscriptionTier {
  const tierRaw = (raw ?? '').trim().toLowerCase();
  if (tierRaw === SubscriptionTier.GOLD) return SubscriptionTier.GOLD;
  if (tierRaw === SubscriptionTier.DIAMOND) return SubscriptionTier.DIAMOND;
  return SubscriptionTier.BRONZE;
}

/** دمج معاملات العودة من الرابط + sessionStorage قبل التحقق من الدفع. */
export function mergeMoyasarReturnSearchParams(searchParams: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(searchParams);
  const paymentId = next.get('id')?.trim();
  if (!paymentId) return next;
  if ((next.get('gateway') ?? '').trim().toLowerCase() === 'sab') return next;

  const ctx = readMoyasarPaymentContext();
  if (!ctx) return next;

  if (!next.get('tier') && ctx.tier) next.set('tier', ctx.tier);
  if (!next.get('qty') && ctx.qty) next.set('qty', String(ctx.qty));
  if (!next.get('requestId') && ctx.requestId) next.set('requestId', ctx.requestId);
  if (!next.get('linkedBarberId') && ctx.linkedBarberId) next.set('linkedBarberId', ctx.linkedBarberId);
  if (!next.get('aiAddon') && ctx.aiAddon) next.set('aiAddon', '1');
  if (!next.get('barberName') && ctx.barberName) next.set('barberName', ctx.barberName);
  if (!next.get('purpose') && ctx.purpose) next.set('purpose', ctx.purpose);
  if (!next.get('walletSku') && ctx.walletSku) next.set('walletSku', ctx.walletSku);
  return next;
}

export function readHashOrTopLevelSearchParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();
  const hash = window.location.hash.replace(/^#/, '');
  const hashQuery = hash.includes('?') ? hash.split('?').slice(1).join('?') : '';
  const topLevel = window.location.search.replace(/^\?/, '');
  return new URLSearchParams(hashQuery || topLevel);
}

export function moyasarReturnNeedsHydration(searchParams: URLSearchParams): boolean {
  const paymentId = searchParams.get('id')?.trim();
  if (!paymentId) return false;
  if ((searchParams.get('gateway') ?? '').trim().toLowerCase() === 'sab') return false;
  if (searchParams.get('tier')) return false;
  return readMoyasarPaymentContext() != null;
}

/** عودة فاشلة من ميسر عبر callback_url: ?status=failed&message=… */
export function readMoyasarFailureReturn(searchParams: URLSearchParams): { status: string; message: string } | null {
  if ((searchParams.get('gateway') ?? '').trim().toLowerCase() === 'sab') return null;
  if (searchParams.get('id')?.trim()) return null;
  const status = (searchParams.get('status') ?? '').trim().toLowerCase();
  const message = (searchParams.get('message') ?? '').trim();
  if (status === 'failed' || message) return { status: status || 'failed', message };
  return null;
}

export function formatMoyasarFailureReturnMessage(rawMessage: string): string {
  const msg = rawMessage.trim();
  const upper = msg.toUpperCase();
  if (
    upper.includes('INVALID CARD') ||
    upper.includes('CARD_INVALID') ||
    upper.includes('NOT FOUND') ||
    upper.includes('CARD NOT ENROLLED')
  ) {
    return 'رفضت البطاقة: الرقم غير صالح للاختبار. استخدم بطاقة ميسر التجريبية `4111 1111 1111 1111` مع تاريخ مستقبلي وأي CVV، ثم أكمل شاشة 3DS بزر Submit.';
  }
  if (upper.includes('DECLINED')) {
    return `رفض البنك العملية (${msg}). جرّب البطاقة التجريبية 4111… أو راجع لوحة ميسر.`;
  }
  if (upper.includes('INSUFFICIENT')) {
    return 'الرصيد غير كافٍ. في الاختبار استخدم البطاقة `4111 1111 1111 1111`.';
  }
  return msg || 'تعذر إتمام الدفع عبر ميسر. أعد المحاولة أو راجع لوحة ميسر.';
}

export function expectedHalalasFromReturnSearchParams(
  searchParams: URLSearchParams,
  vatSettings: PlatformVatSettings,
): number {
  const tier = parseTierFromParam(searchParams.get('tier'));
  const licenseQuantity = clampListingLicenseQuantity(searchParams.get('qty'));
  const digitalShiftAddonSelected = isDigitalShiftAddonAllowed(
    tier,
    parseDigitalShiftAddonParam(searchParams.get('aiAddon')),
  );
  const listingPricingOptions = digitalShiftAddonSelected ? { digitalShiftAddon: true as const } : undefined;
  const price = computeListingLicenseTotalSar(tier, licenseQuantity, listingPricingOptions);
  const licenseBreakdown = calcVatBreakdown(price, vatSettings);
  return Math.max(100, Math.round(licenseBreakdown.total * 100));
}

/** يُستدعى قبل React — إن عاد ميسر بـ `/?id=` نُحوّل لمسار HashRouter. */
export function captureMoyasarReturnInHashRoute(): boolean {
  if (typeof window === 'undefined') return false;

  const pathname = (window.location.pathname || '').replace(/\/+$/, '') || '/';
  const search = window.location.search || '';
  const params = search ? new URLSearchParams(search) : null;

  if (pathname === ROUTE_PATHS.PAYMENT && search) {
    const target = `${window.location.origin}/#${ROUTE_PATHS.PAYMENT}${search}`;
    if (window.location.href !== target) {
      window.location.replace(target);
      return true;
    }
    return false;
  }

  if (!params?.get('id')) {
    if (params && (params.get('status') === 'failed' || params.get('message'))) {
      const hasReturnContext =
        Boolean(params.get('tier') || params.get('requestId') || readMoyasarPaymentContext());
      if (hasReturnContext) {
        const hash = window.location.hash || '';
        const hashPath = hash.replace(/^#/, '').split('?')[0] || '';
        if (hashPath === ROUTE_PATHS.PAYMENT || hashPath === `${ROUTE_PATHS.PAYMENT}/`) return false;
        const target = `${window.location.origin}/#${ROUTE_PATHS.PAYMENT}${search}`;
        window.location.replace(target);
        return true;
      }
    }
    return false;
  }
  if (params.get('gateway') === 'sab') return false;

  const hash = window.location.hash || '';
  const hashPath = hash.replace(/^#/, '').split('?')[0] || '';
  if (hashPath === ROUTE_PATHS.PAYMENT || hashPath === `${ROUTE_PATHS.PAYMENT}/`) return false;

  const target = `${window.location.origin}/#${ROUTE_PATHS.PAYMENT}${search}`;
  window.location.replace(target);
  return true;
}
