/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_SERVICE_DURATION_MINUTES = 30;
export const MAX_BARBER_SERVICES = 40;
export const MAX_SERVICE_NAME_LEN = 80;
export const MAX_SERVICE_PRICE_SAR = 99_999;

export type BarberServiceCatalogRow = {
  id: string;
  barber_id: string;
  service_name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  category: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type BarberServicePromptItem = {
  name: string;
  price: number;
  durationMinutes: number;
};

export function normalizeServiceName(raw: unknown): string {
  return String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_SERVICE_NAME_LEN);
}

export function parseServicePriceSar(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    const n = Math.round(raw * 100) / 100;
    if (n < 0 || n > MAX_SERVICE_PRICE_SAR) return null;
    return n;
  }
  const s = String(raw ?? '')
    .replace(/,/g, '.')
    .replace(/[^\d.]/g, '')
    .trim();
  if (!s) return null;
  const n = Number.parseFloat(s);
  if (!Number.isFinite(n) || n < 0 || n > MAX_SERVICE_PRICE_SAR) return null;
  return Math.round(n * 100) / 100;
}

export function parseDurationMinutes(raw: unknown, fallback = DEFAULT_SERVICE_DURATION_MINUTES): number {
  const n = typeof raw === 'number' ? raw : Number.parseInt(String(raw ?? ''), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(480, Math.max(5, Math.floor(n)));
}

/** يفكّ أسطر ملخص التسجيل مثل: «قص شعر — 50 ر.س» */
export function parseServicesSummaryLines(
  summary: string,
): Array<{ service_name: string; price: number }> {
  const text = String(summary ?? '').trim();
  if (!text || text === '—' || text === '-') return [];

  const out: Array<{ service_name: string; price: number }> = [];
  const seen = new Set<string>();

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === '—' || trimmed === '-') continue;

    const m = trimmed.match(/^(.+?)\s*[—–\-]\s*([\d.,]+)\s*(?:ر\.?\s*س|sar)?\s*$/i);
    let name = '';
    let price = 0;
    if (m) {
      name = normalizeServiceName(m[1]);
      price = parseServicePriceSar(m[2]) ?? 0;
    } else {
      name = normalizeServiceName(trimmed.replace(/\s*[—–\-]\s*.*$/, ''));
      price = 0;
    }
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ service_name: name, price });
    if (out.length >= MAX_BARBER_SERVICES) break;
  }

  return out;
}

function mapRow(row: Record<string, unknown>): BarberServiceCatalogRow {
  return {
    id: String(row.id ?? ''),
    barber_id: String(row.barber_id ?? ''),
    service_name: String(row.service_name ?? ''),
    description: row.description == null ? null : String(row.description),
    price: Number(row.price) || 0,
    duration_minutes: Number(row.duration_minutes) || DEFAULT_SERVICE_DURATION_MINUTES,
    category: row.category == null ? null : String(row.category),
    is_active: row.is_active !== false,
    ...(row.created_at ? { created_at: String(row.created_at) } : {}),
    ...(row.updated_at ? { updated_at: String(row.updated_at) } : {}),
  };
}

