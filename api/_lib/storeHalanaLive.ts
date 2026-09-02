/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حلانا1 — نسخ غير معلنة. بلا ميسر على طلب العميلة.
 */
import { randomBytes } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

export const STORE_HALANA_COPIES_TABLE = 'store_halana_copies' as const;
export const STORE_HALANA_REQUESTS_TABLE = 'store_halana_requests' as const;

const STATUSES = new Set([
  'new',
  'quoted',
  'awaiting_deposit',
  'confirmed',
  'preparing',
  'ready',
  'completed',
  'declined',
]);

type Db = SupabaseClient;

export function newHalanaToken(): string {
  return randomBytes(24).toString('base64url');
}

export function normalizeHalanaEmail(raw: unknown): string {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .slice(0, 180);
}

export function isHalanaEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) && raw.length <= 180;
}

function clip(raw: unknown, max: number): string {
  return String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function halanaShopUrl(token: string): string {
  return `https://store.halaqmap.com/#/h/${encodeURIComponent(token)}`;
}

export function halanaDeskUrl(token: string): string {
  return `https://store.halaqmap.com/#/h/${encodeURIComponent(token)}/desk`;
}

export function publicCopyPayload(row: Record<string, unknown>, requests: Record<string, unknown>[] = []) {
  return {
    shopName: String(row.shop_name || row.specialist_name || 'حلانا1'),
    specialistName: String(row.specialist_name || ''),
    flavorsAr: String(row.flavors_ar || ''),
    policyAr: String(row.policy_ar || ''),
    quotesAr: String(row.quotes_ar || ''),
    whatsapp: String(row.whatsapp || ''),
    galleryUrls: String(row.gallery_urls || ''),
    readyLines: String(row.ready_lines || ''),
    requests,
  };
}

export async function findHalanaCopy(
  db: Db,
  token: string,
  role: 'shop' | 'desk',
): Promise<Record<string, unknown> | null> {
  const col = role === 'desk' ? 'desk_token' : 'shop_token';
  const { data } = await db
    .from(STORE_HALANA_COPIES_TABLE)
    .select('*')
    .eq(col, token)
    .eq('status', 'issued')
    .maybeSingle();
  return (data as Record<string, unknown> | null) || null;
}

export async function listHalanaRequests(db: Db, copyId: string): Promise<Record<string, unknown>[]> {
  const { data } = await db
    .from(STORE_HALANA_REQUESTS_TABLE)
    .select('*')
    .eq('copy_id', copyId)
    .order('created_at', { ascending: false })
    .limit(80);
  return (data || []) as Record<string, unknown>[];
}

export async function issueHalanaCopy(
  db: Db,
  input: { name: string; email: string; issuedBy: string },
): Promise<{ ok: true; copyId: string; shopToken: string; deskToken: string } | { ok: false; error: string }> {
  const name = clip(input.name, 80);
  const email = normalizeHalanaEmail(input.email);
  if (name.length < 2) return { ok: false, error: 'أدخل اسم المتخصصة.' };
  if (!isHalanaEmail(email)) return { ok: false, error: 'أدخل بريداً صالحاً.' };
  const shopToken = newHalanaToken();
  const deskToken = newHalanaToken();
  const { data, error } = await db
    .from(STORE_HALANA_COPIES_TABLE)
    .insert({
      specialist_name: name,
      shop_name: name,
      beneficiary_email: email,
      shop_token: shopToken,
      desk_token: deskToken,
      issued_by: clip(input.issuedBy, 80),
    })
    .select('id')
    .maybeSingle();
  if (error || !data) return { ok: false, error: 'تعذر إصدار النسخة.' };
  return { ok: true, copyId: String(data.id), shopToken, deskToken };
}

export async function addHalanaRequest(
  db: Db,
  copyId: string,
  input: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const deliverAt = clip(input.deliverAt, 80);
  const quantity = clip(input.quantity, 40);
  const sweetType = clip(input.sweetType, 60);
  const fillings = clip(input.fillings, 160);
  if (deliverAt.length < 2) return { ok: false, error: 'أدخلي وقت الوصول المطلوب.' };
  if (quantity.length < 1) return { ok: false, error: 'أدخلي العدد.' };
  if (sweetType.length < 2) return { ok: false, error: 'أدخلي النوع.' };
  if (fillings.length < 2) return { ok: false, error: 'أدخلي الحشوات المفضلة.' };
  const { error } = await db.from(STORE_HALANA_REQUESTS_TABLE).insert({
    copy_id: copyId,
    deliver_at: deliverAt,
    quantity,
    sweet_type: sweetType,
    fillings,
    ref_note: clip(input.refNote, 400),
    guest_name: clip(input.guestName, 80),
    guest_whatsapp: String(input.guestWhatsapp || '').replace(/\D/g, '').slice(0, 15),
  });
  if (error) return { ok: false, error: 'تعذر حفظ الطلب.' };
  return { ok: true };
}

export async function saveHalanaHost(
  db: Db,
  copyId: string,
  input: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await db
    .from(STORE_HALANA_COPIES_TABLE)
    .update({
      shop_name: clip(input.shopName, 80),
      flavors_ar: String(input.flavorsAr || '').slice(0, 800),
      policy_ar: String(input.policyAr || '').slice(0, 1200),
      quotes_ar: String(input.quotesAr || '').slice(0, 1200),
      whatsapp: String(input.whatsapp || '').replace(/\D/g, '').slice(0, 15),
      gallery_urls: String(input.galleryUrls || '').slice(0, 2000),
      ready_lines: String(input.readyLines || '').slice(0, 800),
      updated_at: new Date().toISOString(),
    })
    .eq('id', copyId);
  if (error) return { ok: false, error: 'تعذر حفظ اللوحة.' };
  return { ok: true };
}

export async function updateHalanaRequest(
  db: Db,
  copyId: string,
  requestId: string,
  input: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const status = String(input.status || '').trim();
  if (!STATUSES.has(status)) return { ok: false, error: 'حالة غير صالحة.' };
  const patch: Record<string, unknown> = {
    status,
    quote_amount_sar: clip(input.quoteAmountSar, 20),
    quote_note: clip(input.quoteNote, 400),
    updated_at: new Date().toISOString(),
  };
  if (status === 'confirmed') {
    const { data } = await db
      .from(STORE_HALANA_REQUESTS_TABLE)
      .select('deliver_at')
      .eq('id', requestId)
      .eq('copy_id', copyId)
      .maybeSingle();
    patch.locked_date = clip(input.lockedDate || data?.deliver_at, 80);
  }
  const { error } = await db
    .from(STORE_HALANA_REQUESTS_TABLE)
    .update(patch)
    .eq('id', requestId)
    .eq('copy_id', copyId);
  if (error) return { ok: false, error: 'تعذر تحديث الطلب.' };
  return { ok: true };
}

export async function listHalanaCopies(db: Db): Promise<Record<string, unknown>[]> {
  const { data } = await db
    .from(STORE_HALANA_COPIES_TABLE)
    .select('id, specialist_name, beneficiary_email, status, shop_token, desk_token, created_at')
    .order('created_at', { ascending: false })
    .limit(80);
  return (data || []) as Record<string, unknown>[];
}
