const DEFAULT_ENDPOINT = '/api/barber-portfolio';

function endpoint(): string {
  return String(import.meta.env.VITE_BARBER_PORTFOLIO_URL || DEFAULT_ENDPOINT).trim();
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

export type BarberPortfolioStats = {
  objectCount: number;
  maxAllowed: number;
};

export async function fetchBarberPortfolioStatsRemote(input: {
  barberId: string;
  email: string;
}): Promise<{ ok: true; data: BarberPortfolioStats } | { ok: false; error: string }> {
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار معرض الأعمال غير مضبوط.' };
  try {
    const response = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        action: 'stats',
        barberId: input.barberId.trim(),
        email: input.email.trim(),
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      objectCount?: unknown;
      maxAllowed?: unknown;
    };
    if (!response.ok) {
      return { ok: false, error: payload.error || `HTTP ${response.status}` };
    }
    const objectCount = Math.max(0, Math.floor(Number(payload.objectCount) || 0));
    const maxAllowed = Math.max(0, Math.floor(Number(payload.maxAllowed) || 0));
    return { ok: true, data: { objectCount, maxAllowed } };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export async function uploadBarberPortfolioImageRemote(input: {
  barberId: string;
  email: string;
  imageBase64: string;
}): Promise<{ ok: true; publicUrl: string; objectPath: string } | { ok: false; error: string }> {
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار معرض الأعمال غير مضبوط.' };
  try {
    const response = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        action: 'upload',
        barberId: input.barberId.trim(),
        email: input.email.trim(),
        imageBase64: input.imageBase64,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      publicUrl?: string;
      objectPath?: string;
    };
    if (!response.ok) {
      return { ok: false, error: payload.error || `HTTP ${response.status}` };
    }
    const publicUrl = String(payload.publicUrl ?? '').trim();
    const objectPath = String(payload.objectPath ?? '').trim();
    if (!publicUrl || !objectPath) {
      return { ok: false, error: 'استجابة غير كاملة من الخادم.' };
    }
    return { ok: true, publicUrl, objectPath };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export async function deleteBarberPortfolioObjectRemote(input: {
  barberId: string;
  email: string;
  objectPath: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار معرض الأعمال غير مضبوط.' };
  try {
    const response = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        action: 'delete',
        barberId: input.barberId.trim(),
        email: input.email.trim(),
        objectPath: input.objectPath.trim(),
      }),
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

/** يستخرج مسار الكائن داخل الحاوية من رابط العلن لمعرض الحلاق */
export function objectPathFromBarberPortfolioPublicUrl(publicUrl: string, barberId: string): string | null {
  const u = publicUrl.trim();
  const marker = '/storage/v1/object/public/barber-portfolio/';
  const i = u.indexOf(marker);
  if (i < 0) return null;
  const path = decodeURIComponent(u.slice(i + marker.length).split('?')[0] ?? '');
  const prefix = `${barberId.trim()}/`;
  if (!path.startsWith(prefix)) return null;
  if (path.includes('..') || path.includes('\\')) return null;
  return path;
}
