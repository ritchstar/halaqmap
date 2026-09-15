/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * منطق هدية بخورنا1: خمسون مؤكَّداً ثم سحب تقني. باقة 180 يوماً فقط.
 */
import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  bakhurnaLiveTermEndIso,
  newBakhurnaToken,
  STORE_BAKHURNA_LIVE_DAYS_6,
  STORE_BAKHURNA_LIVE_POLICY,
  STORE_BAKHURNA_LIVE_PRICE_6_HALALAS,
  STORE_BAKHURNA_LIVE_TABLE,
  type BakhurnaLiveOrderPayload,
} from './storeBakhurnaLive.js';
import { DEFAULT_STORE_SHOP_HOURS } from './storeShopHours.js';
import { DEFAULT_SHOP_PICKUP } from './storeShopPlace.js';
import { sendBakhurnaLiveLinksEmail } from './storeBakhurnaLiveMail.js';
import { storeLiveShopShareHref } from './storeLiveShopShare.js';

export const STORE_BAKHURNA_GIFT_CYCLE_CAP = 50 as const;
export const STORE_BAKHURNA_GIFT_SLOT_COUNT = 5 as const;
export const STORE_BAKHURNA_GIFT_TERMS_VERSION = 'bakhurna-gift-1' as const;
export const STORE_BAKHURNA_GIFT_CONFIRM_HOURS = 48 as const;
export const STORE_BAKHURNA_GIFT_RESEND_COOLDOWN_MS = 10 * 60 * 1000;
export const STORE_BAKHURNA_GIFT_PRODUCT_LABEL_AR = 'بخورنا1' as const;
export const STORE_BAKHURNA_GIFT_ISSUED_BY = 'هدية بخورنا1' as const;
export const STORE_BAKHURNA_GIFT_LABEL_AR = 'هدية من متجر خريطة الحل' as const;

type StoreBakhurnaGiftSource = 'google' | 'youtube' | 'x' | 'snapchat' | 'friend';

export const STORE_BAKHURNA_GIFT_CYCLES_TABLE = 'store_bakhurna_gift_cycles' as const;
export const STORE_BAKHURNA_GIFT_ENTRIES_TABLE = 'store_bakhurna_gift_entries' as const;

type Db = SupabaseClient;

export type StoreBakhurnaGiftCycleRow = {
  id: string;
  slot_no: number;
  status: string;
  nominated_entry_id: string | null;
  winner_entry_id: string | null;
  bakhurna_order_id: string | null;
  drawn_at: string | null;
};

const SOURCES = new Set<StoreBakhurnaGiftSource>(['google', 'youtube', 'x', 'snapchat', 'friend']);

export function normalizeBakhurnaGiftEmail(raw: unknown): string {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .slice(0, 180);
}

export function isBakhurnaGiftEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) && raw.length <= 180;
}

