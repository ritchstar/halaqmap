import { ROUTE_PATHS } from '@/lib';

export const MOYASAR_PAYMENT_CONTEXT_STORAGE_KEY = 'hm-moyasar-payment-context-v1';

export type MoyasarPaymentContext = {
  tier: string;
  qty: number;
  requestId: string;
  linkedBarberId?: string;
  aiAddon?: boolean;
  barberName?: string;
  purpose?: string;
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
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(MOYASAR_PAYMENT_CONTEXT_STORAGE_KEY);
  } catch {
    // ignore
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
      const baseOrigin = u.origin.replace(/\/+$/, '');
      const hashBody = u.hash.replace(/^#\/?/, '');
      const hashQuery = hashBody.includes('?') ? hashBody.split('?').slice(1).join('?') : '';
      const merged = new URLSearchParams(hashQuery || u.search);
      q.forEach((value, key) => merged.set(key, value));
      return `${baseOrigin}/?${merged.toString()}`;
    } catch {
      // fall through to default
    }
  }

  return `${origin}/?${q.toString()}`;
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

  if (!params?.get('id')) return false;
  if (params.get('gateway') === 'sab') return false;

  const hash = window.location.hash || '';
  const hashPath = hash.replace(/^#/, '').split('?')[0] || '';
  if (hashPath === ROUTE_PATHS.PAYMENT || hashPath === `${ROUTE_PATHS.PAYMENT}/`) return false;

  const target = `${window.location.origin}/#${ROUTE_PATHS.PAYMENT}${search}`;
  window.location.replace(target);
  return true;
}
