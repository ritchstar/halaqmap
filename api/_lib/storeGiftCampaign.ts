/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * منطق هدية خريطة الحل: خمسون مؤكَّداً ثم سحب تقني. لا كاردي8.
 */
import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { issueStoreProductTrial } from './storeProductTrial.js';

export const STORE_GIFT_CYCLE_CAP = 50 as const;
export const STORE_GIFT_SLOT_COUNT = 5 as const;
export const STORE_GIFT_TERMS_VERSION = 'gift-1' as const;

type StoreGiftProductChoice = 'wedding_men' | 'wedding_women' | 'event';
type StoreGiftSource = 'google' | 'youtube' | 'x' | 'snapchat' | 'friend';
type StoreGiftVoice = 'men' | 'women';

function giftProductLabelAr(choice: StoreGiftProductChoice, eventVoice?: StoreGiftVoice | null): string {
  if (choice === 'wedding_men') return 'افراحي1 رجالي';
  if (choice === 'wedding_women') return 'افراحي1 نسائي';
  if (eventVoice === 'women') return 'اجواء1 نسائي';
  if (eventVoice === 'men') return 'اجواء1 رجالي';
  return 'اجواء1';
}

function giftTrialKey(choice: StoreGiftProductChoice): 'wedding' | 'event' {
  return choice === 'event' ? 'event' : 'wedding';
}

function giftTrialVoice(choice: StoreGiftProductChoice, eventVoice?: StoreGiftVoice | null): StoreGiftVoice {
  if (choice === 'wedding_women') return 'women';
  if (choice === 'wedding_men') return 'men';
  return eventVoice === 'women' ? 'women' : 'men';
}

export const STORE_GIFT_CYCLES_TABLE = 'store_gift_cycles' as const;
export const STORE_GIFT_ENTRIES_TABLE = 'store_gift_entries' as const;

type Db = SupabaseClient;

export type StoreGiftCycleRow = {
  id: string;
  slot_no: number;
  status: string;
  nominated_entry_id: string | null;
  winner_entry_id: string | null;
  trial_id: string | null;
  drawn_at: string | null;
};

type StoreGiftEntryRow = {
  id: string;
  cycle_id: string;
  given_name: string;
  email: string;
  email_verified_at: string | null;
  product_choice: StoreGiftProductChoice;
  event_voice: StoreGiftVoice | null;
};

const PRODUCT_CHOICES = new Set<StoreGiftProductChoice>(['wedding_men', 'wedding_women', 'event']);
const SOURCES = new Set<StoreGiftSource>(['google', 'youtube', 'x', 'snapchat', 'friend']);
const VOICES = new Set<StoreGiftVoice>(['men', 'women']);

export function normalizeGiftEmail(raw: unknown): string {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .slice(0, 180);
}

export function isGiftEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) && raw.length <= 180;
}

export function normalizeGivenName(raw: unknown): string {
  return String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

export function isGivenName(raw: string): boolean {
  const parts = raw.split(' ').filter(Boolean);
  if (parts.length < 2 || /[0-9]/.test(raw)) return false;
  return raw.length >= 5;
}

export function parseProductChoice(raw: unknown): StoreGiftProductChoice | null {
  const v = String(raw ?? '').trim() as StoreGiftProductChoice;
  return PRODUCT_CHOICES.has(v) ? v : null;
}

export function parseSource(raw: unknown): StoreGiftSource | null {
  const v = String(raw ?? '').trim() as StoreGiftSource;
  return SOURCES.has(v) ? v : null;
}

export function parseVoice(raw: unknown): StoreGiftVoice | null {
  const v = String(raw ?? '').trim() as StoreGiftVoice;
  return VOICES.has(v) ? v : null;
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

export function mintGiftConfirmToken(input: {
  entryId: string;
  email: string;
}): { ok: true; token: string } | { ok: false; error: string } {
  const secret = confirmSecret();
  if (!secret) return { ok: false, error: 'تعذر تجهيز رسالة التأكيد.' };
  const exp = Math.floor(Date.now() / 1000) + 48 * 3600;
  const payloadB64 = Buffer.from(
    JSON.stringify({ eid: input.entryId, em: input.email, exp }),
    'utf8',
  ).toString('base64url');
  const sig = createHmac('sha256', secret).update(payloadB64).digest('base64url');
  return { ok: true, token: `${payloadB64}.${sig}` };
}

export function verifyGiftConfirmToken(
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
      eid?: string;
      em?: string;
      exp?: number;
    };
    if (!parsed.eid || !parsed.em || !parsed.exp) return { ok: false, error: 'رابط غير صالح.' };
    if (parsed.exp * 1000 < Date.now()) return { ok: false, error: 'انتهت صلاحية رابط التأكيد.' };
    return { ok: true, entryId: parsed.eid, email: parsed.em };
  } catch {
    return { ok: false, error: 'رابط غير صالح.' };
  }
}

