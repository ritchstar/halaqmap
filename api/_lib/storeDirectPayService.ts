/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * نظام موحّد لتمرير تعليمات الدفع. بلا ميسر على سلة العميل، بلا عمولة على الحرفة.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { openHalanaIban, sealHalanaIban } from './storeHalanaPay.js';

const PRODUCTS = new Set([
  'store_halana_live',
  'store_kitchen_live',
  'store_grocers_live',
  'store_produce_live',
  'store_restaurant_live',
  'store_cafe_live',
  'store_wedding_live',
  'store_event_live',
  'store_lounge_live',
]);

const GUEST_REVEAL = new Set([
  'store_halana_live',
  'store_kitchen_live',
  'store_grocers_live',
  'store_produce_live',
  'store_restaurant_live',
  'store_cafe_live',
]);

const COPY_TABLE: Record<string, string> = {
  store_halana_live: 'store_halana_copies',
  store_kitchen_live: 'store_kitchen_live_orders',
  store_grocers_live: 'store_grocers_live_orders',
  store_produce_live: 'store_produce_live_orders',
  store_restaurant_live: 'store_restaurant_live_orders',
  store_cafe_live: 'store_cafe_live_orders',
  store_wedding_live: 'store_wedding_live_orders',
  store_event_live: 'store_event_live_orders',
  store_lounge_live: 'store_lounge_live_orders',
};

const LIVE_STATUS = new Set(['issued', 'live', 'pending_renewal']);
const HALANA_PAY_REVEAL = new Set(['quoted', 'awaiting_deposit', 'confirmed', 'preparing', 'ready']);
const TRUSTED_HOSTS = [
  'moyasar.com',
  'tap.company',
  'hyperpay.com',
  'paytabs.com',
  'geidea.net',
  'payfort.com',
  'stcpay.com.sa',
  'stcpay.com',
  'urpay.com.sa',
  'myfatoorah.com',
  'edfaapay.com',
  'stripe.com',
  'checkout.com',
];

type Db = SupabaseClient;

function clip(raw: unknown, max: number): string {
  return String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function normalizeIban(raw: unknown): string {
  return String(raw ?? '')
    .replace(/\s+/g, '')
    .toUpperCase()
    .slice(0, 34);
}

function isIban(raw: unknown): boolean {
  return /^SA\d{22}$/.test(normalizeIban(raw));
}

function normalizeMobile(raw: unknown): string {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (digits.startsWith('966') && digits.length === 12) return `0${digits.slice(3)}`;
  return digits.slice(0, 15);
}

function isMobile(raw: unknown): boolean {
  return /^05\d{8}$/.test(normalizeMobile(raw));
}

function isEmail(raw: unknown): boolean {
  const email = String(raw ?? '')
    .trim()
    .toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 180;
}

function isEntity(raw: unknown): boolean {
  return /^7\d{9}$/.test(String(raw ?? '').replace(/\D/g, ''));
}

function normalizeSarie(kind: string, raw: unknown): string {
  if (kind === 'mobile') return normalizeMobile(raw);
  if (kind === 'email') {
    return String(raw ?? '')
      .trim()
      .toLowerCase()
      .slice(0, 180);
  }
  return String(raw ?? '')
    .replace(/\D/g, '')
    .slice(0, 10);
}

function isTrustedHost(hostname: string): boolean {
  const host = hostname.replace(/^www\./i, '').toLowerCase();
  return TRUSTED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

function normalizeExternalUrl(raw: unknown): string {
  const value = String(raw ?? '')
    .trim()
    .slice(0, 400);
  if (!value) return '';
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return '';
    if (url.username || url.password) return '';
    if (!isTrustedHost(url.hostname)) return '';
    return url.toString();
  } catch {
    return '';
  }
}

function parseImageSrc(raw: unknown): string {
  const src = String(raw ?? '').trim();
  if (src.length < 12 || src.length > 180000) return '';
  if (/[<>]/.test(src) || /javascript:/i.test(src) || /data:image\/svg/i.test(src)) return '';
  if (/^https:\/\/[^\s]+$/i.test(src) && src.length <= 500) return src;
  if (/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=\s]+$/i.test(src)) return src;
  return '';
}

export function isDirectPayProduct(raw: unknown): boolean {
  return PRODUCTS.has(String(raw || ''));
}

