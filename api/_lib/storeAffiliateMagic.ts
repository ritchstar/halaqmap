/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إصدار رابط دخول سري لمسوّق المتجر المعتمد.
 */
import { createHash, randomBytes } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { storeAffiliateCheckoutLinks } from './storeAffiliateCode.js';
import { sendStoreAffiliateMagicEmail } from './storeAffiliateMail.js';

export const STORE_AFFILIATE_MAGIC_TTL_MS = 24 * 60 * 60 * 1000;
const PUBLIC_HOURLY_CAP = 3;

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function newSecret(): string {
  return randomBytes(32).toString('base64url');
}

export function storeAffiliateMagicLoginUrl(request: Request, token: string): string {
  const host = (request.headers.get('host') || '').trim().toLowerCase();
  const proto = (request.headers.get('x-forwarded-proto') || 'https').split(',')[0]?.trim() || 'https';
  const origin = host.includes('store.halaqmap.com')
    ? 'https://store.halaqmap.com'
    : host.endsWith('.vercel.app')
      ? `${proto}://${host}`.replace(/\/+$/, '')
      : 'https://www.halaqmap.com';
  return `${origin}/#/store/affiliates/desk?magic=${encodeURIComponent(token)}`;
}

export async function issueStoreAffiliateMagic(input: {
  db: SupabaseClient;
  request: Request;
  marketerId: string;
  email: string;
  code: string;
  skipHourlyCap?: boolean;
}): Promise<{ ok: true; mailed: boolean } | { ok: false; reason: 'rate_limited' | 'insert_failed' }> {
  if (!input.skipHourlyCap) {
    const { count } = await input.db
      .from('store_affiliate_magic_links')
      .select('id', { count: 'exact', head: true })
      .eq('marketer_id', input.marketerId)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());
    if ((count || 0) >= PUBLIC_HOURLY_CAP) return { ok: false, reason: 'rate_limited' };
  }
  const token = newSecret();
  const { error } = await input.db.from('store_affiliate_magic_links').insert({
    marketer_id: input.marketerId,
    token_hash: sha256(token),
    expires_at: new Date(Date.now() + STORE_AFFILIATE_MAGIC_TTL_MS).toISOString(),
  });
  if (error) return { ok: false, reason: 'insert_failed' };
  const mailed = await sendStoreAffiliateMagicEmail({
    to: input.email,
    loginUrl: storeAffiliateMagicLoginUrl(input.request, token),
    productLinks: storeAffiliateCheckoutLinks(input.code),
    code: input.code,
  });
  return { ok: true, mailed };
}
