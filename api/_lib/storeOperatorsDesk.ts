/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة مشغّلي خريطة الحل: رمز بريد وتشغيلات البريد فقط.
 */
import { createHash, randomBytes } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

export const STORE_OPERATORS_OTP_TTL_MS = 10 * 60 * 1000;
export const STORE_OPERATORS_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const STORE_OPERATORS_OTP_HOURLY_CAP = 3;
export const STORE_OPERATORS_OTP_MAX_ATTEMPTS = 5;

export type StoreOperatorProductId =
  | 'kitchen'
  | 'grocers'
  | 'produce'
  | 'restaurant'
  | 'cafe'
  | 'halana'
  | 'lounge';

type DeskSpec = {
  id: StoreOperatorProductId;
  titleAr: string;
  table: string;
  emailColumns: readonly string[];
  tokenColumn: string;
  nameColumns: readonly string[];
  deskPath: (token: string) => string;
};

const DESKS: readonly DeskSpec[] = [
  {
    id: 'kitchen',
    titleAr: 'طبختنا1',
    table: 'store_kitchen_live_orders',
    emailColumns: ['buyer_email'],
    tokenColumn: 'desk_token',
    nameColumns: ['buyer_name'],
    deskPath: (token) => `/k/${token}/desk`,
  },
  {
    id: 'grocers',
    titleAr: 'تمويناتا1',
    table: 'store_grocers_live_orders',
    emailColumns: ['buyer_email'],
    tokenColumn: 'desk_token',
    nameColumns: ['buyer_name'],
    deskPath: (token) => `/g/${token}/desk`,
  },
  {
    id: 'produce',
    titleAr: 'خضارنا1',
    table: 'store_produce_live_orders',
    emailColumns: ['buyer_email'],
    tokenColumn: 'desk_token',
    nameColumns: ['buyer_name'],
    deskPath: (token) => `/v/${token}/desk`,
  },
  {
    id: 'restaurant',
    titleAr: 'مطعمنا1',
    table: 'store_restaurant_live_orders',
    emailColumns: ['buyer_email'],
    tokenColumn: 'desk_token',
    nameColumns: ['buyer_name'],
    deskPath: (token) => `/r/${token}/desk`,
  },
  {
    id: 'cafe',
    titleAr: 'كافينا1',
    table: 'store_cafe_live_orders',
    emailColumns: ['buyer_email'],
    tokenColumn: 'desk_token',
    nameColumns: ['buyer_name'],
    deskPath: (token) => `/c/${token}/desk`,
  },
  {
    id: 'halana',
    titleAr: 'حلانا1',
    table: 'store_halana_copies',
    emailColumns: ['beneficiary_email', 'buyer_email'],
    tokenColumn: 'desk_token',
    nameColumns: ['shop_name', 'specialist_name', 'buyer_name'],
    deskPath: (token) => `/h/${token}/desk`,
  },
  {
    id: 'lounge',
    titleAr: 'لاونجا1',
    table: 'store_lounge_live_orders',
    emailColumns: ['buyer_email'],
    tokenColumn: 'host_token',
    nameColumns: ['buyer_name'],
    deskPath: (token) => `/l/${token}/host`,
  },
];

export type StoreOperatorTile = {
  id: string;
  productId: StoreOperatorProductId;
  titleAr: string;
  nameAr: string;
  deskPath: string;
  operable: boolean;
};

type Db = SupabaseClient;

export function normalizeOperatorEmail(raw: unknown): string {
  return String(raw ?? '')
    .trim()
    .toLowerCase();
}

export function isOperatorEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) && raw.length <= 180;
}

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function newOperatorOtp(): string {
  return String(100000 + (randomBytes(3).readUIntBE(0, 3) % 900000));
}

export function newOperatorSecret(): string {
  return randomBytes(32).toString('base64url');
}

