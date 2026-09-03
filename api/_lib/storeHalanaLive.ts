/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حلانا1 — نسخ غير معلنة. بلا ميسر على طلب العميلة.
 */
import { randomBytes } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

export const STORE_HALANA_COPIES_TABLE = 'store_halana_copies' as const;
export const STORE_HALANA_REQUESTS_TABLE = 'store_halana_requests' as const;
export const STORE_HALANA_GALLERY_TABLE = 'store_halana_gallery' as const;
export const STORE_HALANA_GALLERY_MAX = 12;
export const STORE_HALANA_YOUTUBE_MAX = 6;
export const STORE_HALANA_IMAGE_MAX_CHARS = 180000;
export const STORE_HALANA_CAPTION_MAX = 180;

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

export type HalanaGalleryItem = { id: string; caption: string; src: string };

export function parseHalanaImageSrc(raw: unknown): string {
  const src = String(raw ?? '').trim();
  if (src.length < 12 || src.length > STORE_HALANA_IMAGE_MAX_CHARS) return '';
  if (/[<>]/.test(src) || /javascript:/i.test(src) || /data:image\/svg/i.test(src)) return '';
  if (/^https:\/\/[^\s]+$/i.test(src) && src.length <= 500) return src;
  if (/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=\s]+$/i.test(src)) return src;
  return '';
}

function galleryFromLegacyUrls(raw: string): HalanaGalleryItem[] {
  return String(raw || '')
    .split('\n')
    .map((line) => parseHalanaImageSrc(line))
    .filter(Boolean)
    .slice(0, STORE_HALANA_GALLERY_MAX)
    .map((src, index) => ({ id: `url-${index}`, caption: '', src }));
}

export function halanaShopUrl(token: string): string {
  return `https://store.halaqmap.com/#/h/${encodeURIComponent(token)}`;
}

export function halanaDeskUrl(token: string): string {
  return `https://store.halaqmap.com/#/h/${encodeURIComponent(token)}/desk`;
}

export function halanaOrderUrl(token: string): string {
  return `https://store.halaqmap.com/#/h/${encodeURIComponent(token)}/order`;
}

export function parseHalanaYoutubeLines(raw: unknown): string {
  return String(raw ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(line) && !/[<>]/.test(line))
    .slice(0, STORE_HALANA_YOUTUBE_MAX)
    .join('\n')
    .slice(0, 2000);
}

export function publicCopyPayload(
  row: Record<string, unknown>,
  requests: Record<string, unknown>[] = [],
  gallery: HalanaGalleryItem[] = [],
) {
  const uploaded = gallery.filter((item) => parseHalanaImageSrc(item.src));
  const merged = uploaded.length > 0 ? uploaded : galleryFromLegacyUrls(String(row.gallery_urls || ''));
  return {
    shopName: String(row.shop_name || row.specialist_name || 'حلانا1'),
    specialistName: String(row.specialist_name || ''),
    flavorsAr: String(row.flavors_ar || ''),
    policyAr: String(row.policy_ar || ''),
    quotesAr: String(row.quotes_ar || ''),
    whatsapp: String(row.whatsapp || ''),
    gallery: merged,
    readyLines: String(row.ready_lines || ''),
    promoTitleAr: String(row.promo_title_ar || ''),
    promoAr: String(row.promo_ar || ''),
    youtubeUrls: parseHalanaYoutubeLines(row.youtube_urls),
    requests,
  };
}

export async function listHalanaGallery(db: Db, copyId: string): Promise<HalanaGalleryItem[]> {
  const { data } = await db
    .from(STORE_HALANA_GALLERY_TABLE)
    .select('id, caption, image_src, sort_order, created_at')
    .eq('copy_id', copyId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(STORE_HALANA_GALLERY_MAX);
  return ((data || []) as Record<string, unknown>[])
    .map((row) => ({
      id: String(row.id || ''),
      caption: clip(row.caption, STORE_HALANA_CAPTION_MAX),
      src: parseHalanaImageSrc(row.image_src),
    }))
    .filter((item) => item.id && item.src);
}

export async function addHalanaGallery(
  db: Db,
  copyId: string,
  input: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const src = parseHalanaImageSrc(input.imageSrc);
  if (!src) return { ok: false, error: 'ارفع صورة صالحة للعرض.' };
  const { count } = await db
    .from(STORE_HALANA_GALLERY_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('copy_id', copyId);
  if ((count || 0) >= STORE_HALANA_GALLERY_MAX) {
    return { ok: false, error: 'بلغت الصور الحد الأعلى.' };
  }
  const { error } = await db.from(STORE_HALANA_GALLERY_TABLE).insert({
    copy_id: copyId,
    caption: clip(input.caption, STORE_HALANA_CAPTION_MAX),
    image_src: src,
    sort_order: count || 0,
  });
  if (error) return { ok: false, error: 'تعذر حفظ الصورة.' };
  return { ok: true };
}

export async function removeHalanaGallery(
  db: Db,
  copyId: string,
  imageId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const id = String(imageId || '').trim();
  if (!/^[0-9a-f-]{16,40}$/i.test(id)) return { ok: false, error: 'صورة غير صالحة.' };
  const { error } = await db.from(STORE_HALANA_GALLERY_TABLE).delete().eq('id', id).eq('copy_id', copyId);
  if (error) return { ok: false, error: 'تعذر إخفاء الصورة.' };
  return { ok: true };
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
      ready_lines: String(input.readyLines || '').slice(0, 800),
      promo_title_ar: clip(input.promoTitleAr, 80),
      promo_ar: String(input.promoAr || '').slice(0, 1600),
      youtube_urls: parseHalanaYoutubeLines(input.youtubeUrls),
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