export function giftConfirmUrl(token: string): string {
  return `https://store.halaqmap.com/#/store/gift/confirm?t=${encodeURIComponent(token)}`;
}

export function pickWinnerIndex(count: number, entropy: (max: number) => number = randomInt): number {
  if (count < 1) return 0;
  return entropy(count);
}

async function currentCycle(db: Db): Promise<StoreGiftCycleRow | null> {
  const { data: open } = await db
    .from(STORE_GIFT_CYCLES_TABLE)
    .select('*')
    .eq('status', 'open')
    .order('slot_no', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (open) return open as StoreGiftCycleRow;
  const { data: drawing } = await db
    .from(STORE_GIFT_CYCLES_TABLE)
    .select('*')
    .in('status', ['drawing', 'issuing'])
    .order('slot_no', { ascending: true })
    .limit(1)
    .maybeSingle();
  return (drawing as StoreGiftCycleRow | null) || null;
}

async function winnersPublic(db: Db) {
  const { data: cycles } = await db
    .from(STORE_GIFT_CYCLES_TABLE)
    .select('slot_no, winner_entry_id')
    .not('winner_entry_id', 'is', null)
    .order('slot_no', { ascending: true });
  const ids = (cycles || []).map((row) => String(row.winner_entry_id || '')).filter(Boolean);
  if (!ids.length) return [];
  const { data: entries } = await db
    .from(STORE_GIFT_ENTRIES_TABLE)
    .select('id, given_name, product_choice, event_voice')
    .in('id', ids);
  const byId = new Map((entries || []).map((row) => [String(row.id), row]));
  return (cycles || []).flatMap((cycle) => {
    const entry = byId.get(String(cycle.winner_entry_id || ''));
    if (!entry) return [];
    return [
      {
        slotNo: Number(cycle.slot_no),
        givenName: String(entry.given_name || ''),
        productLabelAr: giftProductLabelAr(
          entry.product_choice as StoreGiftProductChoice,
          (entry.event_voice as StoreGiftVoice | null) || null,
        ),
      },
    ];
  });
}

export async function publicGiftState(db: Db) {
  await finishGiftDraw(db);
  const cycle = await currentCycle(db);
  const nominees = await winnersPublic(db);
  const { count: issuedCount } = await db
    .from(STORE_GIFT_CYCLES_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('status', 'issued');
  const exhausted = (issuedCount || 0) >= STORE_GIFT_SLOT_COUNT && !cycle;
  if (!cycle) {
    return {
      slotNo: Math.min(STORE_GIFT_SLOT_COUNT, (issuedCount || 0) || STORE_GIFT_SLOT_COUNT),
      slotCount: STORE_GIFT_SLOT_COUNT,
      qualifiedCount: 0,
      cap: STORE_GIFT_CYCLE_CAP,
      accepting: false,
      exhausted,
      closed: true,
      nominees,
    };
  }
  const { count } = await db
    .from(STORE_GIFT_ENTRIES_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('cycle_id', cycle.id)
    .not('email_verified_at', 'is', null);
  const qualifiedCount = count || 0;
  const accepting = cycle.status === 'open' && qualifiedCount < STORE_GIFT_CYCLE_CAP;
  return {
    slotNo: Number(cycle.slot_no),
    slotCount: STORE_GIFT_SLOT_COUNT,
    qualifiedCount,
    cap: STORE_GIFT_CYCLE_CAP,
    accepting,
    exhausted: false,
    closed: !accepting,
    nominees,
  };
}

export async function enterGiftCampaign(
  db: Db,
  input: {
    givenName: unknown;
    email: unknown;
    productChoice: unknown;
    eventVoice: unknown;
    city: unknown;
    occasionDate: unknown;
    source: unknown;
    opinionBefore: unknown;
    opinionAfter: unknown;
    acceptedTerms: unknown;
  },
): Promise<{ ok: true; entryId: string; confirmToken: string } | { ok: false; error: string }> {
  if (input.acceptedTerms !== true) {
    return { ok: false, error: 'الموافقة على شروط هدايا خريطة الحل مطلوبة.' };
  }
  const givenName = normalizeGivenName(input.givenName);
  if (!isGivenName(givenName)) return { ok: false, error: 'اكتب الاسم الأول والثاني.' };
  const email = normalizeGiftEmail(input.email);
  if (!isGiftEmail(email)) return { ok: false, error: 'أدخل بريداً صالحاً.' };
  const productChoice = parseProductChoice(input.productChoice);
  if (!productChoice) return { ok: false, error: 'اختر النموذج المطلوب.' };
  const eventVoice = parseVoice(input.eventVoice);
  if (productChoice === 'event' && !eventVoice) {
    return { ok: false, error: 'اختر الشق الرجالي أو النسائي لاجواء1.' };
  }
  const city = clip(input.city, 80);
  if (city.length < 2) return { ok: false, error: 'اكتب المنطقة أو المدينة.' };
  const occasionDate = clip(input.occasionDate, 12);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(occasionDate)) {
    return { ok: false, error: 'اختر التاريخ المتوقع للمناسبة.' };
  }
  const source = parseSource(input.source);
  if (!source) return { ok: false, error: 'اختر كيف سمعت بنا.' };

  await finishGiftDraw(db);
  const cycle = await currentCycle(db);
  if (!cycle || cycle.status !== 'open') {
    return { ok: false, error: 'أُغلقت المشاركة الحالية لإجراء السحب التقني.' };
  }
  const { count } = await db
    .from(STORE_GIFT_ENTRIES_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('cycle_id', cycle.id)
    .not('email_verified_at', 'is', null);
  if ((count || 0) >= STORE_GIFT_CYCLE_CAP) {
    return { ok: false, error: 'أُغلقت المشاركة الحالية لإجراء السحب التقني.' };
  }

  const { data: dup } = await db
    .from(STORE_GIFT_ENTRIES_TABLE)
    .select('id, email_verified_at')
    .eq('email', email)
    .maybeSingle();
  if (dup) {
    if (dup.email_verified_at) {
      return { ok: false, error: 'هذا البريد مسجَّل في الهدية.' };
    }
    const minted = mintGiftConfirmToken({ entryId: String(dup.id), email });
    if (!minted.ok) return minted;
    return { ok: true, entryId: String(dup.id), confirmToken: minted.token };
  }

  const { data, error } = await db
    .from(STORE_GIFT_ENTRIES_TABLE)
    .insert({
      cycle_id: cycle.id,
      given_name: givenName,
      email,
      product_choice: productChoice,
      event_voice: productChoice === 'event' ? eventVoice : productChoice === 'wedding_women' ? 'women' : 'men',
      city,
      occasion_date: occasionDate,
      source_channel: source,
      opinion_before: clip(input.opinionBefore, 600),
      opinion_after: clip(input.opinionAfter, 600),
      terms_version: STORE_GIFT_TERMS_VERSION,
      terms_accepted_at: new Date().toISOString(),
      status: 'pending_email',
      confirm_nonce: randomBytes(8).toString('hex'),
    })
    .select('id')
    .maybeSingle();
  if (error || !data) {
    return { ok: false, error: 'تعذر حفظ المشاركة.' };
  }
  const minted = mintGiftConfirmToken({ entryId: String(data.id), email });
  if (!minted.ok) return minted;
  return { ok: true, entryId: String(data.id), confirmToken: minted.token };
}

export async function confirmGiftEntry(
  db: Db,
  token: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = verifyGiftConfirmToken(token);
  if (!parsed.ok) return parsed;
  const { data: entry } = await db
    .from(STORE_GIFT_ENTRIES_TABLE)
    .select('id, cycle_id, email_verified_at')
    .eq('id', parsed.entryId)
    .eq('email', parsed.email)
    .maybeSingle();
  if (!entry) return { ok: false, error: 'تعذر تأكيد الرابط.' };
  if (!entry.email_verified_at) {
    const now = new Date().toISOString();
    await db
      .from(STORE_GIFT_ENTRIES_TABLE)
      .update({ email_verified_at: now, status: 'qualified', updated_at: now })
      .eq('id', entry.id)
      .is('email_verified_at', null);
  }
  await maybeStartDraw(db, String(entry.cycle_id));
  await finishGiftDraw(db);
  return { ok: true };
}

async function maybeStartDraw(db: Db, cycleId: string): Promise<void> {
  const { count } = await db
    .from(STORE_GIFT_ENTRIES_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('cycle_id', cycleId)
    .not('email_verified_at', 'is', null);
  if ((count || 0) < STORE_GIFT_CYCLE_CAP) return;
  await db
    .from(STORE_GIFT_CYCLES_TABLE)
    .update({ status: 'drawing', updated_at: new Date().toISOString() })
    .eq('id', cycleId)
    .eq('status', 'open');
}

export async function finishGiftDraw(db: Db): Promise<void> {
  const { data: cycle } = await db
    .from(STORE_GIFT_CYCLES_TABLE)
    .select('*')
    .in('status', ['drawing', 'issuing'])
    .order('slot_no', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!cycle) return;
  const row = cycle as StoreGiftCycleRow;
  let nominatedId = String(row.nominated_entry_id || '').trim();
  if (!nominatedId) {
    const { data: pool } = await db
      .from(STORE_GIFT_ENTRIES_TABLE)
      .select('id')
      .eq('cycle_id', row.id)
      .not('email_verified_at', 'is', null)
      .order('created_at', { ascending: true });
    const ids = (pool || []).map((item) => String(item.id));
    if (ids.length < 1) return;
    nominatedId = ids[pickWinnerIndex(ids.length)] || ids[0];
    const now = new Date().toISOString();
    await db
      .from(STORE_GIFT_CYCLES_TABLE)
      .update({
        nominated_entry_id: nominatedId,
        status: 'issuing',
        drawn_at: now,
        updated_at: now,
      })
      .eq('id', row.id)
      .in('status', ['drawing', 'issuing']);
    await db.from(STORE_GIFT_ENTRIES_TABLE).update({ status: 'nominated', updated_at: now }).eq('id', nominatedId);
  }

  const { data: winner } = await db
    .from(STORE_GIFT_ENTRIES_TABLE)
    .select('*')
    .eq('id', nominatedId)
    .maybeSingle();
  if (!winner) return;
  const choice = winner.product_choice as StoreGiftProductChoice;
  const voice = giftTrialVoice(choice, (winner.event_voice as StoreGiftVoice | null) || null);
  const issued = await issueStoreProductTrial(db, {
    productKey: giftTrialKey(choice),
    email: String(winner.email),
    issuerKind: 'admin',
    issuedByLabel: 'هدية خريطة الحل',
    voice,
    hostName: String(winner.given_name || ''),
  });
  if (!issued.ok) return;
  const now = new Date().toISOString();
  await db.from(STORE_GIFT_ENTRIES_TABLE).update({ status: 'chosen', updated_at: now }).eq('id', nominatedId);
  await db
    .from(STORE_GIFT_CYCLES_TABLE)
    .update({
      status: 'issued',
      winner_entry_id: nominatedId,
      trial_id: issued.trialId,
      updated_at: now,
    })
    .eq('id', row.id);
  const nextSlot = Number(row.slot_no) + 1;
  if (nextSlot <= STORE_GIFT_SLOT_COUNT) {
    await db.from(STORE_GIFT_CYCLES_TABLE).insert({ slot_no: nextSlot, status: 'open' });
  }
}