export function publicDirectPayFromRow(row: Record<string, unknown>) {
  return {
    bankTransfer: Boolean(row.enabled_iban) && Boolean(String(row.pay_iban_cipher || '').trim() || String(row.pay_bank_name || '').trim()),
    stcBank: Boolean(row.enabled_stc) && Boolean(String(row.pay_stc_mobile_cipher || '').trim()),
    sarie: Boolean(row.enabled_sarie) && Boolean(String(row.pay_sarie_alias_cipher || '').trim()),
    externalLink: Boolean(row.enabled_external) && Boolean(String(row.pay_external_url || '').trim()),
    cashOnPickup: Boolean(row.pay_cash_remainder),
    networkOnPickup: Boolean(row.pay_network_remainder),
  };
}

export function deskDirectPayFromRow(row: Record<string, unknown>) {
  const sarieKind = String(row.pay_sarie_kind || '');
  return {
    bankName: String(row.pay_bank_name || ''),
    beneficiaryName: String(row.pay_beneficiary_name || ''),
    iban: openHalanaIban(String(row.pay_iban_cipher || '')),
    stcMobile: openHalanaIban(String(row.pay_stc_mobile_cipher || '')),
    sarieKind: sarieKind === 'email' || sarieKind === 'entity' || sarieKind === 'mobile' ? sarieKind : '',
    sarieAlias: openHalanaIban(String(row.pay_sarie_alias_cipher || '')),
    externalUrl: String(row.pay_external_url || ''),
    cashRemainder: Boolean(row.pay_cash_remainder),
    networkRemainder: Boolean(row.pay_network_remainder),
    enabledIban: Boolean(row.enabled_iban),
    enabledStc: Boolean(row.enabled_stc),
    enabledSarie: Boolean(row.enabled_sarie),
    enabledExternal: Boolean(row.enabled_external),
  };
}

export async function findDirectPayCopy(
  db: Db,
  product: string,
  token: string,
  role: 'shop' | 'desk',
): Promise<Record<string, unknown> | null> {
  const table = COPY_TABLE[product];
  if (!table || token.length < 16) return null;
  const col = role === 'desk' ? 'desk_token' : 'shop_token';
  const { data } = await db.from(table).select('id, status').eq(col, token).maybeSingle();
  if (!data) return null;
  const status = String(data.status || '');
  if (!LIVE_STATUS.has(status)) return null;
  return data as Record<string, unknown>;
}

export async function loadDirectPayProfile(db: Db, product: string, copyId: string) {
  const { data } = await db
    .from('store_direct_pay_profiles')
    .select('*')
    .eq('product_tag', product)
    .eq('copy_id', copyId)
    .maybeSingle();
  return (data as Record<string, unknown> | null) || null;
}

export async function saveDirectPayProfile(
  db: Db,
  product: string,
  copyId: string,
  input: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const iban = normalizeIban(input.iban);
  if (iban && !isIban(iban)) return { ok: false, error: 'أدخل آيباناً سعودياً صالحاً.' };
  const stc = normalizeMobile(input.stcMobile);
  if (stc && !isMobile(stc)) return { ok: false, error: 'أدخل جوالاً سعودياً صالحاً لـ STC Bank.' };
  const sarieKind = String(input.sarieKind || '').trim();
  if (sarieKind && sarieKind !== 'mobile' && sarieKind !== 'email' && sarieKind !== 'entity') {
    return { ok: false, error: 'نوع معرّف سريع غير صالح.' };
  }
  const sarieAlias = sarieKind ? normalizeSarie(sarieKind, input.sarieAlias) : '';
  if (sarieAlias) {
    if (sarieKind === 'mobile' && !isMobile(sarieAlias)) return { ok: false, error: 'معرّف سريع بالجوال غير صالح.' };
    if (sarieKind === 'email' && !isEmail(sarieAlias)) return { ok: false, error: 'معرّف سريع بالبريد غير صالح.' };
    if (sarieKind === 'entity' && !isEntity(sarieAlias)) return { ok: false, error: 'أدخل الرقم الموحّد للمنشأة. لا تُستخدم الهوية أو الإقامة.' };
  }
  const externalUrl = normalizeExternalUrl(input.externalUrl);
  if (String(input.externalUrl || '').trim() && !externalUrl) {
    return { ok: false, error: 'الرابط الخارجي يجب أن يكون HTTPS على نطاق مزوّد مرخّص، بلا اختصار.' };
  }
  const row = {
    product_tag: product,
    copy_id: copyId,
    pay_bank_name: clip(input.bankName, 80),
    pay_beneficiary_name: clip(input.beneficiaryName, 80),
    pay_iban_cipher: iban ? sealHalanaIban(iban) : '',
    pay_stc_mobile_cipher: stc ? sealHalanaIban(stc) : '',
    pay_sarie_kind: sarieKind,
    pay_sarie_alias_cipher: sarieAlias ? sealHalanaIban(sarieAlias) : '',
    pay_external_url: externalUrl,
    pay_cash_remainder: Boolean(input.cashRemainder),
    pay_network_remainder: Boolean(input.networkRemainder),
    enabled_iban: Boolean(input.enabledIban) && Boolean(iban),
    enabled_stc: Boolean(input.enabledStc) && Boolean(stc),
    enabled_sarie: Boolean(input.enabledSarie) && Boolean(sarieAlias),
    enabled_external: Boolean(input.enabledExternal) && Boolean(externalUrl),
    updated_at: new Date().toISOString(),
  };
  const { error } = await db.from('store_direct_pay_profiles').upsert(row, { onConflict: 'product_tag,copy_id' });
  if (error) return { ok: false, error: 'تعذر حفظ وسائل التحويل.' };
  return { ok: true };
}