export function normalizeBakhurnaGivenName(raw: unknown): string {
  return String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

export function isBakhurnaGivenName(raw: string): boolean {
  const parts = raw.split(' ').filter(Boolean);
  if (parts.length < 2 || /[0-9]/.test(raw)) return false;
  return raw.length >= 5;
}

export function parseBakhurnaGiftSource(raw: unknown): StoreBakhurnaGiftSource | null {
  const v = String(raw ?? '').trim() as StoreBakhurnaGiftSource;
  return SOURCES.has(v) ? v : null;
}

function clip(raw: unknown, max: number): string {
  return String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function confirmSecret(): string | null {
  const s = (
    process.env.STORE_GIFT_EMAIL_CONFIRM_SECRET ||
    process.env.BRONZE_TRIAL_EMAIL_CONFIRM_SECRET ||
    process.env.REGISTRATION_INTENT_SECRET ||
    process.env.LISTING_LICENSE_VOUCHER_PEPPER ||
    ''
  ).trim();
  return s.length >= 16 ? s : null;
}

export function mintBakhurnaGiftConfirmToken(input: {
  entryId: string;
  email: string;
}): { ok: true; token: string } | { ok: false; error: string } {
  const secret = confirmSecret();
  if (!secret) return { ok: false, error: 'تعذر تجهيز رسالة التأكيد.' };
  const exp = Math.floor(Date.now() / 1000) + 48 * 3600;
  const payloadB64 = Buffer.from(
    JSON.stringify({ kid: input.entryId, em: input.email, exp }),
    'utf8',
  ).toString('base64url');
  const sig = createHmac('sha256', secret).update(payloadB64).digest('base64url');
  return { ok: true, token: `${payloadB64}.${sig}` };
}

export function verifyBakhurnaGiftConfirmToken(
  token: string,
): { ok: true; entryId: string; email: string } | { ok: false; error: string } {
  const secret = confirmSecret();
  if (!secret) return { ok: false, error: 'تعذر التحقق.' };
  const parts = String(token ?? '').trim().split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { ok: false, error: 'رابط غير صالح.' };
  const expected = createHmac('sha256', secret).update(parts[0]).digest();
  let got: Buffer;
  try {
    got = Buffer.from(parts[1], 'base64url');
  } catch {
    return { ok: false, error: 'رابط غير صالح.' };
  }
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) {
    return { ok: false, error: 'رابط غير صالح.' };
  }
  try {
    const parsed = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as {
      kid?: string;
      em?: string;
      exp?: number;
    };
    if (!parsed.kid || !parsed.em || !parsed.exp) return { ok: false, error: 'رابط غير صالح.' };
    if (parsed.exp * 1000 < Date.now()) return { ok: false, error: 'انتهت صلاحية رابط التأكيد.' };
    return { ok: true, entryId: parsed.kid, email: parsed.em };
  } catch {
    return { ok: false, error: 'رابط غير صالح.' };
  }
}

export function bakhurnaGiftConfirmUrl(token: string): string {
  return `https://store.halaqmap.com/#/store/bakhurna/gift/confirm?t=${encodeURIComponent(token)}`;
}

export function pickBakhurnaGiftWinnerIndex(count: number, entropy: (max: number) => number = randomInt): number {
  if (count < 1) return 0;
  return entropy(count);
}

function storeOrigin(): string {
  return 'https://store.halaqmap.com';
}

function shopUrl(token: string): string {
  return storeLiveShopShareHref('bakhurna', token);
}

function deskUrl(token: string): string {
  return `${storeOrigin()}/#/b/${encodeURIComponent(token)}/desk`;
}

export function bakhurnaGiftPayload(input: { shopName: string; hostName: string }): BakhurnaLiveOrderPayload {
  return {
    packId: 'm6',
    shopName: input.shopName,
    logoSrc: '',
    hostName: input.hostName,
    blurbAr: 'بخورنا1: اطلب أصناف اليوم من جوالك.',
    customFields: Array.from({ length: 5 }, () => ''),
    flashAr: '',
    acceptingOrders: true,
    shelf: [],
    orders: [],
    orderArchive: [],
    chatIncluded: true,
    chats: [],
    ...DEFAULT_SHOP_PICKUP,
    vendorMode: 'fixed',
    ...DEFAULT_STORE_SHOP_HOURS,
    gift: true,
    giftLabelAr: STORE_BAKHURNA_GIFT_LABEL_AR,
    issuedByLabel: STORE_BAKHURNA_GIFT_ISSUED_BY,
    giftClockFromFirstVisit: true,
  } as BakhurnaLiveOrderPayload;
}

export async function issueBakhurnaGiftShop(
  db: Db,
  input: { email: string; givenName: string },
): Promise<{ ok: true; bakhurnaOrderId: string; shopToken: string; deskToken: string } | { ok: false; error: string }> {
  const shopToken = newBakhurnaToken();
  const deskToken = newBakhurnaToken();
  const payload = bakhurnaGiftPayload({
    shopName: input.givenName,
    hostName: input.givenName,
  });
  const { data, error } = await db
    .from(STORE_BAKHURNA_LIVE_TABLE)
    .insert({
      status: 'live',
      shop_token: shopToken,
      desk_token: deskToken,
      buyer_email: input.email,
      buyer_name: input.givenName,
      price_halalas: STORE_BAKHURNA_LIVE_PRICE_6_HALALAS,
      payload,
      policy_version: STORE_BAKHURNA_LIVE_POLICY,
      expires_at: null,
    })
    .select('id')
    .maybeSingle();
  if (error || !data) {
    return { ok: false, error: 'تعذر إصدار النشاط.' };
  }
  await sendBakhurnaLiveLinksEmail({
    to: input.email,
    shopUrl: shopUrl(shopToken),
    deskUrl: deskUrl(deskToken),
    expiresLabel: 'تبدأ من أول دخول إلى الرابط، مئة وثمانون يوماً',
    gift: true,
  });
  return { ok: true, bakhurnaOrderId: String(data.id), shopToken, deskToken };
}

async function currentCycle(db: Db): Promise<StoreBakhurnaGiftCycleRow | null> {
  const { data: open } = await db
    .from(STORE_BAKHURNA_GIFT_CYCLES_TABLE)
    .select('*')
    .eq('status', 'open')
    .order('slot_no', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (open) return open as StoreBakhurnaGiftCycleRow;
  const { data: drawing } = await db
    .from(STORE_BAKHURNA_GIFT_CYCLES_TABLE)
    .select('*')
    .in('status', ['drawing', 'issuing'])
    .order('slot_no', { ascending: true })
    .limit(1)
    .maybeSingle();
  return (drawing as StoreBakhurnaGiftCycleRow | null) || null;
}

async function winnersPublic(db: Db) {
  const { data: cycles } = await db
    .from(STORE_BAKHURNA_GIFT_CYCLES_TABLE)
    .select('slot_no, winner_entry_id')
    .not('winner_entry_id', 'is', null)
    .order('slot_no', { ascending: true });
  const ids = (cycles || []).map((row) => String(row.winner_entry_id || '')).filter(Boolean);
  if (!ids.length) return [];
  const { data: entries } = await db
    .from(STORE_BAKHURNA_GIFT_ENTRIES_TABLE)
    .select('id, given_name')
    .in('id', ids);
  const byId = new Map((entries || []).map((row) => [String(row.id), row]));
  return (cycles || []).flatMap((cycle) => {
    const entry = byId.get(String(cycle.winner_entry_id || ''));
    if (!entry) return [];
    return [
      {
        slotNo: Number(cycle.slot_no),
        givenName: String(entry.given_name || ''),
        productLabelAr: STORE_BAKHURNA_GIFT_PRODUCT_LABEL_AR,
      },
    ];
  });
}

export async function publicBakhurnaGiftState(db: Db) {
  await finishBakhurnaGiftDraw(db);
  const cycle = await currentCycle(db);
  const nominees = await winnersPublic(db);
  const { count: issuedCount } = await db
    .from(STORE_BAKHURNA_GIFT_CYCLES_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('status', 'issued');
  const exhausted = (issuedCount || 0) >= STORE_BAKHURNA_GIFT_SLOT_COUNT && !cycle;
  if (!cycle) {
    return {
      slotNo: Math.min(STORE_BAKHURNA_GIFT_SLOT_COUNT, (issuedCount || 0) || STORE_BAKHURNA_GIFT_SLOT_COUNT),
      slotCount: STORE_BAKHURNA_GIFT_SLOT_COUNT,
      qualifiedCount: 0,
      cap: STORE_BAKHURNA_GIFT_CYCLE_CAP,
      accepting: false,
      exhausted,
      closed: true,
      nominees,
    };
  }
  const { count } = await db
    .from(STORE_BAKHURNA_GIFT_ENTRIES_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('cycle_id', cycle.id)
    .not('email_verified_at', 'is', null);
  const qualifiedCount = count || 0;
  const accepting = cycle.status === 'open' && qualifiedCount < STORE_BAKHURNA_GIFT_CYCLE_CAP;
  return {
    slotNo: Number(cycle.slot_no),
    slotCount: STORE_BAKHURNA_GIFT_SLOT_COUNT,
    qualifiedCount,
    cap: STORE_BAKHURNA_GIFT_CYCLE_CAP,
    accepting,
    exhausted: false,
    closed: !accepting,
    nominees,
  };
}

export async function enterBakhurnaGiftCampaign(
  db: Db,
  input: {
    givenName: unknown;
    email: unknown;
    city: unknown;
    source: unknown;
    opinionBefore: unknown;
    opinionAfter: unknown;
    acceptedTerms: unknown;
  },
): Promise<{ ok: true; entryId: string; confirmToken: string } | { ok: false; error: string }> {
  if (input.acceptedTerms !== true) {
    return { ok: false, error: 'الموافقة على شروط هدية بخورنا1 مطلوبة.' };
  }
  const givenName = normalizeBakhurnaGivenName(input.givenName);
  if (!isBakhurnaGivenName(givenName)) return { ok: false, error: 'اكتب الاسم الأول والثاني.' };
  const email = normalizeBakhurnaGiftEmail(input.email);
  if (!isBakhurnaGiftEmail(email)) return { ok: false, error: 'أدخل بريداً صالحاً.' };
  const city = clip(input.city, 80);
  if (city.length < 2) return { ok: false, error: 'اكتب المنطقة أو المدينة.' };
  const source = parseBakhurnaGiftSource(input.source);
  if (!source) return { ok: false, error: 'اختر كيف سمعت بنا.' };

  await finishBakhurnaGiftDraw(db);
  const cycle = await currentCycle(db);
  if (!cycle || cycle.status !== 'open') {
    return { ok: false, error: 'أُغلقت المشاركة الحالية لإجراء السحب التقني.' };
  }
  const { count } = await db
    .from(STORE_BAKHURNA_GIFT_ENTRIES_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('cycle_id', cycle.id)
    .not('email_verified_at', 'is', null);
  if ((count || 0) >= STORE_BAKHURNA_GIFT_CYCLE_CAP) {
    return { ok: false, error: 'أُغلقت المشاركة الحالية لإجراء السحب التقني.' };
  }

  const { data: dup } = await db
    .from(STORE_BAKHURNA_GIFT_ENTRIES_TABLE)
    .select('id, email_verified_at')
    .eq('email', email)
    .maybeSingle();
  if (dup) {
    if (dup.email_verified_at) {
      return { ok: false, error: 'هذا البريد مسجَّل في الهدية.' };
    }
    const minted = mintBakhurnaGiftConfirmToken({ entryId: String(dup.id), email });
    if (!minted.ok) return minted;
    return { ok: true, entryId: String(dup.id), confirmToken: minted.token };
  }

  const { data, error } = await db
    .from(STORE_BAKHURNA_GIFT_ENTRIES_TABLE)
    .insert({
      cycle_id: cycle.id,
      given_name: givenName,
      email,
      city,
      source_channel: source,
      opinion_before: clip(input.opinionBefore, 600),
      opinion_after: clip(input.opinionAfter, 600),
      terms_version: STORE_BAKHURNA_GIFT_TERMS_VERSION,
      terms_accepted_at: new Date().toISOString(),
      status: 'pending_email',
      confirm_nonce: randomBytes(8).toString('hex'),
    })
    .select('id')
    .maybeSingle();
  if (error || !data) {
    return { ok: false, error: 'تعذر حفظ المشاركة.' };
  }
  const minted = mintBakhurnaGiftConfirmToken({ entryId: String(data.id), email });
  if (!minted.ok) return minted;
  return { ok: true, entryId: String(data.id), confirmToken: minted.token };
}

export async function prepareBakhurnaGiftConfirmResend(
  db: Db,
  entryId: string,
): Promise<{ ok: true; email: string; confirmToken: string } | { ok: false; error: string }> {
  const id = String(entryId || '').trim();
  if (!id) return { ok: false, error: 'المشاركة غير موجودة.' };
  const { data: entry } = await db
    .from(STORE_BAKHURNA_GIFT_ENTRIES_TABLE)
    .select('id, email, email_verified_at, updated_at')
    .eq('id', id)
    .maybeSingle();
  if (!entry) return { ok: false, error: 'المشاركة غير موجودة.' };
  if (entry.email_verified_at) return { ok: false, error: 'هذا البريد مفعَّل.' };
  const last = Date.parse(String(entry.updated_at || ''));
  if (Number.isFinite(last) && Date.now() - last < STORE_BAKHURNA_GIFT_RESEND_COOLDOWN_MS) {
    return { ok: false, error: 'أُرسل تذكير قبل قليل. انتظر عشر دقائق ثم أعد المحاولة.' };
  }
  const email = String(entry.email || '').trim().toLowerCase();
  const minted = mintBakhurnaGiftConfirmToken({ entryId: String(entry.id), email });
  if (!minted.ok) return minted;
  const now = new Date().toISOString();
  await db.from(STORE_BAKHURNA_GIFT_ENTRIES_TABLE).update({ updated_at: now }).eq('id', entry.id);
  return { ok: true, email, confirmToken: minted.token };
}

export async function confirmBakhurnaGiftEntry(
  db: Db,
  token: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = verifyBakhurnaGiftConfirmToken(token);
  if (!parsed.ok) return parsed;
  const { data: entry } = await db
    .from(STORE_BAKHURNA_GIFT_ENTRIES_TABLE)
    .select('id, cycle_id, email_verified_at')
    .eq('id', parsed.entryId)
    .eq('email', parsed.email)
    .maybeSingle();
  if (!entry) return { ok: false, error: 'تعذر تأكيد الرابط.' };
  if (!entry.email_verified_at) {
    const now = new Date().toISOString();
    await db
      .from(STORE_BAKHURNA_GIFT_ENTRIES_TABLE)
      .update({ email_verified_at: now, status: 'qualified', updated_at: now })
      .eq('id', entry.id)
      .is('email_verified_at', null);
  }
  await maybeStartDraw(db, String(entry.cycle_id));
  await finishBakhurnaGiftDraw(db);
  return { ok: true };
}

async function maybeStartDraw(db: Db, cycleId: string): Promise<void> {
  const { count } = await db
    .from(STORE_BAKHURNA_GIFT_ENTRIES_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('cycle_id', cycleId)
    .not('email_verified_at', 'is', null);
  if ((count || 0) < STORE_BAKHURNA_GIFT_CYCLE_CAP) return;
  await db
    .from(STORE_BAKHURNA_GIFT_CYCLES_TABLE)
    .update({ status: 'drawing', updated_at: new Date().toISOString() })
    .eq('id', cycleId)
    .eq('status', 'open');
}

export async function finishBakhurnaGiftDraw(db: Db): Promise<void> {
  const { data: cycle } = await db
    .from(STORE_BAKHURNA_GIFT_CYCLES_TABLE)
    .select('*')
    .in('status', ['drawing', 'issuing'])
    .order('slot_no', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!cycle) return;
  const row = cycle as StoreBakhurnaGiftCycleRow;
  let nominatedId = String(row.nominated_entry_id || '').trim();
  if (!nominatedId) {
    const { data: pool } = await db
      .from(STORE_BAKHURNA_GIFT_ENTRIES_TABLE)
      .select('id')
      .eq('cycle_id', row.id)
      .not('email_verified_at', 'is', null)
      .order('created_at', { ascending: true });
    const ids = (pool || []).map((item) => String(item.id));
    if (ids.length < 1) return;
    nominatedId = ids[pickBakhurnaGiftWinnerIndex(ids.length)] || ids[0];
    const now = new Date().toISOString();
    await db
      .from(STORE_BAKHURNA_GIFT_CYCLES_TABLE)
      .update({
        nominated_entry_id: nominatedId,
        status: 'issuing',
        drawn_at: now,
        updated_at: now,
      })
      .eq('id', row.id)
      .in('status', ['drawing', 'issuing']);
    await db.from(STORE_BAKHURNA_GIFT_ENTRIES_TABLE).update({ status: 'nominated', updated_at: now }).eq('id', nominatedId);
  }

  const { data: freshCycle } = await db
    .from(STORE_BAKHURNA_GIFT_CYCLES_TABLE)
    .select('bakhurna_order_id')
    .eq('id', row.id)
    .maybeSingle();
  if (String(freshCycle?.bakhurna_order_id || row.bakhurna_order_id || '').trim()) return;

  const { data: winner } = await db
    .from(STORE_BAKHURNA_GIFT_ENTRIES_TABLE)
    .select('*')
    .eq('id', nominatedId)
    .maybeSingle();
  if (!winner) return;
  const issued = await issueBakhurnaGiftShop(db, {
    email: String(winner.email),
    givenName: String(winner.given_name || ''),
  });
  if (!issued.ok) return;
  const now = new Date().toISOString();
  await db.from(STORE_BAKHURNA_GIFT_ENTRIES_TABLE).update({ status: 'chosen', updated_at: now }).eq('id', nominatedId);
  await db
    .from(STORE_BAKHURNA_GIFT_CYCLES_TABLE)
    .update({
      status: 'issued',
      winner_entry_id: nominatedId,
      bakhurna_order_id: issued.bakhurnaOrderId,
      updated_at: now,
    })
    .eq('id', row.id);
  const nextSlot = Number(row.slot_no) + 1;
  if (nextSlot <= STORE_BAKHURNA_GIFT_SLOT_COUNT) {
    await db.from(STORE_BAKHURNA_GIFT_CYCLES_TABLE).insert({ slot_no: nextSlot, status: 'open' });
  }
}

export function bakhurnaGiftTermEndFromFirstVisit(fromMs = Date.now()): string {
  return bakhurnaLiveTermEndIso(STORE_BAKHURNA_LIVE_DAYS_6, fromMs);
}
