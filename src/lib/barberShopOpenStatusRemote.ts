const DEFAULT_ENDPOINT = '/api/barber-shop-status';

/** رابط كامل في المتصفح (HashRouter) لصفحة التبديل السريع */
export function buildShopOpenManageHashLink(token: string): string {
  const t = token.trim();
  if (!t || typeof window === 'undefined') return '';
  const base = window.location.href.split('#')[0];
  return `${base}#/partners/shop-open?t=${encodeURIComponent(t)}`;
}

function endpoint(): string {
  return String(import.meta.env.VITE_BARBER_SHOP_STATUS_URL || DEFAULT_ENDPOINT).trim();
}

function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  return headers;
}

export async function fetchBarberShopOpenStatusRemote(
  token: string
): Promise<
  | { ok: true; barberName: string; tier: string; openForCustomers: boolean }
  | { ok: false; error: string }
> {
  const t = token.trim();
  if (!t) return { ok: false, error: 'الرابط غير مكتمل.' };
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار الخدمة غير مضبوط.' };
  try {
    const url = new URL(ep, window.location.origin);
    url.searchParams.set('token', t);
    const response = await fetch(url.toString(), { method: 'GET', headers: baseHeaders() });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      barberName?: string;
      tier?: string;
      openForCustomers?: boolean;
    };
    if (!response.ok) {
      return { ok: false, error: payload.error || `HTTP ${response.status}` };
    }
    return {
      ok: true,
      barberName: String(payload.barberName ?? ''),
      tier: String(payload.tier ?? 'bronze'),
      openForCustomers: payload.openForCustomers !== false,
    };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

function portalSessionHeaders(): Record<string, string> {
  const headers = baseHeaders();
  try {
    const raw = localStorage.getItem('barberAuth');
    if (raw) {
      const parsed = JSON.parse(raw) as { barberSessionToken?: unknown };
      const token = String(parsed.barberSessionToken ?? '').trim();
      if (token) headers['x-barber-portal-session'] = token;
    }
  } catch {
    /* ignore */
  }
  return headers;
}

export function normalizeLicenseCodeInput(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export async function requestBronzeShopOpenRotateRemote(input: {
  licenseCode: string;
  email: string;
}): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  const ep = String(import.meta.env.VITE_BARBER_OPEN_STATUS_ROTATE_REQUEST_URL || '/api/barber-open-status-rotate-request').trim();
  try {
    const response = await fetch(new URL(ep, window.location.origin).toString(), {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        licenseCode: normalizeLicenseCodeInput(input.licenseCode),
        email: input.email.trim(),
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
    if (!response.ok) {
      return { ok: false, error: payload.error || `HTTP ${response.status}` };
    }
    return {
      ok: true,
      message:
        payload.message ||
        'إذا تطابقت رقم الرخصة والبريد المسجّل، ستصلك رسالة تأكيد خلال دقائق.',
    };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export async function confirmBronzeShopOpenRotateRemote(
  confirmToken: string,
): Promise<
  | { ok: true; barberName: string; openStatusToken: string; shopOpenUrl: string }
  | { ok: false; error: string }
> {
  const ep = String(import.meta.env.VITE_BARBER_OPEN_STATUS_ROTATE_CONFIRM_URL || '/api/barber-open-status-rotate-confirm').trim();
  try {
    const response = await fetch(new URL(ep, window.location.origin).toString(), {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({ confirmToken: confirmToken.trim() }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      barberName?: string;
      openStatusToken?: string;
      shopOpenUrl?: string;
    };
    if (!response.ok) {
      return { ok: false, error: payload.error || `HTTP ${response.status}` };
    }
    return {
      ok: true,
      barberName: String(payload.barberName ?? ''),
      openStatusToken: String(payload.openStatusToken ?? ''),
      shopOpenUrl: String(payload.shopOpenUrl ?? ''),
    };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export async function rotateShopOpenStatusFromDashboardRemote(): Promise<
  | { ok: true; barberName: string; openStatusToken: string; shopOpenUrl: string }
  | { ok: false; error: string; code?: string }
> {
  const ep = String(import.meta.env.VITE_BARBER_OPEN_STATUS_ROTATE_URL || '/api/barber-open-status-rotate').trim();
  try {
    const response = await fetch(new URL(ep, window.location.origin).toString(), {
      method: 'POST',
      headers: portalSessionHeaders(),
      body: JSON.stringify({}),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
      barberName?: string;
      openStatusToken?: string;
      shopOpenUrl?: string;
    };
    if (!response.ok) {
      return { ok: false, error: payload.error || `HTTP ${response.status}`, code: payload.code };
    }
    return {
      ok: true,
      barberName: String(payload.barberName ?? ''),
      openStatusToken: String(payload.openStatusToken ?? ''),
      shopOpenUrl: String(payload.shopOpenUrl ?? ''),
    };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export async function setBarberShopOpenStatusRemote(
  token: string,
  openForCustomers: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const t = token.trim();
  if (!t) return { ok: false, error: 'الرابط غير مكتمل.' };
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار الخدمة غير مضبوط.' };
  try {
    const response = await fetch(new URL(ep, window.location.origin).toString(), {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({ token: t, openForCustomers }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      return { ok: false, error: payload.error || `HTTP ${response.status}` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}
