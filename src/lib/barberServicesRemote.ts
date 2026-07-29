/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
const DEFAULT_ENDPOINT = '/api/barber-services';

export type BarberServiceRemoteRow = {
  id: string;
  barber_id: string;
  service_name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  category: string | null;
  is_active: boolean;
};

function endpoint(): string {
  return String(import.meta.env.VITE_BARBER_SERVICES_URL || DEFAULT_ENDPOINT).trim();
}

function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
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

function normalizeError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('missing_token') || m.includes('invalid session') || m.includes('جلسة')) {
    return 'انتهت جلسة الدخول. أعد تسجيل الدخول ثم حاول مرة أخرى.';
  }
  if (m.includes('email does not match')) {
    return 'البريد في الجلسة لا يطابق حساب الصالون.';
  }
  if (m.includes('gold') || m.includes('diamond') || m.includes('ذهبية') || m.includes('ماسية')) {
    return 'إدارة قائمة الخدمات متاحة للباقة الذهبية والماسية.';
  }
  return message || 'تعذّر تنفيذ العملية.';
}

async function postAction<T>(
  payload: Record<string, unknown>,
): Promise<{ ok: true; json: T } | { ok: false; error: string }> {
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار إدارة الخدمات غير مضبوط.' };
  try {
    const response = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify(payload),
    });
    const json = (await response.json().catch(() => ({}))) as T & { error?: string; ok?: boolean };
    if (!response.ok || json.ok !== true) {
      return { ok: false, error: normalizeError(json.error || `HTTP ${response.status}`) };
    }
    return { ok: true, json };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'network_error' };
  }
}

export async function listBarberServicesRemote(input: {
  barberId: string;
  email: string;
}): Promise<{ ok: true; services: BarberServiceRemoteRow[]; seeded: number } | { ok: false; error: string }> {
  const res = await postAction<{ services?: BarberServiceRemoteRow[]; seeded?: number }>({
    action: 'list',
    barberId: input.barberId,
    email: input.email,
  });
  if (!res.ok) return res;
  return {
    ok: true,
    services: Array.isArray(res.json.services) ? res.json.services : [],
    seeded: Number(res.json.seeded) || 0,
  };
}

export async function upsertBarberServiceRemote(input: {
  barberId: string;
  email: string;
  id?: string;
  serviceName: string;
  price: number;
  durationMinutes?: number;
  description?: string;
  isActive?: boolean;
}): Promise<{ ok: true; service: BarberServiceRemoteRow } | { ok: false; error: string }> {
  const res = await postAction<{ service?: BarberServiceRemoteRow }>({
    action: 'upsert',
    barberId: input.barberId,
    email: input.email,
    ...(input.id ? { id: input.id } : {}),
    serviceName: input.serviceName,
    price: input.price,
    durationMinutes: input.durationMinutes ?? 30,
    ...(input.description != null ? { description: input.description } : {}),
    isActive: input.isActive !== false,
  });
  if (!res.ok) return res;
  if (!res.json.service?.id) return { ok: false, error: 'تعذّر حفظ الخدمة.' };
  return { ok: true, service: res.json.service };
}

export async function deleteBarberServiceRemote(input: {
  barberId: string;
  email: string;
  id: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await postAction<Record<string, unknown>>({
    action: 'delete',
    barberId: input.barberId,
    email: input.email,
    id: input.id,
  });
  if (!res.ok) return res;
  return { ok: true };
}
