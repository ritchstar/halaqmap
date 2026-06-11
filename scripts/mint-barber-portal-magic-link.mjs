#!/usr/bin/env node
/**
 * يولّد رابط دخول آمن للوحة الحلاق (للاختبار الداخلي فقط).
 *
 * Usage:
 *   node scripts/mint-barber-portal-magic-link.mjs <barberId> <email>
 *
 * Requires in .env (or environment):
 *   BARBER_PORTAL_MAGIC_SECRET (or REGISTRATION_INTENT_SECRET)
 *   VITE_SITE_ORIGIN or SITE_ORIGIN (optional — default http://localhost:4175)
 */
import { createHmac, randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadDotEnv() {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

function mintToken(barberId, email, secret) {
  const payload = {
    v: 1,
    bid: String(barberId).trim(),
    email: String(email).trim().toLowerCase(),
    jti: randomUUID(),
    exp: Date.now() + 72 * 60 * 60 * 1000,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = createHmac('sha256', secret).update(payloadB64).digest('base64url');
  return `${payloadB64}.${sig}`;
}

loadDotEnv();

const barberId = process.argv[2]?.trim();
const email = process.argv[3]?.trim();
const secret = (process.env.BARBER_PORTAL_MAGIC_SECRET || process.env.REGISTRATION_INTENT_SECRET || '').trim();
const site = (process.env.VITE_SITE_ORIGIN || process.env.SITE_ORIGIN || 'http://localhost:4175').replace(/\/+$/, '');

if (!barberId || !email) {
  console.error('Usage: node scripts/mint-barber-portal-magic-link.mjs <barberId> <email>');
  process.exit(1);
}

if (!secret) {
  console.error('Missing BARBER_PORTAL_MAGIC_SECRET (or REGISTRATION_INTENT_SECRET) in .env');
  process.exit(1);
}

const token = mintToken(barberId, email, secret);
const url = `${site}/#/barber/enter?m=${encodeURIComponent(token)}`;

console.log('Barber portal magic link (valid ~72h, single-use on server):');
console.log(url);