export function hashOperatorOtp(email: string, code: string): string {
  return sha256Hex(`${email}:${code}`);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function nameFromRow(row: Record<string, unknown>, columns: readonly string[]): string {
  for (const col of columns) {
    const direct = String(row[col] || '').trim();
    if (direct) return direct.slice(0, 80);
  }
  const payload = asRecord(row.payload);
  const fromPayload = String(payload.shopName || payload.specialistName || '').trim();
  return fromPayload.slice(0, 80);
}

function isExpired(expiresAt: unknown): boolean {
  const ms = Date.parse(String(expiresAt || ''));
  return Number.isFinite(ms) && ms <= Date.now();
}

function isOperableStatus(status: string): boolean {
  return status === 'live' || status === 'issued' || status === 'pending_renewal';
}

export async function emailHasOperatorCopies(db: Db, email: string): Promise<boolean> {
  const tiles = await listOperatorTiles(db, email);
  return tiles.length > 0;
}

export async function listOperatorTiles(db: Db, email: string): Promise<StoreOperatorTile[]> {
  const tiles: StoreOperatorTile[] = [];
  for (const spec of DESKS) {
    const filter = spec.emailColumns.map((col) => `${col}.eq.${email}`).join(',');
    const { data } = await db
      .from(spec.table)
      .select(`id, status, expires_at, ${spec.tokenColumn}, ${spec.nameColumns.join(', ')}`)
      .or(filter)
      .in('status', ['live', 'issued', 'pending_renewal', 'expired']);
    for (const raw of data || []) {
      const row = asRecord(raw);
      const token = String(row[spec.tokenColumn] || '').trim();
      if (token.length < 16) continue;
      const status = String(row.status || '');
      const operable = isOperableStatus(status) && !isExpired(row.expires_at);
      tiles.push({
        id: `${spec.id}:${String(row.id || token)}`,
        productId: spec.id,
        titleAr: spec.titleAr,
        nameAr: nameFromRow(row, spec.nameColumns) || spec.titleAr,
        deskPath: spec.deskPath(token),
        operable,
      });
    }
  }
  tiles.sort((a, b) => Number(b.operable) - Number(a.operable) || a.titleAr.localeCompare(b.titleAr, 'ar'));
  return tiles;
}

export async function issueOperatorOtp(
  db: Db,
  email: string,
): Promise<{ ok: true; code: string } | { ok: false; reason: 'rate_limited' | 'insert_failed' }> {
  const { count } = await db
    .from('store_operator_otps')
    .select('id', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());
  if ((count || 0) >= STORE_OPERATORS_OTP_HOURLY_CAP) return { ok: false, reason: 'rate_limited' };
  const code = newOperatorOtp();
  const { error } = await db.from('store_operator_otps').insert({
    email,
    code_hash: hashOperatorOtp(email, code),
    expires_at: new Date(Date.now() + STORE_OPERATORS_OTP_TTL_MS).toISOString(),
    attempts: 0,
  });
  if (error) return { ok: false, reason: 'insert_failed' };
  return { ok: true, code };
}

export async function consumeOperatorOtp(
  db: Db,
  email: string,
  code: string,
): Promise<{ ok: true } | { ok: false; reason: 'invalid' | 'locked' }> {
  const { data } = await db
    .from('store_operator_otps')
    .select('id, code_hash, expires_at, attempts')
    .eq('email', email)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return { ok: false, reason: 'invalid' };
  if (Number(data.attempts) >= STORE_OPERATORS_OTP_MAX_ATTEMPTS) return { ok: false, reason: 'locked' };
  const match = String(data.code_hash) === hashOperatorOtp(email, code);
  if (!match) {
    await db
      .from('store_operator_otps')
      .update({ attempts: Number(data.attempts) + 1 })
      .eq('id', data.id);
    return { ok: false, reason: 'invalid' };
  }
  await db.from('store_operator_otps').delete().eq('id', data.id);
  return { ok: true };
}

export async function createOperatorSession(db: Db, email: string): Promise<string | null> {
  const token = newOperatorSecret();
  const { error } = await db.from('store_operator_sessions').insert({
    email,
    token_hash: sha256Hex(token),
    expires_at: new Date(Date.now() + STORE_OPERATORS_SESSION_TTL_MS).toISOString(),
  });
  if (error) return null;
  return token;
}

export async function readOperatorSession(db: Db, token: string): Promise<string | null> {
  const trimmed = String(token || '').trim();
  if (trimmed.length < 16) return null;
  const { data } = await db
    .from('store_operator_sessions')
    .select('email, expires_at')
    .eq('token_hash', sha256Hex(trimmed))
    .maybeSingle();
  if (!data) return null;
  if (isExpired(data.expires_at)) {
    await db.from('store_operator_sessions').delete().eq('token_hash', sha256Hex(trimmed));
    return null;
  }
  return normalizeOperatorEmail(data.email);
}

export async function deleteOperatorSession(db: Db, token: string): Promise<void> {
  const trimmed = String(token || '').trim();
  if (trimmed.length < 16) return;
  await db.from('store_operator_sessions').delete().eq('token_hash', sha256Hex(trimmed));
}