export async function listBarberServicesCatalog(
  supabase: SupabaseClient,
  barberId: string,
  opts?: { includeInactive?: boolean },
): Promise<BarberServiceCatalogRow[]> {
  let q = supabase
    .from('barber_services')
    .select(
      'id, barber_id, service_name, description, price, duration_minutes, category, is_active, created_at, updated_at',
    )
    .eq('barber_id', barberId)
    .order('created_at', { ascending: true })
    .limit(MAX_BARBER_SERVICES);

  if (!opts?.includeInactive) {
    q = q.eq('is_active', true);
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function loadActiveServicesForPrompt(
  supabase: SupabaseClient,
  barberId: string,
): Promise<BarberServicePromptItem[]> {
  const rows = await listBarberServicesCatalog(supabase, barberId, { includeInactive: false });
  return rows.map((r) => ({
    name: r.service_name,
    price: r.price,
    durationMinutes: r.duration_minutes,
  }));
}

export async function upsertBarberServiceCatalog(
  supabase: SupabaseClient,
  input: {
    barberId: string;
    id?: string | null;
    serviceName: string;
    price: number;
    durationMinutes?: number;
    description?: string | null;
    category?: string | null;
    isActive?: boolean;
  },
): Promise<BarberServiceCatalogRow> {
  const serviceName = normalizeServiceName(input.serviceName);
  if (!serviceName) throw new Error('service_name_required');

  const price = parseServicePriceSar(input.price);
  if (price == null) throw new Error('invalid_price');

  const durationMinutes = parseDurationMinutes(input.durationMinutes);
  const description = input.description == null ? null : String(input.description).trim().slice(0, 400) || null;
  const category = input.category == null ? null : String(input.category).trim().slice(0, 60) || null;
  const isActive = input.isActive !== false;
  const id = String(input.id ?? '').trim();

  if (id) {
    const { data, error } = await supabase
      .from('barber_services')
      .update({
        service_name: serviceName,
        price,
        duration_minutes: durationMinutes,
        description,
        category,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('barber_id', input.barberId)
      .select(
        'id, barber_id, service_name, description, price, duration_minutes, category, is_active, created_at, updated_at',
      )
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('service_not_found');
    return mapRow(data as Record<string, unknown>);
  }

  const existing = await listBarberServicesCatalog(supabase, input.barberId, { includeInactive: true });
  if (existing.length >= MAX_BARBER_SERVICES) throw new Error('services_limit_reached');

  const { data, error } = await supabase
    .from('barber_services')
    .insert({
      barber_id: input.barberId,
      service_name: serviceName,
      price,
      duration_minutes: durationMinutes,
      description,
      category,
      is_active: isActive,
    })
    .select(
      'id, barber_id, service_name, description, price, duration_minutes, category, is_active, created_at, updated_at',
    )
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}

export async function deleteBarberServiceCatalog(
  supabase: SupabaseClient,
  barberId: string,
  serviceId: string,
): Promise<void> {
  const id = String(serviceId ?? '').trim();
  if (!id) throw new Error('service_id_required');
  const { data, error } = await supabase
    .from('barber_services')
    .delete()
    .eq('id', id)
    .eq('barber_id', barberId)
    .select('id')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('service_not_found');
}

async function findRegistrationServicesSummary(
  supabase: SupabaseClient,
  barberId: string,
  email: string,
): Promise<string> {
  const emailNorm = email.trim().toLowerCase();

  const { data: byLink } = await supabase
    .from('registration_submissions')
    .select('payload')
    .filter('payload->>linkedBarberId', 'eq', barberId)
    .order('created_at', { ascending: false })
    .limit(5);

  for (const row of byLink ?? []) {
    const payload = (row as { payload?: Record<string, unknown> }).payload ?? {};
    const summary = String(payload.servicesSummary ?? '').trim();
    if (summary && summary !== '—') return summary;
    const services = payload.services;
    if (Array.isArray(services) && services.length > 0) {
      return services
        .map((s) => {
          const o = s as { name?: unknown; price?: unknown };
          const name = normalizeServiceName(o.name);
          const price = parseServicePriceSar(o.price);
          if (!name) return '';
          return `${name} — ${price ?? '—'} ر.س`;
        })
        .filter(Boolean)
        .join('\n');
    }
  }

  if (!emailNorm.includes('@')) return '';

  const { data: byEmail } = await supabase
    .from('registration_submissions')
    .select('payload')
    .filter('payload->>email', 'ilike', emailNorm)
    .order('created_at', { ascending: false })
    .limit(3);

  for (const row of byEmail ?? []) {
    const payload = (row as { payload?: Record<string, unknown> }).payload ?? {};
    const summary = String(payload.servicesSummary ?? '').trim();
    if (summary && summary !== '—') return summary;
  }

  return '';
}

export async function seedBarberServicesFromRegistration(
  supabase: SupabaseClient,
  barberId: string,
  email: string,
): Promise<{ seeded: number; services: BarberServiceCatalogRow[] }> {
  const existing = await listBarberServicesCatalog(supabase, barberId, { includeInactive: true });
  if (existing.length > 0) {
    return { seeded: 0, services: existing.filter((s) => s.is_active) };
  }

  const summary = await findRegistrationServicesSummary(supabase, barberId, email);
  const parsed = parseServicesSummaryLines(summary);
  if (parsed.length === 0) {
    return { seeded: 0, services: [] };
  }

  const rows = parsed.map((p) => ({
    barber_id: barberId,
    service_name: p.service_name,
    price: p.price,
    duration_minutes: DEFAULT_SERVICE_DURATION_MINUTES,
    is_active: true,
  }));

  const { data, error } = await supabase
    .from('barber_services')
    .insert(rows)
    .select(
      'id, barber_id, service_name, description, price, duration_minutes, category, is_active, created_at, updated_at',
    );
  if (error) throw new Error(error.message);

  const services = (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
  return { seeded: services.length, services };
}