async function halanaRequestReady(db: Db, copyId: string, requestRef: string): Promise<boolean> {
  if (!/^[0-9a-f-]{16,40}$/i.test(requestRef)) return false;
  const { data } = await db
    .from('store_halana_requests')
    .select('status')
    .eq('id', requestRef)
    .eq('copy_id', copyId)
    .maybeSingle();
  return Boolean(data && HALANA_PAY_REVEAL.has(String(data.status || '')));
}

export async function getDirectPayInstructions(
  db: Db,
  product: string,
  copyId: string,
  requestRef: string,
): Promise<
  | { ok: true; ready: false; payPublic: ReturnType<typeof publicDirectPayFromRow> }
  | { ok: true; ready: true; pay: ReturnType<typeof deskDirectPayFromRow>; proofUploaded: boolean }
  | { ok: false; error: string }
> {
  if (!GUEST_REVEAL.has(product)) return { ok: false, error: 'هذا المنتج لا يعرض تعليمات تحويل للزائر.' };
  const profile = await loadDirectPayProfile(db, product, copyId);
  const payPublic = publicDirectPayFromRow(profile || {});
  const ref = String(requestRef || '').trim();
  if (!ref) return { ok: true, ready: false, payPublic };
  if (product === 'store_halana_live') {
    const ready = await halanaRequestReady(db, copyId, ref);
    if (!ready) return { ok: true, ready: false, payPublic };
  } else if (ref.length < 4 || ref.length > 80) {
    return { ok: false, error: 'طلب غير صالح.' };
  }
  if (!profile) return { ok: true, ready: false, payPublic };
  const { count } = await db
    .from('store_direct_pay_proofs')
    .select('id', { count: 'exact', head: true })
    .eq('product_tag', product)
    .eq('copy_id', copyId)
    .eq('request_ref', ref);
  return {
    ok: true,
    ready: true,
    pay: deskDirectPayFromRow(profile),
    proofUploaded: (count || 0) > 0,
  };
}

export async function addDirectPayProof(
  db: Db,
  product: string,
  copyId: string,
  requestRef: string,
  imageSrc: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!GUEST_REVEAL.has(product)) return { ok: false, error: 'رفع الإثبات غير متاح هنا.' };
  const ref = String(requestRef || '').trim();
  if (ref.length < 4 || ref.length > 80) return { ok: false, error: 'طلب غير صالح.' };
  const src = parseImageSrc(imageSrc);
  if (!src) return { ok: false, error: 'ارفع إثبات العملية المرتبطة بهذا الطلب فقط.' };
  if (product === 'store_halana_live') {
    const ready = await halanaRequestReady(db, copyId, ref);
    if (!ready) return { ok: false, error: 'رفع الإثبات متاح بعد عرض السعر وقبل تأكيد العربون.' };
  }
  const { error } = await db.from('store_direct_pay_proofs').upsert(
    { product_tag: product, copy_id: copyId, request_ref: ref, image_src: src },
    { onConflict: 'product_tag,copy_id,request_ref' },
  );
  if (error) return { ok: false, error: 'تعذر حفظ الإثبات.' };
  if (product === 'store_halana_live') {
    await db
      .from('store_halana_requests')
      .update({ status: 'awaiting_deposit', updated_at: new Date().toISOString() })
      .eq('id', ref)
      .eq('copy_id', copyId)
      .eq('status', 'quoted');
  }
  return { ok: true };
}

export async function listDirectPayProofs(
  db: Db,
  product: string,
  copyId: string,
): Promise<Record<string, string>> {
  const { data } = await db
    .from('store_direct_pay_proofs')
    .select('request_ref, image_src')
    .eq('product_tag', product)
    .eq('copy_id', copyId)
    .limit(80);
  const map: Record<string, string> = {};
  for (const row of (data || []) as Record<string, unknown>[]) {
    const src = parseImageSrc(row.image_src);
    const id = String(row.request_ref || '');
    if (id && src) map[id] = src;
  }
  return map;
}
