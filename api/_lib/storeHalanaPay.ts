/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تشفير آيبان حلانا1 في الخادم. المفتاح من البيئة، لا من Git.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const PREFIX = 'hpay1';

function payKey(): Buffer {
  const explicit = (process.env.STORE_HALANA_PAY_SECRET || '').trim();
  const material =
    explicit ||
    `${process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''}|${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}|halana-pay-v1`;
  return createHash('sha256').update(material).digest();
}

export function sealHalanaIban(plain: string): string {
  if (!plain) return '';
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', payKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [PREFIX, iv.toString('base64url'), tag.toString('base64url'), enc.toString('base64url')].join('.');
}

export function openHalanaIban(sealed: string): string {
  const raw = String(sealed || '').trim();
  if (!raw) return '';
  const parts = raw.split('.');
  if (parts[0] !== PREFIX || parts.length !== 4) return '';
  try {
    const iv = Buffer.from(parts[1], 'base64url');
    const tag = Buffer.from(parts[2], 'base64url');
    const enc = Buffer.from(parts[3], 'base64url');
    const decipher = createDecipheriv('aes-256-gcm', payKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
  } catch {
    return '';
  }
}
