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
